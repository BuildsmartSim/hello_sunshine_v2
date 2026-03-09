import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { upsertProfile } from '@/lib/ticketing';
import { sendTicketEmailStatic } from '@/lib/emails';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('stripe-signature') as string;

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as any;

        try {
            const { customer_details, metadata } = session;

            // 1. Get Guest Emails and Names
            const guestEmails = metadata.guest_emails ? JSON.parse(metadata.guest_emails) : [];
            const guestNames = metadata.guest_names ? JSON.parse(metadata.guest_names) : [];

            // 2. Fetch all pending tickets for this session
            const { data: pendingTickets, error: fetchError } = await supabaseAdmin
                .from('tickets')
                .select('*')
                .eq('stripe_session_id', session.id)
                .eq('status', 'pending');

            if (fetchError || !pendingTickets || pendingTickets.length === 0) {
                console.error('No pending tickets found for session:', session.id);
                throw new Error('No pending tickets found');
            }

            // 3. Handle Ambassador/Referral Code
            let ambassadorId = null;
            if (metadata.referral_code) {
                const { data: ambassador } = await supabaseAdmin
                    .from('ambassadors')
                    .select('id')
                    .eq('referral_code', metadata.referral_code)
                    .single();

                if (ambassador) {
                    ambassadorId = ambassador.id;
                }
            }

            // 4. Process Profiles and Assign Tickets
            const primaryProfile = await upsertProfile({
                email: customer_details.email,
                full_name: metadata.customer_name || customer_details.name,
                phone: metadata.phone || customer_details.phone,
                age: metadata.age ? parseInt(metadata.age) : undefined,
                gender: metadata.gender,
                waiver_accepted: metadata.waiver_accepted === 'true',
                waiver_accepted_at: metadata.waiver_accepted_at,
                terms_accepted: metadata.terms_accepted === 'true',
                mailing_list_optin: metadata.mailing_list_optin === 'true',
                location_city: metadata.location_city || null,
                location_country: metadata.location_country || null,
            });

            const profilesAndTickets = [
                { profile: primaryProfile, ticketId: pendingTickets[0].id, isPrimary: true }
            ];

            // Process guests
            for (let i = 0; i < guestEmails.length && i + 1 < pendingTickets.length; i++) {
                const guestEmail = guestEmails[i];
                const guestName = guestNames[i] && guestNames[i].trim() !== '' ? guestNames[i].trim() : `Guest of ${primaryProfile.full_name}`;
                const ticketId = pendingTickets[i + 1].id;

                if (guestEmail && guestEmail.trim() !== '') {
                    // Upsert real guest profile (they will need to sign terms later if they haven't)
                    const guestProfile = await upsertProfile({
                        email: guestEmail.trim(),
                        full_name: guestName,
                        terms_accepted: false, // Must sign at door or via email link later
                        waiver_accepted: false,
                    });
                    profilesAndTickets.push({ profile: guestProfile, ticketId, isPrimary: false });
                } else {
                    // Create Placeholder Guest Profile
                    const placeholderEmail = `guest-${ticketId}@pending.local`;
                    const guestProfile = await upsertProfile({
                        email: placeholderEmail,
                        full_name: guestName,
                        terms_accepted: false,
                        waiver_accepted: false,
                    });
                    profilesAndTickets.push({ profile: guestProfile, ticketId, isPrimary: false });
                }
            }

            // 5. Update Tickets to Active and Send Emails
            const postProcessingPromises = profilesAndTickets.map(async (item) => {
                // Update Ticket
                const { error: ticketUpdateError } = await supabaseAdmin
                    .from('tickets')
                    .update({
                        profile_id: item.profile.id,
                        status: 'active',
                        ambassador_id: ambassadorId
                    })
                    .eq('id', item.ticketId);

                if (ticketUpdateError) {
                    console.error(`Failed to activate ticket ${item.ticketId}:`, ticketUpdateError);
                    return; // Skip email if ticket activation fails
                }

                // Send Email (only if it's not a placeholder)
                if (!item.profile.email.endsWith('@pending.local')) {
                    try {
                        await sendTicketEmailStatic(item.ticketId);
                    } catch (emailErr) {
                        console.error(`Failed to send ticket email to ${item.profile.email}:`, emailErr);
                    }
                }

                // Update Loyalty for Primary Buyer ONLY for now, or for everyone? 
                // Let's increment for the profile attached to the ticket.
                try {
                    const { error: updateError } = await supabaseAdmin.rpc('increment_sweats', {
                        profile_uuid: item.profile.id
                    });

                    if (updateError) {
                        const currentSweats = (item.profile as any).total_sweats || 0;
                        await supabaseAdmin
                            .from('profiles')
                            .update({ total_sweats: currentSweats + 1 })
                            .eq('id', item.profile.id);
                    }
                } catch (sweatsErr) {
                    console.error('Failed to increment loyalty sweats:', sweatsErr);
                }
            });

            // Await ALL post-processing to complete before allowing Node.js to return HTTP 200.
            // This prevents PM2 / Node.js from abandoning pending promises when the connection closes.
            await Promise.all(postProcessingPromises);

        } catch (err) {
            console.error('Error processing webhook success:', err);
            return NextResponse.json({ error: 'Database sync failed' }, { status: 500 });
        }
    } else if (event.type === 'checkout.session.expired') {
        const session = event.data.object as any;

        // Delete the pending ticket reservation to release inventory back to the pool
        const { error: deleteError } = await supabaseAdmin
            .from('tickets')
            .delete()
            .match({
                stripe_session_id: session.id,
                status: 'pending'
            });

        if (deleteError) {
            console.error('Error cleaning up expired session:', deleteError);
            // Even if delete fails, we return 200 so Stripe doesn't retry a failed cleanup
        } else {
            console.log(`Successfully cleaned up expired session: ${session.id}`);
        }
    } else if (event.type === 'charge.refunded') {
        const charge = event.data.object as any;
        const paymentIntentId = charge.payment_intent;

        // 1. Find the checkout session using the payment intent
        let stripeSessionId = charge.metadata?.session_id;

        if (!stripeSessionId && paymentIntentId) {
            try {
                const sessions = await stripe.checkout.sessions.list({
                    payment_intent: paymentIntentId,
                    limit: 1
                });
                if (sessions.data.length > 0) {
                    stripeSessionId = sessions.data[0].id;
                }
            } catch (err) {
                console.error('Error fetching session from Stripe during refund:', err);
            }
        }

        // 2. Find and cancel the ticket
        if (stripeSessionId) {
            const { data: ticket } = await supabaseAdmin
                .from('tickets')
                .select('id, profile_id')
                .eq('stripe_session_id', stripeSessionId)
                .single();

            if (ticket) {
                await supabaseAdmin
                    .from('tickets')
                    .update({ status: 'refunded' })
                    .eq('id', ticket.id);

                // Decrement sweats
                const { error: updateError } = await supabaseAdmin.rpc('decrement_sweats', {
                    profile_uuid: ticket.profile_id
                });

                if (updateError) {
                    // Fallback: get current and decrement
                    const { data: profile } = await supabaseAdmin
                        .from('profiles')
                        .select('total_sweats')
                        .eq('id', ticket.profile_id)
                        .single();

                    if (profile) {
                        await supabaseAdmin
                            .from('profiles')
                            .update({ total_sweats: Math.max(0, (profile.total_sweats || 0) - 1) })
                            .eq('id', ticket.profile_id);
                    }
                }

                console.log(`Successfully cancelled ticket ${ticket.id} due to refund.`);
            }
        }
    }

    return NextResponse.json({ received: true });
}

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { upsertProfile } from '@/lib/ticketing';
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
            // 1. Upsert Profile
            const { customer_details, metadata } = session;
            const profile = await upsertProfile({
                email: customer_details.email,
                full_name: metadata.customer_name || customer_details.name,
                phone: metadata.phone || customer_details.phone,
                age: metadata.age,
                gender: metadata.gender,
                waiver_accepted: metadata.waiver_accepted === 'true',
                waiver_accepted_at: metadata.waiver_accepted_at,
            });

            // 2. Create Ticket
            const { data: ticket, error: ticketError } = await supabaseAdmin
                .from('tickets')
                .insert({
                    profile_id: profile.id,
                    slot_id: session.metadata.slot_id || null,
                    stripe_session_id: session.id,
                    status: 'active'
                })
                .select()
                .single();

            if (ticketError) throw ticketError;

            // 3. Send Email
            try {
                const { sendTicketEmail } = await import('@/lib/ticketing');
                await sendTicketEmail(ticket.id);
            } catch (emailErr) {
                console.error('Failed to send ticket email:', emailErr);
                // We don't want to crash the whole webhook if email fails, 
                // but we might want to log it for retry.
            }

            // 4. Update Loyalty (Increment total_sweats)
            const { error: updateError } = await supabaseAdmin.rpc('increment_sweats', {
                profile_uuid: profile.id
            });

            if (updateError) {
                // Fallback if the RPC doesn't exist yet
                await supabaseAdmin
                    .from('profiles')
                    .update({ total_sweats: (profile.total_sweats || 0) + 1 })
                    .eq('id', profile.id);
            }

        } catch (err) {
            console.error('Error processing webhook success:', err);
            return NextResponse.json({ error: 'Database sync failed' }, { status: 500 });
        }
    }

    return NextResponse.json({ received: true });
}

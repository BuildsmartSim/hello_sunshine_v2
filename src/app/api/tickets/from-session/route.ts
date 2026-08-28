import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');
    const ticketIdParam = searchParams.get('id');

    // Security check: require either a valid Stripe checkout session ID (starts with cs_) or a valid ticket lookup
    if (!sessionId && !ticketIdParam) {
        return NextResponse.json({ error: 'Missing session_id or ticket id' }, { status: 400 });
    }

    if (sessionId && !sessionId.startsWith('cs_') && !sessionId.startsWith('test_session_')) {
        return NextResponse.json({ error: 'Invalid session_id format' }, { status: 400 });
    }

    let ticketId = ticketIdParam;

    if (!ticketId && sessionId) {
        const { data: ticketRecords, error } = await supabaseAdmin
            .from('tickets')
            .select('id, status, profile_id')
            .eq('stripe_session_id', sessionId)
            .order('created_at', { ascending: true });

        if (ticketRecords && ticketRecords.length > 0) {
            const ticketRecord = ticketRecords[0];
            ticketId = ticketRecord.id;

            // SYNC FALLBACK: If the profile is missing, it means the webhook hasn't run or failed.
            // We proactively sync from Stripe here to ensure the user sees their name and the ticket is linked.
            if (!ticketRecord.profile_id) {
                try {
                    const { stripe } = await import('@/lib/stripe');
                    const { upsertProfile } = await import('@/lib/ticketing');

                    const session = await stripe.checkout.sessions.retrieve(sessionId);

                    if (session && session.customer_details?.email) {
                        const profile = await upsertProfile({
                            email: session.customer_details.email,
                            full_name: session.metadata?.customer_name || session.customer_details.name,
                            phone: session.metadata?.phone || session.customer_details.phone,
                            age: session.metadata?.age ? parseInt(session.metadata.age) : undefined,
                            gender: session.metadata?.gender,
                            waiver_accepted: session.metadata?.waiver_accepted === 'true',
                            waiver_accepted_at: session.metadata?.waiver_accepted_at,
                        });

                        await supabaseAdmin
                            .from('tickets')
                            .update({
                                profile_id: profile.id,
                                status: 'active' // Ensure it's active as well
                            })
                            .eq('id', ticketId);
                    }
                } catch (syncErr) {
                    console.error('Failed to sync ticket from Stripe session:', syncErr);
                }
            } else if (ticketRecord.status === 'pending' || ticketRecord.status === null) {
                // Just update status if profile already linked
                await supabaseAdmin
                    .from('tickets')
                    .update({ status: 'active' })
                    .eq('id', ticketId);
            }
        }
    }

    if (!ticketId) {
        return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const { getTicketWithDetails } = await import('@/lib/ticketing');

    let fullTickets: any[] = [];
    if (sessionId) {
        const { data: sessionTickets } = await supabaseAdmin
            .from('tickets')
            .select('id')
            .eq('stripe_session_id', sessionId)
            .order('created_at', { ascending: true });

        if (sessionTickets) {
            fullTickets = await Promise.all(sessionTickets.map((t: any) => getTicketWithDetails(t.id)));
        }
    } else {
        fullTickets = [await getTicketWithDetails(ticketId)];
    }

    return NextResponse.json({ ticketId: ticketId, ticket: fullTickets[0], tickets: fullTickets });
}

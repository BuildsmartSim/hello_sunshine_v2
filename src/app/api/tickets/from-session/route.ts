import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getTicketWithDetails } from '@/lib/ticketing';
import { toPublicTicket } from '@/lib/public-ticket';
import { getStripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const sessionIdPattern = /^cs_(?:(?:test|live)_)?[a-zA-Z0-9]{1,240}$/;
const responseHeaders = { 'Cache-Control': 'private, no-store' };

function processing(paymentStatus?: string) {
    return NextResponse.json(
        { processing: true, paymentStatus, ticketId: null, ticket: null, tickets: [] },
        { status: 202, headers: responseHeaders }
    );
}

// Lookup never activates tickets. Only a verified, paid Stripe webhook may do so.
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');
    const ticketId = searchParams.get('id');

    if ((!sessionId && !ticketId) || (sessionId && ticketId)) {
        return NextResponse.json({ error: 'Provide a checkout session or ticket ID' }, { status: 400 });
    }
    if ((sessionId && !sessionIdPattern.test(sessionId)) || (ticketId && !uuid.test(ticketId))) {
        return NextResponse.json({ error: 'Invalid ticket lookup' }, { status: 400 });
    }

    try {
        let ids: string[];
        if (sessionId) {
            const session = await getStripe().checkout.sessions.retrieve(sessionId);
            if (session.payment_status !== 'paid' || session.status !== 'complete' || session.mode !== 'payment') {
                return processing(session.payment_status);
            }
            const { data: records, error } = await supabaseAdmin
                .from('tickets')
                .select('id, status, profile_id')
                .eq('stripe_session_id', sessionId)
                .order('created_at', { ascending: true });
            if (error) throw error;
            if (!records?.length || records.some((record: { status: string; profile_id: string | null }) =>
                record.status === 'pending' || !record.profile_id)) return processing('paid');
            ids = records.map((record: { id: string }) => record.id);
        } else {
            ids = [ticketId!];
        }

        const tickets = await Promise.all(ids.map(getTicketWithDetails));
        if (tickets.some(ticket => !ticket)) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404, headers: responseHeaders });
        }
        if (tickets.some(ticket => ticket.status === 'pending')) return processing();
        if (tickets.some(ticket => !['active', 'used'].includes(ticket.status))) {
            return NextResponse.json({ error: 'This ticket is no longer valid' }, { status: 409, headers: responseHeaders });
        }
        const publicTickets = tickets.map(toPublicTicket);
        return NextResponse.json(
            { ticketId: publicTickets[0].id, ticket: publicTickets[0], tickets: publicTickets },
            { headers: responseHeaders }
        );
    } catch (error) {
        console.error('Ticket lookup failed:', error instanceof Error ? error.message : 'Unknown error');
        const invalidSession = (error as { type?: string }).type === 'StripeInvalidRequestError';
        return NextResponse.json(
            { error: invalidSession ? 'Checkout session not found' : 'Unable to verify your ticket. Please try again.' },
            { status: invalidSession ? 404 : 503, headers: responseHeaders }
        );
    }
}

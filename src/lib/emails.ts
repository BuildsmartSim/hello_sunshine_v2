import { resend } from './resend';
import { TicketEmail } from '@/emails/TicketEmail';
import { getTicketWithDetails } from './ticketing';
import { supabaseAdmin } from './supabaseAdmin';

export async function sendTicketEmailStatic(ticketId: string) {
    const ticket = await getTicketWithDetails(ticketId);

    if (!ticket) throw new Error('Ticket not found for email');

    const customerEmail = ticket.profile?.email;
    if (!customerEmail) throw new Error('Customer email missing');

    let displayDate = 'Season Pass';
    let eventTitle = ticket.product?.location?.name || ticket.slot?.product?.location?.name || 'Hello Sunshine Sauna';

    if (ticket.slot) {
        displayDate = new Date(ticket.slot.start_time).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    } else {
        const locationName = ticket.product?.location?.name;
        if (locationName) {
            eventTitle = locationName;

            const { data: events } = await supabaseAdmin
                .from('app_events')
                .select('title, dates');

            const matchedEvent = events?.find((e: any) => e.title === locationName);
            if (matchedEvent?.dates) {
                displayDate = matchedEvent.dates;
            }
        }
    }

    try {
        console.log(`[EMAIL] Attempting to send ticket email to ${customerEmail} for ticket ${ticketId}`);
        const { data, error } = await resend.emails.send({
            from: 'Hello Sunshine Sauna <hello@hellosunshinesauna.com>',
            to: [customerEmail],
            subject: `Your Ticket for ${eventTitle}`,
            react: TicketEmail({
                customerName: ticket.profile?.full_name || 'Guest',
                eventTitle: eventTitle,
                passName: ticket.product?.name || ticket.slot?.product?.name || 'General Entry',
                date: displayDate,
                ticketId: ticket.id,
            }) as React.ReactElement,
        });

        if (error) {
            console.error('[EMAIL] Resend returned an error:', error);
            throw error;
        }

        console.log(`[EMAIL] Successfully sent. Resend ID: ${data?.id}`);

        const { error: updateError } = await supabaseAdmin
            .from('tickets')
            .update({ email_sent: true })
            .eq('id', ticketId);

        if (updateError) {
            console.error('[EMAIL] Failed to update email_sent flag in DB:', updateError);
        }

        return data;
    } catch (e: any) {
        console.error('[EMAIL] Critical exception caught during sendTicketEmail:', e);
        throw e;
    }
}

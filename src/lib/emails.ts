import { resend } from './resend';
import { TicketEmail } from '@/emails/TicketEmail';
import { getTicketWithDetails } from './ticketing';
import { supabaseAdmin } from './supabaseAdmin';
import fs from 'fs';
import path from 'path';

function logToFile(msg: string) {
    try {
        const logPath = path.join(process.cwd(), 'email_logs.txt');
        const timestamp = new Date().toISOString();
        fs.appendFileSync(logPath, `[${timestamp}] ${msg}\n`);
    } catch (e) { }
}

export async function sendTicketEmailStatic(ticketId: string) {
    logToFile(`[sendTicketEmailStatic] START for ticket: ${ticketId}`);

    const ticket = await getTicketWithDetails(ticketId);
    if (!ticket) {
        logToFile(`[sendTicketEmailStatic] ERROR: Ticket not found for ID: ${ticketId}`);
        throw new Error('Ticket not found for email');
    }

    const customerEmail = ticket.profile?.email;
    if (!customerEmail) {
        logToFile(`[sendTicketEmailStatic] ERROR: Customer email missing for ticket: ${ticketId}`);
        throw new Error('Customer email missing');
    }

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
        logToFile(`[sendTicketEmailStatic] Attempting to send via Resend to ${customerEmail}`);
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
            logToFile(`[sendTicketEmailStatic] RESEND ERROR: ${JSON.stringify(error)}`);
            console.error('[EMAIL] Resend returned an error:', error);
            throw error;
        }

        logToFile(`[sendTicketEmailStatic] RESEND SUCCESS: ID ${data?.id}`);
        console.log(`[EMAIL] Successfully sent. Resend ID: ${data?.id}`);

        const { error: updateError } = await supabaseAdmin
            .from('tickets')
            .update({ email_sent: true })
            .eq('id', ticketId);

        if (updateError) {
            logToFile(`[sendTicketEmailStatic] DB UPDATE ERROR: ${JSON.stringify(updateError)}`);
            console.error('[EMAIL] Failed to update email_sent flag in DB:', updateError);
        } else {
            logToFile(`[sendTicketEmailStatic] DB UPDATE SUCCESS (email_sent=true)`);
        }

        return data;
    } catch (e: any) {
        logToFile(`[sendTicketEmailStatic] CRITICAL EXCEPTION: ${e.message} \nStack: ${e.stack}`);
        console.error('[EMAIL] Critical exception caught during sendTicketEmail:', e);
        throw e;
    }
}

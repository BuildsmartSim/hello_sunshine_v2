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

/**
 * Sends critical system alerts to the admin (used by Hourly Pulse).
 */
export async function sendSystemAlertEmail(errors: string[]) {
    try {
        const { data: settings } = await supabaseAdmin
            .from('admin_settings')
            .select('chief_email')
            .eq('id', 'default')
            .single();

        const chiefEmail = settings?.chief_email || 'hello@hellosunshinesauna.com'; // Fallback

        let htmlContent = `<div style="font-family: monospace; color: #333; line-height: 1.5;">`;
        htmlContent += `<h2 style="color: #d32f2f;">🚨 Hello Sunshine System Alert</h2>`;
        htmlContent += `<p>The Hourly Pulse script detected the following issues:</p>`;
        htmlContent += `<ul>`;
        errors.forEach(err => {
            htmlContent += `<li style="margin-bottom: 8px;"><b>${err}</b></li>`;
        });
        htmlContent += `</ul>`;
        htmlContent += `<p style="margin-top: 20px; font-size: 12px; color: #666;">Actions required: Check Stripe dashboard or Supabase database.</p>`;
        htmlContent += `</div>`;

        await resend.emails.send({
            from: 'System <onboarding@resend.dev>', // Keep basic for system alerts
            to: chiefEmail,
            subject: `🚨 SYSTEM ALERT: Hello Sunshine Ticketing`,
            html: htmlContent,
        });

        console.log(`[EMAIL] System Alert sent to ${chiefEmail}`);
    } catch (e) {
        console.error('[EMAIL] Failed to send System Alert Email:', e);
    }
}

/**
 * Sends the comprehensive Weekly Digest to the admin.
 */
export async function sendWeeklyDigestEmail(reportData: {
    sales: number;
    revenue: number;
    refunds: number;
    keywords: any[];
}) {
    try {
        const { data: settings } = await supabaseAdmin
            .from('admin_settings')
            .select('chief_email')
            .eq('id', 'default')
            .single();

        const chiefEmail = settings?.chief_email || 'hello@hellosunshinesauna.com';

        let htmlContent = `<div style="font-family: sans-serif; color: #2C3333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">`;
        htmlContent += `<h1 style="color: #F8C630; margin-bottom: 5px;">Weekly Snapshot</h1>`;
        htmlContent += `<p style="color: #666; margin-top: 0; margin-bottom: 30px;">Hello Sunshine Sauna | Last 7 Days</p>`;

        htmlContent += `<h3 style="border-bottom: 2px solid #F8C630; padding-bottom: 5px; margin-top: 30px;">Ticketing Pulse</h3>`;
        htmlContent += `
            <table style="width: 100%; text-align: left; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Net Sales:</strong></td><td style="text-align: right; font-size: 18px; font-weight: bold;">£${(reportData.revenue / 100).toFixed(2)}</td></tr>
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Tickets Sold:</strong></td><td style="text-align: right;">${reportData.sales}</td></tr>
                <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #d32f2f;"><strong>Refunds Assessed:</strong></td><td style="text-align: right; color: #d32f2f;">${reportData.refunds}</td></tr>
            </table>
        `;

        htmlContent += `<h3 style="border-bottom: 2px solid #F8C630; padding-bottom: 5px; margin-top: 30px;">Google Search Rankings (Top 10)</h3>`;
        if (reportData.keywords && reportData.keywords.length > 0) {
            htmlContent += `<table style="width: 100%; text-align: left; font-size: 14px; border-collapse: collapse;">`;
            htmlContent += `<tr style="background-color: #f9f9f9;">
                                <th style="padding: 8px;">Keyword</th>
                                <th style="padding: 8px; text-align: center;">Clicks</th>
                                <th style="padding: 8px; text-align: right;">Avg Position</th>
                            </tr>`;
            reportData.keywords.slice(0, 10).forEach(kw => {
                htmlContent += `<tr>
                                    <td style="padding: 6px 8px; border-bottom: 1px solid #eee; color: #444;">${kw.keyword}</td>
                                    <td style="padding: 6px 8px; border-bottom: 1px solid #eee; text-align: center; font-weight: bold;">${kw.clicks}</td>
                                    <td style="padding: 6px 8px; border-bottom: 1px solid #eee; text-align: right; font-family: monospace;">${kw.position}</td>
                                </tr>`;
            });
            htmlContent += `</table>`;
        } else {
            htmlContent += `<p style="color: #888; font-style: italic;">No search data available for this period.</p>`;
        }

        htmlContent += `<p style="margin-top: 40px; font-size: 12px; color: #888; text-align: center;">Generated automatically by Antigravity Health Monitor.</p>`;
        htmlContent += `</div>`;

        await resend.emails.send({
            from: 'Analytics <onboarding@resend.dev>', // Basic sender
            to: chiefEmail,
            subject: `☀️ Weekly Snapshot: £${(reportData.revenue / 100).toFixed(2)} & Top SEO Keywords`,
            html: htmlContent,
        });

        console.log(`[EMAIL] Weekly Digest sent to ${chiefEmail}`);
    } catch (e) {
        console.error('[EMAIL] Failed to send Weekly Digest Email:', e);
    }
}

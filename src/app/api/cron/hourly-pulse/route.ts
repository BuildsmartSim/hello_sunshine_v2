import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendSystemAlertEmail } from '@/lib/emails';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const key = searchParams.get('key');

        // Basic security check
        if (key !== process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const errors: string[] = [];

        // 1. Database Connection Check
        const { data: dbCheck, error: dbError } = await supabaseAdmin.from('profiles').select('id').limit(1);
        if (dbError) {
            errors.push(`CRITICAL: Database connection failed. Error: ${dbError.message}`);
        }

        // 2. Stuck Tickets Check
        // We look for tickets that were created more than 15 minutes ago but are still 'pending'
        // or 'active' but never had an email sent.
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

        // Find stuck pending tickets (likely dropped checkouts or webhook failures)
        const { data: pendingTickets, error: pendingError } = await supabaseAdmin
            .from('tickets')
            .select('id, created_at, stripe_session_id')
            .eq('status', 'pending')
            .lte('created_at', fifteenMinutesAgo)
            .gte('created_at', oneHourAgo); // Only look back 1 hour to avoid repeating older alerts

        if (pendingError) {
            errors.push(`Failed to query pending tickets: ${pendingError.message}`);
        } else if (pendingTickets && pendingTickets.length > 0) {
            errors.push(`WARNING: Found ${pendingTickets.length} 'pending' tickets stuck for > 15 minutes.`);
        }

        // Find active tickets that failed to send emails
        const { data: unsentEmails, error: unsentError } = await supabaseAdmin
            .from('tickets')
            .select('id, profile:profiles(email)')
            .eq('status', 'active')
            .eq('email_sent', false)
            .lte('created_at', fifteenMinutesAgo)
            .gte('created_at', oneHourAgo);

        if (unsentError) {
            errors.push(`Failed to query unsent ticket emails: ${unsentError.message}`);
        } else if (unsentEmails && unsentEmails.length > 0) {
            // Filter out placeholder local emails
            const realMissingEmails = unsentEmails.filter((t: any) => !t.profile?.email?.endsWith('@pending.local'));
            if (realMissingEmails.length > 0) {
                errors.push(`URGENT: Found ${realMissingEmails.length} ACTIVE tickets where confirmation email failed to send (IDs: ${realMissingEmails.map((t: any) => t.id).slice(0, 3).join(', ')}...).`);
            }
        }

        // 3. Dispatch Alerts
        if (errors.length > 0) {
            console.error('[HOURLY PULSE] Found Errors:', errors);
            await sendSystemAlertEmail(errors);
            return NextResponse.json({ success: false, alerts_sent: true, errors });
        }

        return NextResponse.json({ success: true, message: 'All systems operational' });

    } catch (err: any) {
        console.error('Hourly pulse failed:', err);
        // If the script crashes entirely, send a panic alert
        try {
            await sendSystemAlertEmail([`FATAL CRON SCRIPT CRASH: ${err.message}`]);
        } catch (e) { }

        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

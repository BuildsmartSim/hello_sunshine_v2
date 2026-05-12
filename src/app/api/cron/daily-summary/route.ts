import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendTelegramMessage } from '@/utils/telegram';
import { resend } from '@/lib/resend';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        // Optional: Simple API key check via header or search param
        const { searchParams } = new URL(req.url);
        const key = searchParams.get('key');
        if (key !== process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

        // 1. Fetch Sales
        const { data: sales } = await supabaseAdmin
            .from('tickets')
            .select('id, created_at, status')
            .eq('status', 'active')
            .gte('created_at', twentyFourHoursAgo);

        // 2. Fetch Refunds
        const { data: refunds } = await supabaseAdmin
            .from('tickets')
            .select('id, created_at, refund_reason')
            .eq('status', 'refunded')
            .gte('created_at', twentyFourHoursAgo);

        // 3. Construct Summary
        const salesCount = sales?.length || 0;
        const refundCount = refunds?.length || 0;

        const summaryText = `
<b>☀️ HELLO SUNSHINE DAILY SUMMARY</b>
<i>Last 24 Hours</i>

💰 <b>New Sales:</b> ${salesCount}
⚠️ <b>Refunds:</b> ${refundCount}

${refundCount > 0 ? '<b>Refund Reasons:</b>\n' + refunds?.map((r: any) => `• ${r.refund_reason || 'No reason given'}`).join('\n') : ''}

Keep shining!
        `.trim();

        // 4. Fetch Settings
        const { data: settings } = await supabaseAdmin
            .from('admin_settings')
            .select('*')
            .eq('id', 'default')
            .single();

        let notificationsSent = [];

        // 5. Send Telegram
        if (settings?.telegram_bot_token && settings?.telegram_chat_id) {
            const tgRes = await sendTelegramMessage(settings.telegram_bot_token, settings.telegram_chat_id, summaryText);
            if (tgRes.success) notificationsSent.push('telegram');
        }

        // 6. Send Email
        if (settings?.chief_email) {
            try {
                await resend.emails.send({
                    from: 'Hello Sunshine <onboarding@resend.dev>',
                    to: settings.chief_email,
                    subject: `☀️ Daily Summary: ${salesCount} New Sales`,
                    html: summaryText.replace(/\n/g, '<br />')
                });
                notificationsSent.push('email');
            } catch (err) {
                console.error('Failed to send daily summary email:', err);
            }
        }

        return NextResponse.json({
            success: true,
            sales: salesCount,
            refunds: refundCount,
            notifications: notificationsSent
        });
    } catch (err: any) {
        console.error('Daily summary cron failed:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

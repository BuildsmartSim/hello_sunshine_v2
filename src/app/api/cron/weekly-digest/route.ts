import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendWeeklyDigestEmail } from '@/lib/emails';
import { getWeeklyGSCRankings } from '@/lib/gsc';
import { verifyCronAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        if (!verifyCronAuth(req)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

        // 1. Fetch Sales and Revenue for the last 7 days
        const { data: salesData, error: salesError } = await supabaseAdmin
            .from('tickets')
            .select('id, created_at, status, product:products(price)')
            .gte('created_at', sevenDaysAgo);

        if (salesError) {
            throw new Error(`Failed to fetch sales data: ${salesError.message}`);
        }

        let totalRevenue = 0;
        let totalSalesCount = 0;
        let totalRefundsCount = 0;

        if (salesData) {
            for (const ticket of salesData) {
                if (ticket.status === 'active' || ticket.status === 'used') {
                    totalSalesCount++;
                    // Assuming price is stored as a string like "25.00" or similar
                    // We parse it and convert to pence/cents format for consistency
                    let priceNumeric = 0;
                    if (ticket.product && ticket.product.price) {
                        priceNumeric = Number(ticket.product.price.replace(/[^0-9.-]+/g, ""));
                    }
                    totalRevenue += Math.round(priceNumeric * 100);
                } else if (ticket.status === 'refunded') {
                    totalRefundsCount++;
                }
            }
        }

        // 2. Fetch SEO Ranking Snapshot
        const keywords = await getWeeklyGSCRankings();

        // 3. Dispatch Email
        const reportData = {
            sales: totalSalesCount,
            revenue: totalRevenue,
            refunds: totalRefundsCount,
            keywords: keywords
        };

        await sendWeeklyDigestEmail(reportData);

        return NextResponse.json({ success: true, message: 'Weekly digest sent successfully.', data: reportData });

    } catch (err: any) {
        console.error('Weekly digest failed:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

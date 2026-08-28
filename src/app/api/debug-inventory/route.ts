import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { requireAdmin } from '@/lib/auth';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const auth = await requireAdmin();
    if (!auth.authorized) {
        return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const output: any[] = [];

    // 1. Find Avalon events
    const { data: events, error: evError } = await supabaseAdmin
        .from('app_events')
        .select('id, title, tiers')
        .ilike('title', '%avalon%');

    if (evError) return NextResponse.json({ error: evError });
    output.push({ events });

    if (events && events.length > 0) {
        for (const tier of events[0].tiers) {
            output.push({ checking_tier: tier });

            // 2. Fetch Product for this tier
            const { data: product, error: prodError } = await supabaseAdmin
                .from('products')
                .select('*')
                .eq('price_id', tier.id)
                .single();

            if (prodError) {
                output.push({ error: `Product lookup failed for ${tier.id}`, details: prodError });
                continue;
            }

            output.push({ found_product: product });

            // 3. Check Tickets
            const fifteenMinsAgo = new Date(Date.now() - 15 * 60000).toISOString();
            const { count, error: countError } = await supabaseAdmin
                .from('tickets')
                .select('*', { count: 'exact', head: true })
                .eq('product_id', product.id)
                .or(`status.in.(active,used),and(status.eq.pending,created_at.gte.${fifteenMinsAgo})`);

            output.push({
                ticket_count: count,
                error: countError,
                stock_limit: product.stock_limit,
                is_sold_out: (count || 0) >= (product.stock_limit || 0)
            });
        }
    }

    return NextResponse.json(output);
}

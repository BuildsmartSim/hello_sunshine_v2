import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const key = searchParams.get('key');

        if (key !== process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const stripeKey = process.env.STRIPE_SECRET_KEY;
        const stripe = stripeKey ? new Stripe(stripeKey, { apiVersion: '2025-01-27.acacia' as any }) : null;

        let errorsFound = 0;
        let warningsFound = 0;
        const report: any = {
            timestamp: new Date().toISOString(),
            status: 'success',
            details: []
        };

        const addDetail = (type: 'PASS' | 'FAIL' | 'WARN' | 'INFO', message: string, data?: any) => {
            report.details.push({ type, message, data });
            if (type === 'FAIL') errorsFound++;
            if (type === 'WARN') warningsFound++;
        };

        // 1. Consistency Check
        const { data: activeOrphaned, error: activeOrphError } = await supabaseAdmin
            .from('tickets')
            .select('id, stripe_session_id')
            .eq('status', 'active')
            .is('profile_id', null);

        if (activeOrphError) addDetail('FAIL', 'Failed to query orphaned tickets', activeOrphError);
        else if (activeOrphaned && activeOrphaned.length > 0) addDetail('FAIL', `Found ${activeOrphaned.length} ACTIVE tickets securely missing a profile_id!`, activeOrphaned);
        else addDetail('PASS', 'No orphaned active tickets found.');

        // 2. Stuck Pending Inventory
        const thirtyFiveMinsAgo = new Date(Date.now() - 35 * 60000).toISOString();
        const { data: stalePending, error: staleErr } = await supabaseAdmin
            .from('tickets')
            .select('id, created_at, stripe_session_id')
            .eq('status', 'pending')
            .lt('created_at', thirtyFiveMinsAgo);

        if (staleErr) addDetail('FAIL', 'Failed to query stale pending tickets', staleErr);
        else if (stalePending && stalePending.length > 0) addDetail('WARN', `Found ${stalePending.length} stale PENDING tickets locking inventory.`, stalePending);
        else addDetail('PASS', 'No stale pending tickets locking inventory.');

        // 3. Inventory Mismatches
        const { data: products } = await supabaseAdmin.from('products').select('id, name, stock_limit, price_id');
        const { data: ticketsCount } = await supabaseAdmin.from('tickets').select('product_id, status');
        
        if (products && ticketsCount) {
            let mismatches = 0;
            for (const p of products) {
                const allocated = ticketsCount.filter((t: any) => t.product_id === p.id && (t.status === 'active' || t.status === 'used')).length;
                if (p.stock_limit !== null && allocated > p.stock_limit) {
                    addDetail('FAIL', `OVERSOLD: Product ${p.name} (Limit: ${p.stock_limit}, Allocated: ${allocated})`);
                    mismatches++;
                }
            }
            if (mismatches === 0) addDetail('PASS', 'All inventory counts are within capacity limits.');
        }

        // 4. Stripe Verification
        if (stripe) {
            const { data: recentTickets } = await supabaseAdmin
                .from('tickets')
                .select('id, stripe_session_id')
                .eq('status', 'active')
                .not('stripe_session_id', 'is', null)
                .order('created_at', { ascending: false })
                .limit(10);

            if (recentTickets && recentTickets.length > 0) {
                let syncFails = 0;
                for (const t of recentTickets) {
                    if (!t.stripe_session_id.startsWith('cs_')) continue;
                    try {
                        const session = await stripe.checkout.sessions.retrieve(t.stripe_session_id);
                        if (session.payment_status !== 'paid') {
                            addDetail('FAIL', `Ticket ${t.id} is ACTIVE but Stripe session ${t.stripe_session_id} is NOT PAID (${session.payment_status})!`);
                            syncFails++;
                        }
                    } catch (e: any) {
                        addDetail('WARN', `Could not verify session ${t.stripe_session_id} in Stripe: ${e.message}`);
                    }
                }
                if (syncFails === 0) addDetail('PASS', 'Recent active tickets match PAID Stripe sessions.');
            }
        }

        // 5. Legal & Compliance
        const { data: profiles } = await supabaseAdmin.from('profiles').select('id, waiver_accepted');
        if (profiles) {
            const missingWaivers = profiles.filter((p: any) => Boolean(p.waiver_accepted) === false).length;
            if (missingWaivers > 0) addDetail('WARN', `Found ${missingWaivers} total users missing waivers.`);

            const { data: riskyTickets } = await supabaseAdmin.from('tickets').select('id, profile_id').eq('status', 'active');
            if (riskyTickets) {
                const activeWithoutWaiver = riskyTickets.filter((t: any) => {
                    const prof = profiles.find((p: any) => p.id === t.profile_id);
                    return prof && Boolean(prof.waiver_accepted) === false;
                }).length;
                if (activeWithoutWaiver > 0) addDetail('WARN', `There are ${activeWithoutWaiver} ACTIVE tickets assigned to guests without waivers!`);
            }
        }

        report.errorsCount = errorsFound;
        report.warningsCount = warningsFound;

        // --- PUSH TO SECONDARY AGENT DROPLET ---
        const secondaryAgentWebhookUrl = process.env.SECONDARY_AGENT_WEBHOOK_URL; 
        
        if (secondaryAgentWebhookUrl) {
            try {
                // To bypass SSL validation for private IP connections, we use the native https module
                const https = await import('https');
                const url = new URL(secondaryAgentWebhookUrl);
                
                await new Promise((resolve, reject) => {
                    const req = https.request({
                        hostname: url.hostname,
                        port: url.port || (url.protocol === 'https:' ? 443 : 80),
                        path: url.pathname + url.search,
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        rejectUnauthorized: false // Bypasses SSL cert validation
                    }, (res) => {
                        res.on('data', () => {}); // Consume data to free memory
                        res.on('end', () => resolve(true));
                    });
                    req.on('error', (e) => reject(e));
                    req.write(JSON.stringify(report));
                    req.end();
                });
                
                addDetail('INFO', 'Successfully dispatched report to secondary agent.');
            } catch (err: any) {
                console.error('Failed to dispatch to secondary agent:', err);
                addDetail('FAIL', 'Webhook dispatch to secondary agent failed.', err.message);
            }
        } else {
            addDetail('INFO', 'SECONDARY_AGENT_WEBHOOK_URL not set. Skipping push.');
        }

        return NextResponse.json({ success: true, report });
    } catch (err: any) {
        console.error('Daily audit failed:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

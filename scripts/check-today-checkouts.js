#!/usr/bin/env node

/**
 * Script to check the Supabase database for checkout activity today.
 * Usage: node scripts/check-today-checkouts.js
 */

const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// 1. Load Environment Variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables in .env.local');
    console.error('Expected: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTodayCheckouts() {

    // 1. Determine "Today" boundaries
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today (local time)
    const todayStr = today.toISOString();

    console.log(`Checking activity since: ${today.toLocaleString()}\n`);

    try {
        // 2. Query the tickets table for any row created today
        const { data: tickets, error } = await supabase
            .from('tickets')
            .select('id, status, created_at, stripe_session_id')
            .gte('created_at', todayStr)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Error querying database:', error.message);
            return;
        }

        let report = '🌞 Hello Sunshine — Daily Checkout Report\n';
        report += '-----------------------------------------\n';
        report += `Checking activity since: ${today.toLocaleString()}\n\n`;

        if (!tickets || tickets.length === 0) {
            report += '📊 Stats for Today:\n';
            report += '   0 total checkout attempts started.\n';
            report += '   0 tickets sold.\n';
            report += '\n(No activity found in the database yet.)\n';
            console.log(report);
        } else {
            // 3. Summarize the data
            const completed = tickets.filter(t => t.status === 'valid' || t.status === 'checked_in');
            const pending = tickets.filter(t => t.status === 'pending');
            const refunded = tickets.filter(t => t.status === 'refunded');

            report += '📊 Stats for Today:\n';
            report += `   ${tickets.length} total checkout attempts started.\n`;
            report += `   ${completed.length} tickets successfully sold.\n`;
            report += `   ${pending.length} abandoned/pending checkout(s).\n`;
            if (refunded.length > 0) {
                report += `   ${refunded.length} tickets refunded.\n`;
            }

            // 4. Show details of the most recent activity
            report += '\n📝 Recent Checkout Activity:\n';
            tickets.forEach((t, i) => {
                const date = new Date(t.created_at).toLocaleTimeString();
                let statusIcon = '⏳'; // Pending
                if (t.status === 'valid' || t.status === 'checked_in') statusIcon = '✅';
                if (t.status === 'refunded') statusIcon = '↩️';

                report += `   [${date}] ${statusIcon} Status: ${t.status.toUpperCase()}\n`;
            });
            console.log(report);
        }

        // 5. Send message to the other agent on the droplet
        const agentWebhookUrl = process.env.AGENT_WEBHOOK_URL;
        if (agentWebhookUrl) {
            console.log(`\n📡 Sending report to agent at ${agentWebhookUrl}...`);
            try {
                const agentRes = await fetch(agentWebhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        source: 'hellosunshine_v2_checkouts',
                        timestamp: new Date().toISOString(),
                        report: report,
                        type: 'daily_checkout_report'
                    })
                });

                if (agentRes.ok) {
                    console.log('✅ Successfully sent checkout report to agent.');
                } else {
                    console.error('❌ Failed to send checkout report to agent. Status:', agentRes.status);
                }
            } catch (fetchErr) {
                console.error('❌ Error sending request to agent webhook:', fetchErr.message);
            }
        } else {
            console.log('\n⚠️ AGENT_WEBHOOK_URL not set in .env.local. Skipping agent notification.');
        }

    } catch (err) {
        console.error('❌ Unexpected Error:', err.message);
    }
}

// Execute
checkTodayCheckouts();

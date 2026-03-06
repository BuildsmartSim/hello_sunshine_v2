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
    console.log('🌞 Hello Sunshine — Daily Checkout Report');
    console.log('-----------------------------------------');

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

        if (!tickets || tickets.length === 0) {
            console.log('📊 Stats for Today:');
            console.log('   0 total checkout attempts started.');
            console.log('   0 tickets sold.');
            console.log('\n(No activity found in the database yet.)');
            return;
        }

        // 3. Summarize the data
        const completed = tickets.filter(t => t.status === 'valid' || t.status === 'checked_in');
        const pending = tickets.filter(t => t.status === 'pending');
        const refunded = tickets.filter(t => t.status === 'refunded');

        console.log('📊 Stats for Today:');
        console.log(`   ${tickets.length} total checkout attempts started.`);
        console.log(`   ${completed.length} tickets successfully sold.`);
        console.log(`   ${pending.length} abandoned/pending checkout(s).`);
        if (refunded.length > 0) {
            console.log(`   ${refunded.length} tickets refunded.`);
        }

        // 4. Show details of the most recent activity
        console.log('\n📝 Recent Checkout Activity:');
        tickets.forEach((t, i) => {
            const date = new Date(t.created_at).toLocaleTimeString();
            let statusIcon = '⏳'; // Pending
            if (t.status === 'valid' || t.status === 'checked_in') statusIcon = '✅';
            if (t.status === 'refunded') statusIcon = '↩️';

            console.log(`   [${date}] ${statusIcon} Status: ${t.status.toUpperCase()}`);
        });

    } catch (err) {
        console.error('❌ Unexpected Error:', err.message);
    }
}

// Execute
checkTodayCheckouts();

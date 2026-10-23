'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { assertAdmin } from '@/lib/auth';

/**
 * Interface for KPI statistics
 */
export interface DashboardKPIs {
    totalTicketsSold: number;
    totalCapacity: number;
    activeEvents: number;
    liveAttendance: number;
    activeAmbassadors: number;
}

export async function getDashboardKPIsAction(): Promise<{ success: boolean; data?: DashboardKPIs; error?: string }> {
    try {
        await assertAdmin();

        // 1. Total Tickets Sold & Valid
        const { count: ticketCount } = await supabaseAdmin
            .from('tickets')
            .select('*', { count: 'exact', head: true })
            .neq('status', 'refunded');

        // 2. Active Events
        const { count: activeEvents } = await supabaseAdmin
            .from('app_events')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true);

        // 3. Live Attendance (checked_in_at is not null)
        const { count: liveAttendance } = await supabaseAdmin
            .from('tickets')
            .select('*', { count: 'exact', head: true })
            .not('checked_in_at', 'is', null) // Note: using the correct migration column name
            .neq('status', 'refunded');

        // 4. Total Capacity (sum of product stock limits)
        const { data: productsData } = await supabaseAdmin
            .from('products')
            .select('stock_limit');

        const totalCapacity = productsData?.reduce((sum: number, p: any) => sum + (p.stock_limit || 0), 0) || 0;

        // 5. Active Ambassadors (have at least one sale)
        const { data: ticketsWithAmbassadors } = await supabaseAdmin
            .from('tickets')
            .select('ambassador_id')
            .not('ambassador_id', 'is', null)
            .neq('status', 'refunded');

        // Count unique ambassador IDs
        const uniqueAmbassadors = new Set(ticketsWithAmbassadors?.map((t: any) => t.ambassador_id));
        const activeAmbassadors = uniqueAmbassadors.size;

        return {
            success: true,
            data: {
                totalTicketsSold: ticketCount || 0,
                totalCapacity,
                activeEvents: activeEvents || 0,
                liveAttendance: liveAttendance || 0,
                activeAmbassadors
            }
        };
    } catch (err: any) {
        console.error("KPI Error:", err);
        return { success: false, error: err.message };
    }
}

/**
 * Gets aggregated ticket sales count day-by-day for the last 14 days
 */
export async function getSalesVelocityAction(): Promise<{ success: boolean; data?: { date: string; sales: number }[]; error?: string }> {
    try {
        await assertAdmin();

        // Fetch all non-refunded tickets with their creation date
        const { data: tickets, error } = await supabaseAdmin
            .from('tickets')
            .select('created_at')
            .neq('status', 'refunded');

        if (error) throw error;

        // Aggregate by date (YYYY-MM-DD)
        const salesByDate: Record<string, number> = {};

        // Initialize last 14 days with 0
        for (let i = 13; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            salesByDate[dateStr] = 0;
        }

        // Count tickets per date
        tickets?.forEach((t: any) => {
            const dateStr = new Date(t.created_at).toISOString().split('T')[0];
            if (salesByDate[dateStr] !== undefined) {
                salesByDate[dateStr]++;
            }
        });

        // Format for Recharts
        const data = Object.entries(salesByDate).map(([date, sales]) => {
            // Format to generic "Mon", "Tue" sort of display for charts
            const dateObj = new Date(date);
            const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            return {
                date: formattedDate,
                sales
            };
        });

        return { success: true, data };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * Gets aggregated ticket sales count day-by-day for the last 14 days, grouped by Event ID.
 * Returns a map of eventId -> [{ date, sales }]
 */
export async function getAllEventSalesVelocitiesAction(): Promise<{ success: boolean; data?: Record<string, { date: string; sales: number }[]>; error?: string }> {
    try {
        await assertAdmin();

        // 1. Fetch all events and their tiers so we know which price_ids map to which event
        const { data: events, error: eventsError } = await supabaseAdmin
            .from('app_events')
            .select('id, tiers')
            .eq('is_active', true); // Only care about active events

        if (eventsError) throw eventsError;

        // Create a mapping from price_id -> event_id
        const priceToEventMap: Record<string, string> = {};
        events?.forEach((event: any) => {
            if (event.tiers && Array.isArray(event.tiers)) {
                event.tiers.forEach((tier: any) => {
                    if (tier.id) {
                        priceToEventMap[tier.id] = event.id;
                    }
                });
            }
        });

        // 2. Fetch all non-refunded tickets with their product's price_id
        const { data: tickets, error: ticketsError } = await supabaseAdmin
            .from('tickets')
            .select(`
                created_at,
                product:products ( price_id )
            `)
            .neq('status', 'refunded');

        if (ticketsError) throw ticketsError;

        // 3. Initialize the 14-day history for every active event
        const eventSalesMap: Record<string, Record<string, number>> = {};

        events?.forEach((event: any) => {
            eventSalesMap[event.id] = {};
            for (let i = 13; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                eventSalesMap[event.id][dateStr] = 0;
            }
        });

        // 4. Populate the sales
        tickets?.forEach((ticket: any) => {
            const priceId = ticket.product?.price_id;
            if (!priceId) return;

            const eventId = priceToEventMap[priceId];
            if (!eventId || !eventSalesMap[eventId]) return;

            const dateStr = new Date(ticket.created_at).toISOString().split('T')[0];
            if (eventSalesMap[eventId][dateStr] !== undefined) {
                eventSalesMap[eventId][dateStr]++;
            }
        });

        // 5. Format for Recharts
        const formattedData: Record<string, { date: string; sales: number }[]> = {};

        Object.entries(eventSalesMap).forEach(([eventId, datesObj]) => {
            formattedData[eventId] = Object.entries(datesObj).map(([date, sales]) => {
                const dateObj = new Date(date);
                const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                return {
                    date: formattedDate,
                    sales
                };
            });
        });

        return { success: true, data: formattedData };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * Gets current inventory status grouped by ticket prefix (e.g. 'av', 'sw')
 */
export async function getInventoryStatsAction(): Promise<{ success: boolean; data?: { name: string; sold: number; available: number }[]; error?: string }> {
    try {
        await assertAdmin();

        const { data: inventory, error } = await supabaseAdmin
            .from('ticket_inventory')
            .select('id, max_quantity, sold_quantity');

        if (error) throw error;

        // Group by prefix (e.g. 'av-eb' -> 'av')
        const grouped: Record<string, { sold: number; max: number }> = {};

        inventory?.forEach((item: any) => {
            const prefix = item.id.split('-')[0].toUpperCase();
            if (!grouped[prefix]) {
                grouped[prefix] = { sold: 0, max: 0 };
            }
            grouped[prefix].sold += item.sold_quantity;
            grouped[prefix].max += item.max_quantity;
        });

        const data = Object.entries(grouped).map(([name, stats]) => ({
            name,
            sold: stats.sold,
            available: Math.max(0, stats.max - stats.sold)
        }));

        return { success: true, data };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * Gets recent ticket activity including ambassador details
 */
export async function getRecentPurchasesAction(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
        await assertAdmin();

        const { data: tickets, error } = await supabaseAdmin
            .from('tickets')
            .select(`
                id, 
                created_at, 
                status,
                profile:profiles ( full_name, email ),
                product:products ( name ),
                ambassador:ambassadors ( name )
            `)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) throw error;

        return { success: true, data: tickets };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * Gets the top performing ambassadors
 */
export async function getAmbassadorLeaderboardAction(): Promise<{ success: boolean; data?: { name: string; sales: number }[]; error?: string }> {
    try {
        await assertAdmin();

        const { data: tickets, error } = await supabaseAdmin
            .from('tickets')
            .select(`
                ambassador_id,
                ambassador:ambassadors ( name )
            `)
            .not('ambassador_id', 'is', null)
            .neq('status', 'refunded');

        if (error) throw error;

        const counts: Record<string, number> = {};

        tickets?.forEach((t: any) => {
            const name = t.ambassador?.name;
            if (name) {
                counts[name] = (counts[name] || 0) + 1;
            }
        });

        const leaderBoard = Object.entries(counts)
            .map(([name, sales]) => ({ name, sales }))
            .sort((a, b) => b.sales - a.sales) // Sort descending
            .slice(0, 5); // Top 5

        return { success: true, data: leaderBoard };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

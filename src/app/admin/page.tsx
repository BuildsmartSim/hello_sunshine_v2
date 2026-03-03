import React from 'react';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { EventToggle } from './EventToggle';
import { DeleteEventButton } from './events/DeleteEventButton';
import { ReadinessScorecard } from './ReadinessScorecard';
import { getReadinessTasksAction } from '@/app/actions/admin';
import { GuestManager } from './GuestManager';
import { StripeReconciler } from './StripeReconciler';
import Link from 'next/link';

// New Wow-Factor Components & Actions
import {
    getDashboardKPIsAction,
    getSalesVelocityAction,
    getInventoryStatsAction,
    getRecentPurchasesAction,
    getAmbassadorLeaderboardAction
} from '@/app/actions/dashboard';
import { DashboardKPIsClient } from '@/components/Admin/DashboardKPIs';
import { SalesVelocityChart } from '@/components/Admin/SalesChart';
import { InventoryDonut } from '@/components/Admin/InventoryDonut';
import { RecentActivity } from '@/components/Admin/RecentActivity';

export const revalidate = 0; // Ensure fresh data on every load

interface EventRow {
    id: string;
    title: string;
    location: string;
    dates: string;
    is_featured: boolean;
    is_active: boolean;
}

export default async function AdminDashboard() {
    try {
        const initialTasks = await getReadinessTasksAction();

        // Fetch Wow-Factor Data concurrently
        const [
            kpisRes,
            velocityRes,
            inventoryRes,
            recentRes,
            leaderboardRes
        ] = await Promise.all([
            getDashboardKPIsAction(),
            getSalesVelocityAction(),
            getInventoryStatsAction(),
            getRecentPurchasesAction(),
            getAmbassadorLeaderboardAction()
        ]);

        // Fetch all events using the full-access admin client
        const { data: events, error } = await supabaseAdmin
            .from('app_events')
            .select('*')
            .order('created_at', { ascending: false });

        // Fetch sales stats
        const { count: ticketCount } = await supabaseAdmin
            .from('tickets')
            .select('*', { count: 'exact', head: true })
            .neq('status', 'refunded'); // Clean sales data

        // Fetch live attendance (checked in tickets)
        const { count: attendanceCount } = await supabaseAdmin
            .from('tickets')
            .select('*', { count: 'exact', head: true })
            .not('check_in_at', 'is', null);

        const { data: productsData } = await supabaseAdmin
            .from('products')
            .select('stock_limit');

        const totalCapacity = productsData?.reduce((sum: number, p: any) => sum + (p.stock_limit || 0), 0) || 0;
        const ticketPercentage = totalCapacity > 0 ? Math.round(((ticketCount || 0) / totalCapacity) * 100) : 0;

        // Fetch latest purchases
        const { data: latestTickets } = await supabaseAdmin
            .from('tickets')
            .select(`
                id, created_at, status,
                profile:profiles ( full_name, email ),
                product:products ( name ),
                slot:slots (
                    start_time,
                    product:products ( name )
                )
            `)
            .order('created_at', { ascending: false })
            .limit(10);

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-12">
                <div>
                    <h2 className="text-2xl lg:text-3xl font-black text-charcoal tracking-tight uppercase font-mono">Mission Control</h2>
                    <p className="text-xs text-neutral-500 font-mono mt-1 uppercase tracking-widest">Real-time venue intelligence & ticketing</p>
                </div>

                {/* Tier 1: At-a-Glance KPIs */}
                {kpisRes.success && kpisRes.data && (
                    <DashboardKPIsClient data={kpisRes.data} eventsUrl="/admin/events" />
                )}

                {/* Tier 2: Visual Trends */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Sales Velocity Area Chart */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-neutral-200/50 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-sm font-black text-charcoal tracking-[0.2em] uppercase font-mono">Sales Velocity</h3>
                                <p className="text-[10px] text-neutral-400 font-mono uppercase tracking-widest mt-1">14-Day Trajectory</p>
                            </div>
                        </div>
                        {velocityRes.success && velocityRes.data && (
                            <SalesVelocityChart data={velocityRes.data} />
                        )}
                    </div>

                    {/* Inventory Donut Chart */}
                    <div className="bg-white p-6 rounded-3xl border border-neutral-200/50 shadow-sm hover:shadow-md transition-shadow">
                        <div>
                            <h3 className="text-sm font-black text-charcoal tracking-[0.2em] uppercase font-mono">Current Inventory</h3>
                            <p className="text-[10px] text-neutral-400 font-mono uppercase tracking-widest mt-1">Sales by Category</p>
                        </div>
                        {inventoryRes.success && inventoryRes.data && (
                            <InventoryDonut data={inventoryRes.data} />
                        )}
                    </div>
                </div>

                {/* Actionable Insights (Scorecard) */}
                <div className="my-8">
                    <ReadinessScorecard initialTasks={initialTasks} />
                </div>

                {/* Tier 3: Actionable Data Feed */}
                {recentRes.success && leaderboardRes.success && (
                    <RecentActivity
                        recentPurchases={recentRes.data || []}
                        leaderboard={leaderboardRes.data || []}
                    />
                )}

                {/* Emergency Tools Section */}
                <div className="pt-12 border-t border-charcoal/5 mt-12 flex flex-col gap-6">
                    <div>
                        <h3 className="text-sm font-black text-neutral-400 tracking-[0.2em] uppercase font-mono">Operations Pipeline</h3>
                        <p className="text-[10px] text-neutral-400 font-mono uppercase tracking-widest mt-1">Manual overrides and reconciliations</p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <StripeReconciler />

                        <div className="bg-white rounded-3xl border border-neutral-200/50 p-6 flex flex-col justify-center items-center text-center">
                            <h4 className="font-mono uppercase tracking-widest text-sm font-bold text-charcoal mb-2">Legacy Refund View</h4>
                            <p className="text-xs text-neutral-500 mb-4 max-w-sm">Access the unified timeline of guest purchases and detailed refund management.</p>
                            <Link href="/admin/refunds" className="px-6 py-2 bg-charcoal text-white rounded-full text-xs font-bold font-mono tracking-widest uppercase hover:bg-primary hover:text-charcoal transition-colors">
                                Manage Refunds
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    } catch (err: any) {
        console.error("ADMIN PAGE CRASHED:", err);
        return (
            <div className="p-8 bg-red-50 text-red-600 rounded-xl font-mono text-sm max-w-3xl border border-red-200">
                <h3 className="text-xl font-black mb-4 uppercase">Internal Server Error Caught</h3>
                <pre>{err.stack || err.message || JSON.stringify(err)}</pre>
            </div>
        );
    }
}

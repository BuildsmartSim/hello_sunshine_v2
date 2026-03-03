import React from 'react';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { EventToggle } from '../EventToggle';
import { DeleteEventButton } from './DeleteEventButton';
import Link from 'next/link';
import { getAllEventSalesVelocitiesAction } from '@/app/actions/dashboard';
import { SalesVelocityChart } from '@/components/Admin/SalesChart';
import { EventManagerClient } from './EventManagerClient';

export const revalidate = 0;

export interface EventRow {
    id: string;
    title: string;
    location: string;
    dates: string;
    is_featured: boolean;
    is_active: boolean;
    event_year: string | null;
    logo_src: string | null;
}

export default async function EventsPage() {
    const { data: events, error } = await supabaseAdmin
        .from('app_events')
        .select('*')
        .order('created_at', { ascending: false });

    // Fetch the 14-day sales velocity mapped by event ID
    const velocityRes = await getAllEventSalesVelocitiesAction();
    const velocities = velocityRes.success && velocityRes.data ? velocityRes.data : {};

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-charcoal tracking-tight uppercase font-mono">Event Manager</h2>
                    <p className="text-xs text-neutral-500 font-mono mt-1 uppercase tracking-widest">Manage events, locations, and ticket tiers</p>
                </div>
                <Link href="/admin/events/new" className="px-6 py-3 bg-charcoal text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-center flex justify-center items-center gap-2">
                    <span className="text-lg">+</span>
                    <span className="font-mono uppercase tracking-widest text-xs">Create New Event</span>
                </Link>
            </div>

            {error ? (
                <div className="p-12 text-center text-red-500 font-mono text-sm bg-red-50/50 rounded-2xl border border-red-100">
                    <svg className="w-12 h-12 mx-auto mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    Failed to load events: {error.message}
                </div>
            ) : (
                <EventManagerClient events={events || []} velocities={velocities} />
            )}
        </div>
    );
}

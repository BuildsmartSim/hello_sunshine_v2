'use client';

import React, { useState } from 'react';
import { EventRow } from './page';
import { EventToggle } from '../EventToggle';
import { DeleteEventButton } from './DeleteEventButton';
import Link from 'next/link';
import { SalesVelocityChart } from '@/components/Admin/SalesChart';
import Image from 'next/image';

export function EventManagerClient({ events, velocities }: { events: EventRow[], velocities: Record<string, any[]> }) {
    const [activeTab, setActiveTab] = useState<'active' | 'historic'>('active');

    // Filter events into Active/Upcoming vs Historic based on is_active primarily, or year.
    // For this context, let's group by is_active boolean to keep it simple, where false = Historic / Archived.
    const activeEvents = events.filter(e => e.is_active);
    const historicEvents = events.filter(e => !e.is_active);

    const displayedEvents = activeTab === 'active' ? activeEvents : historicEvents;

    return (
        <div className="space-y-6">
            <div className="flex border-b border-neutral-200">
                <button
                    onClick={() => setActiveTab('active')}
                    className={`px-8 py-4 text-sm font-black uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === 'active' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-400 hover:text-neutral-600'}`}
                >
                    Live & Upcoming ({activeEvents.length})
                </button>
                <button
                    onClick={() => setActiveTab('historic')}
                    className={`px-8 py-4 text-sm font-black uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === 'historic' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-400 hover:text-neutral-600'}`}
                >
                    Historic Archive ({historicEvents.length})
                </button>
            </div>

            {displayedEvents.length === 0 ? (
                <div className="p-16 text-center border-2 border-dashed border-neutral-200 rounded-3xl bg-neutral-50/50">
                    <p className="text-neutral-500 font-bold">No {activeTab} events found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {displayedEvents.map((event: EventRow) => {
                        const eventVelocityData = velocities[event.id] || [];
                        const totalVelocitySales = eventVelocityData.reduce((acc, v) => acc + v.sales, 0);

                        return (
                            <div key={event.id} className={`bg-white rounded-[2rem] border border-neutral-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden flex flex-col group relative ${!event.is_active ? 'opacity-80 grayscale-[20%]' : ''}`}>

                                {/* Aesthetic Header Section with potential Image */}
                                <div className="h-28 bg-neutral-900 relative overflow-hidden flex items-center justify-center">
                                    {event.logo_src ? (
                                        <div className="absolute inset-0 opacity-40 mix-blend-overlay">
                                            {/* We use standard img to avoid next/image domain strictness issues for arbitrary URLs */}
                                            <img src={event.logo_src} alt={event.title} className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="absolute inset-0 opacity-20 bg-[url('/noise.png')]"></div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent"></div>

                                    {event.event_year && (
                                        <span className="absolute top-4 left-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-white font-mono uppercase tracking-widest border border-white/20">
                                            {event.event_year}
                                        </span>
                                    )}

                                    <div className="absolute top-4 right-4 flex gap-2 z-20">
                                        <EventToggle eventId={event.id} initialState={event.is_active} type="active" />
                                    </div>

                                    <div className="absolute bottom-4 left-6 pr-6 z-20">
                                        <h3 className="text-xl font-black text-white uppercase tracking-tight truncate drop-shadow-md">{event.title}</h3>
                                        <p className="text-[10px] text-neutral-300 font-mono lowercase tracking-widest">{event.location} &middot; {event.dates}</p>
                                    </div>
                                </div>

                                {/* Chart Section */}
                                <div className="p-6 flex-1 flex flex-col justify-center bg-neutral-50/50 relative">
                                    <div className="flex justify-between items-end mb-4">
                                        <div>
                                            <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] font-mono">14-Day Velocity</h4>
                                            <p className="text-3xl font-black text-neutral-900 font-mono leading-none mt-1">{totalVelocitySales}</p>
                                        </div>
                                        {event.is_featured && (
                                            <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 font-mono uppercase tracking-widest shadow-sm">
                                                Featured Hero
                                            </span>
                                        )}
                                    </div>

                                    {/* Isolated Chart instance */}
                                    <div className="-mx-6">
                                        <SalesVelocityChart data={eventVelocityData} height={120} />
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="p-4 border-t border-neutral-100 bg-white flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] text-neutral-400 font-black font-mono uppercase tracking-widest">Pin to Home:</span>
                                        <EventToggle eventId={event.id} initialState={event.is_featured} type="featured" />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Link href={`/admin/events/${event.id}`} className="px-5 py-2.5 bg-neutral-100 text-neutral-900 text-[10px] font-black uppercase tracking-widest font-mono rounded-lg hover:bg-neutral-200 transition-colors">
                                            Manage
                                        </Link>
                                        <DeleteEventButton eventId={event.id} eventTitle={event.title} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

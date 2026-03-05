"use client";

import React from 'react';
import { EventData } from '@/data/festivals';
import { SmartImage as Image } from '@/components/SmartImage';

interface TypographicEventDetailsProps {
    event: EventData;
}

const SERVICE_ICONS: Record<string, string> = {
    sauna: '/icons/sauna.png',
    plunge: '/icons/plunge-pool.png',
    shower: '/icons/shower.png',
    tub: '/icons/hot-tub.png',
    fire: '/icons/fire-pit.png',
    heart: '/icons/heart.png',
    towels: '/icons/towels.png'
};

export function TypographicEventDetails({ event }: TypographicEventDetailsProps) {
    return (
        <div className="w-full max-w-5xl mx-auto px-4 mt-8 pb-12">
            <div className="flex flex-col md:flex-row gap-12 md:gap-24 relative">

                {/* Visual side: Logo & Identity (Polaroid Style, but fixed) */}
                <div className="w-full md:w-[320px] shrink-0 flex flex-col items-center justify-start border-b md:border-b-0 md:border-r border-charcoal/10 pb-8 md:pb-0 md:pr-12">
                    <div className="relative w-full aspect-square max-w-[280px] mb-8 bg-white p-4 pb-12 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] rotate-[-1deg] hover:rotate-1 transition-transform duration-700">
                        <div className="relative w-full h-full grayscale hover:grayscale-0 transition-all duration-700 bg-charcoal/5">
                            <Image src={event.logoSrc} alt={event.title} fill className="object-contain p-4" />
                        </div>
                        <div className="absolute bottom-4 left-0 w-full text-center">
                            <span className="font-body uppercase tracking-[0.2em] text-charcoal/70 text-sm">{event.title}</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Details & Services in Typographic Style */}
                <div className="flex-1 flex flex-col pt-4">

                    {/* Event Stats Header Row */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between py-2 border-b-2 border-charcoal mb-8 gap-4 md:gap-0">
                        <div className="flex flex-col gap-1">
                            <span className="text-charcoal/40 font-mono text-[9px] uppercase tracking-[0.2em] font-bold">Dates</span>
                            <span className="text-charcoal/80 text-[12px] uppercase font-mono tracking-[0.2em] font-bold">{event.dates}</span>
                        </div>
                        <div className="flex flex-col gap-1 md:text-right">
                            <span className="text-charcoal/40 font-mono text-[9px] uppercase tracking-[0.2em] font-bold">Sanctuary</span>
                            <span className="text-charcoal/80 text-[12px] uppercase font-mono tracking-[0.2em] font-bold">{event.location}</span>
                        </div>
                    </div>

                    <div className="mb-12">
                        <span className="text-xs uppercase font-bold tracking-[0.3em] text-charcoal/60 mb-4 block">The Experience</span>
                        <p className="text-xl text-charcoal/80 leading-relaxed font-body italic tracking-wide">
                            &quot;{event.description}&quot;
                        </p>
                        <a
                            href={event.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-8 text-[10px] uppercase font-mono tracking-widest text-primary hover:text-charcoal transition-colors border-b border-primary/20 pb-1"
                        >
                            Official Event Website ↗
                        </a>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12 border-t border-charcoal/10 pt-12">
                        {/* Opening Times */}
                        <div>
                            <span className="text-xs uppercase font-bold tracking-[0.3em] text-charcoal/60 mb-6 block">Sanctuary Hours</span>
                            <div className="space-y-3">
                                {event.openingTimes.map((time, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
                                        <span className="text-sm font-mono text-charcoal/70 uppercase tracking-widest">{time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Services At a Glance */}
                        <div>
                            <span className="text-xs uppercase font-bold tracking-[0.3em] text-charcoal/60 mb-6 block">Facilities Included</span>
                            <div className="flex flex-wrap gap-6">
                                {event.services.map((s, i) => (
                                    <div key={i} className="group/svc relative flex flex-col items-center gap-2">
                                        <div className="w-8 h-8 relative opacity-40 hover:opacity-100 transition-all transform hover:scale-110 grayscale hover:grayscale-0">
                                            <Image src={SERVICE_ICONS[s]} alt={s} fill className="object-contain" />
                                        </div>
                                        <span className="text-[9px] uppercase tracking-widest text-charcoal/40 group-hover/svc:text-charcoal/60 transition-all text-center">
                                            {s}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

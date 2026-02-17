import React from 'react';


import { EventData } from './FestivalPass';
import { fonts, textures } from '@/design-system/tokens';
import { Button } from '@/components/Button';
import Image from 'next/image';

interface FestivalGuideProps {
    event: EventData;
    onContinue: () => void;
    onBack: () => void;
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

export function FestivalGuide({ event, onContinue, onBack }: FestivalGuideProps) {
    return (
        <div className="w-full max-w-4xl mx-auto px-4 mt-8">
            <div className="relative bg-white/60 p-1 md:p-2 rounded-[2.5rem] shadow-2xl overflow-hidden group">
                {/* Background Textures */}
                <div className="absolute inset-0 opacity-10 mix-blend-multiply pointer-events-none" style={{ backgroundImage: `url('${textures.paper}')` }}></div>

                <div className="relative bg-white/90 rounded-[2.3rem] p-8 md:p-16 border border-charcoal/5 flex flex-col md:flex-row gap-12">
                    <div className="w-full md:w-1/3 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-charcoal/5 pb-8 md:pb-0 md:pr-12">
                        <div className="relative w-40 h-40 mb-8 grayscale hover:grayscale-0 transition-all duration-700">
                            <Image src={event.logoSrc} alt={event.title} fill className="object-contain" />
                        </div>
                        <div className="flex flex-col items-center text-center gap-2 font-mono uppercase tracking-[0.4em] text-[10px] font-bold">
                            <h3 className="text-charcoal">{event.title}</h3>
                            <span className="text-primary">{event.dates}</span>
                            <p className="text-charcoal/40">{event.location}</p>
                        </div>
                    </div>

                    {/* Right Side: Details & Services */}
                    <div className="flex-1 flex flex-col">
                        <div className="mb-10">
                            <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-charcoal/30 mb-4 block">The Experience</span>
                            <p className="text-lg text-charcoal/70 leading-relaxed italic" style={{ fontFamily: fonts.body }}>
                                &quot;{event.description}&quot;
                            </p>
                            <a
                                href={event.externalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block mt-4 text-[10px] uppercase font-bold tracking-widest text-primary hover:text-charcoal transition-colors border-b border-primary/20"
                            >
                                Official Event Website ↗
                            </a>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                            {/* Opening Times */}
                            <div>
                                <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-charcoal/30 mb-4 block">Sanctuary Hours</span>
                                <div className="space-y-2">
                                    {event.openingTimes.map((time, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-1 h-1 rounded-full bg-primary/40"></div>
                                            <span className="text-xs font-mono text-charcoal/60 uppercase">{time}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Services At a Glance */}
                            <div>
                                <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-charcoal/30 mb-4 block">Facilities</span>
                                <div className="flex flex-wrap gap-4">
                                    {event.services.map((s, i) => (
                                        <div key={i} className="group/svc relative">
                                            <div className="w-10 h-10 relative opacity-40 hover:opacity-100 transition-all transform hover:scale-110">
                                                <Image src={SERVICE_ICONS[s]} alt={s} fill className="object-contain" />
                                            </div>
                                            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] uppercase font-bold tracking-widest text-charcoal/0 group-hover/svc:text-charcoal/40 transition-all whitespace-nowrap">
                                                {s}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* CTA Section */}
                        <div className="mt-auto pt-8 border-t border-charcoal/5 flex flex-col md:flex-row items-center justify-between gap-6">
                            <button
                                onClick={onBack}
                                className="text-[10px] uppercase font-bold tracking-widest text-charcoal/30 hover:text-charcoal transition-colors"
                            >
                                ← Choose Different Event
                            </button>
                            <Button onClick={onContinue}>
                                Choose Your Pass Type
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

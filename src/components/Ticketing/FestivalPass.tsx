"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { textures, fonts } from '@/design-system/tokens';
import { Button } from '@/components/Button';

export type TicketSubTier = {
    id: string;
    name: string;
    price: string;
    description: string;
};

export type EventData = {
    id: string;
    title: string;
    location: string;
    dates: string;
    description: string;
    logoSrc: string;
    featuredPrice: string;
    facilities: string[];
    tiers: TicketSubTier[];
    openingTimes: string[];
    externalUrl: string;
    services: ('sauna' | 'plunge' | 'shower' | 'tub' | 'fire' | 'heart' | 'towels')[];
};

export const FESTIVAL_DATA: EventData[] = [
    {
        id: 'avalon',
        title: "Avalon Dance Odyssey",
        location: "Glastonbury",
        dates: "18-22 Sept",
        description: "The UK’s premier festival sanctuary. A multi-day journey of heat, cold therapy, and deep relaxation under the stars.",
        logoSrc: "/Festival Logo_svg/Avalon Dance Oddessy2.svg",
        featuredPrice: "£45",
        facilities: ["2x Wood-fired Saunas", "2x Cold Plunges", "6x Hot & Cold Showers", "2x Hot Tubs"],
        openingTimes: [
            "Thursday: 6pm - 2am",
            "Friday - Sunday: 8am - 2am",
            "Monday: 8am - 11am"
        ],
        externalUrl: "https://hellosunshinesauna.com/avalon-dance-odyssey",
        services: ['sauna', 'plunge', 'shower', 'tub', 'fire', 'heart'],
        tiers: [
            { id: 'av-eb', name: "Early Bird 5-Day", price: "£35", description: "Limited sale for early seekers." },
            { id: 'av-guest', name: "Guest 5-Day Pass", price: "£45", description: "Full access for the duration." },
            { id: 'av-couple', name: "Couples 5-Day", price: "£80", description: "Shared warmth for two." },
            { id: 'av-crew', name: "Crew & Volunteer", price: "£30", description: "For the hard-working souls." },
            { id: 'av-single', name: "Single Session", price: "£15", description: "A moment of stillness." }
        ]
    },
    {
        id: 'small-world',
        title: "Small World",
        location: "Kent",
        dates: "21st-24th August",
        description: "The original creation. A haven of peace and calm, always hot and clean, with a beautiful and welcoming garden.",
        logoSrc: "/Festival Logo_svg/Small world.svg",
        featuredPrice: "£30",
        facilities: ["1969 Thomson Glenn Sauna", "Cold Plunge Pool", "Bamboo Privacy Showers", "Fire Bowl Hub"],
        openingTimes: [
            "Thursday: 3pm - 8pm",
            "Friday - Monday: 8am - 8pm",
            "Tuesday: 8am - Noon"
        ],
        externalUrl: "https://hellosunshinesauna.com/small-world",
        services: ['sauna', 'plunge', 'shower', 'fire'],
        tiers: [
            { id: 'sw-guest', name: "Guest Pass", price: "£30", description: "Full weekend immersion." },
            { id: 'sw-single', name: "Single Session", price: "£15", description: "One-hour ritual." },
            { id: 'sw-crew', name: "Crew Pass", price: "£15", description: "Special rate for village team." }
        ]
    },
    {
        id: 'sancho-campo',
        title: "Campo Sancho",
        location: "Hertfordshire",
        dates: "24-28 July",
        description: "A social focal point for the festival. Fire, steam, and intimate conversations in our bespoke wood-fired sanctuary.",
        logoSrc: "/Festival Logo_svg/rumble camp.svg",
        featuredPrice: "£30",
        facilities: ["Wood-fired Sauna", "Icy Cold Plunge", "Chill Zone Garden", "Night Lighting"],
        openingTimes: [
            "Thursday: 6pm - 12am",
            "Friday - Sunday: 8am - 8pm",
            "Monday: 8am - 11am"
        ],
        externalUrl: "https://hellosunshinesauna.com/campo-sancho-sauna-pass",
        services: ['sauna', 'plunge', 'fire', 'heart'],
        tiers: [
            { id: 'cs-guest', name: "Guest Pass", price: "£30", description: "5-day festival access." },
            { id: 'cs-couple', name: "Couple Pass", price: "£55", description: "Full festival for two." },
            { id: 'cs-crew', name: "Crew Pass", price: "£20", description: "Hard-work recovery pass." }
        ]
    },
    {
        id: 'moving-connections',
        title: "Moving Connections",
        location: "London",
        dates: "31 July - 10 Aug",
        description: "Introspective meditation and euphoric bliss. Join us in the heart of London for a radiant journey of wellness.",
        logoSrc: "/Festival Logo_svg/Small world.svg",
        featuredPrice: "£40",
        facilities: ["London Urban Sanctuary", "Dual-Weekend Access", "Euphoric Steam Rituals", "Stillness Zone"],
        openingTimes: [
            "Tues - Thurs: 3pm - 12am",
            "Fri - Sun: 8am - 3am",
            "Monday: 8am - 12pm"
        ],
        externalUrl: "https://hellosunshinesauna.com/moving-connections-sauna-pass",
        services: ['sauna', 'plunge', 'heart'],
        tiers: [
            { id: 'mc-seb', name: "Super Early Bird", price: "£40", description: "Full pass for dual weekends." }
        ]
    },
];

const SERVICE_ICONS: Record<string, string> = {
    sauna: '/icons/sauna.png',
    plunge: '/icons/plunge-pool.png',
    shower: '/icons/shower.png',
    tub: '/icons/hot-tub.png',
    fire: '/icons/fire-pit.png',
    heart: '/icons/heart.png',
    towels: '/icons/towels.png'
};

export type { EventData as TicketTier }; // Keep alias for compatibility

export function FestivalPass({ data, index, className = "", style = {}, onSelect, isSelected, mode = 'card' }:
    {
        data: EventData,
        index: number,
        className?: string,
        style?: React.CSSProperties,
        onSelect?: (tier: EventData) => void,
        isSelected?: boolean,
        mode?: 'teaser' | 'card' | 'expanded'
    }) {

    const isTeaser = mode === 'teaser';

    return (
        <motion.div
            style={{
                ...style,
                filter: 'drop-shadow(0 calc(15px * var(--shadow-intensity, 1)) 15px rgba(0, 0, 0, 0.15)) drop-shadow(0 calc(25px * var(--shadow-intensity, 1)) 45px rgba(0, 0, 0, 0.2))',
                transform: isTeaser ? `rotate(calc(${index % 2 === 0 ? '0.5' : '-0.5'} * var(--card-tilt, 1deg)))` : `rotate(calc(${index % 2 === 0 ? '1' : '-1'} * var(--card-tilt, 1deg)))`
            }}
            whileHover={{ scale: 1.02, y: -5, rotate: 0, zIndex: 100 }}
            transition={{ type: "spring", stiffness: 80, damping: 20 }}
            className={`relative w-full ${isTeaser ? 'max-w-[300px] min-h-[400px]' : 'max-w-[340px] min-h-[550px]'} h-auto group cursor-pointer ${className} ${isSelected ? 'ring-4 ring-primary ring-offset-4 rounded-lg' : ''}`}
            onClick={() => onSelect?.(data)}
        >
            <div
                className="w-full h-full flex flex-col overflow-hidden relative"
                style={{
                    backgroundColor: '#E0CC99',
                    clipPath: 'polygon(0% 1%, 15% 0%, 35% 2%, 55% 0.5%, 75% 1.5%, 85% 0%, 100% 1%, 100% 99%, 85% 100%, 65% 98%, 45% 99.5%, 25% 97.5%, 10% 100%, 0% 99%)'
                }}
            >
                {/* 1. LAYER: Paper Texture */}
                <div className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none" style={{ backgroundImage: `url('${textures.paper}')` }}></div>

                {/* 2. LAYER: Lighting & Grain */}
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-charcoal/10 to-transparent pointer-events-none z-10"></div>
                <div className="absolute inset-0 opacity-5 mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url('${textures.pencilGrain}')`, backgroundSize: '300px' }}></div>

                {/* 3. LAYER: Watermark (Subtle) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                    <div className="relative w-[130%] h-[130%] opacity-[0.05] mix-blend-multiply transition-transform duration-1000 group-hover:scale-110">
                        <Image src={data.logoSrc} alt="" fill className="object-contain filter grayscale" />
                    </div>
                </div>

                {/* 4. LAYER: CONTENT */}
                <div className="h-12 bg-charcoal/90 flex items-center justify-center relative shrink-0 z-30">
                    <div className="absolute bottom-0 left-0 w-full h-[1px] border-b border-dashed border-white/10"></div>
                    <h4 className="text-white/30 text-[8px] uppercase font-mono tracking-[0.5em] select-none">{data.dates}</h4>
                </div>

                <div className="flex-1 p-5 flex flex-col relative z-30">
                    <div className="mb-4">
                        <h3 className={`${isTeaser ? 'text-lg' : 'text-xl'} font-bold text-charcoal uppercase leading-tight tracking-tight`} style={{ fontFamily: fonts.mono }}>
                            {data.title.split(' ').map((w, i) => <div key={i} className="inline-block mr-1.5">{w === 'Odyssey' ? <span className="text-primary">{w}</span> : w}</div>)}
                        </h3>
                        <p className="text-[9px] font-mono text-charcoal/40 font-bold mt-1 tracking-[0.3em] uppercase">{data.location}</p>
                    </div>

                    {!isTeaser && (
                        <>
                            <div className="flex-1 border-y border-charcoal/10 py-4 flex flex-col gap-4">
                                <p className="text-xs text-charcoal/80 leading-relaxed italic text-justify" style={{ fontFamily: fonts.body }}>
                                    &quot;{data.description}&quot;
                                </p>

                                <div className="space-y-1.5 mt-2">
                                    <span className="text-[8px] uppercase tracking-widest text-charcoal/30 font-bold block">Included Facilities:</span>
                                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                                        {data.facilities.map((f, i) => (
                                            <span key={i} className="text-[10px] font-mono text-charcoal/60 flex items-center gap-1">
                                                <span className="w-1 h-1 rounded-full bg-primary/40 block"></span>
                                                {f}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {isTeaser && (
                        <div className="flex-1 flex flex-col justify-center border-t border-charcoal/5 mt-2 pt-2">
                            <p className="text-[10px] text-charcoal/60 line-clamp-2 italic">{data.description}</p>
                        </div>
                    )}

                    {/* Service Icons Strip */}
                    <div className="flex gap-2 mb-4 mt-4 overflow-x-auto overflow-y-hidden no-scrollbar border-t border-charcoal/5 pt-4">
                        {data.services.map((s, i) => (
                            <div key={i} className="relative w-6 h-6 shrink-0 opacity-40 group-hover:opacity-100 transition-all filter grayscale hover:grayscale-0 group-hover:scale-110" title={s}>
                                <Image src={SERVICE_ICONS[s]} alt={s} fill className="object-contain" />
                            </div>
                        ))}
                    </div>

                    <div className="mt-auto pt-4 flex justify-between items-end">
                        <div className="flex flex-col">
                            <span className="text-[7px] uppercase tracking-[0.3em] text-charcoal/30 font-bold">{isTeaser ? 'Starting At' : 'Entry Tier'}</span>
                            <span className={`${isTeaser ? 'text-xl' : 'text-2xl'} font-bold text-charcoal`} style={{ fontFamily: fonts.display }}>{data.featuredPrice}</span>
                        </div>
                        <Button variant="deepDry" className={`scale-[0.65] origin-right ring-4 ring-white/5 shadow-xl transition-all hover:scale-[0.7] active:scale-60 ${isSelected ? 'opacity-50' : ''}`}>
                            {isTeaser ? 'Explore' : (isSelected ? 'Ready' : 'Choose')}
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

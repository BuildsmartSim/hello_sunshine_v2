"use client";

import React from 'react';
import { SmartImage as Image } from '@/components/SmartImage';
import { motion } from 'framer-motion';
import { textures, fonts } from '@/design-system/tokens';
import { Button } from '@/components/Button';
import { EventData, SERVICE_ICONS } from '@/data/festivals';

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
                filter: isSelected
                    ? 'drop-shadow(0 30px 30px rgba(0, 0, 0, 0.2)) drop-shadow(0 50px 80px rgba(0, 0, 0, 0.25))'
                    : 'drop-shadow(0 calc(15px * var(--shadow-intensity, 1)) 15px rgba(0, 0, 0, 0.15)) drop-shadow(0 calc(25px * var(--shadow-intensity, 1)) 45px rgba(0, 0, 0, 0.2))',
                transform: isTeaser ? `rotate(calc(${index % 2 === 0 ? '0.5' : '-0.5'} * var(--card-tilt, 1deg)))` : `rotate(calc(${index % 2 === 0 ? '1' : '-1'} * var(--card-tilt, 1deg)))`
            }}
            animate={{
                y: isSelected ? -8 : 0,
                scale: isSelected ? 1.02 : 1,
            }}
            whileHover={{ scale: 1.02, y: -8, rotate: 0, zIndex: 100 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className={`relative w-full ${isTeaser ? 'max-w-[380px] min-h-[400px]' : 'max-w-[420px] min-h-[550px]'} h-auto group cursor-pointer ${className} 
                ${isSelected
                    ? 'z-50'
                    : ''
                }`}
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
                {data.logoSrc && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                        <div className="relative w-[130%] h-[130%] opacity-[0.05] mix-blend-multiply transition-transform duration-1000 group-hover:scale-110">
                            <Image src={data.logoSrc} alt="" fill className="object-contain filter grayscale" />
                        </div>
                    </div>
                )}

                {/* 4. LAYER: CONTENT */}
                <div className="h-12 bg-charcoal/90 flex items-center justify-center relative shrink-0 z-30">
                    <div className="absolute bottom-0 left-0 w-full h-[1px] border-b border-dashed border-white/10"></div>
                    <h4 className="text-white/90 text-[12px] uppercase font-mono tracking-[0.2em] font-bold select-none">{data.dates}</h4>
                </div>

                <div className="flex-1 p-5 flex flex-col relative z-30">
                    <div className="mb-4">
                        <h3 className={`h3 ${isTeaser ? 'text-lg' : 'text-xl'} uppercase`}>
                            {data.title.split(' ').map((w, i) => <div key={i} className="inline-block mr-1.5">{w === 'Odyssey' ? <span className="text-primary">{w}</span> : w}</div>)}
                        </h3>
                        <p className="text-[11px] font-mono text-charcoal/60 font-bold mt-1 tracking-[0.2em] uppercase">{data.location}</p>
                    </div>

                    {!isTeaser && (
                        <>
                            <div className="flex-1 border-y border-charcoal/10 py-4 flex flex-col gap-4">
                                <p className="text-sm text-charcoal/80 leading-relaxed font-body italic tracking-wide">
                                    &quot;{data.description}&quot;
                                </p>

                                <div className="space-y-1.5 mt-2">
                                    <span className="text-[11px] uppercase tracking-widest text-charcoal/60 font-bold block">Included Facilities:</span>
                                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                                        {data.facilities.map((f, i) => (
                                            <span key={i} className="text-xs font-mono text-charcoal/70 flex items-center gap-1">
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
                            <p className="text-[12px] text-charcoal/80 line-clamp-3 italic leading-relaxed">{data.description}</p>
                        </div>
                    )}

                    {/* Service Icons Strip */}
                    <div className="flex gap-2 mb-4 mt-4 overflow-x-auto overflow-y-hidden no-scrollbar border-t border-charcoal/5 pt-4">
                        {data.services?.map((s, i) => {
                            const iconSrc = SERVICE_ICONS[s];
                            if (!iconSrc) return null;
                            return (
                                <div key={i} className="relative w-6 h-6 shrink-0 opacity-40 group-hover:opacity-100 transition-all filter grayscale hover:grayscale-0 group-hover:scale-110" title={s}>
                                    <Image src={iconSrc} alt={s} fill className="object-contain" />
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-auto pt-4 flex justify-between items-end">
                        <div className="flex flex-col">
                            <span className="text-xs uppercase tracking-[0.2em] text-charcoal/70 font-bold mb-0.5">{isTeaser ? 'Starting At' : 'Entry Tier'}</span>
                            <span className={`${isTeaser ? 'text-xl' : 'text-2xl'} font-bold text-charcoal`} style={{ fontFamily: fonts.body }}>{data.featuredPrice}</span>
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

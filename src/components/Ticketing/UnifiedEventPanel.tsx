"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { TicketSubTier, EventData, SERVICE_ICONS, sortTiersByType, formatTicketPrice } from '@/data/festivals';
import { fonts } from '@/design-system/tokens';
import { Button } from '@/components/Button';
import { SmartImage as Image } from '@/components/SmartImage';

interface UnifiedEventPanelProps {
    event: EventData;
    selectedTierId?: string;
    onSelect: (tier: TicketSubTier) => void;
    inventory?: Record<string, { remaining: number; soldOut: boolean }>;
}

export function UnifiedEventPanel({ event, selectedTierId, onSelect, inventory = {} }: UnifiedEventPanelProps) {
    const hasOpeningTimes = event.openingTimes && event.openingTimes.length > 0;
    const hasServices = event.services && event.services.length > 0;
    const isDescriptionOnly = !hasOpeningTimes && !hasServices;

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 max-w-6xl mx-auto">
            <div className="flex flex-col relative mt-4 w-full">

                {/* 1. EVENT INFO ROW (Attached to top of table) */}
                <div className="block pb-12 mb-0 relative">

                    {/* Top Centered Section: Logo, Title, Dates */}
                    <div className={`flex flex-col items-center justify-center text-center w-full px-4 border-b border-charcoal/10 pb-16 lg:pb-24 ${isDescriptionOnly ? 'mb-10 lg:mb-16' : 'mb-16 lg:mb-20'}`}>
                        <div className="relative w-64 h-40 md:w-96 md:h-56 lg:w-[480px] lg:h-56 transition-all duration-700 mb-6">
                            <Image priority sizes="(max-width: 768px) 100vw, 50vw" src={event.logoSrc} alt={event.title} fill className="object-contain object-center" />
                        </div>
                        <h2 className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.3em] font-bold text-charcoal/80 mb-3">
                            {event.title}
                        </h2>
                        <p className="text-[10px] sm:text-[11px] font-mono text-charcoal/80 font-bold tracking-[0.4em] uppercase mb-4">
                            {event.dates} <span className="mx-3 text-charcoal/30">|</span> {event.location}
                        </p>
                        <a
                            href={event.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block text-[10px] uppercase font-bold tracking-[0.2em] text-[#E6C665] hover:text-charcoal transition-colors"
                        >
                            Official Website ↗
                        </a>
                    </div>

                    {/* Columns Section (Aligns with Tiers Table) */}
                    <div className={`flex flex-col lg:flex-row items-start justify-between gap-12 lg:gap-8 xl:gap-12 w-full lg:px-4 ${isDescriptionOnly ? 'justify-center items-center text-center' : ''}`}>

                        {/* Col 1: Sanctuary Hours */}
                        {hasOpeningTimes && (
                            <div className="w-full lg:w-[260px] xl:w-[300px] flex flex-col shrink-0">
                                <span className="text-[10px] lg:text-[11px] uppercase font-bold tracking-[0.3em] text-charcoal/80 mb-6 block border-b border-charcoal/20 pb-2">Sanctuary Hours</span>
                                <div className="space-y-4">
                                    {event.openingTimes.map((time, i) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#E6C665]"></div>
                                            <span className="text-[10px] lg:text-[11px] uppercase font-bold tracking-[0.3em] text-charcoal/80 block pt-0.5">{time}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Col 2: Facilities Included */}
                        {hasServices && (
                            <div className="w-full lg:flex-1 lg:max-w-[400px]">
                                <span className="text-[10px] lg:text-[11px] uppercase font-bold tracking-[0.3em] text-charcoal/80 mb-6 block border-b border-charcoal/20 pb-2">Facilities Included</span>
                                <div className="flex flex-wrap gap-x-6 xl:gap-x-8 gap-y-6">
                                    {event.services.map((s, i) => (
                                        <div key={i} className="group/svc relative flex flex-col items-center gap-3">
                                            <div className="w-7 h-7 sm:w-10 sm:h-10 relative opacity-80 transition-all transform hover:scale-110 grayscale hover:grayscale-0">
                                                <Image src={SERVICE_ICONS[s]} alt={s} fill className="object-contain object-center" />
                                            </div>
                                            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-charcoal group-hover/svc:text-charcoal transition-all text-center">
                                                {s}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Col 3: Description Snippet */}
                        <div className={`w-full flex flex-col ${isDescriptionOnly ? 'items-center max-w-3xl' : 'lg:flex-1 lg:pr-4'}`}>
                            <span className={`text-[10px] lg:text-[11px] uppercase font-bold tracking-[0.3em] text-charcoal/80 mb-6 block pb-2 ${isDescriptionOnly ? '' : 'border-b border-charcoal/20 w-full'}`}>
                                The Experience
                            </span>
                            <p
                                className={`text-xl lg:text-2xl text-charcoal leading-relaxed ${isDescriptionOnly ? 'max-w-2xl mx-auto text-center' : ''}`}
                                style={{ fontFamily: 'var(--font-caveat)' }}
                            >
                                {event.description}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. TIERS HEADER */}
                <div className="hidden md:flex items-center justify-between py-4 border-b border-charcoal/60 text-charcoal font-mono text-[10px] uppercase tracking-[0.2em] font-bold lg:px-4 mb-2 gap-8 xl:gap-12">
                    <div className="w-[260px] xl:w-[300px] shrink-0">Availability</div>
                    <div className="flex-1 max-w-[400px]">Pass Type & Details</div>
                    <div className="flex-1 text-right pr-4">Access</div>
                </div>

                {/* 3. TIERS LIST */}
                {sortTiersByType(event.tiers).map((tier) => {
                    const stock = inventory[tier.id];
                    const isSoldOut = stock?.soldOut;
                    const isLowStock = stock?.remaining !== undefined && stock.remaining < 5 && !isSoldOut;

                    let availabilityText = "Available";
                    let availabilityColorClass = "text-charcoal/80";
                    if (isSoldOut) {
                        availabilityText = "Sold Out";
                        availabilityColorClass = "text-red-500/70";
                    } else if (isLowStock) {
                        availabilityText = `Only ${stock.remaining} Left`;
                        availabilityColorClass = "text-yellow-600";
                    } else if (stock?.remaining !== undefined && stock.remaining <= 10) {
                        availabilityText = "Selling Fast";
                        availabilityColorClass = "text-primary";
                    }

                    const isSelected = selectedTierId === tier.id;

                    return (
                        <div
                            key={tier.id}
                            className={`block border-b border-charcoal/10 transition-colors px-4 lg:px-6 py-10 relative ${isSelected ? 'border-primary bg-primary/5' : 'hover:bg-black/[0.02]'
                                } ${isSoldOut ? 'opacity-50 grayscale' : 'cursor-pointer'}`}
                            onClick={() => !isSoldOut && onSelect(tier)}
                        >
                            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-8 xl:gap-12 lg:px-4">

                                {/* Col 1: Availability */}
                                <div className="flex flex-col gap-1 w-full lg:w-[150px] xl:w-[200px] shrink-0">
                                    <h4 className={`text-[12px] sm:text-[13px] font-black uppercase tracking-widest ${availabilityColorClass}`}>
                                        {availabilityText}
                                    </h4>
                                </div>

                                {/* Col 2 & 3: Title & Description Blurb */}
                                <div className="flex flex-col gap-1 flex-1 w-full lg:max-w-[460px]">
                                    <div className="flex items-center gap-3">
                                        <h3 className={`h3 transition-colors uppercase ${isSelected ? 'text-primary' : 'text-charcoal'}`}>
                                            {tier.name}
                                        </h3>
                                        {isSelected && !isSoldOut && (
                                            <motion.span
                                                layoutId="selected-tier-dot"
                                                className="w-2 h-2 rounded-full bg-primary"
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            ></motion.span>
                                        )}
                                    </div>
                                    <p className="text-[12px] font-mono text-charcoal/80 mt-2 italic leading-relaxed max-w-xl">
                                        {tier.description}
                                    </p>
                                </div>

                                {/* Col 4: Price & Button */}
                                <div className="flex items-center gap-6 md:gap-8 w-full lg:flex-1 justify-between lg:justify-end shrink-0 pt-4 lg:pt-0 lg:pr-4">
                                    <span className={`text-2xl font-black ${isSoldOut ? 'text-charcoal/50 line-through' : 'text-charcoal'}`} style={{ fontFamily: fonts.body }}>
                                        {formatTicketPrice(tier.price)}
                                    </span>
                                    <Button
                                        variant={isSelected ? "primary" : "deepDry"}
                                        className={`!px-6 !py-3 !text-[12px] uppercase font-bold tracking-[0.2em] w-auto ${isSoldOut ? 'opacity-50 pointer-events-none' : ''}`}
                                    >
                                        {isSelected ? 'Selected' : (isSoldOut ? 'Sold Out' : 'Select')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 flex justify-center w-full">
                <p className="text-[12px] uppercase font-bold tracking-[0.1em] text-charcoal/80">
                    Secure payment & instant confirmation
                </p>
            </div>
        </div>
    );
}

"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { TicketSubTier, EventData, sortTiersByType } from '@/data/festivals';
import { fonts } from '@/design-system/tokens';
import { Button } from '@/components/Button';

interface TypographicTierListProps {
    event: EventData;
    selectedTierId?: string;
    onSelect: (tier: TicketSubTier) => void;
    inventory?: Record<string, { remaining: number; soldOut: boolean }>;
}

export function TypographicTierList({ event, selectedTierId, onSelect, inventory = {} }: TypographicTierListProps) {
    return (
        <div className="w-full mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 max-w-5xl mx-auto">
            <div className="flex flex-col relative mt-12">
                {/* Header Row */}
                <div className="hidden md:flex items-center justify-between py-2 border-b-2 border-charcoal text-charcoal/40 font-mono text-[9px] uppercase tracking-[0.2em] font-bold px-6">
                    <div className="w-[120px] lg:w-1/4">Availability</div>
                    <div className="flex-1">Pass Type</div>
                    <div className="w-[160px] text-right">Access</div>
                </div>

                {sortTiersByType(event.tiers).map((tier) => {
                    const stock = inventory[tier.id];
                    const isSoldOut = stock?.soldOut;
                    const isLowStock = stock?.remaining !== undefined && stock.remaining < 5 && !isSoldOut;

                    let availabilityText = "Available";
                    let availabilityColorClass = "text-charcoal/70";
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
                            className={`block border-b transition-colors md:px-6 py-8 relative ${isSelected ? 'border-primary bg-primary/5' : 'border-charcoal/10 hover:bg-black/[0.02]'
                                } ${isSoldOut ? 'opacity-50 grayscale' : 'cursor-pointer'}`}
                            onClick={() => !isSoldOut && onSelect(tier)}
                        >
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
                                {/* Availability Mobile */}
                                <div className="flex flex-col gap-1 w-[120px] lg:w-1/4">
                                    <h4 className={`text-[10px] sm:text-[11px] uppercase font-mono tracking-[0.2em] font-bold ${availabilityColorClass}`}>
                                        {availabilityText}
                                    </h4>
                                </div>

                                {/* Title & Desktop Description */}
                                <div className="flex flex-col gap-1 flex-1 pr-4">
                                    <div className="flex items-center gap-3">
                                        <h3 className={`h3 transition-colors text-xl sm:text-2xl lg:text-3xl uppercase ${isSelected ? 'text-primary' : 'group-hover:text-primary'}`}>
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
                                    <p className="text-[11px] md:text-[12px] font-mono text-charcoal/60 md:max-w-md mt-2 italic leading-relaxed">
                                        {tier.description}
                                    </p>
                                </div>

                                {/* Price & Button */}
                                <div className="flex items-center gap-4 md:gap-8 w-full md:w-[200px] justify-between md:justify-end shrink-0">
                                    <div className="flex flex-row md:flex-col items-baseline md:items-end gap-2 md:gap-0">
                                        <span className={`text-2xl font-bold ${isSoldOut ? 'text-charcoal/40 line-through' : 'text-charcoal'}`} style={{ fontFamily: fonts.body }}>
                                            {tier.price}
                                        </span>
                                    </div>
                                    <Button
                                        variant={isSelected ? "primary" : "deepDry"}
                                        className={`!px-4 !py-2 !text-[11px] md:!text-[14px] md:!px-8 md:!py-3 ${isSoldOut ? 'opacity-50 pointer-events-none' : ''}`}
                                    >
                                        {isSelected ? 'Selected' : (isSoldOut ? 'Sold Out' : 'Select')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 pt-8 flex justify-center">
                <p className="text-xs uppercase font-bold tracking-[0.3em] text-charcoal/40">
                    Secure payment & instant confirmation
                </p>
            </div>
        </div>
    );
}

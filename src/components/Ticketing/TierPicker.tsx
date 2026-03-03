import React from 'react';
import { motion } from 'framer-motion';
import { TicketSubTier, EventData, sortTiersByType } from '@/data/festivals';
import { fonts } from '@/design-system/tokens';
import { SectionHeader } from '@/components/SectionHeader';

interface TierPickerProps {
    event: EventData;
    selectedTierId?: string;
    onSelect: (tier: TicketSubTier) => void;
    inventory?: Record<string, { remaining: number; soldOut: boolean }>;
}

export function TierPicker({ event, selectedTierId, onSelect, inventory = {} }: TierPickerProps) {
    return (
        <div className="w-full max-w-3xl mx-auto px-4 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <div className="relative">
                <div className="relative">
                    <div className="mb-0 text-center">
                        <span className="text-xs uppercase font-bold tracking-[0.3em] text-charcoal/60 mb-2 block">Choose Your Pass</span>
                    </div>

                    <div className="space-y-4">
                        {sortTiersByType(event.tiers).map((tier) => {
                            const stock = inventory[tier.id];
                            const isSoldOut = stock?.soldOut;
                            const isLowStock = stock?.remaining !== undefined && stock.remaining < 5 && !isSoldOut;

                            return (
                                <motion.button
                                    key={tier.id}
                                    whileHover={!isSoldOut ? { scale: 1.01, y: -4 } : {}}
                                    whileTap={!isSoldOut ? { scale: 0.98 } : {}}
                                    onClick={() => !isSoldOut && onSelect(tier)}
                                    disabled={isSoldOut}
                                    className={`w-full text-left p-6 md:p-8 rounded-[2.5rem] transition-all duration-500 flex items-center justify-between group/tier 
                                    ${isSoldOut
                                            ? 'bg-gray-100 opacity-40 cursor-not-allowed grayscale'
                                            : selectedTierId === tier.id
                                                ? 'bg-charcoal text-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4),inset_0_0_0_4px_rgba(248,198,48,0.5)] scale-[1.01] -translate-y-1'
                                                : 'bg-primary/10 text-charcoal shadow-[inset_0_0_0_4px_rgba(248,198,48,0.4),inset_0_0_10px_8px_rgba(212,163,42,0.3)] hover:bg-primary/15 hover:shadow-[inset_0_0_0_4px_rgba(248,198,48,0.6),inset_0_0_15px_10px_rgba(212,163,42,0.5)]'
                                        }`}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h4 className="font-bold text-lg uppercase tracking-tight">
                                                {tier.name}
                                                {isSoldOut && <span className="ml-3 inline-block px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded leading-none border border-red-200 uppercase font-bold">SOLD OUT</span>}
                                                {isLowStock && <span className="ml-3 inline-block px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded leading-none border border-yellow-200 uppercase font-bold">ONLY {stock.remaining} LEFT</span>}
                                            </h4>
                                            {selectedTierId === tier.id && !isSoldOut && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                                            )}
                                        </div>
                                        <p className={`text-xs ${selectedTierId === tier.id ? 'text-white/80' : 'text-charcoal/70'} italic`}>
                                            {tier.description}
                                        </p>
                                    </div>
                                    <div className="text-right ml-4">
                                        <span className={`text-2xl font-bold ${isSoldOut ? 'text-gray-400 line-through' : selectedTierId === tier.id ? 'text-primary' : 'text-charcoal'}`} style={{ fontFamily: fonts.body }}>
                                            {tier.price}
                                        </span>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>

                    <div className="mt-8 pt-8 border-t border-charcoal/5 flex justify-center">
                        <p className="text-xs uppercase font-bold tracking-[0.3em] text-charcoal/40">
                            Secure payment & instant confirmation
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

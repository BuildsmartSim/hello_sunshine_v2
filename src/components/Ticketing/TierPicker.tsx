import React from 'react';
import { motion } from 'framer-motion';
import { TicketSubTier, EventData } from './FestivalPass';
import { fonts, textures } from '@/design-system/tokens';

interface TierPickerProps {
    event: EventData;
    selectedTierId?: string;
    onSelect: (tier: TicketSubTier) => void;
}

export function TierPicker({ event, selectedTierId, onSelect }: TierPickerProps) {
    return (
        <div className="w-full max-w-2xl mx-auto px-4 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative bg-white/40 p-1 md:p-2 rounded-[2rem] shadow-2xl overflow-hidden group">
                {/* Background Textures */}
                <div className="absolute inset-0 opacity-20 mix-blend-multiply pointer-events-none" style={{ backgroundImage: `url('${textures.paper}')` }}></div>

                <div className="relative bg-white/80 rounded-[1.8rem] p-8 md:p-12 border border-charcoal/5">
                    <div className="mb-10 text-center">
                        <span className="text-[10px] uppercase tracking-[0.5em] text-primary font-black mb-2 block">Choose Your Pass</span>
                        <h3 className="text-3xl md:text-4xl font-black text-charcoal uppercase leading-none tracking-tighter" style={{ fontFamily: fonts.accent }}>
                            {event.title}
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {event.tiers.map((tier) => (
                            <motion.button
                                key={tier.id}
                                whileHover={{ scale: 1.01, x: 5 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onSelect(tier)}
                                className={`w-full text-left p-6 rounded-2xl border-2 transition-all flex items-center justify-between group/tier ${selectedTierId === tier.id
                                        ? 'bg-charcoal border-charcoal text-white shadow-xl'
                                        : 'bg-white/50 border-charcoal/5 hover:border-primary/30 text-charcoal shadow-sm'
                                    }`}
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h4 className="font-bold text-lg uppercase tracking-tight">{tier.name}</h4>
                                        {selectedTierId === tier.id && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                                        )}
                                    </div>
                                    <p className={`text-xs ${selectedTierId === tier.id ? 'text-white/60' : 'text-charcoal/40'} italic`}>
                                        {tier.description}
                                    </p>
                                </div>
                                <div className="text-right ml-4">
                                    <span className={`text-2xl font-bold ${selectedTierId === tier.id ? 'text-primary' : 'text-charcoal'}`} style={{ fontFamily: fonts.display }}>
                                        {tier.price}
                                    </span>
                                </div>
                            </motion.button>
                        ))}
                    </div>

                    <div className="mt-8 pt-8 border-t border-charcoal/5 flex justify-center">
                        <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-charcoal/20">
                            Secure payment & instant confirmation
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

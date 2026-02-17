"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { textures, fonts } from '@/design-system/tokens';
import { TicketTier } from './FestivalPass';
import { Button } from '@/components/Button';
import Link from 'next/link';

interface StepConfirmationProps {
    formData: {
        name: string;
        email: string;
    };
    selectedTier: TicketTier | null;
}

export function StepConfirmation({ formData, selectedTier }: StepConfirmationProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg mx-auto px-4"
        >
            <div
                className="relative bg-white p-8 md:p-12 shadow-2xl overflow-hidden"
                style={{
                    clipPath: 'polygon(0% 0%, 100% 0%, 100% 95%, 95% 100%, 5% 100%, 0% 95%)'
                }}
            >
                {/* Paper Texture Overlay */}
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: `url('${textures.paper}')` }}></div>

                {/* Pencil Grain Overlay */}
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: `url('${textures.pencilGrain}')` }}></div>

                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                        <span className="text-4xl">✨</span>
                    </div>

                    <h2 className="text-4xl font-black text-charcoal uppercase mb-2" style={{ fontFamily: fonts.accent }}>
                        Booking Confirmed
                    </h2>
                    <p className="font-handwriting text-2xl text-charcoal/60 mb-12">
                        Get ready for the warmth, {formData.name.split(' ')[0]}.
                    </p>

                    <div className="w-full border-t border-dashed border-charcoal/20 pt-8 mb-8 text-left">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] uppercase tracking-[0.4em] text-charcoal/40 font-bold">Pass Tier</span>
                            <span className="text-sm font-bold text-charcoal uppercase">{selectedTier?.title}</span>
                        </div>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] uppercase tracking-[0.4em] text-charcoal/40 font-bold">Price</span>
                            <span className="text-sm font-bold text-charcoal">{selectedTier?.price}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] uppercase tracking-[0.4em] text-charcoal/40 font-bold">Booking ID</span>
                            <span className="text-sm font-mono text-primary font-bold">HSS-2026-{Math.floor(Math.random() * 10000)}</span>
                        </div>
                    </div>

                    <p className="text-xs text-charcoal/40 leading-relaxed italic mb-12">
                        A digital copy of your receipt and entrance instructions has been sent to {formData.email}.
                    </p>

                    <Link href="/">
                        <Button variant="ghostDry">
                            Return Home
                        </Button>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}

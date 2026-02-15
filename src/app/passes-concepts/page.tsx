"use client";

import React from 'react';
import Image from 'next/image';
import { textures, colors, fonts, pencil } from '@/design-system/tokens';
import { HandDrawnFilter } from '@/components/LayeredPencil';

/* ═══════════════════════════════════════════════════════
   THE CHOSEN CARD: "THE YELLOW STRIPE"
   Refined for production use.
   ═══════════════════════════════════════════════════════ */
function TicketYellowStripe({ title, price, description, variant = 'standard', className = '' }:
    { title: string, price: string, description: string, variant?: 'standard' | 'highlight', className?: string }) {

    // Highlight variant uses yellow background for VIP look
    const isHighlight = variant === 'highlight';
    const bgClass = isHighlight ? 'bg-[#F8C630]' : 'bg-[#EBE5CE]';
    const stripeClass = isHighlight ? 'bg-[#EBE5CE] text-[#F8C630]' : 'bg-[#F8C630] text-charcoal/60';
    const borderClass = isHighlight ? 'border-charcoal/20' : 'border-[#F8C630]';
    const maskId = `mask-${title.replace(/\s+/g, '-').toLowerCase()}`;

    return (
        <div className={`relative group cursor-pointer transition-transform duration-500 will-change-transform ${className}`}>
            <div className={`relative ${bgClass} w-[300px] h-[480px] mx-auto shadow-xl overflow-hidden flex flex-col`}
                style={{
                    maskImage: 'radial-gradient(circle at 10px 10px, transparent 15px, black 16px), radial-gradient(circle at 290px 470px, transparent 15px, black 16px)',
                    WebkitMaskImage: 'radial-gradient(circle at 10px 10px, transparent 15px, black 16px), radial-gradient(circle at 290px 470px, transparent 15px, black 16px)'
                }}>
                <div className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none" style={{ backgroundImage: `url('${textures.paper}')` }}></div>

                {/* Yellow Stripe Header */}
                <div className={`h-24 ${isHighlight ? 'bg-white' : 'bg-[#F8C630]'} w-[150%] -ml-4 -mt-4 transform -rotate-3 border-b-2 border-dashed border-charcoal/20 flex items-end justify-center pb-2 opacity-90 mix-blend-multiply`}>
                    <span className="font-mono text-xs tracking-[0.5em] text-charcoal/60 uppercase font-bold transform rotate-3">ADMISSION TICKET</span>
                </div>

                <div className="flex-1 p-8 flex flex-col items-center text-center relative z-10">
                    <h3 style={{ fontFamily: fonts.accent }} className="text-5xl text-charcoal mb-4 leading-none mt-4">{title}</h3>

                    <div className={`w-16 h-16 rounded-full border-2 border-dashed ${borderClass} flex items-center justify-center mb-6 rotate-12 bg-white/40 shadow-sm`}>
                        <span style={{ fontFamily: fonts.display }} className="text-xl font-bold text-charcoal/80">VIP</span>
                    </div>

                    <p style={{ fontFamily: fonts.body }} className="text-charcoal/70 text-xs leading-relaxed mb-auto border-t border-b border-charcoal/10 py-4 font-medium">
                        {description}
                    </p>

                    <div className="w-full bg-charcoal/5 py-4 mt-4 rounded-sm border border-charcoal/5">
                        <span style={{ fontFamily: fonts.display }} className="text-4xl text-charcoal font-bold block">{price}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}


/* ═══════════════════════════════════════════════════════
   LAYOUT 1: STANDARD GRID
   Clean, balanced, equal emphasis.
   ═══════════════════════════════════════════════════════ */
function LayoutStandard() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <TicketYellowStripe
                title="Day Pass"
                price="$45"
                description="Sunlight and stillness. Valid for one full day."
                className="hover:-translate-y-2"
            />
            <TicketYellowStripe
                title="Weekender"
                price="$120"
                description="Fri-Sun Access. Towel service included."
                className="hover:-translate-y-2"
                variant="highlight"
            />
            <TicketYellowStripe
                title="Season"
                price="$450"
                description="Unlimited summer access. Priority booking."
                className="hover:-translate-y-2"
            />
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   LAYOUT 2: THE HAND (FAN)
   Interactive, organic, playful overlap.
   ═══════════════════════════════════════════════════════ */
function LayoutFan() {
    return (
        <div className="relative h-[600px] flex items-center justify-center w-full max-w-4xl mx-auto perspective-[1000px]">
            {/* Left Card */}
            <div className="absolute left-[10%] top-10 z-10 transform -rotate-6 transition-all duration-500 hover:-translate-y-8 hover:rotate-[-8deg] hover:z-40">
                <TicketYellowStripe
                    title="Day Pass"
                    price="$45"
                    description="Sunlight and stillness. Valid for one full day."
                    className="shadow-2xl"
                />
            </div>

            {/* Center Card (Highlight) */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 z-20 transition-all duration-500 hover:-translate-y-10 hover:scale-105 hover:z-50">
                <TicketYellowStripe
                    title="Weekender"
                    price="$120"
                    description="Fri-Sun Access. Towel service included."
                    variant="highlight"
                    className="shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]"
                />
            </div>

            {/* Right Card */}
            <div className="absolute right-[10%] top-10 z-10 transform rotate-6 transition-all duration-500 hover:-translate-y-8 hover:rotate-[8deg] hover:z-40">
                <TicketYellowStripe
                    title="Season"
                    price="$450"
                    description="Unlimited summer access. Priority booking."
                    className="shadow-2xl"
                />
            </div>

            <p className="absolute bottom-0 text-center w-full font-handwriting text-charcoal/40 text-xl animate-pulse">
                Hover to pick a card...
            </p>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   LAYOUT 3: THE PODIUM (STAGGERED)
   Clear hierarchy, center stage.
   ═══════════════════════════════════════════════════════ */
function LayoutPodium() {
    return (
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0 lg:gap-8 max-w-5xl mx-auto px-4">
            {/* Left - Standard */}
            <div className="transform scale-90 translate-y-8 opacity-90 transition-all hover:scale-95 hover:opacity-100 duration-300">
                <TicketYellowStripe
                    title="Day Pass"
                    price="$45"
                    description="Sunlight and stillness. Valid for one full day."
                />
            </div>

            {/* Center - Hero */}
            <div className="z-10 relative -mx-4 md:mx-0 shadow-2xl rounded-xl">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-charcoal text-[#F8C630] px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest shadow-lg whitespace-nowrap z-20">
                    Most Popular Choice
                </div>
                <TicketYellowStripe
                    title="Weekender"
                    price="$120"
                    description="Fri-Sun Access. Towel service included."
                    variant="highlight"
                    className="transform hover:scale-105"
                />
            </div>

            {/* Right - Standard */}
            <div className="transform scale-90 translate-y-8 opacity-90 transition-all hover:scale-95 hover:opacity-100 duration-300">
                <TicketYellowStripe
                    title="Season"
                    price="$450"
                    description="Unlimited summer access. Priority booking."
                />
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   PAGE LAYOUT
   ═══════════════════════════════════════════════════════ */
export default function PassesConceptsPage() {
    return (
        <div className="min-h-screen bg-[#F3EFE6] px-4 py-20 font-body text-charcoal overflow-x-hidden">
            {/* Inject Global Filter */}
            <HandDrawnFilter />

            <div className="max-w-7xl mx-auto mb-20 text-center">
                <h1 className="text-5xl md:text-7xl mb-6 text-charcoal" style={{ fontFamily: fonts.accent }}>
                    The Yellow Stripe: Layouts
                </h1>
                <p className="text-xl md:text-2xl font-display italic opacity-60 max-w-2xl mx-auto">
                    Three ways to configure the chosen card design.
                </p>
            </div>

            <div className="max-w-7xl mx-auto space-y-40 pb-40">

                {/* 1. GRID */}
                <section>
                    <div className="flex gap-4 items-center justify-center mb-12 border-b border-charcoal/10 pb-4 max-w-md mx-auto">
                        <span className="font-mono text-xs bg-charcoal text-white px-2 py-1">LAYOUT 01</span>
                        <h2 className="text-2xl font-bold font-display">The Standard Grid</h2>
                    </div>
                    <LayoutStandard />
                </section>

                {/* 2. FAN */}
                <section className="bg-woodDark/5 py-20 rounded-[60px]">
                    <div className="flex gap-4 items-center justify-center mb-12 border-b border-charcoal/10 pb-4 max-w-md mx-auto">
                        <span className="font-mono text-xs bg-[#F8C630] text-charcoal px-2 py-1">LAYOUT 02</span>
                        <h2 className="text-2xl font-bold font-display">The Hand (Fan)</h2>
                    </div>
                    <LayoutFan />
                </section>

                {/* 3. PODIUM */}
                <section>
                    <div className="flex gap-4 items-center justify-center mb-12 border-b border-charcoal/10 pb-4 max-w-md mx-auto">
                        <span className="font-mono text-xs bg-white border border-charcoal px-2 py-1">LAYOUT 03</span>
                        <h2 className="text-2xl font-bold font-display">The Podium</h2>
                    </div>
                    <LayoutPodium />
                </section>

            </div>
        </div>
    );
}

"use client";

import React from 'react';
import { textures, fonts } from '@/design-system/tokens';

/* ═══════════════════════════════════════════════════════
   THE CHOSEN CARD: "THE YELLOW STRIPE"
   ═══════════════════════════════════════════════════════ */
function TicketYellowStripe({ title, price, description, variant = 'standard', className = '' }:
    { title: string, price: string, description: string, variant?: 'standard' | 'highlight', className?: string }) {

    const isHighlight = variant === 'highlight';
    const bgClass = isHighlight ? 'bg-[#F8C630]' : 'bg-[#EBE5CE]';
    const borderClass = isHighlight ? 'border-charcoal/20' : 'border-[#F8C630]';

    return (
        <div className={`relative group cursor-pointer transition-transform duration-500 will-change-transform ${className}`}>
            <div className={`relative ${bgClass} w-[280px] h-[440px] md:w-[300px] md:h-[480px] mx-auto shadow-xl overflow-hidden flex flex-col`}
                style={{
                    maskImage: 'radial-gradient(circle at 10px 10px, transparent 15px, black 16px), radial-gradient(circle at 290px 470px, transparent 15px, black 16px)',
                    WebkitMaskImage: 'radial-gradient(circle at 10px 10px, transparent 15px, black 16px), radial-gradient(circle at 290px 470px, transparent 15px, black 16px)'
                }}>
                <div className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none" style={{ backgroundImage: `url('${textures.paper}')` }}></div>

                {/* Yellow Stripe Header */}
                <div className={`h-20 md:h-24 ${isHighlight ? 'bg-white' : 'bg-[#F8C630]'} w-[150%] -ml-4 -mt-4 transform -rotate-3 border-b-2 border-dashed border-charcoal/20 flex items-end justify-center pb-2 opacity-90 mix-blend-multiply`}>
                    <span className="font-mono text-[10px] md:text-xs tracking-[0.5em] text-charcoal/60 uppercase font-bold transform rotate-3">ADMISSION TICKET</span>
                </div>

                <div className="flex-1 p-6 md:p-8 flex flex-col items-center text-center relative z-10">
                    <h3 style={{ fontFamily: fonts.accent }} className="text-4xl md:text-5xl text-charcoal mb-4 leading-none mt-4">{title}</h3>

                    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-dashed ${borderClass} flex items-center justify-center mb-6 rotate-12 bg-white/40 shadow-sm`}>
                        <span style={{ fontFamily: fonts.display }} className="text-lg md:text-xl font-bold text-charcoal/80">VIP</span>
                    </div>

                    <p style={{ fontFamily: fonts.body }} className="text-charcoal/70 text-[10px] md:text-xs leading-relaxed mb-auto border-t border-b border-charcoal/10 py-4 font-medium">
                        {description}
                    </p>

                    <div className="w-full bg-charcoal/5 py-3 md:py-4 mt-4 rounded-sm border border-charcoal/5">
                        <span style={{ fontFamily: fonts.display }} className="text-3xl md:text-4xl text-charcoal font-bold block">{price}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function TicketingSection() {
    return (
        <section className="py-32 overflow-hidden bg-[#F3EFE6] relative">
            {/* Paper Texture Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply"
                style={{
                    backgroundImage: `url('${textures.paper}')`,
                    backgroundSize: '400px',
                }}></div>
            <div className="max-w-7xl mx-auto px-6 mb-20 text-center">
                <h2 className="text-5xl md:text-7xl text-wood-dark mb-4" style={{ fontFamily: fonts.accent }}>Festival Passes</h2>
                <div className="w-24 h-1 bg-primary mx-auto mb-6"></div>
                <p className="font-display italic text-xl text-charcoal/60">Choose your journey into warmth.</p>
            </div>

            <div className="relative h-[550px] md:h-[650px] flex items-center justify-center w-full max-w-5xl mx-auto perspective-[1000px] mb-20 px-4">
                {/* Left Card */}
                <div className="absolute left-[5%] md:left-[15%] top-10 z-10 transform -rotate-6 transition-all duration-500 hover:-translate-y-8 hover:rotate-[-8deg] hover:z-40">
                    <TicketYellowStripe
                        title="Day Pass"
                        price="$45"
                        description="Sunlight and stillness. Valid for one full day of restoration."
                        className="shadow-2xl"
                    />
                </div>

                {/* Center Card (Highlight) */}
                <div className="absolute left-1/2 -translate-x-1/2 top-0 z-20 transition-all duration-500 hover:-translate-y-10 hover:scale-105 hover:z-50">
                    <TicketYellowStripe
                        title="Weekender"
                        price="$120"
                        description="Fri-Sun Access. Our most popular choice for the full experience."
                        variant="highlight"
                        className="shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]"
                    />
                </div>

                {/* Right Card */}
                <div className="absolute right-[5%] md:right-[15%] top-10 z-10 transform rotate-6 transition-all duration-500 hover:-translate-y-8 hover:rotate-[8deg] hover:z-40">
                    <TicketYellowStripe
                        title="Season"
                        price="$450"
                        description="Unlimited summer access. Priority booking & exclusive events."
                        className="shadow-2xl"
                    />
                </div>

                <p className="absolute bottom-4 text-center w-full font-handwriting text-charcoal/30 text-xl animate-pulse">
                    Hover to pick your pass...
                </p>
            </div>
        </section>
    );
}

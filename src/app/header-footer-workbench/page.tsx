"use client";

import React, { useState } from 'react';
import { textures, fonts, colors, icons, pencil } from '@/design-system/tokens';
import Image from 'next/image';
import { LayeredPencil } from '@/components/LayeredPencil';

/* ─────────────────────────────────────────────────────
   THE REFINED YELLOW HERITAGE - FINAL ITERATIONS
   ───────────────────────────────────────────────────── */

/**
 * REFINED VARIANT A: The Sun-Drenched Heritage (Refined)
 * Classic layout + Bold Uppercase Nav + Large Icons.
 */
function HeaderHeritageRefined() {
    return (
        <header className="w-full bg-[#FDFCF9] border-b border-charcoal/10 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-8 py-8 flex items-center justify-between relative z-10">
                {/* Identity Column */}
                <div className="flex items-center gap-10">
                    <div className="relative w-16 h-16 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                        <Image src="/HSSLOGO black YELLOW.png" alt="Hello Sunshine" fill className="object-contain" />
                    </div>
                    <div className="flex flex-col border-l border-charcoal/10 pl-10">
                        <LayeredPencil
                            text="Hello Sunshine"
                            size="3rem"
                            hatchClass={pencil.hatch.yellowBold}
                            strokeColor={colors.charcoal}
                            strokeWidth="1.2px"
                            blendClass="pencil-blend-multiply"
                        />
                        <span className="text-[10px] font-mono tracking-[0.5em] text-charcoal opacity-40 uppercase font-bold mt-1">
                            Est. 2019
                        </span>
                    </div>
                </div>

                {/* Refined Navigation Column (Style from Variant 2) */}
                <nav className="hidden lg:flex items-center gap-12 font-body text-[11px] font-bold uppercase tracking-[0.4em]">
                    {['Experience', 'Our Story', 'Booking'].map(it => (
                        <a key={it} href="#" className="text-charcoal/40 hover:text-charcoal transition-all relative group">
                            {it}
                            <span className="absolute -bottom-2 left-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                        </a>
                    ))}
                </nav>

                {/* Right: Contact & Action (Large Icons) */}
                <div className="flex items-center gap-10">
                    <div className="flex items-center gap-5">
                        <button className="w-14 h-14 rounded-full border border-charcoal/10 flex items-center justify-center hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all group bg-white/40">
                            <Image src={icons.phone} alt="Phone" width={22} height={22} className="opacity-30 group-hover:opacity-100 transition-opacity" />
                        </button>
                        <button className="w-14 h-14 rounded-full border border-charcoal/10 flex items-center justify-center hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all group bg-white/40">
                            <Image src={icons.mail} alt="Email" width={22} height={22} className="opacity-30 group-hover:opacity-100 transition-opacity" />
                        </button>
                    </div>
                    <button className="hidden md:block bg-charcoal text-white px-10 py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-primary hover:text-charcoal transition-all shadow-xl border border-white/10 active:scale-95">
                        Join the Warmth
                    </button>
                </div>
            </div>
        </header>
    );
}

export default function HeaderFooterWorkbench() {
    const [debugMode, setDebugMode] = useState(false);

    return (
        <div className={`min-h-screen flex flex-col ${debugMode ? 'debug-grid' : 'bg-[#FDFCF9]'} pb-40`}>

            <main className="flex-1 w-full pt-20">
                <div className="max-w-7xl mx-auto px-8 text-center mb-32">
                    <h1 className="text-7xl font-black text-charcoal mb-4" style={{ fontFamily: fonts.accent }}>Yellow Heritage Refinement</h1>
                    <p className="text-2xl font-display italic text-charcoal/40">Merging the Classic Symmetric Layout with Studio-Grade Sizing.</p>
                </div>

                {/* FINAL CANDIDATE */}
                <section>
                    <div className="max-w-7xl mx-auto mb-10 px-8 text-center md:text-left">
                        <span className="text-primary font-bold uppercase tracking-widest text-xs">The Fusion Candidate</span>
                        <h2 className="text-4xl font-bold text-wood-dark mt-2" style={{ fontFamily: fonts.accent }}>The Sun-Drenched Heritage II</h2>
                        <ul className="list-disc pl-5 mt-4 space-y-2 opacity-60 max-w-2xl text-sm">
                            <li><strong>Layout</strong>: Restored to the classic 3-column symmetry.</li>
                            <li><strong>Branding</strong>: Hand-drawn Yellow Hatch + 'Est. 2019' anchor.</li>
                            <li><strong>Lettering</strong>: Switched to bold, uppercase 'Studio' tracking (0.4em).</li>
                            <li><strong>Icons</strong>: Increased presence (14x14 buttons / 22x22 assets) for better tactile interaction.</li>
                        </ul>
                    </div>
                    <div className="bg-[#FDFCF9] py-20 border-y border-charcoal/10 shadow-inner">
                        <HeaderHeritageRefined />
                    </div>
                </section>

                {/* Usage Note */}
                <div className="max-w-3xl mx-auto mt-20 p-8 bg-primary/5 rounded-2xl border border-primary/10">
                    <p className="font-handwriting text-2xl text-primary/80 text-center">
                        Is the balance between the bold nav and the hand-drawn branding feeling consistent now?
                    </p>
                </div>
            </main>

            <style jsx global>{`
                .debug-grid {
                    background-image: linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
                                    linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px);
                    background-size: 20px 20px;
                }
            `}</style>
        </div>
    );
}

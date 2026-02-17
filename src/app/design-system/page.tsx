"use client";

import React from 'react';
import Image from 'next/image';
import { fonts, textures, colors } from '@/design-system/tokens';
import { LayeredPencil, HandDrawnFilter } from '@/components/LayeredPencil';
import { Polaroid } from '@/components/Polaroid';
import Logo from '@/components/Logo';

/* ─────────────────────────────────────────────────────
   MASTER DESIGN SYSTEM & REFERENCE GUIDE
   ───────────────────────────────────────────────────── */

function SectionHeader({ title, subtitle }: { title: string, subtitle?: string }) {
    return (
        <div className="mb-16">
            <h2 className="text-6xl italic mb-4" style={{ fontFamily: fonts.accent }}>{title}</h2>
            {subtitle && <p className="text-2xl font-display italic opacity-50 max-w-2xl">{subtitle}</p>}
            <div className="h-[2px] w-24 bg-primary mt-8"></div>
        </div>
    );
}

function ColorBox({ color, name, hex }: { color: string, name: string, hex: string }) {
    return (
        <div className="group">
            <div className="w-full aspect-square rounded-3xl border border-charcoal/5 shadow-sm mb-4 transition-transform group-hover:scale-[1.02]" style={{ backgroundColor: color }}></div>
            <h4 className="font-bold uppercase tracking-tighter text-sm opacity-80">{name}</h4>
            <p className="font-mono text-[10px] opacity-40 uppercase">{hex}</p>
        </div>
    );
}

export default function DesignSystemPage() {
    return (
        <div className="min-h-screen bg-[#FDFCF9] text-charcoal selection:bg-primary/30">
            <HandDrawnFilter />

            {/* HERO HEADER */}
            <header className="py-32 px-12 md:px-24 border-b border-charcoal/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 translate-x-1/2"></div>
                <div className="mx-auto relative z-10" style={{ maxWidth: 'var(--hss-site-width)' }}>
                    <div className="flex items-center gap-6 mb-12">
                        <div className="w-16 h-20 relative">
                            <Logo className="w-full h-full" />
                        </div>
                        <div className="h-12 w-[1px] bg-charcoal/20"></div>
                        <span className="font-bold uppercase tracking-[0.4em] text-xs opacity-40">Reference Manual v2.0</span>
                    </div>

                    <h1 className="text-8xl md:text-[10rem] leading-[0.85] mb-12" style={{ fontFamily: fonts.accent }}>
                        The Design<br />System
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-end">
                        <div className="prose prose-2xl font-display italic leading-relaxed opacity-70">
                            <p>
                                Hello Sunshine is an ode to the handmade. A visual language built on the tension between editorial precision and the organic character of wood, fire, and ink.
                            </p>
                        </div>
                        <div className="hidden md:flex flex-col gap-4 text-right">
                            <span className="font-handwriting text-4xl text-primary rotate-[-4deg]">Hand-built with soul.</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="px-12 md:px-24 py-32 space-y-48">

                {/* 1. PHILOSOPHY */}
                <section className="mx-auto" style={{ maxWidth: 'var(--hss-site-width)' }}>
                    <SectionHeader title="Design Philosophy" subtitle="The core principles that govern our aesthetic decisions." />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="p-10 bg-white shadow-photo rounded-[40px] rotate-[-1deg] border border-charcoal/5">
                            <h3 className="text-3xl mb-6" style={{ fontFamily: fonts.accent }}>Character over Perfection</h3>
                            <p className="font-display italic text-xl opacity-60">
                                We embrace the wobble. Subtle rotations, hand-drawn strokes, and imperfect textures prevent the site from feeling like a rigid template.
                            </p>
                        </div>
                        <div className="p-10 bg-charcoal text-wood-light shadow-photo rounded-[40px] rotate-[1deg]">
                            <h3 className="text-3xl mb-6 text-primary" style={{ fontFamily: fonts.accent }}>Tactile Depth</h3>
                            <p className="font-display italic text-xl opacity-60 text-white/50">
                                Surfaces have weight. We use "Smoked Wood" shadows and paper textures to bridge the uncancny valley between screen and shelf.
                            </p>
                        </div>
                        <div className="p-10 bg-white shadow-photo rounded-[40px] rotate-[-2deg] border border-charcoal/5">
                            <h3 className="text-3xl mb-6" style={{ fontFamily: fonts.accent }}>Editorial Rhythm</h3>
                            <p className="font-display italic text-xl opacity-60">
                                High-impact typography meets wide-open space. The grid is structured like a premium coffee table book.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 2. TYPOGRAPHY */}
                <section className="mx-auto" style={{ maxWidth: 'var(--hss-site-width)' }}>
                    <SectionHeader title="Typography" subtitle="A hierarchy built for command and intimacy." />

                    <div className="space-y-32">
                        {/* CHICLE */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 border-b border-charcoal/10 pb-20">
                            <div className="md:col-span-4">
                                <h4 className="font-bold uppercase tracking-widest text-xs opacity-40 mb-4">Master Title</h4>
                                <p className="text-3xl italic mb-4" style={{ fontFamily: fonts.accent }}>Chicle Regular</p>
                                <p className="opacity-50 font-body text-sm leading-relaxed">
                                    Our voice. Used for headers and brandmarks. Always paired with the hand-drawn pencil hatch filter.
                                </p>
                            </div>
                            <div className="md:col-span-8 space-y-12">
                                <div className="flex items-center gap-12">
                                    <LayeredPencil
                                        hatchClass="hatch-aesthetic-yellow-bold" strokeColor="#1F1A17"
                                        strokeWidth="1.5px" fillOpacity="1" strokeOpacity="1" blendClass="pencil-blend-multiply"
                                        size="120px" text="Sunshine"
                                    />
                                    <span className="text-[10px] font-mono opacity-20 uppercase tracking-widest mt-12">Champion Scale</span>
                                </div>
                                <div className="flex items-center gap-12">
                                    <LayeredPencil
                                        hatchClass="hatch-aesthetic-yellow" strokeColor="#1F1A17"
                                        strokeWidth="1px" fillOpacity="0.6" strokeOpacity="0.8" blendClass="pencil-blend-multiply"
                                        size="64px" text="Hand-built Memories"
                                    />
                                    <span className="text-[10px] font-mono opacity-20 uppercase tracking-widest">Detail Scale</span>
                                </div>
                            </div>
                        </div>

                        {/* CAVEAT */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 border-b border-charcoal/10 pb-20">
                            <div className="md:col-span-4">
                                <h4 className="font-bold uppercase tracking-widest text-xs opacity-40 mb-4">Personal Annotation</h4>
                                <p className="text-3xl italic mb-4" style={{ fontFamily: 'var(--font-caveat)' }}>Caveat</p>
                                <p className="opacity-50 font-body text-sm leading-relaxed">
                                    For notes, captions, and intimate side-thoughts. Provides a human contrast to the display headers.
                                </p>
                            </div>
                            <div className="md:col-span-8 py-8">
                                <p className="text-6xl text-charcoal/70 leading-tighter" style={{ fontFamily: 'var(--font-caveat)' }}>
                                    "Into the warmth, away from the noise."
                                </p>
                                <div className="flex gap-12 mt-8">
                                    <span className="text-3xl text-primary -rotate-2" style={{ fontFamily: 'var(--font-caveat)' }}>Verified Soul</span>
                                    <span className="text-3xl text-charcoal/30 rotate-1" style={{ fontFamily: 'var(--font-caveat)' }}>2026 Archive</span>
                                </div>
                            </div>
                        </div>

                        {/* DM SANS */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 border-b border-charcoal/10 pb-20">
                            <div className="md:col-span-4">
                                <h4 className="font-bold uppercase tracking-widest text-xs opacity-40 mb-4">Editorial Body</h4>
                                <p className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-dm-sans)' }}>DM Sans</p>
                                <p className="opacity-50 font-body text-sm leading-relaxed">
                                    Geometric and high-readability. Used for all informational copy and technical details.
                                </p>
                            </div>
                            <div className="md:col-span-8 max-w-2xl">
                                <p className="text-2xl font-display italic text-charcoal/80 mb-6 leading-relaxed">
                                    We craft spaces that feel sculpted from the earth itself. Heavy cedar timbers, the crackle of a live fire, and the shock of cold water.
                                </p>
                                <p className="font-body text-charcoal/50 leading-loose">
                                    Hello Sunshine is an ode to simple pleasures and handmade aesthetics. Every timber is hand-selected, every joint is cut with precision, and every session is designed to be a transformative ritual.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. COLORS & TEXTURES */}
                <section className="mx-auto" style={{ maxWidth: 'var(--hss-site-width)' }}>
                    <SectionHeader title="Atmosphere" subtitle="The palette and textures of the wild." />

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-32">
                        <ColorBox color="#F8C630" name="Sunlight" hex="#F8C630" />
                        <ColorBox color="#2C2C2C" name="Charcoal" hex="#2C2C2C" />
                        <ColorBox color="#F3EFE6" name="Natural Paper" hex="#F3EFE6" />
                        <ColorBox color="#322B28" name="Smoked Wood" hex="#322B28" />
                        <ColorBox color="#3E2723" name="Deep Cedar" hex="#3E2723" />
                        <ColorBox color="#FDFCF9" name="Alabaster" hex="#FDFCF9" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
                        <div className="space-y-12">
                            <h4 className="text-sm font-bold uppercase tracking-widest opacity-30">Pencil Hatches</h4>
                            <div className="space-y-8">
                                <div className="flex items-center gap-8">
                                    <div className="w-24 h-24 bg-charcoal/5 rounded-2xl flex items-center justify-center p-4">
                                        <div className="w-full h-full hatch-aesthetic-yellow-bold"></div>
                                    </div>
                                    <div>
                                        <span className="block font-bold">Aesthetic Yellow Bold</span>
                                        <span className="text-[10px] font-mono opacity-40 uppercase">/textures/aesthetic-hatch-bold-yellow.png</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="w-24 h-24 bg-charcoal/5 rounded-2xl flex items-center justify-center p-4">
                                        <div className="w-full h-full hatch-pencil-grey"></div>
                                    </div>
                                    <div>
                                        <span className="block font-bold">Graphite Scratch</span>
                                        <span className="text-[10px] font-mono opacity-40 uppercase">/textures/pencil-hatch.png</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-12">
                            <h4 className="text-sm font-bold uppercase tracking-widest opacity-30">Surface Textures</h4>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="aspect-video bg-white rounded-2xl shadow-sm border border-charcoal/5 overflow-hidden flex flex-col">
                                    <div className="flex-1 opacity-10" style={{ backgroundImage: `url('${textures.paper}')` }}></div>
                                    <div className="p-4 bg-charcoal/5 text-[10px] font-bold uppercase tracking-widest opacity-40">Twill Canvas</div>
                                </div>
                                <div className="aspect-video bg-white rounded-2xl shadow-sm border border-charcoal/5 overflow-hidden flex flex-col">
                                    <div className="flex-1 opacity-10" style={{ backgroundImage: `url('${textures.cedar}')` }}></div>
                                    <div className="p-4 bg-charcoal/5 text-[10px] font-bold uppercase tracking-widest opacity-40">Cedar Grain</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. ELEMENTS */}
                <section className="mx-auto" style={{ maxWidth: 'var(--hss-site-width)' }}>
                    <SectionHeader title="Key Elements" subtitle="Tactile components that build the world." />

                    <div className="bg-[#F3EFE6] p-24 rounded-[120px] border-8 border-charcoal/5 shadow-section relative overflow-hidden">
                        <div className="absolute inset-0 opacity-5 mix-blend-multiply" style={{ backgroundImage: `url('${textures.paper}')` }}></div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-20 items-start relative z-10">
                            {/* A */}
                            <div className="flex flex-col items-center gap-8">
                                <Polaroid src="" label="Faded Memory" variant="A" rotation="rotate-[-3deg]" forcePlaceholder={true} />
                                <div className="text-center italic opacity-40 text-sm">A · Soft Warmth</div>
                            </div>
                            {/* B */}
                            <div className="flex flex-col items-center gap-8 md:pt-16">
                                <Polaroid src="" label="Left on the Shelf" variant="B" rotation="rotate-[2deg]" forcePlaceholder={true} />
                                <div className="text-center italic opacity-40 text-sm">B · Sun-Faded Shelf</div>
                            </div>
                            {/* C */}
                            <div className="flex flex-col items-center gap-8">
                                <Polaroid src="" label="Found in the Attic" variant="C" rotation="rotate-[-1deg]" forcePlaceholder={true} />
                                <div className="text-center italic opacity-40 text-sm">C · Bleached & Embossed</div>
                            </div>
                        </div>
                    </div>
                </section>

            </main>

            <footer className="py-24 bg-charcoal text-white text-center rounded-t-[100px]">
                <div className="max-w-4xl mx-auto px-6">
                    <h3 className="text-4xl text-primary mb-6" style={{ fontFamily: fonts.accent }}>Hello Sunshine</h3>
                    <p className="font-display italic text-2xl opacity-40 max-w-2xl mx-auto leading-relaxed">
                        This system is living. It grows with every session, every festival, and every shared memory. Use it with warmth.
                    </p>
                    <div className="mt-16 w-12 h-1 bg-primary/20 mx-auto"></div>
                </div>
            </footer>
        </div>
    );
}

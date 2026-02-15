"use client";

import React from 'react';

const bg = { name: 'Natural Paper (Light)', class: 'bg-[#F3EFE6] border-charcoal/5', isDark: false };

function LayeredPencil({ fontVar, hatchClass, strokeColor, fontWeight, fillOpacity, strokeOpacity, blendClass, size = "100px", text = "Hello Sunshine", className = "" }: any) {
    return (
        <div className={`grid place-items-center relative ${blendClass} ${className}`}>
            {/* Fill Layer */}
            <h4
                className={`${hatchClass} ${fillOpacity === '0.65' ? 'pencil-soft' : fillOpacity === '0.45' ? 'pencil-extra-soft' : ''}`}
                style={{
                    fontFamily: fontVar,
                    fontSize: size,
                    lineHeight: '1',
                    gridArea: '1/1',
                    opacity: fillOpacity,
                    display: 'block'
                }}
            >
                {text}
            </h4>

            {/* Stroke Layer */}
            <h4
                className="pencil-stroke-only"
                style={{
                    fontFamily: fontVar,
                    fontSize: size,
                    lineHeight: '1',
                    gridArea: '1/1',
                    WebkitTextStroke: `${fontWeight} ${strokeColor}`,
                    opacity: strokeOpacity,
                    filter: 'url(#hand-drawn)',
                    display: 'block'
                }}
            >
                {text}
            </h4>
        </div>
    );
}

function OrganicLine({ type = "graphite", className = "", height = "h-[500px]" }: any) {
    if (type === "graphite") {
        return (
            <div className={`relative w-2 ${height} ${className}`}>
                {/* Main Stroke */}
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-charcoal/40 filter url(#hand-drawn)"></div>
                {/* Texture Shadow */}
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[3px] bg-charcoal/10 pencil-soft filter blur-[1px]"></div>
                {/* Double drawn effect at top/bottom */}
                <div className="absolute top-0 left-[20%] w-[0.5px] h-32 bg-charcoal/20 filter url(#hand-drawn) rotate-[1deg]"></div>
                <div className="absolute bottom-24 right-[20%] w-[0.5px] h-48 bg-charcoal/20 filter url(#hand-drawn) rotate-[-1deg]"></div>
            </div>
        );
    }
    if (type === "feathered") {
        return (
            <div className={`relative w-2 ${height} ${className}`}>
                <div className="absolute inset-x-0 top-0 h-full w-[1px] bg-charcoal/40 filter url(#hand-drawn)"
                    style={{ maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)' }}></div>
                <div className="absolute inset-x-0 top-0 h-full w-[2px] bg-charcoal/10 pencil-soft filter blur-[0.5px]"
                    style={{ maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)' }}></div>
            </div>
        );
    }
    if (type === "charcoal") {
        return (
            <div className={`relative w-3 ${height} ${className} opacity-20 filter blur-[0.5px]`}>
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-4 bg-charcoal/40 pencil-soft"
                    style={{ maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 80%)', backgroundSize: '100% 10px' }}></div>
            </div>
        );
    }
    return null;
}

function PencilBreaker({ type = "horizontal", className = "", length = "w-32", height = "h-4", thickness = "h-[0.5px]" }: any) {
    if (type === "horizontal") {
        return (
            <div className={`relative ${length} ${height} ${className}`}>
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-charcoal/20 pencil-soft filter blur-[0.5px]"></div>
                <div className={`absolute inset-x-0 top-1/2 -translate-y-1/2 ${thickness} bg-charcoal/40 filter url(#hand-drawn)`}></div>
            </div>
        );
    }
    if (type === "scribble") {
        return (
            <div className={`h-8 w-48 text-charcoal opacity-40 pencil-soft filter url(#hand-drawn) ${className}`}
                style={{
                    background: 'repeating-linear-gradient(45deg, transparent, transparent 2px, currentColor 3px, currentColor 4px)',
                    maskImage: 'radial-gradient(circle, black 40%, transparent 80%)'
                }}>
            </div>
        );
    }
    if (type === "dash") {
        return (
            <div className={`h-1 w-12 bg-charcoal/30 pencil-soft filter url(#hand-drawn) ${className}`}></div>
        );
    }
    return null;
}

function Polaroid({ label, className = "", rotation = "rotate-3", size = "w-48", shadowStyle = "" }: any) {
    return (
        <div className={`aspect-[4/5] bg-white p-3 border border-charcoal/5 transition-transform hover:scale-105 hover:rotate-0 z-20 ${size} ${rotation} ${className}`}
            style={{ boxShadow: shadowStyle }}>
            <div className="w-full h-[80%] bg-charcoal/5 mb-3 flex items-center justify-center overflow-hidden">
                <div className="text-charcoal/20 font-bold uppercase tracking-widest text-[10px] text-center px-4">{label}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-caveat)' }} className="text-center text-charcoal/60 text-sm italic">
                {label.toLowerCase()}
            </div>
        </div>
    );
}

function LandscapePhoto({ label, className = "", tilt = "rotate-0", shadowStyle = "", borderSize = "12px", borderRadius = "4px" }: any) {
    return (
        <div className={`aspect-[16/9] bg-white transition-transform ${tilt} ${className}`}
            style={{
                boxShadow: shadowStyle,
                padding: borderSize,
                borderRadius: borderRadius
            }}>
            <div className="w-full h-full bg-charcoal/10 relative overflow-hidden" style={{ borderRadius: `calc(${borderRadius} / 2)` }}>
                <div className="absolute inset-0 bg-canvas-texture opacity-20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-charcoal/20 font-bold uppercase tracking-[0.5em] text-sm">{label}</div>
                </div>
            </div>
        </div>
    );
}

function SectionPreview({ title, id, children }: any) {
    return (
        <div className="mb-64 group">
            <div className="flex items-center gap-6 mb-12">
                <div className="bg-charcoal text-primary px-8 py-2 rounded-full font-bold text-xl shadow-lg border-2 border-charcoal/10">
                    ID: {id}
                </div>
                <h2 className="text-3xl italic opacity-40 font-display uppercase tracking-widest">{title}</h2>
            </div>
            <div className={`${bg.class} p-24 rounded-[120px] border-8 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] relative overflow-hidden min-h-[900px] flex items-center justify-center`}>
                <div className="absolute inset-0 bg-canvas-texture opacity-5 pointer-events-none"></div>
                <div className="relative z-10 w-full max-w-7xl">
                    {children}
                </div>
            </div>
        </div>
    );
}

// CHAMPION SPECS (Locked for v47)
const smokeShadow = "rgba(50, 43, 40, 0.45)";
const smokePolaroid = "rgba(50, 43, 40, 0.65)";
const championPhotoShadow = `0 15px 30px -5px ${smokeShadow}`;
const championPolaroidShadow = `0 4px 6px -1px ${smokePolaroid}`;

export default function FontAuditPage() {
    return (
        <div className="min-h-screen bg-[#FDFCF9] p-10 font-body text-charcoal">
            <header className="mb-24 border-b-2 border-charcoal/10 pb-12">
                <h1 className="text-5xl mb-4 italic" style={{ fontFamily: "'ChicleForce', cursive" }}>The Organic Ledger Series (v47)</h1>
                <p className="text-2xl font-display italic opacity-70 max-w-3xl">
                    Refining **Organic Dividers & Header Stacks**.
                    Exploring textured pencil strokes and creative header interlocking while maintaining a 32px gap.
                </p>
                <div className="mt-8 flex gap-4">
                    <span className="bg-[#322B28] text-[#f9cb40] px-4 py-1 rounded-full text-sm font-bold uppercase tracking-widest shadow-lg">LOCKED: col-span-9 CHAMPION</span>
                </div>
            </header>

            {/* VARIATION 1: THE GRAPHITE STROKE */}
            <SectionPreview title="The Graphite Stroke" id="47001">
                <div className="grid grid-cols-12 gap-0 items-center">
                    <div className="col-span-9 relative">
                        <LandscapePhoto
                            label="THE NORTHERN RETREAT"
                            className="w-full z-10"
                            tilt="rotate-[1.5deg]"
                            shadowStyle={championPhotoShadow}
                        />
                        <Polaroid
                            label="Morning"
                            className="absolute bottom-[-15%] left-[-5%] rotate-[-4deg] scale-125 z-20"
                            shadowStyle={championPolaroidShadow}
                        />
                    </div>

                    <div className="col-span-3 h-full flex items-start gap-8 pt-12 pl-[32px]">
                        <OrganicLine type="graphite" className="opacity-60" />
                        <div className="space-y-12 py-12 pr-4 relative">
                            <div className="relative">
                                <LayeredPencil
                                    fontVar="var(--font-chicle)" hatchClass="hatch-aesthetic-yellow-bold" strokeColor="#1F1A17"
                                    fontWeight="1.1px" fillOpacity="0.9" strokeOpacity="1" blendClass="pencil-blend-multiply"
                                    size="65px" text="Hello"
                                    className="absolute -top-10 -left-12 rotate-[-8deg] z-20"
                                />
                                <LayeredPencil
                                    fontVar="var(--font-chicle)" hatchClass="hatch-aesthetic-yellow-bold" strokeColor="#1F1A17"
                                    fontWeight="1.4px" fillOpacity="1" strokeOpacity="1" blendClass="pencil-blend-multiply"
                                    size="110px" text="Sunshine"
                                    className="pt-2"
                                />
                            </div>
                            <div className="space-y-6">
                                <p style={{ fontFamily: 'var(--font-caveat)' }} className="text-3xl italic text-charcoal/60 leading-tight">
                                    "Dedicated to the ritual of water and wood."
                                </p>
                                <PencilBreaker type="dash" className="w-16 opacity-30" />
                            </div>
                        </div>
                    </div>
                </div>
            </SectionPreview>

            {/* VARIATION 2: THE FEATHERED LINE */}
            <SectionPreview title="The Feathered Line" id="47002">
                <div className="grid grid-cols-12 gap-0 items-center">
                    <div className="col-span-9 relative">
                        <LandscapePhoto
                            label="CEDAR CRAFT"
                            className="w-full z-10"
                            tilt="rotate-[1.5deg]"
                            shadowStyle={championPhotoShadow}
                        />
                        <Polaroid
                            label="Timber"
                            className="absolute bottom-[-15%] left-[-5%] rotate-[-4deg] scale-125 z-20"
                            shadowStyle={championPolaroidShadow}
                        />
                    </div>

                    <div className="col-span-3 h-full flex items-start gap-6 pt-16 pl-[32px]">
                        <OrganicLine type="feathered" className="opacity-50" />
                        <div className="space-y-16 py-8">
                            <div className="space-y-[-12px]">
                                <LayeredPencil
                                    fontVar="var(--font-chicle)" hatchClass="hatch-aesthetic-yellow-bold" strokeColor="#1F1A17"
                                    fontWeight="1.2px" fillOpacity="0.95" strokeOpacity="1" blendClass="pencil-blend-multiply"
                                    size="85px" text="Hello"
                                    className="ml-4"
                                />
                                <LayeredPencil
                                    fontVar="var(--font-chicle)" hatchClass="hatch-aesthetic-yellow-bold" strokeColor="#1F1A17"
                                    fontWeight="1.5px" fillOpacity="1" strokeOpacity="1" blendClass="pencil-blend-multiply"
                                    size="125px" text="Sunshine"
                                />
                            </div>
                            <div className="space-y-8 max-w-[200px]">
                                <p style={{ fontFamily: 'var(--font-caveat)' }} className="text-3xl text-charcoal/50 leading-snug">
                                    Hand-built cedar. Authentic steam.
                                </p>
                                <div className="h-[0.5px] w-12 bg-charcoal/20"></div>
                                <p className="text-[10px] uppercase font-bold tracking-[0.4em] opacity-30">REV.01 2024</p>
                            </div>
                        </div>
                    </div>
                </div>
            </SectionPreview>

            {/* VARIATION 3: THE INTERLOCKED NOTE */}
            <SectionPreview title="The Interlocked Note" id="47003">
                <div className="grid grid-cols-12 gap-0 items-center">
                    <div className="col-span-9 relative">
                        <LandscapePhoto
                            label="THE ART OF STEAM"
                            className="w-full z-10"
                            tilt="rotate-[1.5deg]"
                            shadowStyle={championPhotoShadow}
                        />
                        <Polaroid
                            label="Mist"
                            className="absolute bottom-[-15%] left-[-5%] rotate-[-4deg] scale-125 z-20"
                            shadowStyle={championPolaroidShadow}
                        />
                    </div>

                    <div className="col-span-3 h-full flex flex-col pt-12 pl-[32px]">
                        <div className="relative mb-12">
                            <div className="flex items-baseline gap-0">
                                <LayeredPencil
                                    fontVar="var(--font-chicle)" hatchClass="hatch-aesthetic-yellow-bold" strokeColor="#1F1A17"
                                    fontWeight="1.1px" fillOpacity="0.8" strokeOpacity="1" blendClass="pencil-blend-multiply"
                                    size="60px" text="Hello"
                                    className="rotate-[-10deg] mr-[-10px]"
                                />
                                <LayeredPencil
                                    fontVar="var(--font-chicle)" hatchClass="hatch-aesthetic-yellow-bold" strokeColor="#1F1A17"
                                    fontWeight="1.6px" fillOpacity="1" strokeOpacity="1" blendClass="pencil-blend-multiply"
                                    size="115px" text="Sunshine"
                                />
                            </div>
                            <PencilBreaker type="scribble" className="w-[80%] h-8 opacity-30 mt-[-10px] ml-4" />
                        </div>
                        <div className="space-y-12 pl-4 border-l-2 border-charcoal/5">
                            <p style={{ fontFamily: 'var(--font-caveat)' }} className="text-3xl text-charcoal/60 italic leading-snug max-w-[240px]">
                                "A simple ritual for the modern soul."
                            </p>
                            <div className="flex gap-1.5 [&>div]:w-1.5 [&>div]:h-1.5 [&>div]:bg-charcoal/10 [&>div]:rounded-full">
                                <div></div><div></div><div></div>
                            </div>
                        </div>
                    </div>
                </div>
            </SectionPreview>

            {/* VARIATION 4: THE LEDGER MARGIN */}
            <SectionPreview title="The Ledger Margin" id="47004">
                <div className="grid grid-cols-12 gap-0 items-center">
                    <div className="col-span-9 relative">
                        <LandscapePhoto
                            label="SAUNA MOMENT"
                            className="w-full z-10"
                            tilt="rotate-[1.5deg]"
                            shadowStyle={championPhotoShadow}
                        />
                        <Polaroid
                            label="Heat"
                            className="absolute bottom-[-15%] left-[-5%] rotate-[-4deg] scale-125 z-20"
                            shadowStyle={championPolaroidShadow}
                        />
                    </div>

                    <div className="col-span-3 h-full flex items-start gap-10 pt-20 pl-[32px]">
                        <OrganicLine type="charcoal" className="h-[400px]" />
                        <div className="space-y-16">
                            <div className="space-y-2">
                                <p style={{ fontFamily: 'var(--font-caveat)' }} className="text-4xl text-charcoal/20 ml-2 rotate-[-5deg]">The</p>
                                <LayeredPencil
                                    fontVar="var(--font-chicle)" hatchClass="hatch-aesthetic-yellow-bold" strokeColor="#1F1A17"
                                    fontWeight="1.4px" fillOpacity="1" strokeOpacity="1" blendClass="pencil-blend-multiply"
                                    size="120px" text="Sunshine"
                                    className="-mt-8"
                                />
                                <LayeredPencil
                                    fontVar="var(--font-chicle)" hatchClass="hatch-aesthetic-yellow" strokeColor="#1F1A17"
                                    fontWeight="0.9px" fillOpacity="0.6" strokeOpacity="1" blendClass="pencil-blend-multiply"
                                    size="70px" text="Retreat"
                                    className="-mt-6 ml-12"
                                />
                            </div>
                            <div className="space-y-8 pr-4">
                                <p style={{ fontFamily: 'var(--font-caveat)' }} className="text-3xl text-charcoal/60 leading-relaxed italic">
                                    Established heat. Pure elemental warmth for your home.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </SectionPreview>

            <footer className="mt-40 p-24 bg-charcoal text-white rounded-[100px] text-center border-8 border-wood-dark/40 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-canvas-texture opacity-20 pointer-events-none"></div>
                <h3 className="text-5xl font-accent text-[#f9cb40] mb-8 relative z-10" style={{ fontFamily: "'ChicleForce', cursive" }}>The Organic Flow</h3>
                <p className="text-2xl opacity-70 mb-16 max-w-3xl mx-auto font-display italic relative z-10">
                    With textured divider lines and creative character, the typography finds its absolute
                    authority next to the champion base.
                </p>
                <div className="inline-block bg-[#f9cb40] text-charcoal px-10 py-4 rounded-full font-bold text-2xl relative z-10 shadow-2xl font-display">
                    Final Editorial Flow.
                </div>
            </footer>

            {/* SVG Filter for Sketch Effect */}
            <svg className="hidden" width="0" height="0">
                <filter id="hand-drawn">
                    <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
                </filter>
            </svg>
        </div>
    );
}

"use client";

import React from 'react';
import Image from 'next/image';
import { Polaroid } from '@/components/Polaroid';
import { LayeredPencil } from '@/components/LayeredPencil';
import { textures } from '@/design-system/tokens';

/* ─────────────────────────────────────────────────────
   CHAMPION HERO (ID 47002)
   
   The established visual architecture for Hello Sunshine.
   - 9 Columns (Photo) / 3 Columns (Text)
   - Organic Feathered Line Anchor
   - "Hello Sunshine" Layered Pencil Header
   ───────────────────────────────────────────────────── */

/* Specifications */
const championPhotoShadow = "0 15px 30px -5px rgba(50, 43, 40, 0.45)";

/* Local Helper: Organic Line */
function OrganicLine({ type = "graphite", className = "", height = "h-[500px]" }: any) {
    if (type === "graphite") {
        return (
            <div className={`relative w-2 ${height} ${className}`}>
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-charcoal/40" style={{ filter: 'url(#hand-drawn)' }}></div>
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[3px] bg-charcoal/10 pencil-soft filter blur-[1px]"></div>
                <div className="absolute top-0 left-[20%] w-[0.5px] h-32 bg-charcoal/20 rotate-[1deg]" style={{ filter: 'url(#hand-drawn)' }}></div>
                <div className="absolute bottom-24 right-[20%] w-[0.5px] h-48 bg-charcoal/20 rotate-[-1deg]" style={{ filter: 'url(#hand-drawn)' }}></div>
            </div>
        );
    }
    return null;
}

/* Local Helper: Landscape Photo Placeholder */
function LandscapePhoto({ src, alt, className = "", tilt = "rotate-0", shadowStyle = "", borderSize = "12px", borderRadius = "4px" }: any) {
    return (
        <div className={`aspect-[16/9] bg-white transition-transform ${tilt} ${className}`}
            style={{
                boxShadow: shadowStyle,
                padding: borderSize,
                borderRadius: borderRadius
            }}>
            <div className="w-full h-full bg-charcoal/10 relative overflow-hidden flex items-center justify-center" style={{ borderRadius: `calc(${borderRadius} / 2)` }}>
                <Image src={src} alt={alt} fill className="object-cover" />
            </div>
        </div>
    );
}

export default function HeroSection() {
    return (
        <section className="relative bg-[#F3EFE6] pt-48 pb-32 px-6 overflow-hidden">
            {/* Paper Texture Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply"
                style={{
                    backgroundImage: `url('${textures.paper}')`,
                    backgroundSize: '400px',
                }}></div>
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-0 items-center">

                    {/* Photo Area (col-span-1 md:col-span-9) */}
                    <div className="col-span-1 md:col-span-9 relative mb-16 md:mb-0">
                        <LandscapePhoto
                            src="/DSCF2335.JPG"
                            alt="Northern Retreat"
                            className="w-full z-10 relative"
                            tilt="rotate-[1.5deg]"
                            shadowStyle={championPhotoShadow}
                        />
                        <div className="absolute bottom-[-10%] left-[-2%] z-20">
                            <Polaroid
                                src="/optimized/polaroids/caravan1.webp"
                                label="Timber"
                                rotation="rotate-[-4deg]"
                                size="w-56"
                                forcePlaceholder={false}
                                className="scale-110"
                            />
                        </div>
                    </div>

                    {/* Typography Area (col-span-1 md:col-span-3 with gap) */}
                    <div className="col-span-1 md:col-span-3 h-full flex items-start gap-6 md:pt-16 md:pl-[32px]">
                        {/* Vertical line hidden on mobile */}
                        <div className="hidden md:block">
                            <OrganicLine type="graphite" className="opacity-50" />
                        </div>

                        <div className="space-y-12 py-4">
                            <div className="space-y-[-12px] relative left-[-10px] md:left-0">
                                <LayeredPencil
                                    hatchClass="hatch-aesthetic-yellow-bold"
                                    strokeColor="#1F1A17"
                                    strokeWidth="1.2px"
                                    fillOpacity="0.95"
                                    strokeOpacity="1"
                                    blendClass="pencil-blend-multiply"
                                    size="85px"
                                    text="Hello"
                                    className="ml-4"
                                    as="h1"
                                />
                                <LayeredPencil
                                    hatchClass="hatch-aesthetic-yellow-bold"
                                    strokeColor="#1F1A17"
                                    strokeWidth="1.5px"
                                    fillOpacity="1"
                                    strokeOpacity="1"
                                    blendClass="pencil-blend-multiply"
                                    size="125px"
                                    text="Sunshine"
                                    as="h1"
                                />
                            </div>

                            <div className="space-y-8 max-w-[250px]">
                                <p style={{ fontFamily: 'var(--font-caveat)' }} className="text-3xl text-charcoal/50 leading-snug">
                                    Hand-built cedar.<br />Authentic steam.
                                </p>
                                <div className="h-[2px] w-12 bg-charcoal/20"></div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

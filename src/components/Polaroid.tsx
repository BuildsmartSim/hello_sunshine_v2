"use client";

import React, { useMemo } from 'react';
import Image from 'next/image';
import { shadows, textures } from '@/design-system/tokens';

/* ─────────────────────────────────────────────────────
   POLAROID REALISM COMPONENT
   
   Three locked-in aging styles with a deterministic
   randomiser. The shadow uses the agreed "Smoked Wood"
   from the Champion Hero (ID 47002).
   ───────────────────────────────────────────────────── */

/* The agreed hero shadow — imported from design tokens */
const CHAMPION_SHADOW = shadows.polaroid;

/* Variant recipes (A, B, C) */
const VARIANTS = ["A", "B", "C"] as const;
type Variant = typeof VARIANTS[number];

interface VariantRecipe {
    photoFilter: string;
    frameBg: string;
    vignetteOpacity: number;
    vignetteSize: string;
    embossHighlight: string;
    embossLowlight: string;
    grainOpacity: number;
    frameStain: boolean;
}

const RECIPES: Record<Variant, VariantRecipe> = {
    /* A – Soft Warmth: gentle vignette, micro emboss, warm whites */
    A: {
        photoFilter: "contrast(115%) brightness(108%) saturate(75%) sepia(12%)",
        frameBg: "#faf8f4",
        vignetteOpacity: 0.25,
        vignetteSize: "55%",
        embossHighlight: "inset 1px 1px 0 rgba(255,255,255,0.6)",
        embossLowlight: "inset -1px -1px 0 rgba(0,0,0,0.04)",
        grainOpacity: 0.06,
        frameStain: false,
    },

    /* B – Sun-Faded Shelf: deeper vignette, visible grain, yellowed stain */
    B: {
        photoFilter: "contrast(130%) brightness(118%) saturate(55%) sepia(20%)",
        frameBg: "#f5f0e8",
        vignetteOpacity: 0.4,
        vignetteSize: "45%",
        embossHighlight: "inset 1.5px 1.5px 0 rgba(255,255,255,0.7)",
        embossLowlight: "inset -1.5px -1.5px 0 rgba(0,0,0,0.06)",
        grainOpacity: 0.12,
        frameStain: true,
    },

    /* C – Bleached & Embossed: heavy bleach, pronounced ridge, aged staining */
    C: {
        photoFilter: "contrast(145%) brightness(128%) saturate(45%) sepia(25%)",
        frameBg: "#f0ebe0",
        vignetteOpacity: 0.5,
        vignetteSize: "35%",
        embossHighlight: "inset 2px 2px 0 rgba(255,255,255,0.8)",
        embossLowlight: "inset -2px -2px 0 rgba(0,0,0,0.08)",
        grainOpacity: 0.18,
        frameStain: true,
    },
};

/* Deterministic hash from a string → variant index */
function hashToVariant(seed: string): Variant {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }
    return VARIANTS[Math.abs(hash) % VARIANTS.length];
}

/* ─────────────────────────────────────────────────────
   PUBLIC COMPONENT
   
   Usage:
     <Polaroid src="/photo.jpg" label="My Photo" />
     <Polaroid src="/photo.jpg" label="My Photo" variant="B" />
   
   If no variant is passed, one is randomly assigned
   based on a hash of the label (deterministic).
   ───────────────────────────────────────────────────── */
export interface PolaroidProps {
    src: string;
    label: string;
    variant?: Variant;
    rotation?: string;
    size?: string;
    className?: string;
    forcePlaceholder?: boolean;
}

export const Polaroid = React.memo(function Polaroid({
    src,
    label,
    variant,
    rotation = "rotate-[-2deg]",
    size = "w-72",
    className = "",
    forcePlaceholder = false,
}: PolaroidProps) {
    /* Pick variant: explicit override or deterministic random */
    const v = useMemo(() => variant ?? hashToVariant(label), [variant, label]);
    const r = RECIPES[v];

    /* Compose the box-shadow: reactive wood shadow + emboss highlight + emboss lowlight */
    const woodShadow = `0 calc(15px * var(--shadow-intensity, 1)) 25px -5px rgba(50, 43, 40, 0.45)`;
    const composedShadow = `${woodShadow}, ${r.embossHighlight}, ${r.embossLowlight}`;

    return (
        <div className={`relative ${size} ${rotation} ${className} group [container-type:inline-size]`}>
            {/* ── THE FRAME ──────────────────────────── */}
            <div
                className="aspect-[4/5] p-[6%] pb-[22%] relative overflow-hidden transition-all duration-700 hover:scale-[1.03] hover:rotate-0"
                style={{
                    backgroundColor: r.frameBg,
                    boxShadow: composedShadow,
                }}
            >
                {/* Paper grain texture across frame */}
                <div
                    className="absolute inset-0 pointer-events-none mix-blend-multiply"
                    style={{
                        backgroundImage: `url('${textures.pencilGrain}')`,
                        backgroundSize: '200px',
                        opacity: r.grainOpacity,
                    }}
                ></div>

                {/* Optional yellowed stain blotches */}
                {r.frameStain && (
                    <>
                        <div className="absolute top-6 right-8 w-16 h-16 rounded-full bg-[#d4c5a0]/[0.08] blur-2xl pointer-events-none"></div>
                        <div className="absolute bottom-16 left-6 w-12 h-12 rounded-full bg-[#c8b88a]/[0.06] blur-xl pointer-events-none"></div>
                    </>
                )}

                {/* Subtle edge darkening on the frame */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: `radial-gradient(ellipse at center, transparent 75%, rgba(60,50,40,${r.grainOpacity * 0.3}) 100%)`,
                    }}
                ></div>

                {/* ── THE PHOTO INSET ──────────────────── */}
                <div className="w-full h-[84%] relative overflow-hidden bg-charcoal/5 shadow-[inset_0_3px_8px_rgba(0,0,0,0.15)]">
                    <div className="w-full h-full relative group-hover:scale-110 transition-transform duration-1000 ease-out">
                        {forcePlaceholder ? (
                            <div className="w-full h-full bg-charcoal/10 flex items-center justify-center">
                                <span className="text-charcoal/20 text-xs font-mono">IMG</span>
                            </div>
                        ) : (
                            <Image
                                src={src}
                                alt={label}
                                fill
                                className="object-cover"
                                style={{ filter: r.photoFilter }}
                                sizes="(max-width: 768px) 100vw, 33vw"
                            />
                        )}

                        {/* Vignette */}
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                background: `radial-gradient(ellipse at center, transparent ${r.vignetteSize}, rgba(0,0,0,${r.vignetteOpacity}) 100%)`,
                            }}
                        ></div>

                        {/* Inner bevel (photo recessed into paper) */}
                        <div className="absolute inset-0 shadow-[inset_0_6px_16px_rgba(0,0,0,0.25)] pointer-events-none"></div>

                        {/* Film grain over photo */}
                        <div
                            className="absolute inset-0 pointer-events-none mix-blend-overlay"
                            style={{
                                backgroundImage: `url('${textures.pencilGrain}')`,
                                backgroundSize: '180px',
                                opacity: r.grainOpacity * 1.5,
                            }}
                        ></div>
                    </div>
                </div>

                {/* Hand-written label */}
                <div className="absolute bottom-[4%] left-0 right-0 text-center">
                    <span
                        style={{ fontFamily: 'var(--font-caveat)' }}
                        className="text-[min(24px,8cqw)] italic text-charcoal/50 block -rotate-1 leading-none"
                    >
                        {label}
                    </span>
                </div>
            </div>
        </div>
    );
});

/* Re-export types and constants for consumers */
export { VARIANTS, RECIPES, CHAMPION_SHADOW };
export type { Variant };

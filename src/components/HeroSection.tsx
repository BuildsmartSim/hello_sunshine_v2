"use client";

import React from 'react';
import Image from 'next/image';
import { Polaroid } from '@/components/Polaroid';
import { DappledHeaderStroke } from '@/components/LightHeaderVariants';
import { fonts } from '@/design-system/tokens';
import { motion } from 'framer-motion';
import { useMedia, useHasMounted } from '@/design-system/MediaContext';
import { StandardSection } from '@/components/StandardSection';

/* ─────────────────────────────────────────────────────
   CHAMPION HERO v4 — Headline top, editorial bridge, photo below

   Hello Sunshine
   ━━━  Hand-built pine. · Authentic steam.  ━━━
   [panoramic photo + sauna interior polaroid top-right]
   ───────────────────────────────────────────────────── */

const PHOTO_SRC = "/optimized/photographs/webp/nude-people-caravan-sanctuary.webp";
const POLAROID_SRC = "/optimized/polaroids/webp/sauna-interior-wood-stove-glow.webp";

function HeroPhoto() {
    const { openMedia, activeMedia, isTransitioning } = useMedia();
    const id = "hero-main-photo";
    const isActive = activeMedia?.id === id;
    const isShowingGhost = isActive || (isTransitioning && !activeMedia);

    return (
        <div className="relative mt-12 md:mt-24">
            {/* Polaroid — scaled down on mobile */}
            <div className="absolute -top-12 md:-top-32 -right-4 md:-right-8 z-20" style={{ transform: 'rotate(6deg)' }}>
                <Polaroid
                    src={POLAROID_SRC}
                    label="Inside the warmth."
                    rotation="rotate-0"
                    size="w-32 sm:w-48 md:w-80"
                    forcePlaceholder={false}
                />
            </div>

            {/* Panoramic photo - Adjusted aspect for mobile if needed, though 21/9 can work with cover */}
            <motion.div
                layoutId={id}
                onClick={() => openMedia({ src: PHOTO_SRC, label: 'Hello Sunshine sauna exterior', id, aspect: 'aspect-[21/9]', padding: '10px', borderRadius: '6px' })}
                className={`relative w-full overflow-hidden rounded-md cursor-zoom-in p-2 md:p-2.5 bg-white aspect-video md:aspect-[21/9] ${isActive ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                style={{
                    boxShadow: '0 calc(15px * var(--shadow-intensity, 1)) 40px -8px rgba(50,43,40,0.3)',
                    transform: 'rotate(0.5deg)',
                    transformOrigin: 'center',
                    visibility: isActive ? 'hidden' : 'visible'
                }}>
                <div className="w-full h-full relative overflow-hidden rounded-sm">
                    <Image src={PHOTO_SRC} alt="Hello Sunshine sauna exterior" fill className="object-cover object-center" />
                </div>
            </motion.div>

            {isShowingGhost && (
                <div className="absolute inset-0 opacity-10 grayscale pointer-events-none rounded-md" />
            )}
        </div>
    );
}

export default function HeroSection() {
    const hasMounted = useHasMounted();
    if (!hasMounted) return null;

    return (
        <StandardSection id="hero" variant="naturalPaper" className="pt-24 md:pt-60 pb-8 md:pb-16 relative z-20" containerPadding="px-4 md:px-8" overflowVisible={true}>

            {/* Headline — adjusted size for mobile overlay prevention */}
            <div className="pt-4 md:pt-14">
                <DappledHeaderStroke
                    line1="Hello Sunshine"
                    line1Size="clamp(64px, 15vw, 142px)"
                    centered={false}
                    strokeWidth="2.5px"
                    className="!p-0 !m-0"
                />
            </div>

            {/* Editorial strip — stacked on mobile if narrow enough, but flex-wrap/shrink usually works */}
            <div className="flex items-center gap-3 md:gap-6 my-2 md:my-6 overflow-hidden">
                <div className="h-px flex-1 bg-charcoal/30 hidden sm:block" />
                <p className="text-lg md:text-2xl text-charcoal/80 shrink-0 text-center w-full sm:w-auto handwritten-text">
                    Hand-built pine.&nbsp;·&nbsp;Authentic steam.
                </p>
                <div className="h-px flex-1 bg-charcoal/30 hidden sm:block" />
            </div>

            {/* Panoramic photo + sauna interior polaroid */}
            <HeroPhoto />

            {/* Kicker */}
            <p className="mt-6 md:mt-4 text-right text-xl md:text-xs handwritten-text md:font-body md:uppercase text-charcoal/90 md:tracking-[0.4em] md:opacity-30">
                A quiet escape into nature.
            </p>

        </StandardSection>
    );
}

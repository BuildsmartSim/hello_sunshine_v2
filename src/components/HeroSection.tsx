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
const MOBILE_PHOTO_SRC = "/optimized/photographs/webp/nude-people-caravan-sanctuary-mobile.webp";
const POLAROID_SRC = "/optimized/polaroids/webp/sauna-interior-wood-stove-glow.webp";

function HeroPhoto() {
    const { openMedia, activeMedia, isTransitioning } = useMedia();
    const id = "hero-main-photo";
    const isActive = activeMedia?.id === id;
    const isShowingGhost = isActive || (isTransitioning && !activeMedia);

    return (
        <div className="relative mt-12 md:mt-24">
            {/* Polaroid — moved to bottom left on mobile, kept top right on desktop */}
            <div className="absolute -bottom-8 left-2 md:-bottom-auto md:left-auto md:-top-32 md:-right-8 z-20" style={{ transform: 'rotate(6deg)' }}>
                <Polaroid
                    src={POLAROID_SRC}
                    label="Inside the warmth."
                    rotation="rotate-0"
                    size="w-48 md:w-80"
                    forcePlaceholder={false}
                />
            </div>

            {/* Photo - Portrait on Mobile / Panoramic on Desktop */}
            <motion.div
                layoutId={id}
                onClick={() => {
                    const isMobile = window.innerWidth < 768;
                    openMedia({
                        src: isMobile ? MOBILE_PHOTO_SRC : PHOTO_SRC,
                        label: 'Hello Sunshine sauna exterior',
                        id,
                        aspect: isMobile ? 'aspect-[4/5]' : 'aspect-[21/9]',
                        padding: '10px',
                        borderRadius: '6px'
                    });
                }}
                className={`relative w-full overflow-hidden rounded-md cursor-zoom-in p-2 md:p-2.5 bg-white aspect-[4/5] md:aspect-[21/9] ${isActive ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                style={{
                    boxShadow: '0 calc(15px * var(--shadow-intensity, 1)) 40px -8px rgba(50,43,40,0.3)',
                    transform: 'rotate(0.5deg)',
                    transformOrigin: 'center',
                    visibility: isActive ? 'hidden' : 'visible'
                }}>
                <div className="w-full h-full relative overflow-hidden rounded-sm">
                    {/* Desktop Image */}
                    <Image priority sizes="(min-width: 768px) 100vw, 0vw" src={PHOTO_SRC} alt="Hello Sunshine sauna exterior" fill className="object-cover object-center hidden md:block" />
                    {/* Mobile Image */}
                    <Image priority sizes="(max-width: 767px) 100vw, 0vw" src={MOBILE_PHOTO_SRC} alt="Hello Sunshine sauna exterior" fill className="object-cover object-center block md:hidden" />
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
        <StandardSection id="hero" variant="naturalPaper" className="pt-16 md:pt-60 pb-0 relative z-20" containerPadding="px-4 md:px-8" overflowVisible={true}>

            <div className="pt-4 md:pt-14 -mx-4 md:mx-0">
                <DappledHeaderStroke
                    line1="Hello Sunshine"
                    line1Size="clamp(40px, 12vw, 100px)"
                    centered={false}
                    strokeWidth="2px"
                    className="!p-0 !m-0 !items-center !text-center md:!items-start md:!text-left w-full overflow-visible whitespace-nowrap tracking-tight"
                />
            </div>

            {/* Editorial strip — stacked on mobile if narrow enough, but flex-wrap/shrink usually works */}
            <div className="flex items-center gap-3 md:gap-6 mt-2 mb-6 md:my-10 overflow-hidden">
                <div className="h-px flex-1 bg-charcoal/30 hidden sm:block" />
                <p className="text-sm md:text-sm font-body uppercase tracking-[0.2em] text-charcoal/80 shrink-0 text-center w-full sm:w-auto">
                    Hand-built pine.&nbsp;·&nbsp;Authentic steam.
                </p>
                <div className="h-px flex-1 bg-charcoal/30 hidden sm:block" />
            </div>

            {/* Panoramic photo + sauna interior polaroid */}
            <HeroPhoto />

            {/* Kicker */}
            <p className="mt-6 md:mt-4 text-right text-xs md:text-xs font-body uppercase tracking-[0.1em] text-charcoal/90 md:tracking-[0.4em] md:opacity-30">
                A quiet escape into nature.
            </p>

        </StandardSection>
    );
}

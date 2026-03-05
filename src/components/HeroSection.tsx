"use client";

import React from 'react';
import { SmartImage as Image } from '@/components/SmartImage';
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
        <div className="relative mt-8 md:mt-8">
            {/* Polaroid — mobile only (bottom left) */}
            <div className="block md:hidden absolute -bottom-8 left-2 z-20" style={{ transform: 'rotate(6deg)' }}>
                <Polaroid
                    src={POLAROID_SRC}
                    label="Inside the warmth."
                    rotation="rotate-0"
                    size="w-48"
                    forcePlaceholder={false}
                    disableHiding={true}
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
        <StandardSection id="hero" variant="naturalPaper" className="pt-16 md:pt-40 pb-0 relative z-20" containerPadding="px-4 md:px-8" overflowVisible={true}>

            <div className="pt-4 md:pt-8 -mx-4 md:mx-0 flex flex-col items-start px-4 md:px-0 z-30 relative w-full h-auto overflow-visible pointer-events-none">
                <div className="flex flex-col items-start w-full md:w-auto pointer-events-auto relative z-40">
                    <DappledHeaderStroke
                        line1="Hello Sunshine"
                        line1Size="clamp(45px, 14vw, 140px)"
                        centered={false}
                        strokeWidth="2px"
                        className="!p-0 !m-0 !items-start !text-left w-full overflow-visible whitespace-nowrap tracking-tight"
                    />

                    {/* Handwritten sub-header directly under main header */}
                    <p className="handwritten-text text-2xl md:text-4xl text-charcoal/90 mt-[-5px] md:mt-[2px] w-full text-left origin-left whitespace-normal md:whitespace-nowrap leading-[1.2] md:leading-normal" style={{ transform: 'rotate(-2deg)' }}>
                        Hand-built pine.&nbsp;&nbsp;Authentic steam.
                    </p>
                </div>

                {/* Desktop Polaroid - to the right of header */}
                <div className="hidden md:flex absolute right-4 lg:right-24 top-0 mt-[40px] shrink-0 z-50 justify-center md:justify-end w-full md:w-auto pointer-events-auto" style={{ transform: 'rotate(6deg)' }}>
                    <Polaroid
                        src={POLAROID_SRC}
                        label="Inside the warmth."
                        rotation="rotate-0"
                        size="w-64 lg:w-[300px]"
                        forcePlaceholder={false}
                        disableHiding={true}
                    />
                </div>
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

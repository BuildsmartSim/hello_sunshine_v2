"use client";

import React, { useState } from 'react';
import { shadows, fonts, icons } from '@/design-system/tokens';
import Image from 'next/image';
import { Polaroid } from '@/components/Polaroid';
import { SectionHeader } from '@/components/SectionHeader';
import { StandardSection } from '@/components/StandardSection';

/* ─────────────────────────────────────────────────────
   SANCTUARY SECTION (Layout G1 - Interactive)
   
   - Left: Header + Text/Icon Split
   - Right: Cascade of 3 Photos + 1 Polaroid
   - Interaction: "Parting Clouds" (Spread on Hover) + Gallery Switch
   ───────────────────────────────────────────────────── */

const SERVICES = [
    { icon: icons.sauna, label: "Sauna" },
    { icon: icons.hotTub, label: "Hot Tub" },
    { icon: icons.plungePool, label: "Plunge Pool" },
    { icon: icons.firePit, label: "Fire Pit" },
    { icon: icons.shower, label: "Shower" },
    { icon: icons.towels, label: "Towels" },
] as const;

type ServiceType = typeof SERVICES[number]['label'];

const SERVICE_GALLERY: Record<ServiceType | 'Default', {
    img1: string; // Top Left
    img2: string; // Mid Right
    img3: string; // Bottom Left
    polaroid: string; // Bottom Right
    polaroidLabel: string;
}> = {
    'Default': {
        img1: "/optimized/polaroids/webp/caravan-open-door-night-steps.webp",
        img2: "/optimized/polaroids/webp/silver-chimney-rainbow-sky.webp",
        img3: "/optimized/polaroids/webp/sauna-garden-relaxing-crowd.webp",
        polaroid: "/optimized/polaroids/webp/hello-sign-warm-lighting-detail.webp",
        polaroidLabel: "The Ritual"
    },
    'Sauna': {
        img1: "/optimized/polaroids/webp/wood-fired-sauna-interior-benches.webp",
        img2: "/optimized/polaroids/webp/sauna-interior-wood-stove-glow.webp",
        img3: "/optimized/polaroids/webp/chopped-firewood-logs-texture.webp",
        polaroid: "/optimized/photographs/webp/sauna-signage-vintage-caravan-outdoor.webp",
        polaroidLabel: "Deep Heat"
    },
    'Hot Tub': {
        img1: "/optimized/photographs/webp/happy-group-hot-tub-thumbs-up.webp",
        img2: "/optimized/polaroids/webp/medicine-festival-hot-tub-smiles.webp",
        img3: "/optimized/polaroids/webp/couple-smiling-in-hot-tub.webp",
        polaroid: "/optimized/photographs/webp/sauna-campsite-sunset-rays-pool.webp",
        polaroidLabel: "Soak"
    },
    'Plunge Pool': {
        img1: "/optimized/polaroids/webp/beautifu-couple-in-cold-plunge-.webp",
        img2: "/optimized/polaroids/webp/view-cold-plunge-sun-rise.webp",
        img3: "/optimized/photographs/webp/sauna-exterior-silver-caravan-sunny.webp",
        polaroid: "/optimized/photographs/webp/man-in-ice-barrel.webp",
        polaroidLabel: "Refresh"
    },
    'Fire Pit': {
        img1: "/optimized/polaroids/webp/night-fire-pit-heart-decor-chairs.webp",
        img2: "/optimized/photographs/webp/caravan-camp-fire-pit-gathering.webp",
        img3: "/optimized/photographs/webp/fire-pit-burning-logs-overhead.webp",
        polaroid: "/optimized/polaroids/webp/camp-fire-singalong-night-gathering.webp",
        polaroidLabel: "Gather"
    },
    'Shower': {
        img1: "/optimized/polaroids/webp/outdoor-showers-reed-privacy-screen.webp",
        img2: "/optimized/photographs/webp/golden-sun-face-sculpture.webp",
        img3: "/optimized/polaroids/webp/caravan-metallic-detail-curve.webp",
        polaroid: "/optimized/photographs/webp/hand-painted-sauna-sign-detail.webp",
        polaroidLabel: "Cleanse"
    },
    'Towels': {
        img1: "/optimized/polaroids/webp/tent-interior-towels-night-lamp.webp",
        img2: "/optimized/polaroids/webp/night-spa-towels-boombox-lighting.webp",
        img3: "/optimized/photographs/webp/sanctuary-garden-yellow-chairs-beanbags.webp",
        polaroid: "/optimized/photographs/webp/caravan-tent-view-garlands.webp",
        polaroidLabel: "Comfort"
    }
};

/* ── Local Helper: Placeholder Photo ──────────────── */
function Photo({
    src,
    tilt = "0deg",
    className = "",
    alt = "Photo Context",
    onMouseEnter,
    onMouseLeave
}: {
    src: string;
    tilt?: string;
    className?: string;
    alt?: string;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}) {
    return (
        <div
            className={`relative overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)] ${className}`}
            style={{
                padding: "12px",
                background: "#fff",
                borderRadius: "4px",
                boxShadow: shadows.photo,
                transform: `rotate(${tilt})`
            }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className="w-full h-full bg-charcoal/5 relative overflow-hidden border border-charcoal/5" style={{ borderRadius: "2px" }}>
                <Image src={src} alt={alt} fill className="object-cover transition-opacity duration-500" sizes="(max-width: 768px) 100vw, 33vw" />
            </div>
        </div>
    );
}

/* ── Local Helper: Vertical Icon Column ───────────── */
function IconColumn({ services, activeService, onServiceClick }: {
    services: typeof SERVICES,
    activeService: ServiceType | null,
    onServiceClick: (service: ServiceType) => void
}) {
    return (
        <div className="flex flex-col items-center gap-4">
            {services.map((s) => {
                const isActive = activeService === s.label;
                return (
                    <button
                        key={s.label}
                        onClick={() => onServiceClick(s.label)}
                        className="flex flex-col items-center gap-1 group cursor-pointer focus:outline-none transition-transform active:scale-95"
                        title={s.label}
                    >
                        <div className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 ${isActive
                            ? 'bg-primary shadow-md scale-110'
                            : 'bg-charcoal/[0.04] hover:bg-primary/20'
                            }`}>
                            <Image
                                src={s.icon}
                                alt={s.label}
                                width={28}
                                height={28}
                                className={`w-7 h-7 object-contain transition-all duration-300 ${isActive ? 'opacity-100 brightness-0 invert' : 'opacity-60'
                                    }`}
                            />
                        </div>
                    </button>
                );
            })}
        </div>
    );
}

/* ── Local Helper: Left Column Content ────────────── */

function LeftColumnContent({ activeService, onServiceClick }: {
    activeService: ServiceType | null,
    onServiceClick: (service: ServiceType) => void
}) {
    return (
        <div className="space-y-8 pt-4">
            <SectionHeader
                line1="The"
                line2="Sanctuary"
                className="space-y-0" // SectionHeader has its own spacing, but we want to control the subtitle/description here
            />

            <div className="flex gap-6 border-t border-charcoal/10 pt-8">
                {/* Body Text */}
                <div className="flex-1 space-y-6">
                    <p style={{ fontFamily: fonts.handwriting }} className="text-2xl text-charcoal/50 leading-snug">
                        A garden of elemental rituals.
                    </p>
                    <div className="h-[2px] w-12 bg-primary"></div>
                    <p className="text-sm leading-7 text-[#2C2C2C] font-body text-justify">
                        Safely ensconced within the privacy fencing, sauna guests are liberated to pursue their sauna rituals as comfortably as they feel, whether they be naked or wearing a bathing suit, all are welcome & there is no judgement.
                    </p>
                    <p className="text-sm leading-7 text-[#2C2C2C] font-body text-justify">
                        We are focused that the plunge pool is full of icy cold water, the showers have strong water pressure, the changing tent is clean and dry, the firebowl is roaring, and there is plenty of filtered drinking water for all guests.
                    </p>
                </div>

                {/* Icon Column */}
                <div className="w-16 pt-2 pl-4 border-l border-charcoal/10">
                    <IconColumn
                        services={SERVICES}
                        activeService={activeService}
                        onServiceClick={onServiceClick}
                    />
                </div>
            </div>
        </div>
    );
}

export default function SanctuarySection() {
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [activeService, setActiveService] = useState<ServiceType | null>(null);

    // Get current images based on active service
    const currentImages = activeService ? SERVICE_GALLERY[activeService] : SERVICE_GALLERY['Default'];

    // Helper to get transformation based on hover state
    const getTransform = (id: string, baseTilt: string, direction: 'top-left' | 'mid-right' | 'bottom-left' | 'polaroid') => {
        const isHovered = hoveredId === id;
        const isAnyHovered = hoveredId !== null;

        // Base state
        let scale = "scale(1)";
        let translate = "translate(0, 0)";
        let rotate = `rotate(${baseTilt})`;

        if (isHovered) {
            scale = "scale(1.05)";
            rotate = "rotate(0deg)";
        } else if (isAnyHovered) {
            // Push away logic based on relative positions
            if (hoveredId === '1') { // Top-Left hovered
                if (direction === 'mid-right') translate = "translate(40px, 40px)";
                if (direction === 'bottom-left') translate = "translate(0px, 60px)";
                if (direction === 'polaroid') translate = "translate(40px, 40px)";
            }
            if (hoveredId === '2') { // Middle-Right hovered
                if (direction === 'top-left') translate = "translate(-40px, -20px)";
                if (direction === 'bottom-left') translate = "translate(-20px, 40px)";
                if (direction === 'polaroid') translate = "translate(0px, 60px)";
            }
            if (hoveredId === '3') { // Bottom-Left hovered
                if (direction === 'top-left') translate = "translate(-20px, -60px)";
                if (direction === 'mid-right') translate = "translate(40px, -20px)";
                if (direction === 'polaroid') translate = "translate(60px, 20px)";
            }
            if (hoveredId === '4') { // Polaroid hovered
                if (direction === 'top-left') translate = "translate(-40px, -40px)";
                if (direction === 'mid-right') translate = "translate(20px, -60px)";
                if (direction === 'bottom-left') translate = "translate(-60px, 0px)";
            }
            scale = "scale(0.95)"; // Slight shrink for background items
        }

        return {
            transform: `${translate} ${rotate} ${scale}`,
            zIndex: isHovered ? 50 : (isAnyHovered ? 0 : (direction === 'top-left' ? 10 : direction === 'mid-right' ? 20 : direction === 'bottom-left' ? 30 : 40)),
            opacity: isAnyHovered && !isHovered ? 0.6 : 1
        };
    };

    return (
        <StandardSection id="sanctuary" variant="naturalPaper">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
                <div className="col-span-1 md:col-span-5">
                    <LeftColumnContent
                        activeService={activeService}
                        onServiceClick={setActiveService}
                    />
                </div>

                <div className="col-span-1 md:col-span-7 relative min-h-[500px]" onMouseLeave={() => setHoveredId(null)}>

                    {/* Layer 1: Top Left */}
                    <div
                        className="absolute top-0 left-0 w-[60%] transition-all duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)]"
                        style={getTransform('1', '-2deg', 'top-left')}
                        onMouseEnter={() => setHoveredId('1')}
                    >
                        <Photo src={currentImages.img1} className="aspect-[4/3] w-full" alt="1. Detail Shot" />
                    </div>

                    {/* Layer 2: Middle Right */}
                    <div
                        className="absolute top-24 right-0 w-[65%] transition-all duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)]"
                        style={getTransform('2', '1deg', 'mid-right')}
                        onMouseEnter={() => setHoveredId('2')}
                    >
                        <Photo src={currentImages.img2} className="aspect-video w-full" alt="2. Wide Landscape" />
                    </div>

                    {/* Layer 3: Bottom Left */}
                    <div
                        className="absolute top-[280px] left-12 w-[55%] transition-all duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)]"
                        style={getTransform('3', '-1deg', 'bottom-left')}
                        onMouseEnter={() => setHoveredId('3')}
                    >
                        <Photo src={currentImages.img3} className="aspect-square w-full" alt="3. Texture/Macro" />
                    </div>

                    {/* Polaroid: Anchored Bottom Right */}
                    <div
                        className="absolute bottom-[-20px] right-12 transition-all duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)]"
                        style={getTransform('4', '3deg', 'polaroid')}
                        onMouseEnter={() => setHoveredId('4')}
                    >
                        <Polaroid
                            src={currentImages.polaroid}
                            label={currentImages.polaroidLabel}
                            rotation="rotate-0"
                            size="w-48"
                            forcePlaceholder={false}
                        />
                    </div>

                </div>
            </div>
        </StandardSection>
    );
}

"use client";

import React, { useState } from 'react';
import { colors, shadows, fonts, icons, textures, pencil } from '@/design-system/tokens';
import { Polaroid } from '@/components/Polaroid';
import { LayeredPencil, HandDrawnFilter } from '@/components/LayeredPencil';

/* ─────────────────────────────────────────────────────
   THE SANCTUARY — FINAL CONCEPT (G1 INTERACTIVE)
   
   Structure:
   - Left Col: Locked F1 (Header + Text/Icon Split).
   - Right Col: The Cascade (3 Photos + 1 Polaroid).
   
   Interaction:
   - "Spread on Hover": When hovering an image, others
     slide gently out of the way.
   - Strict Placeholders.
   ───────────────────────────────────────────────────── */

const PHOTOS = {
    saunaSign: "",
    sunset: "",
    festival: "",
};

const SERVICES = [
    { icon: icons.sauna, label: "Sauna" },
    { icon: icons.hotTub, label: "Hot Tub" },
    { icon: icons.plungePool, label: "Plunge Pool" },
    { icon: icons.firePit, label: "Fire Pit" },
    { icon: icons.shower, label: "Shower" },
    { icon: icons.towels, label: "Towels" },
];

/* ── Shared: Placeholder Photo ────────────────────── */
function Photo({
    tilt = "0deg",
    className = "",
    label = "Photo Context",
    onMouseEnter,
    onMouseLeave
}: {
    tilt?: string;
    className?: string;
    label?: string;
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
            <div className="w-full h-full bg-charcoal/5 flex items-center justify-center border border-charcoal/5" style={{ borderRadius: "2px" }}>
                <div className="text-center">
                    <span className="text-charcoal/20 text-xs font-mono tracking-widest uppercase block mb-1">PLACEHOLDER</span>
                    <span className="text-charcoal/40 text-sm font-bold font-body">{label}</span>
                </div>
            </div>
        </div>
    );
}

/* ── Shared: Vertical Icon Column ─────────────────── */
function IconColumn({ services }: { services: typeof SERVICES }) {
    return (
        <div className="flex flex-col items-center gap-4">
            {services.map((s) => (
                <div key={s.label} className="flex flex-col items-center gap-1 group">
                    <div className="w-12 h-12 flex items-center justify-center bg-charcoal/[0.04] rounded-full group-hover:bg-primary/20 transition-colors">
                        <img src={s.icon} alt={s.label} className="w-7 h-7 object-contain opacity-60" />
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ── Shared: Section Wrapper ──────────────────────── */
function SectionWrap({ children }: { children: React.ReactNode }) {
    return (
        <section className="space-y-8">
            <div className="relative overflow-hidden rounded-[60px] border-4"
                style={{ backgroundColor: colors.bgLight, borderColor: 'rgba(44,44,44,0.05)', boxShadow: shadows.section }}>
                <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-5"
                    style={{ backgroundImage: `url('${textures.pencilGrain}')`, backgroundSize: '300px' }}></div>
                <div className="relative z-10 p-16">
                    {children}
                </div>
            </div>
        </section>
    );
}

/* ── Shared: Left Column Content ──────────────────── */
function LeftColumnContent() {
    return (
        <div className="space-y-8 pt-4">
            <LayeredPencil text="The" size="50px" />
            <LayeredPencil text="Sanctuary" size="85px" strokeWidth={pencil.strokes.hero.width} className="-mt-6" />

            <div className="flex gap-6 border-t border-charcoal/10 pt-8">
                {/* Body Text */}
                <div className="flex-1 space-y-6">
                    <p style={{ fontFamily: fonts.handwriting }} className="text-2xl text-charcoal/50 leading-snug">
                        A garden of elemental rituals.
                    </p>
                    <div className="h-[2px] w-12 bg-primary"></div>
                    <p className="text-sm leading-7 opacity-60 font-body text-justify">
                        Our wood-fired sauna sits in a wildflower meadow, surrounded by cold plunge pools
                        and fire pits. Strip back, slow down, and let the cycle of heat and cold reset
                        your nervous system.
                    </p>
                </div>

                {/* Icon Column */}
                <div className="w-16 pt-2 pl-4 border-l border-charcoal/10">
                    <IconColumn services={SERVICES} />
                </div>
            </div>
        </div>
    );
}


/* ═════════════════════════════════════════════════════
   THE CASCADE — INTERACTIVE
   ─────────────────────────────────────────────────────
   Logic:
   - 3 Photos + 1 Polaroid.
   - Hovering one pushes the others away.
   ═════════════════════════════════════════════════════ */
function CascadeInteractive() {
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    // Helper to get transformation based on hover state
    const getTransform = (id: string, baseTilt: string, direction: 'top-left' | 'mid-right' | 'bottom-left' | 'polaroid') => {
        const isHovered = hoveredId === id;
        const isAnyHovered = hoveredId !== null;

        // Base state
        let scale = "scale(1)";
        let translate = "translate(0, 0)";
        let rotate = `rotate(${baseTilt})`;
        let zIndex = "z-10";

        if (isHovered) {
            scale = "scale(1.05)";
            rotate = "rotate(0deg)";
            zIndex = "z-50"; // Bring to front
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
            zIndex = "z-0"; // Push back
        }

        return {
            transform: `${translate} ${rotate} ${scale}`,
            zIndex: isHovered ? 50 : (isAnyHovered ? 0 : (direction === 'top-left' ? 10 : direction === 'mid-right' ? 20 : direction === 'bottom-left' ? 30 : 40)),
            opacity: isAnyHovered && !isHovered ? 0.6 : 1
        };
    };

    return (
        <SectionWrap>
            <div className="grid grid-cols-12 gap-12 items-start">
                <div className="col-span-5"><LeftColumnContent /></div>

                <div className="col-span-7 relative min-h-[500px]" onMouseLeave={() => setHoveredId(null)}>

                    {/* Layer 1: Top Left */}
                    <div
                        className="absolute top-0 left-0 w-[60%] transition-all duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)]"
                        style={getTransform('1', '-2deg', 'top-left')}
                        onMouseEnter={() => setHoveredId('1')}
                    >
                        <Photo className="aspect-[4/3] w-full" label="1. Detail Shot" />
                    </div>

                    {/* Layer 2: Middle Right */}
                    <div
                        className="absolute top-24 right-0 w-[65%] transition-all duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)]"
                        style={getTransform('2', '1deg', 'mid-right')}
                        onMouseEnter={() => setHoveredId('2')}
                    >
                        <Photo className="aspect-video w-full" label="2. Wide Landscape" />
                    </div>

                    {/* Layer 3: Bottom Left */}
                    <div
                        className="absolute top-[280px] left-12 w-[55%] transition-all duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)]"
                        style={getTransform('3', '-1deg', 'bottom-left')}
                        onMouseEnter={() => setHoveredId('3')}
                    >
                        <Photo className="aspect-square w-full" label="3. Texture/Macro" />
                    </div>

                    {/* Polaroid: Anchored Bottom Right */}
                    <div
                        className="absolute bottom-[-20px] right-12 transition-all duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)]"
                        style={getTransform('4', '3deg', 'polaroid')}
                        onMouseEnter={() => setHoveredId('4')}
                    >
                        <Polaroid src="" label="The Ritual" rotation="rotate-0" size="w-48" forcePlaceholder={true} />
                    </div>

                </div>
            </div>
        </SectionWrap>
    );
}


/* ─────────────────────────────────────────────────────
   PAGE — THE FINAL CONCEPT
   ───────────────────────────────────────────────────── */
export default function SanctuaryFinal() {
    return (
        <div className="min-h-screen p-24 font-body text-charcoal" style={{ backgroundColor: colors.bgPageBase }}>
            <header className="mb-24 border-b-2 border-charcoal/10 pb-12">
                <LayeredPencil text="Sanctuary Final" size="70px" as="h1" />
                <p className="text-2xl italic opacity-70 max-w-2xl mt-4" style={{ fontFamily: fonts.display }}>
                    Layout G1 ("The Cascade") with "Parting Clouds" interaction.
                    Hover any image to see others slide gently out of the way.
                </p>
            </header>

            <div className="space-y-40">
                <CascadeInteractive />
            </div>

            <HandDrawnFilter />
        </div>
    );
}

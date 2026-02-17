"use client";

import React from 'react';
import { Polaroid } from '@/components/Polaroid';
import Image from 'next/image';
import { textures, shadows, icons } from '@/design-system/tokens';

/* ── Local Helper: Standard Photograph (Sanctuary style) ── */
function Photo({ src, label, tilt = "0deg", className = "", size = "w-64 h-80" }: { src: string; label?: string; tilt?: string; className?: string; size?: string }) {
    return (
        <div
            className={`absolute ${size} bg-white p-3 shadow-photo transition-transform duration-700 hover:scale-[1.02] ${className}`}
            style={{ borderRadius: '4px', transform: `rotate(${tilt})` }}
        >
            <div className="w-full h-full bg-charcoal/5 relative overflow-hidden border border-charcoal/5">
                <Image src={src} alt={label || "Photo"} fill className="object-cover" />
            </div>
        </div>
    );
}

export function DeskBackground() {
    return (
        <div className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0 bg-[#FDFCF9]">
            {/* Canvas Base Layer */}
            <div
                className="absolute inset-0 opacity-[0.3] mix-blend-multiply"
                style={{
                    backgroundImage: `url('${textures.canvas}')`,
                    backgroundSize: '1000px',
                }}
            />

            {/* Blurred & Faded Content Wrapper */}
            <div className="absolute inset-0 blur-[8px] opacity-40">
                {/* 1. SCATTERED POLAROIDS */}
                <div className="absolute top-[8%] left-[4%] scale-[0.6]">
                    <Polaroid src="/DSCF2335.JPG" label="Morning Mist" variant="A" rotation="rotate-[-8deg]" />
                </div>

                <div className="absolute bottom-[10%] right-[3%] scale-[0.55]">
                    <Polaroid src="/P1130170.JPG" label="Sanctuary Prep" variant="B" rotation="rotate-[6deg]" />
                </div>

                <div className="absolute top-[45%] -left-12 scale-[0.5]">
                    <Polaroid src="/logo-black-yellow.png" label="Identity Draft" variant="C" rotation="rotate-[12deg]" />
                </div>

                <div className="absolute -bottom-8 left-[25%] scale-[0.5]">
                    <Polaroid src="/DSCF2335.JPG" label="Texture Study" variant="B" rotation="rotate-[-15deg]" />
                </div>

                {/* 2. STANDARD PHOTOGRAPHS */}
                <Photo src="/P1130170.JPG" tilt="4deg" className="top-[15%] right-[8%]" size="w-56 h-72" />
                <Photo src="/DSCF2335.JPG" tilt="-12deg" className="bottom-[18%] left-[10%]" size="w-48 h-48" />
                <Photo src="/P1130170.JPG" tilt="-6deg" className="top-[60%] right-[5%]" size="w-60 h-44" />
                <Photo src="/DSCF2335.JPG" tilt="15deg" className="top-[5%] left-[30%]" size="w-32 h-40" />
                <Photo src="/P1130170.JPG" tilt="-3deg" className="bottom-[5%] right-[30%]" size="w-44 h-56" />

                {/* 3. SCATTERED HAND-DRAWN ICONS (Approved set only) */}
                <div className="absolute top-[35%] left-[48%] w-24 h-24 grayscale rotate-[-15deg]">
                    <Image src={icons.heart} alt="" fill className="object-contain" />
                </div>

                <div className="absolute top-[20%] left-[25%] w-32 h-32 grayscale rotate-[10deg]">
                    <Image src={icons.hotTub} alt="" fill className="object-contain" />
                </div>

                <div className="absolute bottom-[30%] right-[22%] w-20 h-20 grayscale rotate-[-20deg]">
                    <Image src={icons.sauna} alt="" fill className="object-contain" />
                </div>

                <div className="absolute top-[65%] right-[15%] w-28 h-28 grayscale rotate-[35deg]">
                    <Image src={icons.firePit} alt="" fill className="object-contain" />
                </div>

                <div className="absolute top-[5%] right-[40%] w-36 h-36 grayscale rotate-[-10deg]">
                    <Image src={icons.home} alt="" fill className="object-contain" />
                </div>
            </div>
        </div>
    );
}

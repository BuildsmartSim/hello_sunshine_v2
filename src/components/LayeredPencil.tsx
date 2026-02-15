"use client";

import React from 'react';
import { pencil, fonts } from '@/design-system/tokens';

/* ─────────────────────────────────────────────────────
   LAYERED PENCIL HEADER
   
   The confirmed Chicle rendering technique:
   Two stacked layers — a hatch-textured fill underneath
   and a hand-drawn ink stroke on top. This is the ONLY
   way Chicle headers should be rendered.
   
   Champion config (ID 26000 / 7002_CANV):
     hatchClass: "hatch-aesthetic-yellow-bold"
     strokeColor: "#1F1A17"
     strokeWidth: "1.2px" (standard) or "1.5px" (hero)
     blendClass: "pencil-blend-multiply"
   ───────────────────────────────────────────────────── */

export interface LayeredPencilProps {
    text: string;
    size?: string;
    hatchClass?: string;
    strokeColor?: string;
    strokeWidth?: string;
    fillOpacity?: string;
    strokeOpacity?: string;
    blendClass?: string;
    className?: string;
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'span';
}

export function LayeredPencil({
    text,
    size = "80px",
    hatchClass = pencil.hatch.yellowBold,
    strokeColor = pencil.strokes.standard.color,
    strokeWidth = pencil.strokes.standard.width,
    fillOpacity = "0.95",
    strokeOpacity = "1",
    blendClass = pencil.blend.multiply,
    className = "",
    as: Tag = "h2",
}: LayeredPencilProps) {
    return (
        <div className={`grid place-items-start relative ${blendClass} ${className}`}>
            {/* Fill Layer — hatch texture clipped to text */}
            <Tag
                className={`${hatchClass} ${fillOpacity === '0.65' ? 'pencil-soft' : fillOpacity === '0.45' ? 'pencil-extra-soft' : ''}`}
                style={{
                    fontFamily: fonts.accent,
                    fontSize: size,
                    lineHeight: '1',
                    gridArea: '1/1',
                    opacity: parseFloat(fillOpacity),
                    display: 'block',
                }}
            >
                {text}
            </Tag>

            {/* Stroke Layer — hand-drawn ink outline */}
            <Tag
                className="pencil-stroke-only"
                style={{
                    fontFamily: fonts.accent,
                    fontSize: size,
                    lineHeight: '1',
                    gridArea: '1/1',
                    WebkitTextStroke: `${strokeWidth} ${strokeColor}`,
                    opacity: parseFloat(strokeOpacity),
                    filter: 'url(#hand-drawn)',
                    display: 'block',
                }}
            >
                {text}
            </Tag>
        </div>
    );
}

/* SVG Filter — must be included once on every page that uses LayeredPencil */
export function HandDrawnFilter() {
    return (
        <svg className="hidden" width="0" height="0">
            <filter id="hand-drawn">
                <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
            </filter>
        </svg>
    );
}



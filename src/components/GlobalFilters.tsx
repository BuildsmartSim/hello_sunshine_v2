"use client";

import React from "react";

/**
 * GLOBAL SVG FILTERS
 * 
 * Centralized definition for heavy SVG filters to avoid duplication.
 * Include this ONCE in the root layout.
 * 
 * IDs defined here:
 * - #hand-drawn: The wobble effect for headers
 */
export function GlobalFilters() {
    return (
        <svg className="hidden" width="0" height="0" aria-hidden="true">
            <defs>
                <filter id="hand-drawn">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.05"
                        numOctaves="2"
                        result="noise"
                    />
                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="noise"
                        scale="4"
                        xChannelSelector="R"
                        yChannelSelector="G"
                    />
                </filter>
            </defs>
        </svg>
    );
}

"use client";

import React from 'react';
import { SmartImage as Image } from '@/components/SmartImage';

export function DeskBackground() {
    return (
        <div className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0 bg-charcoal">
            {/* Base Blurred Image */}
            <div className="absolute inset-0 w-full h-full">
                <Image
                    src="/optimized/photographs/webp/sauna-signage-vintage-caravan-outdoor.webp"
                    alt="Sauna Signage"
                    fill
                    className="object-cover blur-xl scale-110 opacity-70"
                    priority
                />
            </div>
            {/* Warm overlay to standardize contrast */}
            <div className="absolute inset-0 bg-[#3E2723]/30 mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-charcoal/40"></div>
        </div>
    );
}


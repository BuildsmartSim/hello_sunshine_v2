"use client";

import React from 'react';
import { useDesign } from '@/design-system/DesignContext';
import { textures, backgrounds } from '@/design-system/tokens';

interface StandardSectionProps {
    children: React.ReactNode;
    variant?: 'naturalPaper' | 'charcoal' | 'sunlightYellow' | 'cedar';
    className?: string;
    id?: string;
    showOverlap?: boolean;
    containerSize?: 'max-w-7xl' | 'max-w-6xl' | 'max-w-5xl' | 'full';
}

/**
 * THE DEFINITIVE SECTION WRAPPER
 * 
 * Centralizes:
 * 1. Vertical Rhythm (Responsive Padding)
 * 2. Background Textures & Colors
 * 3. Horizontal Constraint (max-width)
 * 4. Section Interlock (Negative Overlap)
 */
export function StandardSection({
    children,
    variant = 'naturalPaper',
    className = "",
    id,
    showOverlap = false,
    containerSize = 'max-w-7xl'
}: StandardSectionProps) {
    const { getEffectiveDesign } = useDesign();
    const local = getEffectiveDesign(id);
    const config = backgrounds[variant];

    // Dynamic styles from local design override (using CSS variables for responsiveness)
    const sectionStyle: React.CSSProperties = {
        backgroundColor: config.bg,
        marginTop: showOverlap ? `calc(-1 * ${local.sectionOverlap}px)` : 0,
        // Local Override Injection
        '--hss-local-pad-v-mobile': `${local.sectionPaddingMobile}px`,
        '--hss-local-pad-v-desktop': `${local.sectionPaddingDesktop}px`,
        '--shadow-intensity': local.shadowIntensity.toString(),
        '--card-tilt': `${local.cardTilt}deg`,
        '--hss-primary': local.primaryColor,
        '--hss-charcoal': local.charcoalColor,
        '--hss-site-width': `${local.siteWidth}px`,
        '--hss-header-interlock': `${local.headerInterlock}px`,
        '--hss-header-subtitle-gap': `${local.headerSubtitleGap}px`,
    } as React.CSSProperties;

    return (
        <section
            id={id}
            className={`relative overflow-hidden ${config.isDark ? 'text-white' : 'text-charcoal'} ${className}`}
            style={sectionStyle}
        >
            <style jsx>{`
                section {
                    padding-top: var(--hss-local-pad-v-mobile);
                    padding-bottom: var(--hss-local-pad-v-mobile);
                }
                @media (min-width: 1024px) {
                    section {
                        padding-top: var(--hss-local-pad-v-desktop);
                        padding-bottom: var(--hss-local-pad-v-desktop);
                    }
                }
            `}</style>

            {/* Texture Layer */}
            <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply"
                style={{
                    backgroundImage: `url('${variant === 'cedar' ? textures.cedar : textures.paper}')`,
                    backgroundSize: '400px',
                }}></div>

            {/* Content Container */}
            <div
                className={`mx-auto px-6 relative z-10 ${containerSize === 'full' ? 'w-full' : ''}`}
                style={{ maxWidth: containerSize === 'full' ? 'none' : 'var(--hss-site-width)' }}
            >
                {children}
            </div>
        </section>
    );
}

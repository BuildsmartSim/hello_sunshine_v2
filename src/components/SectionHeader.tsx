"use client";

import { fonts, pencil } from '@/design-system/tokens';
import { LayeredPencil } from '@/components/LayeredPencil';

interface SectionHeaderProps {
    line1: string;
    line2?: string;
    subtitle?: string; // e.g. "EST. 2024"
    description?: string;
    className?: string;
    centered?: boolean;
}

/**
 * THE DEFINITIVE SECTION HEADER
 * 
 * Standardizes the 50px/85px Chicle stack used across:
 * - Sanctuary
 * - Ticketing
 * - Guestbook
 * 
 * Includes the specific charcoal hatch fill (faded) and 
 * fixed line-interlock spacing to prevent overlap.
 */

export function SectionHeader({ line1, line2 = "", subtitle, description, className = "", centered = false }: SectionHeaderProps) {
    return (
        <div
            className={`${className} ${centered ? 'items-center text-center' : ''}`}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--hss-header-subtitle-gap, 16px)'
            }}
        >
            <div className="relative">
                {/* Line 1: 50px Standard */}
                <LayeredPencil
                    text={line1}
                    size="50px"
                    hatchClass={pencil.hatch.charcoalShaded}
                    strokeColor="var(--hss-charcoal, #2C2C2C)"
                    fillOpacity="1"
                />

                {/* Line 2: 85px with dynamic interlock */}
                <LayeredPencil
                    text={line2}
                    size="85px"
                    hatchClass={pencil.hatch.charcoalShaded}
                    strokeColor="var(--hss-charcoal, #2C2C2C)"
                    className="block"
                    style={{ marginTop: 'var(--hss-header-interlock, 0px)' }}
                    fillOpacity="1"
                />
            </div>

            {(subtitle || description) && (
                <div
                    className="flex flex-col border-t border-charcoal/10"
                    style={{ gap: 'calc(var(--hss-header-subtitle-gap, 16px) * 1.5)', paddingTop: 'calc(var(--hss-header-subtitle-gap, 16px) * 0.75)' }}
                >
                    {subtitle && (
                        <div className="space-y-3">
                            <p style={{ fontFamily: fonts.handwriting }} className="text-2xl text-charcoal/50 leading-snug">
                                {subtitle}
                            </p>
                            <div className="h-[2px] w-12" style={{ backgroundColor: 'var(--hss-primary, #F8C630)' }}></div>
                        </div>
                    )}
                    {description && (
                        <div className="text-xl font-display italic text-charcoal/40 max-w-xl">
                            {description}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

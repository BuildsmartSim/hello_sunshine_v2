"use client";

import { fonts } from '@/design-system/tokens';

interface SectionHeaderProps {
    line1: string;
    line2?: string;
    subtitle?: string; // e.g. "EST. 2024"
    handwriting?: string;
    description?: string;
    className?: string;
    centered?: boolean;
    withSeparator?: boolean;
}

export function SectionHeader({
    line1,
    line2 = "",
    subtitle,
    handwriting,
    description,
    className = "",
    centered = false,
    withSeparator = false
}: SectionHeaderProps) {
    const fullHeading = line2 ? `${line1} ${line2}` : line1;

    return (
        <div className={`${className} ${centered ? 'flex flex-col items-center text-center' : ''}`}>
            {subtitle && (
                <div className="mb-4 md:mb-6">
                    <span className="overline">
                        {subtitle}
                    </span>
                </div>
            )}

            <h2 className={`super-header ${handwriting || description ? 'mb-6 md:mb-8' : 'mb-0'}`}>
                {fullHeading}
            </h2>

            {handwriting && (
                <div className={`flex gap-4 items-center opacity-70 ${centered ? 'justify-center' : ''} ${description ? 'mb-6' : 'mb-0'}`}>
                    <svg width="40" height="12" viewBox="0 0 40 12" className="stroke-charcoal fill-none shrink-0" role="img" aria-hidden="true">
                        <path d="M0 6 Q10 -2 20 6 T40 6" strokeWidth="1" />
                    </svg>
                    <span className="text-sm md:text-base font-body uppercase tracking-[0.2em] text-charcoal/80">
                        {handwriting}
                    </span>
                    {centered && (
                        <svg width="40" height="12" viewBox="0 0 40 12" className="stroke-charcoal fill-none transform scale-x-[-1] shrink-0" role="img" aria-hidden="true">
                            <path d="M0 6 Q10 -2 20 6 T40 6" strokeWidth="1" />
                        </svg>
                    )}
                </div>
            )}

            {description && (
                <p className={`text-lg text-charcoal/80 leading-relaxed font-light max-w-xl ${centered ? 'mx-auto' : ''}`}>
                    {description}
                </p>
            )}

            {withSeparator && (
                <div className="h-px w-full bg-charcoal/10 mt-8" />
            )}
        </div>
    );
}

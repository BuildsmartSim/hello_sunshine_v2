"use client";

import { fonts } from '@/design-system/tokens';

interface GlowingHeaderProps {
    line1: string;
    line2?: string;
    subtitle?: string; // e.g. "EST. 2024"
    description?: string;
    className?: string;
    centered?: boolean;
    variant?: "dark" | "light";
}

export function GlowingHeader({ line1, line2 = "", subtitle, description, className = "", centered = false, variant = "dark" }: GlowingHeaderProps) {
    const isLight = variant === "light";

    // Both variants now use bright white for the word itself, as the "hottest" part of the sun.
    const coreColor = "#FFF";

    const darkGlowEffects = `
        0 0 10px rgba(255, 230, 150, 0.8),
        0 0 20px rgba(248, 198, 48, 0.8),
        0 0 40px rgba(248, 198, 48, 0.6),
        0 0 80px rgba(212, 163, 42, 0.5),
        0 0 120px rgba(212, 163, 42, 0.4)
    `;

    // A white hot core needs contrast against a bright background.
    // We surround the pure white text with a very dense, deep ochre and vibrant sunlight yellow edge.
    // This creates a "burning through the page" look.
    const lightGlowEffects = `
        0 0 5px rgba(212, 163, 42, 1),
        0 0 10px rgba(248, 198, 48, 0.9),
        0 0 20px rgba(248, 198, 48, 0.8),
        0 0 40px rgba(212, 163, 42, 0.6),
        0 0 80px rgba(212, 163, 42, 0.3)
    `;

    const textShadow = isLight ? lightGlowEffects : darkGlowEffects;

    // Subtitle and description contrast
    const subtitleColorClass = isLight ? "text-secondary" : "text-primary";
    const subtitleShadow = isLight ? "none" : "drop-shadow-md";
    const descriptionColor = isLight ? "var(--hss-charcoal, #2C2C2C)" : "rgba(255, 255, 255, 0.7)";
    const descriptionOpacity = isLight ? 0.7 : 1;
    const dividerBorderColor = isLight ? "rgba(44, 44, 44, 0.1)" : "rgba(248, 198, 48, 0.3)";
    const subDividerColor = isLight ? "var(--hss-secondary, #D4A32A)" : "var(--hss-primary, #F8C630)";
    const subDividerShadow = isLight ? "none" : "0 0 10px rgba(248,198,48,0.8)";

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
                {/* Line 1 */}
                <span
                    className="block transition-all duration-1000"
                    style={{
                        fontFamily: fonts.accent,
                        fontSize: '50px',
                        lineHeight: 1,
                        color: coreColor,
                        textShadow: textShadow,
                    }}
                >
                    {line1}
                </span>

                {/* Line 2 */}
                {line2 && (
                    <span
                        className="block transition-all duration-1000"
                        style={{
                            fontFamily: fonts.accent,
                            fontSize: '95px', // Slightly larger for extra wow 
                            lineHeight: 0.95,
                            color: coreColor,
                            textShadow: textShadow,
                            marginTop: '-5px',
                        }}
                    >
                        {line2}
                    </span>
                )}
            </div>

            {(subtitle || description) && (
                <div
                    className="flex flex-col border-t transition-colors duration-1000"
                    style={{
                        borderColor: dividerBorderColor,
                        gap: 'calc(var(--hss-header-subtitle-gap, 16px) * 1.5)',
                        paddingTop: 'calc(var(--hss-header-subtitle-gap, 16px) * 0.75)'
                    }}
                >
                    {subtitle && (
                        <div className="space-y-3">
                            <p className={`text-sm md:text-base font-body uppercase tracking-[0.2em] ${subtitleColorClass} ${subtitleShadow} transition-colors duration-1000`}>
                                {subtitle}
                            </p>
                            <div className="h-[2px] w-12 transition-all duration-1000" style={{ backgroundColor: subDividerColor, boxShadow: subDividerShadow }}></div>
                        </div>
                    )}
                    {description && (
                        <div className="text-xl font-display italic max-w-xl transition-colors duration-1000" style={{ color: descriptionColor, opacity: descriptionOpacity }}>
                            {description}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

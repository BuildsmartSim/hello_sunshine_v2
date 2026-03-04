"use client";

import { fonts } from '@/design-system/tokens';

interface HeaderProps {
    line1: string;
    line2?: string;
    subtitle?: string;
    description?: string;
    className?: string;
    centered?: boolean;
    line1Size?: string;
    line2Size?: string;
    strokeWidth?: string;
}

// Helper for the animated dappled overlay (we reuse this across all 3 options)
function DappledOverlay() {
    return (
        <>
            <div
                className="absolute inset-0 pointer-events-none mix-blend-screen opacity-70 z-20"
                style={{
                    backgroundImage: [
                        'radial-gradient(ellipse 100px 80px at 25% 40%, rgba(255,255,255,0.75) 0%, transparent 100%)',
                        'radial-gradient(ellipse 80px 60px at 65% 55%, rgba(255,255,255,0.85) 0%, transparent 100%)',
                        'radial-gradient(ellipse 60px 50px at 45% 80%, rgba(255,255,255,0.65) 0%, transparent 100%)',
                    ].join(', '),
                    backgroundSize: '100% 100%',
                    animation: 'dapple 10s ease-in-out infinite alternate',
                }}
            ></div>
            <style jsx>{`
                @keyframes dapple {
                    0%   { background-position: 0% 0%;   opacity: 0.5; }
                    50%  { opacity: 0.75; }
                    100% { background-position: 30% 20%; opacity: 0.6; }
                }
            `}</style>
        </>
    );
}

// Option C1: Yellow Text + Deep Drop Shadow
export function DappledHeaderShadow({ line1, line2 = "", subtitle, description, className = "", centered = false }: HeaderProps) {
    const textStyle = {
        fontFamily: fonts.accent,
        color: 'var(--hss-primary, #F8C630)',
        // A tight, dark shadow acts as a grounding anchor so the yellow doesn't vanish into the cream background.
        textShadow: '0 4px 12px rgba(44,44,44,0.15), 0 2px 4px rgba(44,44,44,0.1)'
    };

    return (
        <div className={`relative overflow-hidden p-8 -m-8 ${className} ${centered ? 'items-center text-center' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <DappledOverlay />

            <div className="relative z-10 flex flex-col drop-shadow-sm">
                <span className="block" style={{ ...textStyle, fontSize: '50px', lineHeight: 1 }}>
                    {line1}
                </span>
                {line2 && (
                    <span className="block" style={{ ...textStyle, fontSize: '95px', lineHeight: 0.95, marginTop: '-5px' }}>
                        {line2}
                    </span>
                )}
            </div>

            {(subtitle || description) && (
                <div className="relative z-10 flex flex-col border-t" style={{ borderColor: 'rgba(44, 44, 44, 0.1)', gap: '24px', paddingTop: '12px' }}>
                    {subtitle && (
                        <div className="space-y-3">
                            <p className="text-3xl text-secondary leading-snug handwritten-text">{subtitle}</p>
                            <div className="h-[2px] w-12 bg-secondary"></div>
                        </div>
                    )}
                    {description && (
                        <div className="text-xl font-display italic max-w-xl text-charcoal/70">{description}</div>
                    )}
                </div>
            )}
        </div>
    );
}

// Option C2: Yellow Text + Delicate Charcoal Stroke
export function DappledHeaderStroke({ line1, line2 = "", subtitle, description, className = "", centered = false, line1Size = '50px', line2Size = '95px', strokeWidth = '1px' }: HeaderProps) {
    const textStyle = {
        fontFamily: fonts.accent,
        color: 'var(--hss-primary, #F8C630)',
        WebkitTextStroke: `${strokeWidth} var(--hss-charcoal, #2C2C2C)`,
        textShadow: '0 2px 8px rgba(248,198,48,0.3)' // very subtle self-glow
    };

    return (
        <div className={`relative overflow-hidden p-8 -m-8 ${className} ${centered ? 'items-center text-center' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <DappledOverlay />

            <div className="relative z-10 flex flex-col">
                <span className="block" style={{ ...textStyle, fontSize: line1Size, lineHeight: 1 }}>
                    {line1}
                </span>
                {line2 && (
                    <span className="block" style={{ ...textStyle, fontSize: line2Size, lineHeight: 0.95, marginTop: '-5px' }}>
                        {line2}
                    </span>
                )}
            </div>

            {(subtitle || description) && (
                <div className="relative z-10 flex flex-col border-t" style={{ borderColor: 'rgba(44, 44, 44, 0.1)', gap: '24px', paddingTop: '12px' }}>
                    {subtitle && (
                        <div className="space-y-3">
                            <p className="text-3xl text-secondary leading-snug handwritten-text">{subtitle}</p>
                            <div className="h-[2px] w-12 bg-secondary"></div>
                        </div>
                    )}
                    {description && (
                        <div className="text-xl font-display italic max-w-xl text-charcoal/70">{description}</div>
                    )}
                </div>
            )}
        </div>
    );
}

// Option C3: Golden Gradient Text
export function DappledHeaderGradient({ line1, line2 = "", subtitle, description, className = "", centered = false }: HeaderProps) {
    const gradientStyle = {
        fontFamily: fonts.accent,
        background: 'linear-gradient(180deg, #F8C630 0%, #D4A32A 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        filter: 'drop-shadow(0px 4px 6px rgba(44,44,44,0.1))',
    };

    return (
        <div className={`relative overflow-hidden p-8 -m-8 ${className} ${centered ? 'items-center text-center' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <DappledOverlay />

            <div className="relative z-10 flex flex-col">
                <span className="block" style={{ ...gradientStyle, fontSize: '50px', lineHeight: 1 }}>
                    {line1}
                </span>
                {line2 && (
                    <span className="block" style={{ ...gradientStyle, fontSize: '95px', lineHeight: 0.95, marginTop: '-5px' }}>
                        {line2}
                    </span>
                )}
            </div>

            {(subtitle || description) && (
                <div className="relative z-10 flex flex-col border-t" style={{ borderColor: 'rgba(44, 44, 44, 0.1)', gap: '24px', paddingTop: '12px' }}>
                    {subtitle && (
                        <div className="space-y-3">
                            <p className="text-3xl text-secondary leading-snug handwritten-text">{subtitle}</p>
                            <div className="h-[2px] w-12 bg-secondary"></div>
                        </div>
                    )}
                    {description && (
                        <div className="text-xl font-display italic max-w-xl text-charcoal/70">{description}</div>
                    )}
                </div>
            )}
        </div>
    );
}

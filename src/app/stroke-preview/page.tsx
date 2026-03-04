import React from 'react';
import { StandardSection } from '@/components/StandardSection';
import { DappledHeaderStroke } from '@/components/LightHeaderVariants';
import Link from 'next/link';

export const metadata = {
    title: "Stroke Thickness Preview | Hello Sunshine",
    description: "Preview various stroke thicknesses for the Hero Header",
};

export default function StrokePreviewPage() {
    const strokeOptions = ['1px', '1.5px', '2px', '2.5px', '3px', '4px', '5px'];

    return (
        <main className="min-h-screen bg-[canvas] font-sans pb-32">
            <div className="pt-32 pb-16 px-6 max-w-5xl mx-auto">
                <div className="mb-12">
                    <Link href="/" className="text-secondary hover:text-charcoal transition-colors text-sm font-bold tracking-widest uppercase mb-4 inline-block font-mono">
                        ← Back to Home
                    </Link>
                    <h1 className="text-4xl font-black text-charcoal tracking-widest uppercase font-mono mb-4">
                        Stroke Thickness Preview
                    </h1>
                    <p className="text-charcoal/70">
                        Compare different stroke thicknesses for the main &quot;Hello Sunshine&quot; header.
                        Once you decide on a favorite, let me know and I will update the main Hero section.
                    </p>
                </div>

                <div className="space-y-16">
                    {strokeOptions.map((strokeWidth) => (
                        <div key={strokeWidth} className="border border-charcoal/10 rounded-xl overflow-hidden bg-white/50 backdrop-blur-sm shadow-sm">
                            <div className="bg-charcoal/5 px-6 py-4 border-b border-charcoal/10 flex justify-between items-center">
                                <h2 className="font-mono font-bold tracking-widest text-charcoal">
                                    Stroke Width: {strokeWidth}
                                </h2>
                                {strokeWidth === '1px' && (
                                    <span className="text-xs font-mono bg-charcoal text-white px-2 py-1 rounded">CURRENT</span>
                                )}
                            </div>

                            {/* Realistic simulation of the Hero section context */}
                            <StandardSection variant="naturalPaper" containerPadding="px-4 py-12">
                                <DappledHeaderStroke
                                    line1="Hello Sunshine"
                                    line1Size="clamp(64px, 15vw, 142px)"
                                    centered={false}
                                    strokeWidth={strokeWidth}
                                />
                                <div className="flex items-center gap-3 md:gap-6 my-4 md:my-6 overflow-hidden mt-8 max-w-3xl">
                                    <div className="h-px flex-1 bg-charcoal/15 hidden sm:block" />
                                    <p className="text-lg md:text-2xl opacity-50 shrink-0 text-center w-full sm:w-auto handwritten-text">
                                        Hand-built pine.&nbsp;·&nbsp;Authentic steam.
                                    </p>
                                    <div className="h-px flex-1 bg-charcoal/15 hidden sm:block" />
                                </div>
                            </StandardSection>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}

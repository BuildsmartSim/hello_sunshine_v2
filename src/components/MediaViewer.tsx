"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMedia } from '@/design-system/MediaContext';
import { SmartImage as Image } from '@/components/SmartImage';

import { RECIPES, textures } from './Polaroid';
import { useHasMounted } from '@/design-system/MediaContext';

export function MediaViewer() {
    const { activeMedia, closeMedia, setTransitioning } = useMedia();
    const hasMounted = useHasMounted();

    if (!hasMounted) return null;

    const isPolaroid = activeMedia?.aspect === 'aspect-[4/5]';
    const r = RECIPES[activeMedia?.variant || 'A'];

    // Deeper shadow for "lifted" effect
    const woodShadow = `0 60px 120px -25px rgba(35, 30, 28, 0.7)`;
    const composedShadow = isPolaroid
        ? `${woodShadow}, ${r.embossHighlight}, ${r.embossLowlight}`
        : woodShadow;

    return (
        <AnimatePresence onExitComplete={() => setTransitioning(false)}>
            {activeMedia && (
                <div key="viewer-overlay" className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 overflow-hidden">
                    {/* Backdrop Blur Layer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeMedia}
                        className="absolute inset-0 bg-charcoal/30 backdrop-blur-md cursor-zoom-out"
                    />

                    {/* The "Lifted" Element */}
                    <motion.div
                        layoutId={activeMedia.id}
                        onAnimationComplete={() => setTransitioning(false)}
                        className={`relative z-10 w-full ${isPolaroid ? 'max-w-[550px]' : 'max-w-5xl'} ${activeMedia.aspect || 'aspect-video'} cursor-zoom-out`}
                        onClick={closeMedia}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 30
                        }}
                    >
                        {/* ── THE FRAME (MIRRORS ORIGINAL) ──────────────────── */}
                        <div
                            className="w-full h-full relative overflow-hidden"
                            style={{
                                backgroundColor: isPolaroid ? r.frameBg : '#fff',
                                boxShadow: composedShadow,
                                padding: isPolaroid ? '6% 6% 22% 6%' : (activeMedia.padding || '12px'),
                                borderRadius: activeMedia.borderRadius || '4px'
                            }}
                        >
                            {/* Paper grain texture (Polaroid Only) */}
                            {isPolaroid && (
                                <div
                                    className="absolute inset-0 pointer-events-none mix-blend-multiply"
                                    style={{
                                        backgroundImage: `url('${textures.pencilGrain}')`,
                                        backgroundSize: '200px',
                                        opacity: r.grainOpacity,
                                    }}
                                ></div>
                            )}

                            {/* ── THE PHOTO INSET ──────────────────── */}
                            <div
                                className={`w-full ${isPolaroid ? 'h-[84%]' : 'h-full'} relative overflow-hidden bg-charcoal/5 shadow-[inset_0_3px_8px_rgba(0,0,0,0.15)]`}
                                style={{ borderRadius: isPolaroid ? '1px' : `calc(${activeMedia.borderRadius || '4px'} / 2)` }}
                            >
                                <Image
                                    src={activeMedia.src}
                                    alt={activeMedia.label || "Viewed image"}
                                    fill
                                    className="object-cover"
                                    style={{ filter: isPolaroid ? r.photoFilter : 'none' }}
                                    priority
                                />

                                {isPolaroid && (
                                    <>
                                        {/* Vignette */}
                                        <div
                                            className="absolute inset-0 pointer-events-none"
                                            style={{
                                                background: `radial-gradient(ellipse at center, transparent ${r.vignetteSize}, rgba(0,0,0,${r.vignetteOpacity}) 100%)`,
                                            }}
                                        ></div>
                                        {/* Inner bevel */}
                                        <div className="absolute inset-0 shadow-[inset_0_6px_16px_rgba(0,0,0,0.25)] pointer-events-none"></div>
                                        {/* Film grain */}
                                        <div
                                            className="absolute inset-0 pointer-events-none mix-blend-overlay"
                                            style={{
                                                backgroundImage: `url('${textures.pencilGrain}')`,
                                                backgroundSize: '180px',
                                                opacity: r.grainOpacity * 1.5,
                                            }}
                                        ></div>
                                    </>
                                )}
                            </div>

                            {/* Label (Polaroid Only) */}
                            {isPolaroid && activeMedia.label && (
                                <div className="absolute bottom-[4%] left-0 right-0 text-center">
                                    <span
                                        style={{ fontFamily: 'var(--font-caveat)' }}
                                        className="text-[min(40px,8cqw)] italic text-charcoal/50 block -rotate-1 leading-none"
                                    >
                                        {activeMedia.label}
                                    </span>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Instructional prompt */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { delay: 0.6 } }}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-charcoal/30 font-mono text-[9px] uppercase tracking-[0.4em] pointer-events-none"
                    >
                        Click to put back
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

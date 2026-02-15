"use client";

import React from 'react';
import Guestbook from '@/components/Guestbook';
import { fonts } from '@/design-system/tokens';

export default function GuestbookWorkbench() {
    return (
        <main className="min-h-screen bg-[#FAF9F6] flex flex-col items-center py-24 px-6">
            <header className="mb-16 text-center max-w-2xl">
                <p className="text-xs font-bold tracking-widest uppercase text-charcoal/40 mb-4">
                    Component Workbench
                </p>
                <h1 style={{ fontFamily: fonts.accent }} className="text-5xl mb-6 text-charcoal">
                    Authentic Guestbook
                </h1>
                <p className="opacity-60 leading-relaxed max-w-lg mx-auto">
                    Rebuilt with high-fidelity textures and realistic folding mechanics.
                    Click the cover to open, and the page to flip.
                </p>
            </header>

            <div className="w-full flex justify-center perspective-container">
                <Guestbook />
            </div>

            <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl text-center opacity-60 text-sm">
                <div>
                    <h3 className="font-bold mb-2 uppercase tracking-wide">Exterior</h3>
                    <p>Leather texture with embossed details.</p>
                </div>
                <div>
                    <h3 className="font-bold mb-2 uppercase tracking-wide">Interior</h3>
                    <p>Rigid board base with layered paper.</p>
                </div>
                <div>
                    <h3 className="font-bold mb-2 uppercase tracking-wide">Content</h3>
                    <p>Handwritten overlays with multiply blend.</p>
                </div>
            </div>
        </main>
    );
}

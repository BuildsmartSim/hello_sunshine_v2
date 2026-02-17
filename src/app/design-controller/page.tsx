"use client";

import React from 'react';
import { DesignController } from '@/components/DesignController';
import Home from '../page';

export default function DesignControllerPage() {
    return (
        <main className="relative min-h-screen bg-white">
            {/* THE LIVE PREVIEW (Homepage) */}
            <div className="pointer-events-none opacity-80">
                <Home />
            </div>

            {/* THE CONTROLLER (Floating) */}
            <div className="fixed top-8 right-8 z-[9999]">
                <DesignController />
            </div>

            {/* Backdrop for clarity */}
            <div className="fixed inset-0 bg-charcoal/5 pointer-events-none z-[-1]"></div>

            <div className="fixed top-4 left-4 bg-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest z-[10000] shadow-xl border border-charcoal/10">
                Live Design Lab
            </div>
        </main>
    );
}

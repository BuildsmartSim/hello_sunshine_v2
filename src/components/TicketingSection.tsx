"use client";

import React from 'react';
import Link from 'next/link';
import { SectionHeader } from '@/components/SectionHeader';
import { StandardSection } from '@/components/StandardSection';
import { FestivalPass, FESTIVAL_DATA } from '@/components/Ticketing/FestivalPass';

export default function TicketingSection() {
    return (
        <StandardSection id="ticketing" variant="naturalPaper" showOverlap={true}>
            <div className="grid grid-cols-1 md:grid-cols-12" style={{ marginBottom: 'var(--hss-header-gap-desktop, 48px)' }}>
                <div className="hidden md:block md:col-span-1 border-r border-charcoal/10 h-32 opacity-40 mr-12" style={{ filter: 'url(#hand-drawn)' }}></div>
                <div className="col-span-1 md:col-span-11">
                    <SectionHeader
                        line1="Festival"
                        line2="Season"
                        subtitle="Choose your journey into warmth."
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 items-center justify-items-center">
                {FESTIVAL_DATA.map((pass, idx) => (
                    <Link key={pass.id} href="/tickets" className="w-full flex justify-center">
                        <FestivalPass data={pass} index={idx + 1} mode="teaser" />
                    </Link>
                ))}
            </div>

            <div className="mt-24 flex flex-col items-center gap-8">
                <div className="h-[2px] w-16 bg-charcoal/5"></div>
                <p className="font-handwriting text-charcoal/30 text-2xl">Limited availability for all tiers</p>
            </div>
        </StandardSection>
    );
}

"use client";

import React from 'react';
import Image from 'next/image';
import { textures, fonts, colors, icons, pencil } from '@/design-system/tokens';
import { LayeredPencil } from '@/components/LayeredPencil';

const LOGO_SRC = "/HSSLOGO black YELLOW.png";

const NAV_ITEMS = [
    { label: 'Experience', href: '#experience' },
    { label: 'Our Story', href: '#story' },
    { label: 'Booking', href: '#booking' },
];

export default function Header() {
    return (
        <header className="fixed top-0 left-0 w-full z-50 bg-[#FDFCF9] border-b border-charcoal/10 overflow-hidden px-8">
            {/* Very subtle paper texture overlay to keep it organic */}
            <div className="absolute inset-0 pointer-events-none opacity-40"
                style={{
                    backgroundImage: `url('${textures.paper}')`,
                    backgroundSize: '400px',
                }}></div>

            <div className="max-w-7xl mx-auto py-6 md:py-8 flex items-center justify-between relative z-10 transition-all duration-500">

                {/* Identity Column */}
                <div className="flex items-center gap-6 md:gap-10">
                    <div className="relative w-12 h-12 md:w-16 md:h-16 transform -rotate-3 hover:rotate-0 transition-transform duration-500 shrink-0">
                        <Image src={LOGO_SRC} alt="Hello Sunshine" fill className="object-contain" />
                    </div>
                    <div className="flex flex-col border-l border-charcoal/10 pl-6 md:pl-10">
                        <LayeredPencil
                            text="Hello Sunshine"
                            size="clamp(1.8rem, 4vw, 3rem)"
                            hatchClass={pencil.hatch.yellowBold}
                            strokeColor={colors.charcoal}
                            strokeWidth="1.2px"
                            blendClass="pencil-blend-multiply"
                        />
                        <span className="text-[8px] md:text-[10px] font-mono tracking-[0.5em] text-charcoal opacity-40 uppercase font-bold mt-1">
                            Est. 2019
                        </span>
                    </div>
                </div>

                {/* Refined Navigation Column (Studio Style) */}
                <nav className="hidden lg:flex items-center gap-12 font-body text-[11px] font-bold uppercase tracking-[0.4em]">
                    {NAV_ITEMS.map(it => (
                        <a key={it.label} href={it.href} className="text-charcoal/40 hover:text-charcoal transition-all relative group">
                            {it.label}
                            <span className="absolute -bottom-2 left-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                        </a>
                    ))}
                </nav>

                {/* Right: Contact & Action (Large Icons) */}
                <div className="flex items-center gap-4 md:gap-10">
                    <div className="hidden sm:flex items-center gap-3 md:gap-5">
                        <button className="w-10 h-10 md:w-14 md:h-14 rounded-full border border-charcoal/10 flex items-center justify-center hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all group bg-white/40">
                            <Image src={icons.phone} alt="Phone" width={20} height={20} className="md:w-[22px] md:h-[22px] opacity-30 group-hover:opacity-100 transition-opacity" />
                        </button>
                        <button className="w-10 h-10 md:w-14 md:h-14 rounded-full border border-charcoal/10 flex items-center justify-center hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all group bg-white/40">
                            <Image src={icons.mail} alt="Email" width={20} height={20} className="md:w-[22px] md:h-[22px] opacity-30 group-hover:opacity-100 transition-opacity" />
                        </button>
                    </div>
                    <button className="bg-charcoal text-white px-6 md:px-10 py-3 md:py-4 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-primary hover:text-charcoal transition-all shadow-xl border border-white/10 active:scale-95 whitespace-nowrap">
                        Join the Warmth
                    </button>
                </div>
            </div>
        </header>
    );
}

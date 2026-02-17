"use client";

import React from 'react';
import Image from 'next/image';
import { textures, icons } from '@/design-system/tokens';
import Link from 'next/link';
import { useScroll, useMotionValueEvent } from 'framer-motion';
import { useState } from 'react';

const LOGO_SRC = "/HSSLOGO black YELLOW.png";

const NAV_ITEMS = [
    { label: 'Experience', href: '#experience' },
    { label: 'Our Story', href: '#story' },
    { label: 'Booking', href: '#booking' },
];

export default function Header() {
    const { scrollY } = useScroll();
    const [hidden, setHidden] = useState(false);

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() || 0;
        if (latest > previous && latest > 150) {
            setHidden(true);
        } else {
            setHidden(false);
        }
    });

    return (
        <header
            className={`fixed top-0 left-0 w-full z-50 bg-[#FDFCF9] border-b border-charcoal/10 overflow-hidden px-8 transition-transform duration-300 ${hidden ? '-translate-y-full' : 'translate-y-0'}`}
        >
            {/* Very subtle paper texture overlay to keep it organic */}
            <div className="absolute inset-0 pointer-events-none opacity-40"
                style={{
                    backgroundImage: `url('${textures.paper}')`,
                    backgroundSize: '400px',
                }}></div>

            <div
                className="mx-auto py-2 md:py-4 flex items-center justify-between relative z-10 transition-all duration-500"
                style={{ maxWidth: 'var(--hss-site-width)' }}
            >

                {/* Identity Column */}
                <div className="flex items-center gap-4 md:gap-6">
                    <div className="relative w-12 h-12 md:w-14 md:h-14 transform -rotate-3 hover:rotate-0 transition-transform duration-500 shrink-0">
                        <Image src={LOGO_SRC} alt="Hello Sunshine" fill className="object-contain" />
                    </div>
                    <div className="flex flex-col border-l border-charcoal/10 pl-4 md:pl-6 h-12 md:h-14 justify-center">
                        <span className="text-[9px] md:text-[10px] font-mono tracking-[0.3em] text-charcoal opacity-40 uppercase font-bold">
                            Est. 2019
                        </span>
                    </div>
                </div>

                {/* Refined Navigation Column (Studio Style) */}
                <nav className="hidden lg:flex items-center gap-12 font-body text-[13px] font-bold uppercase tracking-[0.4em]">
                    {NAV_ITEMS.map(it => (
                        <a key={it.label} href={it.href} className="text-charcoal/40 hover:text-charcoal transition-all relative group">
                            {it.label}
                            <span className="absolute -bottom-2 left-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                        </a>
                    ))}
                </nav>

                {/* Right: Contact & Action (Large Icons) */}
                <div className="flex items-center gap-3 md:gap-6">
                    <div className="hidden sm:flex items-center gap-2 md:gap-3">
                        <button className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-charcoal/10 flex items-center justify-center hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all group bg-white/40">
                            <Image src={icons.phone} alt="Phone" width={18} height={18} className="md:w-[20px] md:h-[20px] opacity-80 group-hover:opacity-100 transition-opacity" />
                        </button>
                        <button className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-charcoal/10 flex items-center justify-center hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all group bg-white/40">
                            <Image src={icons.mail} alt="Email" width={18} height={18} className="md:w-[20px] md:h-[20px] opacity-80 group-hover:opacity-100 transition-opacity" />
                        </button>
                    </div>
                    <Link href="/tickets">
                        <button className="bg-charcoal text-white px-5 md:px-8 py-2 md:py-3 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary hover:text-charcoal transition-all shadow-xl border border-white/10 active:scale-95 whitespace-nowrap">
                            Join the Warmth
                        </button>
                    </Link>
                </div>
            </div>
        </header>
    );
}

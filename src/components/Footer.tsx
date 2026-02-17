"use client";

import React from 'react';
import Image from 'next/image';
import { textures, icons, pencil } from '@/design-system/tokens';
import { LayeredPencil } from '@/components/LayeredPencil';

export default function Footer() {
    return (
        <footer className="relative bg-[#2C3333] text-[#EBE5CE] py-10 px-8 overflow-hidden">
            {/* Cedar Wood Background Overlay - Tactile Feel */}
            <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay"
                style={{
                    backgroundImage: `url('${textures.cedar}')`,
                    backgroundSize: '600px',
                    backgroundRepeat: 'repeat'
                }}></div>

            <div
                className="mx-auto relative z-10"
                style={{ maxWidth: 'var(--hss-site-width)' }}
            >
                {/* Top Row: Brand & Nav Header */}
                <div className="flex flex-col md:flex-row justify-between items-center border-b border-[#EBE5CE]/10 pb-8 mb-8">
                    <div className="text-center md:text-left mb-6 md:mb-0">
                        <LayeredPencil
                            text="Hello Sunshine"
                            as="h3"
                            size="clamp(3rem, 8vw, 4.5rem)"
                            hatchClass={pencil.hatch.creamBold}
                            strokeColor="#FDFCF9"
                            strokeWidth="1.2px"
                            blendClass="pencil-blend-screen"
                            className="mb-2"
                        />
                        <p className="font-handwriting text-2xl text-[#EBE5CE]/60 -rotate-1">
                            Hand-built stories in steam.
                        </p>
                    </div>

                    <nav className="flex flex-wrap justify-center gap-8 md:gap-12 font-body text-[11px] font-bold uppercase tracking-[0.4em]">
                        {['Sauna', 'Experience', 'Story', 'Journal'].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                className="hover:text-[#F8C630] transition-colors duration-300 relative group"
                            >
                                {item}
                                <span className="absolute -bottom-2 left-0 w-full h-[2px] bg-[#F8C630] scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                            </a>
                        ))}
                    </nav>
                </div>

                {/* Bottom Row: Details, Newsletter & Socials */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-end">

                    {/* Left: Mission Statement */}
                    <div className="md:col-span-4 lg:col-span-5">
                        <p className="font-body text-lg opacity-60 leading-relaxed max-w-md">
                            Based in the hills, moving with the seasons. We craft spaces of deep restoration
                            and wood-fired heat. Finding the wild in the warmth since 2019.
                        </p>
                    </div>

                    {/* Middle: Social Icons */}
                    <div className="md:col-span-3 lg:col-span-2 flex justify-center md:justify-start gap-5">
                        {[
                            { icon: icons.instagram, label: 'IG' },
                            { icon: icons.facebook, label: 'FB' },
                            { icon: icons.mail, label: 'Mail' }
                        ].map((social, i) => (
                            <a
                                key={i}
                                href="#"
                                className="w-14 h-14 flex-shrink-0 rounded-full border border-[#EBE5CE]/20 flex items-center justify-center hover:bg-[#F8C630] hover:border-[#F8C630] hover:scale-110 hover:-translate-y-1 transition-all duration-300 group shadow-lg bg-[#2C3333]"
                                aria-label={social.label}
                            >
                                <div className="relative w-[22px] h-[22px]">
                                    <Image
                                        src={social.icon}
                                        alt={social.label}
                                        fill
                                        className="object-contain opacity-70 group-hover:opacity-100 group-hover:brightness-0 transition-opacity"
                                    />
                                </div>
                            </a>
                        ))}
                    </div>

                    {/* Right: Newsletter Sign-up */}
                    <div className="md:col-span-5 lg:col-span-5 flex flex-col items-center md:items-end">
                        <span
                            style={{ fontFamily: 'var(--font-fraunces)' }}
                            className="text-3xl font-bold mb-4"
                        >
                            Get the warmth.
                        </span>
                        <div className="flex w-full max-w-xs items-center border-b-2 border-[#EBE5CE]/30 hover:border-[#F8C630] transition-colors pb-2">
                            <input
                                type="email"
                                placeholder="E-mail address"
                                className="bg-transparent border-none outline-none flex-1 text-sm font-body italic placeholder:opacity-30"
                            />
                            <button className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#F8C630] hover:translate-x-1 transition-transform">
                                JOIN
                            </button>
                        </div>
                    </div>

                </div>

                {/* Legal & Copyright */}
                <div className="mt-12 pt-6 border-t border-[#EBE5CE]/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-mono tracking-widest opacity-30 uppercase">
                    <p>© 2026 HELLO SUNSHINE SAUNA. ALL WARMTH RESERVED.</p>
                    <div className="flex gap-8">
                        <span>MADE WITH FIRE & ICE</span>
                        <span>ANTIGRAVITY</span>
                    </div>
                </div>
            </div>

            {/* Subtle Gradient Fade at the top */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#EBE5CE]/10 to-transparent"></div>
        </footer>
    );
}

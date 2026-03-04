"use client";

import React from 'react';
import Image from 'next/image';
import { textures, icons } from '@/design-system/tokens';
import Link from 'next/link';
import { useScroll, useMotionValueEvent, motion } from 'framer-motion';
import { useState } from 'react';
import { useHasMounted } from '@/design-system/MediaContext';
import { Button } from '@/components/Button';
import { usePathname, useRouter } from 'next/navigation';

const LOGO_SRC = "/HSSLOGO black YELLOW.png";

export default function Header() {
    const { scrollY } = useScroll();
    const [hidden, setHidden] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const hasMounted = useHasMounted();
    const pathname = usePathname();
    const router = useRouter();

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (pathname === '/') {
            e.preventDefault();
            document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
        }
        setIsMenuOpen(false);
    };

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() || 0;
        if (latest > previous && latest > 150 && !isMenuOpen) {
            setHidden(true);
        } else {
            setHidden(false);
        }
    });

    if (!hasMounted) return null;

    const navItems = [
        { label: 'Sanctuary', href: '#sanctuary' },
        { label: 'Guestbook', href: '#guestbook' },
        { label: 'Ticketing', href: '#ticketing' },
        { label: 'Contact', href: '#contact' }
    ];

    return (
        <>
            <header
                className={`fixed top-0 left-0 w-full z-50 bg-[#FDFCF9] border-b border-charcoal/10 px-6 md:px-8 transition-transform duration-300 ${hidden ? '-translate-y-full' : 'translate-y-0'}`}
            >
                {/* Very subtle paper texture overlay to keep it organic */}
                <div className="absolute inset-0 pointer-events-none opacity-40"
                    style={{
                        backgroundImage: `url('${textures.paper}')`,
                        backgroundSize: '400px',
                    }}></div>

                <div
                    className="mx-auto py-2 flex items-center justify-between relative z-10 w-full"
                    style={{ maxWidth: 'var(--hss-site-width)' }}
                >
                    {/* Left: Logo */}
                    <Link href="/" className="flex items-center gap-3 md:gap-6 group/logo relative z-50 flex-1 justify-start">
                        <div className="relative w-10 h-10 md:w-20 md:h-20 transform -rotate-3 group-hover/logo:rotate-0 transition-transform duration-500 shrink-0">
                            <Image src={LOGO_SRC} alt="Hello Sunshine" fill className="object-contain" priority />
                        </div>
                    </Link>

                    {/* Center: Desktop Nav OR Mobile CTA */}
                    <div className="flex-1 flex justify-center items-center">
                        {/* Desktop Nav */}
                        <nav className="hidden lg:flex items-center gap-12 font-body text-[15px] font-extrabold uppercase tracking-[0.3em]">
                            {navItems.map(it => (
                                <Link key={it.label} href={`/${it.href}`} onClick={(e) => handleNavClick(e, it.href)} className="text-charcoal/80 hover:text-primary transition-colors relative group">
                                    {it.label}
                                    <span className="absolute -bottom-2 left-0 w-full h-[3px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                                </Link>
                            ))}
                        </nav>

                        {/* Mobile CTA (Hidden on Desktop, shown in center on Mobile) */}
                        <div className="lg:hidden relative z-50 w-full px-1 max-w-[160px] sm:max-w-[200px]">
                            <Button
                                variant="deepDry"
                                className="w-full !px-0 !py-2.5 !text-[12px] sm:!text-[13px]"
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    if (pathname === '/') {
                                        document.querySelector('#ticketing')?.scrollIntoView({ behavior: 'smooth' });
                                    } else {
                                        router.push('/#ticketing');
                                    }
                                }}
                            >
                                Book Now
                            </Button>
                        </div>
                    </div>

                    {/* Right: Hamburger Menu (Mobile) OR CTA (Desktop) */}
                    <div className="flex-1 flex justify-end items-center gap-4 relative z-50">
                        {/* Desktop CTA */}
                        <div className="hidden lg:block">
                            <Button
                                variant="deepDry"
                                className="!text-[14px] md:!px-8 md:!py-3"
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    if (pathname === '/') {
                                        document.querySelector('#ticketing')?.scrollIntoView({ behavior: 'smooth' });
                                    } else {
                                        router.push('/#ticketing');
                                    }
                                }}
                            >
                                Book Now
                            </Button>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden relative w-10 h-10 flex flex-col items-center justify-center gap-1.5 focus:outline-none"
                            aria-label="Toggle Menu"
                        >
                            <motion.span
                                animate={isMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                                className="w-6 h-0.5 bg-charcoal block transition-transform"
                            />
                            <motion.span
                                animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                                className="w-6 h-0.5 bg-charcoal block transition-opacity"
                            />
                            <motion.span
                                animate={isMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                                className="w-6 h-0.5 bg-charcoal block transition-transform"
                            />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Navigation Overlay - Close Backdrop */}
            <motion.div
                initial={false}
                animate={isMenuOpen ? { opacity: 1 } : { opacity: 0 }}
                className="fixed inset-0 z-[9998] bg-charcoal/20 lg:hidden"
                style={{
                    pointerEvents: isMenuOpen ? 'auto' : 'none',
                    backdropFilter: 'blur(4px)',
                    visibility: isMenuOpen ? 'visible' : 'hidden'
                }}
                onClick={() => setIsMenuOpen(false)}
            />

            {/* Mobile Navigation Menu - 80% Width */}
            <motion.div
                initial={false}
                animate={isMenuOpen ? { x: 0 } : { x: '-100%' }}
                transition={{ type: "spring", damping: 35, stiffness: 200 }}
                className="fixed inset-y-0 left-0 w-[80%] z-[9999] lg:hidden flex flex-col pt-32 pb-12 px-6 shadow-2xl"
                style={{
                    backgroundColor: '#FDFCF9',
                    visibility: isMenuOpen ? 'visible' : 'hidden'
                }}
            >
                {/* Brand Texture Overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-40"
                    style={{
                        backgroundImage: `url('${textures.paper}')`,
                        backgroundSize: '400px',
                        backgroundRepeat: 'repeat'
                    }}></div>

                <nav className="relative z-10 flex flex-col gap-4">
                    {navItems.map((it, idx) => (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={isMenuOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                            transition={{ delay: idx * 0.08 }}
                            key={it.label}
                        >
                            <Link
                                href={`/${it.href}`}
                                onClick={(e) => handleNavClick(e, it.href)}
                                className="w-full rounded-full border border-charcoal/10 bg-charcoal/[0.03] py-4 px-8 flex items-center justify-center text-center font-body text-[13px] font-bold uppercase tracking-[0.4em] text-charcoal hover:bg-primary/10 hover:border-primary/30 transition-all duration-300 active:scale-95"
                            >
                                {it.label}
                            </Link>
                        </motion.div>
                    ))}
                </nav>

                {/* Bottom Section: Simplified Connect */}
                <div className="mt-auto relative z-10 px-2">
                    <div className="h-px w-full bg-charcoal/10 mb-8" />

                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-charcoal/30">Connect</span>
                            <div className="text-xl font-chicle text-charcoal leading-tight">Finding the wild in the warmth.</div>
                        </div>

                        <div className="flex gap-4">
                            {[
                                { icon: icons.instagram, label: 'IG', href: '#' },
                                { icon: icons.facebook, label: 'FB', href: '#' },
                                { icon: icons.mail, label: 'Mail', href: '#' }
                            ].map((social, i) => (
                                <a
                                    key={i}
                                    href={social.href}
                                    className="w-10 h-10 rounded-full border border-charcoal/10 flex items-center justify-center hover:bg-primary transition-all duration-300 group bg-white/50"
                                    aria-label={social.label}
                                >
                                    <div className="relative w-4 h-4">
                                        <Image
                                            src={social.icon}
                                            alt={social.label}
                                            fill
                                            className="object-contain opacity-60 group-hover:opacity-100 group-hover:brightness-0 transition-opacity"
                                        />
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

interface SidebarItemProps {
    href: string;
    label: string;
    icon: React.ReactNode;
    active?: boolean;
}

function SidebarItem({ href, label, icon, active }: SidebarItemProps) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all group ${active
                ? 'bg-neutral-900 text-white shadow-lg'
                : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
        >
            <span className={`${active ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-900'}`}>
                {icon}
            </span>
            <span className="font-mono uppercase tracking-widest">{label}</span>
        </Link>
    );
}

import { getRoleAction } from '@/app/actions/tickets';

export function Sidebar() {
    const pathname = usePathname();
    const [role, setRole] = React.useState<string | null>(null);
    const [isOpen, setIsOpen] = React.useState(false);

    React.useEffect(() => {
        const fetchRole = async () => {
            const res = await getRoleAction();
            if (res.success) {
                setRole(res.role || 'clerk');
            }
        };
        fetchRole();
    }, []);

    // Close sidebar when path changes on mobile
    React.useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Don't show sidebar on login page
    if (pathname === '/admin/login') return null;

    const isAdmin = role === 'admin';

    return (
        <>
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between p-4 bg-neutral-900 border-b border-neutral-800 sticky top-0 z-50">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="relative w-8 h-8 rounded-full bg-[#FDFCF9] overflow-hidden">
                        <Image src="/HSSLOGO black YELLOW.png" alt="Hello Sunshine" fill className="object-contain p-1" />
                    </div>
                    <h1 className="text-xs font-black text-white tracking-[0.2em] uppercase font-mono group-hover:text-yellow-400 transition-colors">
                        Hello Sunshine
                    </h1>
                </Link>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 text-white hover:bg-neutral-800 rounded-lg transition-colors"
                >
                    {isOpen ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                    )}
                </button>
            </div>

            {/* Sidebar Overlay for Mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div className={`
                fixed lg:sticky top-0 left-0 z-40
                w-72 lg:w-64 bg-white border-r border-neutral-200 flex flex-col h-screen font-sans 
                transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-6 border-b border-neutral-100 bg-neutral-900 hidden lg:block">
                    <Link href="/" className="flex items-center gap-3 group block">
                        <div className="relative w-10 h-10 rounded-full bg-[#FDFCF9] overflow-hidden flex-shrink-0 transition-transform group-hover:scale-105">
                            <Image src="/HSSLOGO black YELLOW.png" alt="Hello Sunshine" fill className="object-contain p-1" priority />
                        </div>
                        <div>
                            <h1 className="text-sm font-black text-white tracking-[0.2em] uppercase font-mono group-hover:text-yellow-400 transition-colors">
                                Hello Sunshine
                            </h1>
                            <p className="text-[10px] text-neutral-400 font-mono uppercase tracking-widest mt-1">Management Portal</p>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] px-4 mb-2 block font-mono">
                        Operations
                    </label>
                    <SidebarItem
                        href="/admin"
                        label="Dashboard"
                        active={pathname === '/admin'}
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>}
                    />
                    <SidebarItem
                        href="/admin/scanner"
                        label="Scanner"
                        active={pathname.startsWith('/admin/scanner')}
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>}
                    />
                    <SidebarItem
                        href="/admin/refunds"
                        label="Refunds"
                        active={pathname.startsWith('/admin/refunds')}
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z"></path></svg>}
                    />
                    <SidebarItem
                        href="/admin/broadcasts"
                        label="Broadcasts"
                        active={pathname.startsWith('/admin/broadcasts')}
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>}
                    />
                    <SidebarItem
                        href="/admin/analytics"
                        label="Analytics"
                        active={pathname.startsWith('/admin/analytics')}
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>}
                    />

                    {isAdmin && (
                        <div className="pt-4">
                            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] px-4 mb-2 block font-mono">
                                Management
                            </label>
                            <SidebarItem
                                href="/admin/events"
                                label="Events"
                                active={pathname.startsWith('/admin/events')}
                                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>}
                            />
                        </div>
                    )}

                    <div className="pt-4">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] px-4 mb-2 block font-mono">
                            Growth
                        </label>
                        <SidebarItem
                            href="/admin/discovery"
                            label="Discovery"
                            active={pathname.startsWith('/admin/discovery')}
                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>}
                        />
                        <SidebarItem
                            href="/admin/seo-strategy"
                            label="SEO Strategy"
                            active={pathname.startsWith('/admin/seo-strategy')}
                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>}
                        />
                        <SidebarItem
                            href="/admin/ambassadors"
                            label="Ambassadors"
                            active={pathname.startsWith('/admin/ambassadors')}
                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>}
                        />
                        <SidebarItem
                            href="/admin/social"
                            label="Socials"
                            active={pathname.startsWith('/admin/social')}
                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path></svg>}
                        />
                    </div>
                </nav>

                <div className="p-4 border-t border-neutral-100 bg-neutral-50">
                    {isAdmin && (
                        <SidebarItem
                            href="/admin/settings"
                            label="Settings"
                            active={pathname === '/admin/settings'}
                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>}
                        />
                    )}
                    <button
                        onClick={async () => {
                            const { createClient } = await import('@/utils/supabase/client');
                            const supabase = createClient();
                            await supabase.auth.signOut();
                            window.location.href = '/admin/login';
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-red-500 hover:bg-red-50 transition-all font-mono uppercase tracking-widest mt-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </>
    );
}

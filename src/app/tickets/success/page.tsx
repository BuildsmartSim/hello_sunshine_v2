"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { sendGAEvent } from '@next/third-parties/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { StandardSection } from '@/components/StandardSection';
import { Button } from '@/components/Button';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { TicketClient } from '@/components/Ticketing/TicketClient';

function SuccessContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const directTicketId = searchParams.get('id');
    const [ticketId, setTicketId] = useState<string | null>(directTicketId);
    const [ticketsData, setTicketsData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(!!sessionId && !directTicketId);

    useEffect(() => {
        if (sessionId || directTicketId) {
            // Wait for webhook to process (poll a few times if needed, or just try once)
            const resolveTicket = async () => {
                try {
                    const url = directTicketId
                        ? `/api/tickets/from-session?id=${directTicketId}`
                        : `/api/tickets/from-session?session_id=${sessionId}`;
                    const response = await fetch(url);
                    const data = await response.json();
                    if (data.ticketId) {
                        setTicketId(data.ticketId);
                    }
                    if (data.tickets && data.tickets.length > 0) {
                        setTicketsData(data.tickets);
                    } else if (data.ticket) {
                        setTicketsData([data.ticket]);
                    }
                } catch (err) {
                    console.error('Failed to resolve ticket from session:', err);
                } finally {
                    setIsLoading(false);
                }
            };

            // Wait 2 seconds for webhook to likely finish
            const timer = setTimeout(resolveTicket, 2000);
            return () => clearTimeout(timer);
        }
    }, [sessionId, directTicketId]);

    // GA4 Purchase Tracking
    useEffect(() => {
        if (sessionId) {
            // Prevent duplicate tracking on page refresh
            const trackedKey = `ga_tracked_${sessionId}`;
            if (!sessionStorage.getItem(trackedKey)) {
                sendGAEvent('event', 'purchase', {
                    currency: 'GBP',
                    transaction_id: sessionId,
                    value: 1 // We don't have the exact cart total here easily, but value is required.
                });
                sessionStorage.setItem(trackedKey, 'true');
            }
        }
    }, [sessionId]);

    return (
        <div className="flex flex-col items-center text-center max-w-lg mx-auto py-20">
            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-10">
                <span className="text-5xl">♨️</span>
            </div>

            <h1 className="text-5xl font-black text-charcoal uppercase mb-6" style={{ fontFamily: 'var(--font-accent)' }}>
                {isLoading ? 'Verifying...' : 'See You Soon'}
            </h1>

            <p className="font-handwriting text-3xl text-charcoal/60 mb-12">
                {isLoading ? 'Hang tight while we prepare your ticket.' : 'Your place in the heat is secured.'}
            </p>

            <div className="w-full p-8 border border-charcoal/10 rounded-3xl bg-white/50 mb-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url('/textures/paper.png')" }}></div>
                <p className="text-sm text-charcoal/60 leading-relaxed relative z-10">
                    We&apos;ve sent your ticket and arrival instructions to your email. Please check your spam folder if you don&apos;t see it within 5 minutes.
                </p>
            </div>

            <div className="flex flex-col gap-4 w-full">
                {ticketsData.length > 0 ? (
                    <div className="w-full flex flex-col gap-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        {ticketsData.map((tData, i) => (
                            <TicketClient key={tData.id || i} ticket={tData} checkInUrl={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://hellosunshinesauna.com'}/tickets/check-in/${tData.id}`} />
                        ))}
                    </div>
                ) : ticketId ? (
                    <Link href={`/tickets/view/${ticketId}`}>
                        <Button variant="primary" className="w-full">
                            View Digital Ticket
                        </Button>
                    </Link>
                ) : sessionId && !isLoading ? (
                    <p className="text-xs text-charcoal/40 font-mono mb-4">
                        Webhook still processing... Your ticket will appear shortly in your email.
                    </p>
                ) : null}
                <Link href="/">
                    <Button variant="ghostDry" className="w-full">
                        Back to Sanctuary
                    </Button>
                </Link>
            </div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <div className="min-h-screen flex flex-col relative bg-[#F9F7F2]">
            <Header />
            <main className="flex-1 pt-32 pb-20 px-4">
                <StandardSection id="success" variant="naturalPaper" className="!bg-transparent !border-transparent">
                    <Suspense fallback={<div className="flex justify-center p-20 text-charcoal/20 font-mono italic">Loading...</div>}>
                        <SuccessContent />
                    </Suspense>
                </StandardSection>
            </main>
            <Footer />
        </div>
    );
}

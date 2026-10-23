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
    const [ticketId, setTicketId] = useState<string | null>(null);
    const [ticketsData, setTicketsData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(!!sessionId && !directTicketId);

    const [verificationMessage, setVerificationMessage] = useState('');
    const confirmed = ticketsData.length > 0 && ticketsData.every(ticket => ['active', 'used'].includes(ticket.status));

    useEffect(() => {
        if (!sessionId && !directTicketId) {
            setVerificationMessage('Open the ticket link from your confirmation email to verify your booking.');
            return;
        }
        const controller = new AbortController();
        let timer: ReturnType<typeof setTimeout>;
        let attempts = 0;
        setIsLoading(true);
        setVerificationMessage('');
        setTicketsData([]);
        setTicketId(null);

        const resolveTicket = async () => {
            attempts += 1;
            try {
                const url = directTicketId
                    ? `/api/tickets/from-session?id=${encodeURIComponent(directTicketId)}`
                    : `/api/tickets/from-session?session_id=${encodeURIComponent(sessionId!)}`;
                const response = await fetch(url, { signal: controller.signal, cache: 'no-store' });
                const data = await response.json();
                if (response.status === 202 || response.status === 503) {
                    if (attempts < 15) {
                        timer = setTimeout(resolveTicket, 2000);
                        return;
                    }
                    setVerificationMessage(data.paymentStatus === 'unpaid'
                        ? 'Payment has not been confirmed. Please complete checkout or contact us if you have already paid.'
                        : 'Your ticket is still processing. Please check your confirmation email or refresh this page shortly.');
                } else if (!response.ok) {
                    setVerificationMessage(data.error || 'We could not verify this ticket.');
                } else if (data.tickets?.length && data.tickets.every((ticket: { status: string }) => ['active', 'used'].includes(ticket.status))) {
                    setTicketId(data.ticketId);
                    setTicketsData(data.tickets);
                } else {
                    setVerificationMessage('Your ticket is still processing. Please refresh this page shortly.');
                }
                setIsLoading(false);
            } catch (error) {
                if (controller.signal.aborted) return;
                console.error('Ticket verification failed:', error);
                setVerificationMessage('Unable to verify your ticket right now. Please refresh this page shortly.');
                setIsLoading(false);
            }
        };
        timer = setTimeout(resolveTicket, 1000);
        return () => {
            controller.abort();
            clearTimeout(timer);
        };
    }, [sessionId, directTicketId]);
    // GA4 Purchase Tracking
    useEffect(() => {
        if (sessionId && confirmed) {
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
    }, [sessionId, confirmed]);

    return (
        <div className="flex flex-col items-center text-center max-w-lg mx-auto py-20">
            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-10">
                <span className="text-5xl">♨️</span>
            </div>

            <h1 className="text-5xl font-black text-charcoal uppercase mb-6" style={{ fontFamily: 'var(--font-accent)' }}>
                {isLoading ? 'Verifying...' : confirmed ? 'See You Soon' : 'Ticket Verification'}
            </h1>

            <p className="font-handwriting text-3xl text-charcoal/60 mb-12">
                {isLoading ? 'Hang tight while we verify your payment and prepare your ticket.' : confirmed ? 'Your place in the heat is secured.' : verificationMessage}
            </p>

            <div className="w-full p-8 border border-charcoal/10 rounded-3xl bg-white/50 mb-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url('/textures/paper.png')" }}></div>
                <p className="text-sm text-charcoal/60 leading-relaxed relative z-10">
                    {confirmed ? <>Your ticket and arrival instructions are sent to your email. Please check your spam folder if you don&apos;t see them within 5 minutes.</> : <>A ticket is confirmed only after payment verification. Contact hello@hellosunshinesauna.com if you need help with your booking.</>}
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
                ) : sessionId && !isLoading && !verificationMessage ? (
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

import React, { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { StandardSection } from '@/components/StandardSection';
import { getTicketWithDetails } from '@/lib/ticketing';
import { notFound } from 'next/navigation';
import { TicketClient } from '@/components/Ticketing/TicketClient';
import { toPublicTicket } from '@/lib/public-ticket';

interface TicketPageProps {
    params: Promise<{ id: string }>;
}

async function TicketContent({ id }: { id: string }) {
    const ticket = await getTicketWithDetails(id);

    if (!ticket || !['active', 'used'].includes(ticket.status)) {
        notFound();
    }

    const checkInUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://hellosunshinesauna.com'}/tickets/check-in/${ticket.id}`;

    return <TicketClient ticket={toPublicTicket(ticket)} checkInUrl={checkInUrl} />;
}

export default async function TicketPage({ params }: TicketPageProps) {
    const { id } = await params;

    return (
        <div className="min-h-screen flex flex-col relative bg-[#F9F7F2]">
            <Header />
            <main className="flex-1 pt-32 pb-20 px-4 relative z-10">
                <StandardSection id="digital-ticket" variant="naturalPaper" className="!bg-transparent !border-transparent">
                    <Suspense fallback={<div className="flex justify-center p-20 text-charcoal/20 font-mono italic animate-pulse">Preparing your ticket...</div>}>
                        <TicketContent id={id} />
                    </Suspense>
                </StandardSection>
            </main>
            <Footer />
        </div>
    );
}

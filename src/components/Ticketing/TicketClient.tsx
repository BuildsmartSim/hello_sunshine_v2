"use client";

import React, { useState } from 'react';
import { DigitalTicket } from '@/components/Ticketing/DigitalTicket';
import { Button } from '@/components/Button';
import { SectionHeader } from '@/components/SectionHeader';
import html2canvas from 'html2canvas';

interface TicketClientProps {
    ticket: any;
    checkInUrl: string;
}

export function TicketClient({ ticket, checkInUrl }: TicketClientProps) {
    const [isSaving, setIsSaving] = useState(false);

    const saveTicket = async () => {
        const element = document.getElementById('digital-ticket-capture');
        if (!element) return;

        setIsSaving(true);
        try {
            const canvas = await html2canvas(element, {
                scale: 3, // High resolution
                useCORS: true,
                backgroundColor: '#F9F7F2',
                logging: false,
            });

            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = `HSS_Ticket_${ticket.id.substring(0, 8)}.png`;
            link.click();
        } catch (err) {
            console.error('Failed to save ticket:', err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col items-center py-12 md:py-20">
            <div className="mb-12">
                <SectionHeader
                    centered={true}
                    line1="Your"
                    line2="Ticket"
                    subtitle="DIGITAL PASS"
                    handwriting="Present this code at the sanctuary entrance."
                />
            </div>

            <div className="mb-12 relative">
                <DigitalTicket
                    ticketId={ticket.id}
                    customerName={ticket.profile?.full_name || 'Guest'}
                    eventTitle={ticket.product?.name || ticket.slot?.product?.location?.name || 'Hello Sunshine Sauna'}
                    passName={ticket.product?.name || ticket.slot?.product?.name || 'General Entry'}
                    date={ticket.slot ? new Date(ticket.slot.start_time).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Season Pass'}
                    checkInUrl={checkInUrl}
                    requiresTermsSignoff={ticket.profile?.terms_accepted === false}
                />
            </div>

            <div className="flex flex-col gap-4 w-full max-w-sm">
                <Button onClick={saveTicket} variant="primary" disabled={isSaving} className="w-full">
                    {isSaving ? 'Saving...' : '💾 Save to Photos'}
                </Button>

                <p className="text-[10px] uppercase tracking-[0.4em] text-charcoal/30 font-bold text-center mt-8 mb-4">Entry Instructions</p>
                <div className="text-xs text-charcoal/60 space-y-4 font-mono leading-relaxed bg-white/30 p-6 rounded-2xl border border-charcoal/5">
                    <p>• Save this ticket to your photos for offline access.</p>
                    <p>• Have your screen brightness up at the door.</p>
                    <p>• Remember to bring 2 towels and arrive 15 mins early.</p>
                </div>
            </div>
        </div>
    );
}

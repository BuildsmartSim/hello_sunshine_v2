"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { StandardSection } from '@/components/StandardSection';
import { Button } from '@/components/Button';

export default function CheckInPage() {
    const { id } = useParams();
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'checking' | 'success' | 'error' | 'already_used'>('loading');
    const [ticketData, setTicketData] = useState<any>(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        async function fetchTicket() {
            const { data, error } = await supabaseAdmin
                .from('tickets')
                .select(`
          *,
          profile:profiles(*),
          slot:slots(
            *,
            product:products(
              *,
              location:locations(*)
            )
          )
        `)
                .eq('id', id)
                .single();

            if (error || !data) {
                setStatus('error');
                setErrorMessage('Invalid Ticket ID');
                return;
            }

            setTicketData(data);
            if (data.status === 'used') {
                setStatus('already_used');
            } else {
                setStatus('checking');
            }
        }

        if (id) fetchTicket();
    }, [id]);

    const handleCheckIn = async () => {
        setStatus('loading');
        try {
            const response = await fetch(`/api/tickets/check-in`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });

            const result = await response.json();
            if (result.success) {
                setStatus('success');
            } else {
                setStatus('error');
                setErrorMessage(result.error || 'Failed to check in');
            }
        } catch (err) {
            setStatus('error');
            setErrorMessage('Network error');
        }
    };

    return (
        <div className="min-h-screen flex flex-col relative bg-[#F9F7F2]">
            <Header />
            <main className="flex-1 pt-32 pb-20 px-4 relative z-10">
                <StandardSection id="check-in" variant="naturalPaper" className="!bg-transparent !border-transparent">
                    <div className="max-w-md mx-auto bg-white p-8 rounded-[3rem] shadow-xl border border-charcoal/5 text-center">
                        <h2 className="text-2xl font-black text-charcoal uppercase mb-8" style={{ fontFamily: 'var(--font-accent)' }}>
                            Staff Check-In
                        </h2>

                        {status === 'loading' && (
                            <div className="py-12 flex flex-col items-center">
                                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="font-mono text-xs text-charcoal/40 italic">Processing...</p>
                            </div>
                        )}

                        {(status === 'checking' || status === 'already_used') && ticketData && (
                            <div className="space-y-6">
                                <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                                    <p className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold mb-2">Guest Name</p>
                                    <p className="text-2xl font-handwriting text-charcoal">{ticketData.profile?.full_name}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-left">
                                    <div className="bg-charcoal/5 p-4 rounded-xl">
                                        <p className="text-[8px] uppercase tracking-[0.4em] text-charcoal/40 font-bold mb-1">Pass</p>
                                        <p className="text-xs font-bold text-charcoal uppercase">{ticketData.slot?.product?.name}</p>
                                    </div>
                                    <div className="bg-charcoal/5 p-4 rounded-xl">
                                        <p className="text-[8px] uppercase tracking-[0.4em] text-charcoal/40 font-bold mb-1">Session</p>
                                        <p className="text-xs font-bold text-charcoal uppercase font-mono">
                                            {new Date(ticketData.slot?.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>

                                {status === 'already_used' ? (
                                    <div className="py-8 bg-red-50 rounded-2xl border border-red-100">
                                        <span className="text-4xl mb-4 block">⚠️</span>
                                        <p className="text-red-600 font-bold uppercase tracking-widest text-sm">Already Checked In</p>
                                        <p className="text-red-600/60 text-xs font-mono mt-2">
                                            Used at {new Date(ticketData.check_in_at).toLocaleString()}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="pt-8">
                                        <Button onClick={handleCheckIn} className="w-full !rounded-2xl py-6">
                                            Confirm Guest Entry
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="py-12">
                                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                                    ✓
                                </div>
                                <h3 className="text-xl font-bold text-charcoal uppercase tracking-widest mb-2">Success!</h3>
                                <p className="text-sm text-charcoal/60 font-mono mb-8">Guest is authorized for entry.</p>
                                <Button onClick={() => router.push('/tickets/check-in/scan')} variant="ghostDry">
                                    Scan Next
                                </Button>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="py-12">
                                <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                                    ✕
                                </div>
                                <h3 className="text-xl font-bold text-charcoal uppercase tracking-widest mb-2">Error</h3>
                                <p className="text-sm text-red-600 font-mono mb-8">{errorMessage}</p>
                                <Button onClick={() => window.location.reload()} variant="ghostDry">
                                    Try Again
                                </Button>
                            </div>
                        )}
                    </div>
                </StandardSection>
            </main>
            <Footer />
        </div>
    );
}

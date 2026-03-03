'use client';

import React, { useState } from 'react';
import { searchTicketsAction, refundTicketAction } from '@/app/actions/tickets';
import { PINOverrideModal } from '@/components/PINOverrideModal';
import { useAdminRole } from '@/hooks/useAdminRole';

interface TicketRow {
    id: string;
    created_at: string;
    status: string;
    stripe_session_id?: string | null;
    profile: {
        full_name: string;
        email: string;
    } | null;
    product: { name: string } | null;
    slot: {
        product: { name: string } | null;
    } | null;
}

export function RefundManager({ initialTickets }: { initialTickets: any[] }) {
    const isAdmin = useAdminRole();
    const [tickets, setTickets] = useState<TicketRow[]>(initialTickets);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<TicketRow | null>(null);
    const [refundReason, setRefundReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);

    const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchQuery(val);
        setIsSearching(true);
        setErrorMsg('');

        try {
            const res = await searchTicketsAction(val);
            if (res.success && res.data) {
                // Filter to only active tickets for refunding
                setTickets(res.data.filter((t: any) => t.status === 'active' || t.status === 'used'));
            }
        } catch (err: any) {
            setErrorMsg('Search failed');
        } finally {
            setIsSearching(false);
        }
    };

    const requestRefundAuth = () => {
        if (!selectedTicket || !refundReason.trim()) return;
        if (isAdmin) {
            processRefund('');
        } else {
            setIsPinModalOpen(true);
        }
    };

    const processRefund = async (pin: string) => {
        setIsPinModalOpen(false);
        setIsProcessing(true);
        setErrorMsg('');

        try {
            // Need to update refundTicketAction to accept reason
            if (!selectedTicket) return;
            const res = await refundTicketAction(selectedTicket.id, selectedTicket.stripe_session_id || null, refundReason, pin);
            if (res.success) {
                setTickets(prev => prev.filter(t => t.id !== selectedTicket.id));
                setSelectedTicket(null);
                setRefundReason('');
                alert('Refund processed and notification sent to Chief.');
            } else {
                setErrorMsg(res.error || 'Refund failed');
            }
        } catch (err: any) {
            setErrorMsg('An error occurred');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Left: Search & Select */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-xl overflow-hidden flex flex-col h-[700px]">
                <div className="p-6 border-b border-neutral-100 bg-neutral-900">
                    <h3 className="text-sm font-black text-white tracking-[0.2em] uppercase font-mono">Select Ticket for Refund</h3>
                    <div className="mt-4 relative">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="w-full pl-10 pr-4 py-3 bg-neutral-800 text-white text-xs border-none rounded-lg focus:ring-2 focus:ring-white outline-none font-mono transition-all"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                            {isSearching ? (
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            )}
                        </div>
                    </div>
                </div>

                <div className="overflow-y-auto flex-1 divide-y divide-neutral-100">
                    {tickets.length === 0 ? (
                        <div className="p-12 text-center text-neutral-400 font-mono text-xs uppercase tracking-widest italic">
                            No refundable tickets found
                        </div>
                    ) : (
                        tickets.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setSelectedTicket(t)}
                                className={`w-full p-6 text-left hover:bg-neutral-50 transition-all border-l-4 ${selectedTicket?.id === t.id ? 'border-neutral-900 bg-neutral-50' : 'border-transparent'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-black text-neutral-900 uppercase font-mono tracking-tight">{t.profile?.full_name || 'Guest'}</p>
                                        <p className="text-[10px] text-neutral-500 font-mono lower">{t.profile?.email}</p>
                                    </div>
                                    <span className="text-[10px] font-black bg-green-50 text-green-700 px-2 py-1 rounded font-mono uppercase">{t.status}</span>
                                </div>
                                <p className="text-xs text-neutral-600 mt-2 font-mono uppercase tracking-widest">{t.slot?.product?.name || t.product?.name}</p>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Right: Processing Panel */}
            <div className="flex flex-col gap-6">
                <div className={`bg-white rounded-2xl border border-neutral-200 shadow-xl p-8 transition-all ${!selectedTicket ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
                    <h3 className="text-sm font-black text-neutral-800 tracking-[0.2em] uppercase font-mono mb-6 pb-4 border-b border-neutral-100">
                        Refund Details
                    </h3>

                    {selectedTicket && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest font-mono">Guest</label>
                                    <p className="font-bold text-neutral-900">{selectedTicket.profile?.full_name}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest font-mono">Date</label>
                                    <p className="font-bold text-neutral-900">{new Date(selectedTicket.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest font-mono block mb-2 font-mono">Reason for Refund</label>
                                <textarea
                                    value={refundReason}
                                    onChange={(e) => setRefundReason(e.target.value)}
                                    placeholder="Enter detailed reason for the Chief..."
                                    className="w-full h-32 p-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 outline-none font-mono text-sm transition-all"
                                />
                            </div>

                            {errorMsg && <p className="text-red-600 text-xs font-bold font-mono uppercase tracking-widest">{errorMsg}</p>}

                            <button
                                onClick={requestRefundAuth}
                                disabled={isProcessing || !refundReason.trim()}
                                className="w-full py-4 bg-red-600 text-white font-black rounded-xl shadow-lg shadow-red-100 hover:bg-red-700 active:scale-95 transition-all text-sm uppercase tracking-[0.2em] font-mono disabled:opacity-50"
                            >
                                {isProcessing ? 'Processing Full Refund...' : 'CONFIRM & NOTIFY CHIEF'}
                            </button>
                        </div>
                    )}

                    {!selectedTicket && (
                        <div className="h-64 flex items-center justify-center text-center">
                            <p className="text-neutral-400 font-mono text-xs uppercase tracking-widest italic leading-relaxed">
                                Select a ticket from the list<br />to begin refund process
                            </p>
                        </div>
                    )}
                </div>

                <div className="bg-neutral-900 rounded-2xl p-6 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
                    </div>
                    <div className="relative z-10">
                        <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest font-mono mb-2">Automated Audit</h4>
                        <p className="text-xs text-neutral-300 font-mono leading-relaxed lowercase italic tracking-wide">
                            any refund initiated here will be logged and sent directly to the chief in command. ensuring full transparency for every sweat.
                        </p>
                    </div>
                </div>
            </div>

            <PINOverrideModal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                onSuccess={processRefund}
                title="Refund Authorization Required"
                description={`Enter Manager PIN to confirm refund for ${selectedTicket?.profile?.full_name || 'Guest'}`}
            />
        </div>
    );
}

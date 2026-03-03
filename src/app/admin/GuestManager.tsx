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
    slot: {
        start_time: string;
        product: { name: string } | null;
    } | null;
    product: { name: string } | null;
}

export function GuestManager({ initialTickets }: { initialTickets: any[] }) {
    const isAdmin = useAdminRole();
    const [tickets, setTickets] = useState<TicketRow[]>(initialTickets);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [refundingId, setRefundingId] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [ticketToRefund, setTicketToRefund] = useState<{ id: string, sessionId?: string | null } | null>(null);

    const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchQuery(val);
        setIsSearching(true);
        setErrorMsg('');

        try {
            const res = await searchTicketsAction(val);
            if (res.success && res.data) {
                setTickets(res.data);
            } else {
                setErrorMsg(res.error || 'Failed to search tickets');
            }
        } catch (err: any) {
            setErrorMsg(err.message || 'An error occurred while searching');
        } finally {
            setIsSearching(false);
        }
    };

    const requestRefundAuth = (ticketId: string, stripeSessionId?: string | null) => {
        if (!confirm('Are you sure you want to refund this ticket? This will trigger a Stripe refund if applicable and mark the ticket as refunded.')) return;
        if (isAdmin) {
            handleRefund('', { id: ticketId, sessionId: stripeSessionId });
        } else {
            setTicketToRefund({ id: ticketId, sessionId: stripeSessionId });
            setIsPinModalOpen(true);
        }
    };

    const handleRefund = async (pin: string, directTicket?: { id: string, sessionId?: string | null }) => {
        const target = directTicket || ticketToRefund;
        if (!target) return;
        setIsPinModalOpen(false);

        const { id: ticketId, sessionId: stripeSessionId } = target;
        setRefundingId(ticketId);
        setErrorMsg('');

        try {
            const res = await refundTicketAction(ticketId, stripeSessionId || null, 'Refunded via Dashboard Preview', pin);
            if (res.success) {
                setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'refunded' } : t));
                alert('Refund processed successfully.');
            } else {
                setErrorMsg(res.error || 'Refund failed to process');
            }
        } catch (err: any) {
            setErrorMsg(err.message || 'An error occurred during refund');
        } finally {
            setRefundingId(null);
            setTicketToRefund(null);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-bold text-neutral-800 tracking-tight">Guest & Purchases Manager</h3>
                    <p className="text-xs text-neutral-500 font-mono mt-1">Search guests, view tickets, and process refunds</p>
                </div>
                <div className="relative w-full md:w-64 flex-shrink-0">
                    <input
                        type="text"
                        placeholder="Search name or email..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-4 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-800 focus:border-neutral-800 outline-none transition-all"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                        {isSearching ? (
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        )}
                    </div>
                </div>
            </div>

            {errorMsg && (
                <div className="bg-red-50 text-red-600 px-6 py-3 text-sm font-medium border-b border-red-100">
                    {errorMsg}
                </div>
            )}

            <div className="divide-y divide-neutral-100 overflow-y-auto max-h-[600px]">
                {tickets.length === 0 ? (
                    <div className="p-6 text-sm text-neutral-500 text-center">
                        {searchQuery ? 'No guests found matching your search.' : 'No purchases yet.'}
                    </div>
                ) : (
                    tickets.map((ticket) => (
                        <div key={ticket.id} className="p-6 hover:bg-neutral-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-neutral-900 truncate">
                                    {ticket.profile?.full_name || ticket.profile?.email || 'Anonymous Guest'}
                                </p>
                                <p className="text-sm text-neutral-500 font-mono truncate">
                                    {ticket.profile?.full_name ? ticket.profile?.email : 'No email contact'}
                                </p>
                            </div>

                            <div className="flex-1 min-w-0 md:text-center md:pl-4 border-l-0 md:border-l border-neutral-100">
                                <p className="font-bold text-neutral-800 text-sm truncate">{ticket.slot?.product?.name || ticket.product?.name || 'Unknown Ticket'}</p>
                                <p className="text-xs text-neutral-500 mt-1">
                                    {new Date(ticket.created_at).toLocaleDateString()} at {new Date(ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-6 flex-1 min-w-0 border-t md:border-t-0 border-neutral-100 pt-4 md:pt-0">
                                <span className={`px-2 py-1 text-[10px] sm:text-xs font-bold rounded-full uppercase tracking-wider ${ticket.status === 'active' ? 'bg-green-100 text-green-700' :
                                    ticket.status === 'used' ? 'bg-neutral-100 text-neutral-600' :
                                        ticket.status === 'refunded' ? 'bg-gray-200 text-gray-700' :
                                            ticket.status === 'archived' ? 'bg-amber-100 text-amber-700' :
                                                'bg-red-100 text-red-700'
                                    }`}>
                                    {ticket.status}
                                </span>

                                {ticket.status === 'active' && (
                                    <button
                                        onClick={() => requestRefundAuth(ticket.id, ticket.stripe_session_id)}
                                        disabled={refundingId === ticket.id}
                                        className="text-xs font-bold px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded shadow-sm transition-colors disabled:opacity-50"
                                    >
                                        {refundingId === ticket.id ? 'Refunding...' : 'Refund'}
                                    </button>
                                )}
                                {ticket.status === 'refunded' && (
                                    <span className="text-xs font-bold px-3 py-1.5 text-neutral-400 italic">
                                        Refunded
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <PINOverrideModal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                onSuccess={handleRefund}
                title="Refund Authorization Required"
                description={`Enter Manager PIN to confirm refund.`}
            />
        </div>
    );
}

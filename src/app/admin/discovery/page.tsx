'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { getDiscoveryLeadsAction, updateDiscoveryLeadStatusAction, deleteDiscoveryLeadAction, triggerDiscoveryAgentAction } from '@/app/actions/discovery';

interface Lead {
    id: string;
    type: 'festival' | 'popup_spot';
    name: string;
    url: string;
    emails: string[] | null;
    vibe_score: number;
    vibe_notes: string;
    status: 'PENDING' | 'CONTACTED' | 'INTERESTED' | 'REJECTED';
    source: 'cron' | 'manual';
    created_at: string;
}

export default function DiscoveryPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [runningAgent, setRunningAgent] = useState(false);

    const fetchLeads = async () => {
        setLoading(true);
        const res = await getDiscoveryLeadsAction();
        if (res.success) {
            setLeads(res.data as Lead[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const runDiscoveryAgent = async () => {
        setRunningAgent(true);
        try {
            const res = await triggerDiscoveryAgentAction(window.location.origin);

            if (res.success && res.data) {
                alert(`Success! Query: ${res.data.query}\nProcessed: ${res.data.processed}\nAdded: ${res.data.added}`);
                fetchLeads();
            } else {
                alert(`Error: ${res.error || 'Failed to run agent'}`);
            }
        } catch (err) {
            console.error(err);
            alert('Internal error running agent');
        }
        setRunningAgent(false);
    };

    const updateStatus = async (id: string, status: Lead['status']) => {
        const res = await updateDiscoveryLeadStatusAction(id, status);
        if (res.success) {
            setLeads(leads.map(l => l.id === id ? { ...l, status } : l));
        }
    };

    const deleteLead = async (id: string) => {
        if (!confirm('Are you sure you want to delete this lead?')) return;
        // Optimistic UI update
        setLeads(leads.filter(l => l.id !== id));
        const res = await deleteDiscoveryLeadAction(id);
        if (!res.success) {
            alert('Failed to delete lead from database.');
            fetchLeads(); // Revert
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black font-mono uppercase tracking-tighter">
                        Discovery Agent <span className="text-yellow-400">⚡</span>
                    </h1>
                    <p className="text-neutral-500 font-mono text-sm uppercase tracking-widest mt-2">
                        AI-Scouted Partnership Opportunities
                    </p>
                </div>
                <button
                    onClick={runDiscoveryAgent}
                    disabled={runningAgent}
                    className="bg-neutral-900 text-white px-6 py-3 rounded-xl font-mono uppercase font-bold tracking-widest text-sm hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg"
                >
                    {runningAgent ? (
                        <>
                            <svg className="animate-spin h-4 w-4 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Scouting Web...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            Run AI Scout
                        </>
                    )}
                </button>
            </div>

            <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-neutral-50 text-neutral-500 font-mono uppercase tracking-widest text-xs border-b">
                            <tr>
                                <th className="px-6 py-4">Score</th>
                                <th className="px-6 py-4">Name / Lead</th>
                                <th className="px-6 py-4">Vibe Notes</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-neutral-400 font-mono">Loading leads...</td>
                                </tr>
                            ) : leads.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-neutral-400 font-mono">No leads discovered yet. Run the scout!</td>
                                </tr>
                            ) : leads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-neutral-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-full border-4 border-yellow-100 bg-yellow-50 text-yellow-600 font-black font-mono">
                                            {lead.vibe_score}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 max-w-[200px]">
                                        <div className="font-bold text-neutral-900 mb-1">{lead.name}</div>
                                        <a href={lead.url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-xs block truncate w-full">
                                            {lead.url}
                                        </a>
                                        <div className="mt-2 space-y-1">
                                            {lead.emails?.map(email => (
                                                <div key={email} className="inline-flex items-center gap-1 bg-neutral-100 px-2 py-1 rounded text-xs font-mono text-neutral-600 mr-2">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                                    {email}
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-neutral-500 max-w-sm">
                                        {lead.vibe_notes}
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={lead.status}
                                            onChange={(e) => updateStatus(lead.id, e.target.value as any)}
                                            className={`text-xs font-bold uppercase tracking-widest pl-3 pr-8 py-2 rounded-full appearance-none border-0 ring-1 ring-inset ${lead.status === 'PENDING' ? 'bg-neutral-100 text-neutral-600 ring-neutral-200' :
                                                lead.status === 'CONTACTED' ? 'bg-blue-50 text-blue-600 ring-blue-200' :
                                                    lead.status === 'INTERESTED' ? 'bg-green-50 text-green-600 ring-green-200' :
                                                        'bg-red-50 text-red-600 ring-red-200'
                                                }`}
                                        >
                                            <option value="PENDING">Pending</option>
                                            <option value="CONTACTED">Contacted</option>
                                            <option value="INTERESTED">Interested</option>
                                            <option value="REJECTED">Rejected</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex flex-col items-end gap-1 text-[10px] text-neutral-400 font-mono uppercase">
                                            <span>{lead.type.replace('_', ' ')}</span>
                                            <span>{format(new Date(lead.created_at), 'MMM d, yyyy')}</span>
                                            <button
                                                onClick={() => deleteLead(lead.id)}
                                                className="mt-2 text-red-400 hover:text-red-600 transition-colors uppercase tracking-widest font-bold border border-red-100 bg-red-50 hover:bg-red-100 px-3 py-1 rounded"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

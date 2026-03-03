'use client';

import React, { useState, useEffect } from 'react';
import { fetchBroadcastAudiencesAction, sendBroadcastEmailAction } from '@/app/actions/broadcasts';
import { getCommunityHeatmapAction } from '@/app/actions/admin';
import { Button } from '@/components/Button';
import { PINOverrideModal } from '@/components/PINOverrideModal';
import { CommunityMap } from '../CommunityMap';
import { useAdminRole } from '@/hooks/useAdminRole';

export default function BroadcastStudio() {
    const isAdmin = useAdminRole();
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [pinAction, setPinAction] = useState<'fetch' | 'send' | null>(null);
    const [audiences, setAudiences] = useState<any[]>([]);
    const [historicalAudiences, setHistoricalAudiences] = useState<any[]>([]);
    const [regionalAudiences, setRegionalAudiences] = useState<any[]>([]);
    const [audienceCategory, setAudienceCategory] = useState<'all' | 'live' | 'historical' | 'region'>('all');
    const [selectedAudience, setSelectedAudience] = useState<string>('');
    const [targetBin, setTargetBin] = useState<Array<{ id: string, title: string }>>([]);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [resultMsg, setResultMsg] = useState('');
    const [hasFetched, setHasFetched] = useState(false);
    const [mapData, setMapData] = useState<any[]>([]);

    useEffect(() => {
        getCommunityHeatmapAction().then(data => {
            if (data) setMapData(data);
        });
    }, []);

    const handleForceFetch = () => {
        if (audiences.length > 0 || historicalAudiences.length > 0) return; // Already fetched
        if (isAdmin) {
            handleFetchAudiences('');
        } else {
            setPinAction('fetch');
            setIsPinModalOpen(true);
        }
    };

    const handleFetchAudiences = async (pin: string) => {
        setIsPinModalOpen(false);
        const res = await fetchBroadcastAudiencesAction(pin);
        setHasFetched(true);
        if (res.success) {
            setAudiences(res.audiences || []);
            setHistoricalAudiences(res.historical || []);
            setRegionalAudiences(res.regions || []);
            setStatus('success');
            setResultMsg('Audiences loaded successfully.');
        } else {
            setStatus('error');
            setResultMsg(res.error || 'Failed to fetch audiences. Check PIN and try again.');
        }
    };

    useEffect(() => {
        if (audienceCategory === 'live' && audiences.length > 0) {
            setSelectedAudience(audiences[0].id);
        } else if (audienceCategory === 'historical' && historicalAudiences.length > 0) {
            setSelectedAudience(historicalAudiences[0].id);
        } else if (audienceCategory === 'region' && regionalAudiences.length > 0) {
            setSelectedAudience(regionalAudiences[0].id);
        } else {
            setSelectedAudience('');
        }
    }, [audienceCategory, audiences, historicalAudiences, regionalAudiences]);

    const handleAddTarget = () => {
        if (!selectedAudience || audienceCategory === 'all') return;
        if (targetBin.find(t => t.id === selectedAudience)) return;

        let title = '';
        if (audienceCategory === 'live') {
            title = audiences.find(a => a.id === selectedAudience)?.title || selectedAudience;
        } else if (audienceCategory === 'historical') {
            title = historicalAudiences.find(a => a.id === selectedAudience)?.title || selectedAudience;
        } else if (audienceCategory === 'region') {
            title = regionalAudiences.find(a => a.id === selectedAudience)?.title || selectedAudience;
        }

        setTargetBin([...targetBin, { id: selectedAudience, title }]);
    };

    const handleRemoveTarget = (id: string) => {
        setTargetBin(targetBin.filter(t => t.id !== id));
    };

    const handleSendRequest = (e: React.FormEvent) => {
        e.preventDefault();
        if (audienceCategory !== 'all' && targetBin.length === 0) {
            alert('Please add at least one audience to the target list.');
            return;
        }
        if (!confirm('Are you sure you want to send this broadcast email to the targeted audience? This action cannot be undone.')) {
            return;
        }
        if (isAdmin) {
            handleConfirmSend('');
        } else {
            setPinAction('send');
            setIsPinModalOpen(true);
        }
    };

    const handleConfirmSend = async (pin: string) => {
        setIsPinModalOpen(false);

        setStatus('loading');
        setResultMsg('');

        try {
            // Note: In a production environment with many recipients, Resend recommends batching 
            // the API calls if passing 50+ bcc emails. For now, we are utilizing the quick blind-copy approach.
            const targetIds = audienceCategory === 'all' ? 'all' : targetBin.map(t => t.id);
            const res = await sendBroadcastEmailAction(targetIds, subject, message, pin);

            if (res.success) {
                setStatus('success');
                setResultMsg(`Successfully dispatched email to ${res.recipientCount} recipients.`);
                setSubject('');
                setMessage('');
            } else {
                setStatus('error');
                setResultMsg(res.error || 'Failed to send broadcast.');
            }
        } catch (err: any) {
            setStatus('error');
            setResultMsg('An unexpected error occurred.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-neutral-800">Email Studio</h2>
                <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-neutral-500 font-mono">
                        Compose and dispatch broadcast emails securely to specific guest groups.
                    </p>
                    {!hasFetched && (
                        <button
                            type="button"
                            onClick={handleForceFetch}
                            className="bg-neutral-900 text-white px-4 py-2 rounded text-xs tracking-widest uppercase font-mono shadow-md hover:bg-neutral-800"
                        >
                            Load Audiences
                        </button>
                    )}
                </div>
            </div>

            <div className="mb-6">
                <CommunityMap data={mapData} />
            </div>

            <form onSubmit={handleSendRequest} className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-8 space-y-6">
                    {/* Audience Selection */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider font-mono">1. Select Target Bucket</label>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setAudienceCategory('all')}
                                    className={`px-4 py-3 rounded-lg text-sm font-bold border transition-all ${audienceCategory === 'all' ? 'bg-neutral-900 text-white border-neutral-900 shadow-md' : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'}`}
                                >
                                    All Contacts
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAudienceCategory('live')}
                                    className={`px-4 py-3 rounded-lg text-sm font-bold border transition-all ${audienceCategory === 'live' ? 'bg-neutral-900 text-white border-neutral-900 shadow-md' : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'}`}
                                >
                                    Live Events
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAudienceCategory('historical')}
                                    className={`px-4 py-3 rounded-lg text-sm font-bold border transition-all ${audienceCategory === 'historical' ? 'bg-neutral-900 text-white border-neutral-900 shadow-md' : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'}`}
                                >
                                    Alumni
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAudienceCategory('region')}
                                    className={`px-4 py-3 rounded-lg text-sm font-bold border transition-all ${audienceCategory === 'region' ? 'bg-neutral-900 text-white border-neutral-900 shadow-md' : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'}`}
                                >
                                    Target Area
                                </button>
                            </div>
                        </div>

                        {audienceCategory !== 'all' && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider font-mono">
                                    2. Select {audienceCategory === 'live' ? 'Event' : audienceCategory === 'historical' ? 'Alumni Group' : 'Target Area'}
                                </label>
                                {!hasFetched ? (
                                    <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                                        <span>Target lists are hidden. Please load audiences to view available targets.</span>
                                        <button
                                            type="button"
                                            onClick={handleForceFetch}
                                            className="px-4 py-2 bg-neutral-900 text-white rounded-md text-xs font-bold uppercase tracking-widest shadow hover:-translate-y-0.5 transition-all text-center whitespace-nowrap"
                                        >
                                            Load Now
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <select
                                            value={selectedAudience}
                                            onChange={(e) => setSelectedAudience(e.target.value)}
                                            className="flex-grow px-4 py-3 border border-neutral-200 rounded-lg text-neutral-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-neutral-400 bg-neutral-50 shadow-sm transition-all"
                                        >
                                            {audienceCategory === 'live' && audiences.map((a: any) => (
                                                <option key={a.id} value={a.id}>{a.title}</option>
                                            ))}
                                            {audienceCategory === 'historical' && historicalAudiences.map((a: any) => (
                                                <option key={a.id} value={a.id}>{a.title}</option>
                                            ))}
                                            {audienceCategory === 'region' && regionalAudiences.map((a: any) => (
                                                <option key={a.id} value={a.id}>{a.title}</option>
                                            ))}
                                            {((audienceCategory === 'live' && audiences.length === 0) ||
                                                (audienceCategory === 'historical' && historicalAudiences.length === 0) ||
                                                (audienceCategory === 'region' && regionalAudiences.length === 0)) && (
                                                    <option value="" disabled>No audiences available in this category.</option>
                                                )}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={handleAddTarget}
                                            className="whitespace-nowrap px-6 py-3 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-lg text-sm font-bold tracking-widest uppercase transition-all shadow-sm"
                                        >
                                            + Add
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Target Bin Display */}
                        {audienceCategory !== 'all' && targetBin.length > 0 && (
                            <div className="p-4 border border-amber-200 bg-amber-50/50 rounded-lg space-y-3 animate-in fade-in zoom-in-95">
                                <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider font-mono">
                                    Targeted Groups ({targetBin.length})
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {targetBin.map(t => (
                                        <div key={t.id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-amber-300 rounded-md text-sm text-neutral-800 shadow-sm">
                                            <span className="font-semibold text-amber-900">{t.title}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTarget(t.id)}
                                                className="text-amber-400 hover:text-red-500 font-bold ml-1"
                                                title="Remove"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <p className="text-xs text-neutral-400 mt-1">Guests will be blind-copied (BCC) to protect their privacy.</p>
                    </div>

                    {/* Subject Line */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider font-mono">Subject Line *</label>
                        <input
                            type="text"
                            required
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="e.g. Important Update for the Summer Solstice Event"
                            className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-neutral-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-neutral-400 placeholder:font-normal placeholder:text-neutral-300"
                        />
                    </div>

                    {/* Email Message */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider font-mono">Message (Plain Text) *</label>
                        <textarea
                            required
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message here..."
                            rows={10}
                            className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 resize-y placeholder:text-neutral-300 font-body leading-relaxed"
                        ></textarea>
                    </div>

                    {/* Status Feedback */}
                    {status === 'error' && (
                        <div className="bg-red-50 text-red-700 px-4 py-3 rounded text-sm font-bold border border-red-200">
                            {resultMsg}
                        </div>
                    )}
                    {status === 'success' && (
                        <div className="bg-green-50 text-green-700 px-4 py-3 rounded text-sm font-bold border border-green-200">
                            ✓ {resultMsg}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="bg-neutral-50/80 border-t border-neutral-100 p-6 flex items-center justify-between">
                    <p className="text-xs text-neutral-400 font-mono">
                        Sent securely via Resend Delivery network.
                    </p>
                    <Button
                        type="submit"
                        disabled={status === 'loading'}
                        className="px-8 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg shadow-sm font-bold tracking-widest text-xs uppercase disabled:opacity-50"
                    >
                        {status === 'loading' ? 'Dispatching...' : 'Send Broadcast'}
                    </Button>
                </div>
            </form>

            <PINOverrideModal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                onSuccess={pinAction === 'fetch' ? handleFetchAudiences : handleConfirmSend}
                title={pinAction === 'fetch' ? 'Load Audiences' : 'Send Broadcast'}
                description={pinAction === 'fetch'
                    ? 'Enter Manager PIN to access guest emails.'
                    : 'Enter Manager PIN to authorize sending this broadcast email.'}
            />
        </div>
    );
}

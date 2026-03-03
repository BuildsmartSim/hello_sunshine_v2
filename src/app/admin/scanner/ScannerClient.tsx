'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { checkInTicketAction } from '@/app/actions/tickets';
import { MissionBriefing } from '../MissionBriefing';
import type { ReadinessTask } from '../ReadinessScorecard';
import { PINOverrideModal } from '@/components/PINOverrideModal';
import { useAdminRole } from '@/hooks/useAdminRole';

type ScanStatus = 'idle' | 'success' | 'error' | 'warning';

export function ScannerClient({ readinessTasks = [] }: { readinessTasks?: ReadinessTask[] }) {
    const isAdmin = useAdminRole();
    const [status, setStatus] = useState<ScanStatus>('idle');
    const [message, setMessage] = useState('');
    const [guestName, setGuestName] = useState('');
    const [productName, setProductName] = useState('');
    const [syncQueue, setSyncQueue] = useState<{ id: string, time: string }[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const scannerRef = useRef<Html5Qrcode | null>(null);

    // 1. Load Queue on Mount
    useEffect(() => {
        const saved = localStorage.getItem('hss_scanner_queue');
        if (saved) setSyncQueue(JSON.parse(saved));

        const scanner = new Html5Qrcode("reader");
        scannerRef.current = scanner;

        return () => {
            if (scanner.isScanning) scanner.stop();
        };
    }, []);

    // 2. Persist Queue on Change
    useEffect(() => {
        localStorage.setItem('hss_scanner_queue', JSON.stringify(syncQueue));
    }, [syncQueue]);

    const handleSyncRequest = () => {
        if (syncQueue.length === 0 || isSyncing) return;
        if (isAdmin) {
            handleConfirmSync('');
        } else {
            setIsPinModalOpen(true);
        }
    };

    const handleConfirmSync = async (pin: string) => {
        setIsPinModalOpen(false);
        setIsSyncing(true);
        const newQueue = [...syncQueue];
        const processedIds: string[] = [];

        for (const item of newQueue) {
            try {
                // If it's a manager doing a mass sync of offline scans, 
                // we'll pass their PIN along to bypass the 'admin only' constraint.
                const res = await checkInTicketAction(item.id, pin);
                if (res.success || res.error?.includes('ALREADY SCANNED')) {
                    processedIds.push(item.id);
                }
            } catch (err) {
                console.warn("Sync failed for ID, network still spotty:", item.id);
                break; // Stop syncing if network is still down
            }
        }

        setSyncQueue(prev => prev.filter(i => !processedIds.includes(i.id)));
        setIsSyncing(false);
    };

    const startScanner = async () => {
        if (!scannerRef.current) return;

        try {
            await scannerRef.current.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                },
                onScanSuccess,
                onScanFailure
            );
            setIsScanning(true);
            setStatus('idle');
            setMessage('');
        } catch (err) {
            console.error("Failed to start scanner:", err);
            setMessage("Failed to access camera.");
            setIsScanning(false);
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
            await scannerRef.current.stop();
        }
        setIsScanning(false);
    };

    async function onScanSuccess(decodedText: string) {
        if (navigator.vibrate) navigator.vibrate(50);
        await stopScanner();

        setStatus('idle');
        setMessage('Processing...');

        let ticketId = decodedText;
        if (decodedText.includes('/tickets/')) {
            const parts = decodedText.split('/');
            ticketId = parts.filter(p => p.length === 36).pop() || parts.pop() || '';
            ticketId = ticketId.split('?')[0].split('#')[0];
        }

        try {
            // Note: During a live scan we might just pass an empty PIN and rely on them
            // having an active admin session, OR we could prompt on scan. 
            // For now, let's assume active session is enough for live scans, 
            // and PIN is needed for pushing the offline queue.
            const res = await checkInTicketAction(ticketId);

            if (res.success) {
                setStatus('success');
                setGuestName(res.guestName || 'Guest');
                setProductName(res.productName || 'Ticket');
                setMessage('CHECK-IN SUCCESS');
            } else {
                if (res.error?.includes('ALREADY SCANNED')) {
                    setStatus('warning');
                    setGuestName(res.guestName || 'Previously Scanned');
                    setMessage(res.error);
                } else if (res.error?.includes('TERMS NOT ACCEPTED')) {
                    setStatus('warning');
                    setGuestName(res.guestName || 'Guest');
                    setProductName(res.productName || 'Ticket');
                    setMessage(res.error);
                } else {
                    setStatus('error');
                    setMessage(res.error || 'Invalid Ticket');
                }
            }
        } catch (err) {
            // OFFLINE FALLBACK
            const scanTime = new Date().toISOString();
            if (!syncQueue.find(qi => qi.id === ticketId)) {
                setSyncQueue(prev => [...prev, { id: ticketId, time: scanTime }]);
            }

            setStatus('success'); // Show success to operator to keep flow moving
            setGuestName('OFFLINE SCAN');
            setMessage('TICKET SAVED (SYNC LATER)');
            setProductName(`QUEUED AT ${new Date(scanTime).toLocaleTimeString()}`);
        }

        setTimeout(() => {
            setStatus('idle');
            setGuestName('');
            setProductName('');
            setMessage('');
            if (!isScanning) startScanner();
        }, 3000);
    }

    function onScanFailure(error: any) {
        // Silently ignore scan failures (they happen constantly while looking)
    }

    const getStatusStyles = () => {
        switch (status) {
            case 'success': return 'bg-green-600 text-white border-green-400';
            case 'error': return 'bg-red-600 text-white border-red-400';
            case 'warning': return 'bg-yellow-500 text-white border-yellow-300';
            default: return 'bg-white text-neutral-800 border-neutral-200';
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-12rem)] max-w-lg mx-auto overflow-hidden">
            <MissionBriefing tasks={readinessTasks} />

            {/* Camera Viewport Container */}
            <div className={`relative flex-1 rounded-3xl overflow-hidden border-4 transition-all duration-500 shadow-2xl ${getStatusStyles()}`}>

                {/* QR Reader Element */}
                <div id="reader" className="w-full h-full [&>video]:object-cover [&>video]:h-full border-none"></div>

                {/* Status Overlays */}
                {(status !== 'idle' || !isScanning) && (
                    <div className="absolute inset-0 bg-inherit flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
                        {status === 'success' && (
                            <svg className="w-24 h-24 mb-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path></svg>
                        )}
                        {status === 'error' && (
                            <svg className="w-24 h-24 mb-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg>
                        )}
                        {status === 'warning' && (
                            <svg className="w-24 h-24 mb-6" fill="currentColor" viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"></path></svg>
                        )}

                        <h2 className="text-2xl lg:text-3xl font-black mb-2 uppercase font-mono tracking-tighter">
                            {message || (isScanning ? "" : "Scanner Ready")}
                        </h2>
                        {guestName && <p className="text-lg lg:text-xl font-bold font-mono opacity-90 uppercase tracking-widest">{guestName}</p>}
                        {productName && <p className="text-[10px] lg:text-sm font-mono opacity-70 mt-3 border-t border-current pt-3 border-dashed">{productName}</p>}

                        {!isScanning && (
                            <button
                                onClick={startScanner}
                                className="mt-8 px-10 py-4 bg-neutral-900 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] font-mono shadow-xl hover:scale-105 transition-all"
                            >
                                Open Camera
                            </button>
                        )}
                    </div>
                )}

                {/* Scanning HUD */}
                {isScanning && status === 'idle' && (
                    <div className="absolute inset-0 pointer-events-none border-t-[10vh] border-b-[10vh] border-l-[10vw] border-r-[10vw] border-black/40 flex items-center justify-center">
                        <div className="w-[250px] h-[250px] relative">
                            {/* Corner Accents */}
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white"></div>
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white"></div>
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white"></div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white"></div>
                            {/* Scanning Animation Line */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-white/50 animate-scan shadow-[0_0_15px_rgba(255,255,255,0.8)]"></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Controls */}
            <div className="mt-8 space-y-4">
                {syncQueue.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-yellow-800 uppercase tracking-widest font-mono">Offline Scans Ready</p>
                            <p className="text-xl font-black text-yellow-900 font-mono">{syncQueue.length} PENDING</p>
                        </div>
                        <button
                            onClick={handleSyncRequest}
                            disabled={isSyncing}
                            className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest font-mono shadow-sm transition-all ${isSyncing ? 'bg-yellow-200 text-yellow-600' : 'bg-yellow-900 text-white hover:bg-black'}`}
                        >
                            {isSyncing ? 'SYNCING...' : 'SYNC NOW'}
                        </button>
                    </div>
                )}

                <div className="flex gap-4">
                    <div className="flex-1 bg-neutral-900 rounded-2xl p-6 text-white overflow-hidden relative">
                        <div className="relative z-10">
                            <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest font-mono mb-1">Status</h4>
                            <p className="text-xs font-mono lowercase italic text-neutral-300">
                                {isScanning ? "live: position qr in focus square" : "camera inactive: ready to engage"}
                            </p>
                        </div>
                    </div>
                    {isScanning && (
                        <button
                            onClick={stopScanner}
                            className="bg-red-50 text-red-600 px-6 rounded-2xl font-black text-[10px] uppercase font-mono tracking-widest border border-red-100"
                        >
                            Stop
                        </button>
                    )}
                </div>
            </div>

            <p className="text-center text-[10px] text-neutral-400 font-mono uppercase tracking-[0.25em] mt-8 opacity-50">
                hello sunshine access control v1.0
            </p>

            <style jsx global>{`
                @keyframes scan {
                    0% { top: 0; }
                    50% { top: 250px; }
                    100% { top: 0; }
                }
                .animate-scan {
                    animation: scan 3s infinite linear;
                }
                #reader > div {
                    display: none !important;
                }
                #reader video {
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: cover !important;
                }
            `}</style>

            <PINOverrideModal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                onSuccess={handleConfirmSync}
                title="Sync Offline Scans"
                description={`Enter Manager PIN to push ${syncQueue.length} offline scans to the server.`}
            />
        </div>
    );
}

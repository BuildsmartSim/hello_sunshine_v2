import React from 'react';
import { assertAdmin } from '@/lib/auth';

export const revalidate = 0; // Ensure fresh data

export default async function AnalyticsPage() {
    await assertAdmin();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div>
                <h2 className="text-2xl font-black text-neutral-800 tracking-tight uppercase font-mono">Analytics</h2>
                <p className="text-xs text-neutral-500 font-mono mt-1 uppercase tracking-widest">Global traffic and behavior metrics</p>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 shadow-xl overflow-hidden">
                <div className="px-6 py-5 border-b border-neutral-100 bg-neutral-900 flex justify-between items-center">
                    <div>
                        <h3 className="text-sm font-black text-white tracking-[0.2em] uppercase font-mono">Operations Health</h3>
                        <p className="text-[10px] text-neutral-400 font-mono uppercase tracking-widest mt-1">Sourced from GA4</p>
                    </div>
                    <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="px-4 py-2 flex items-center gap-2 bg-yellow-400 text-yellow-950 text-[10px] font-black rounded font-mono uppercase tracking-widest shadow hover:bg-yellow-500 transition-all active:scale-95">
                        <span className="text-sm">📊</span> View GA4 Direct
                    </a>
                </div>
                <div className="bg-neutral-50/10 h-[800px] w-full">
                    <iframe
                        width="100%"
                        height="100%"
                        src="https://lookerstudio.google.com/embed/reporting/b9322c62-36d5-4804-8bdf-daee360f7911/page/1M"
                        frameBorder="0"
                        style={{ border: 0 }}
                        allowFullScreen
                        sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox">
                    </iframe>
                </div>
            </div>
        </div>
    );
}

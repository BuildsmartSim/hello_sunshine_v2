'use client';

import React, { useState, useMemo } from 'react';
import Map, { Marker, Popup, NavigationControl, FullscreenControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface Lead {
    id: string;
    type: 'festival' | 'popup_spot';
    name: string;
    url: string;
    emails: string[] | null;
    vibe_score: number;
    vibe_notes: string;
    status: 'PENDING' | 'CONTACTED' | 'INTERESTED' | 'REJECTED';
    latitude?: number | null;
    longitude?: number | null;
    location_name?: string | null;
}

interface GeoPoint {
    lat: number;
    long: number;
    city?: string;
}

export function RadarMap({ leads, heatmapData }: { leads: Lead[], heatmapData: GeoPoint[] }) {
    const [popupInfo, setPopupInfo] = useState<Lead | null>(null);

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    const validLeads = leads.filter(l => l.latitude != null && l.longitude != null);

    if (!token) {
        return (
            <div className="w-full h-[600px] flex flex-col items-center justify-center bg-neutral-900 rounded-3xl text-neutral-400 font-mono tracking-widest text-sm p-8 text-center border border-neutral-800">
                <svg className="w-12 h-12 text-neutral-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                <p className="text-white text-lg font-bold mb-2">Mapbox Token Missing</p>
                <p>Please add NEXT_PUBLIC_MAPBOX_TOKEN to your .env.local file to activate the Radar.</p>
            </div>
        );
    }

    return (
        <div className="w-full h-[600px] rounded-3xl overflow-hidden shadow-2xl border-4 border-neutral-900 relative">
            <Map
                mapboxAccessToken={token}
                initialViewState={{
                    longitude: -1.5,
                    latitude: 52.5,
                    zoom: 5.5
                }}
                mapStyle="mapbox://styles/mapbox/dark-v11"
                attributionControl={false}
            >
                <FullscreenControl position="top-right" />
                <NavigationControl position="bottom-right" />

                {/* Heatmap Layer (Existing Customers) */}
                {heatmapData.map((pt, i) => (
                    <Marker
                        key={`heat-${i}`}
                        longitude={pt.long}
                        latitude={pt.lat}
                        anchor="center"
                    >
                        <div className="w-12 h-12 bg-yellow-500 rounded-full opacity-20 blur-md mix-blend-screen pointer-events-none"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full opacity-50 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mix-blend-screen pointer-events-none shadow-[0_0_15px_rgba(250,204,21,1)]"></div>
                    </Marker>
                ))}

                {/* Discovery Leads Layer */}
                {validLeads.map((lead) => (
                    <Marker
                        key={`lead-${lead.id}`}
                        longitude={lead.longitude!}
                        latitude={lead.latitude!}
                        anchor="bottom"
                        onClick={(e: any) => {
                            e.originalEvent.stopPropagation();
                            setPopupInfo(lead);
                        }}
                    >
                        <div className="relative group cursor-pointer animate-bounce-slow">
                            {/* Marker Pin */}
                            <svg className={`w-8 h-10 transition-transform group-hover:scale-110 drop-shadow-xl ${lead.status === 'INTERESTED' ? 'text-green-500' :
                                lead.status === 'CONTACTED' ? 'text-blue-500' :
                                    lead.status === 'REJECTED' ? 'text-red-500' :
                                        'text-white'
                                }`} viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0c-4.198 0-8 3.403-8 7.602 0 4.198 3.469 9.21 8 16.398 4.531-7.188 8-12.2 8-16.398 0-4.199-3.801-7.602-8-7.602zm0 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z" />
                            </svg>
                            {/* Score Badge */}
                            <div className="absolute -top-3 -right-3 bg-neutral-900 border-2 border-yellow-400 text-yellow-400 text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full">
                                {lead.vibe_score}
                            </div>
                        </div>
                    </Marker>
                ))}

                {/* Info Popup */}
                {popupInfo && (
                    <Popup
                        longitude={popupInfo.longitude!}
                        latitude={popupInfo.latitude!}
                        anchor="bottom"
                        offset={30}
                        onClose={() => setPopupInfo(null)}
                        closeButton={false}
                        closeOnClick={false}
                        className="z-50"
                    >
                        <div className="p-4 w-64 bg-white rounded-xl shadow-xl border border-neutral-100 relative">
                            <button onClick={() => setPopupInfo(null)} className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-900">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                            <h3 className="font-black text-lg text-neutral-900 mb-1 leading-tight pr-6">{popupInfo.name}</h3>
                            <div className="text-xs text-neutral-500 font-mono tracking-wide uppercase mb-3 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                {popupInfo.location_name || 'Unknown Location'}
                            </div>
                            <p className="text-sm text-neutral-600 mb-4 line-clamp-3">{popupInfo.vibe_notes}</p>

                            <div className="flex gap-2 mt-4">
                                <a href={popupInfo.url} target="_blank" rel="noreferrer" className="flex-1 bg-neutral-900 text-white text-center py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition">
                                    Visit site
                                </a>
                            </div>
                        </div>
                    </Popup>
                )}
            </Map>

            {/* Legend Overlay */}
            <div className="absolute bottom-4 left-4 bg-neutral-900/90 backdrop-blur border border-neutral-800 p-4 rounded-xl shadow-lg">
                <h4 className="text-neutral-400 font-mono text-[10px] uppercase tracking-widest mb-3">Radar Legend</h4>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full shadow-[0_0_8px_rgba(250,204,21,0.8)]"></div>
                        <span className="text-xs text-white font-mono tracking-wide">Customer Heatmap</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-4.198 0-8 3.403-8 7.602 0 4.198 3.469 9.21 8 16.398 4.531-7.188 8-12.2 8-16.398 0-4.199-3.801-7.602-8-7.602z" /></svg>
                        <span className="text-xs text-white font-mono tracking-wide">AI Discovered Lead</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

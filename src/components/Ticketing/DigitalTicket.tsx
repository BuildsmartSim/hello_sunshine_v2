"use client";

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { textures, fonts } from '@/design-system/tokens';

interface DigitalTicketProps {
    ticketId: string;
    customerName: string;
    eventTitle: string;
    passName: string;
    date: string;
    checkInUrl: string;
}

export function DigitalTicket({ ticketId, customerName, eventTitle, passName, date, checkInUrl }: DigitalTicketProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            id="digital-ticket-capture"
            className="w-full max-w-sm mx-auto relative group bg-[#F9F7F2] p-4 rounded-[2rem]"
        >
            {/* The Ticket Body */}
            <div
                className="bg-[#FFF9E6] p-8 pb-12 shadow-2xl relative overflow-hidden"
                style={{
                    clipPath: 'polygon(0% 0%, 100% 0%, 100% 70%, 95% 75%, 100% 80%, 100% 100%, 0% 100%, 0% 80%, 5% 75%, 0% 70%)',
                    filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.1))'
                }}
            >
                {/* Textures */}
                <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: `url('${textures.paper}')` }}></div>
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: `url('${textures.pencilGrain}')` }}></div>

                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-2 bg-primary/40"></div>
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary/10 rounded-full blur-xl"></div>

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-full border-b border-dashed border-charcoal/20 pb-4 mb-6 flex justify-between items-end">
                        <div className="text-left">
                            <span className="text-[8px] uppercase tracking-[0.4em] text-charcoal/40 font-bold block mb-1">Hellosunshinesauna</span>
                            <h3 className="text-lg font-black text-charcoal uppercase leading-tight" style={{ fontFamily: fonts.mono }}>
                                {eventTitle}
                            </h3>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-mono text-primary font-bold">{date}</span>
                        </div>
                    </div>

                    <div className="w-full mb-8">
                        <span className="text-[8px] uppercase tracking-[0.4em] text-charcoal/40 font-bold block mb-2">Guest</span>
                        <p className="text-2xl font-handwriting text-charcoal">{customerName}</p>
                    </div>

                    <div className="w-full mb-8 py-4 border-y border-charcoal/5">
                        <span className="text-[8px] uppercase tracking-[0.4em] text-charcoal/40 font-bold block mb-2">Pass Type</span>
                        <p className="text-sm font-bold text-charcoal uppercase tracking-widest">{passName}</p>
                    </div>

                    {/* QR Code Container */}
                    <div className="bg-white p-4 rounded-3xl shadow-inner border border-charcoal/5 mb-6 relative">
                        <QRCodeSVG
                            value={checkInUrl}
                            size={160}
                            level="H"
                            includeMargin={false}
                            fgColor="#333333"
                        />
                        {/* Little branding in the middle of QR if we wanted, but let's keep it clean */}
                    </div>

                    <div className="text-center">
                        <span className="text-[8px] uppercase tracking-[0.4em] text-charcoal/40 font-bold block mb-1">Ticket ID</span>
                        <span className="text-[10px] font-mono text-charcoal/60">{ticketId.substring(0, 18).toUpperCase()}...</span>
                    </div>
                </div>

                {/* Perforation Line (Visual Only) */}
                <div className="absolute bottom-[25%] left-0 w-full flex justify-between px-0 pointer-events-none opacity-20">
                    <div className="w-full border-t border-dashed border-charcoal/40"></div>
                </div>
            </div>

            {/* Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 pointer-events-none group-hover:via-white/20 transition-all duration-700"></div>
        </motion.div>
    );
}

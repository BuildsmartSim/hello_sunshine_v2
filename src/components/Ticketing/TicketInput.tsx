"use client";

import React from 'react';
import { fonts } from '@/design-system/tokens';

interface TicketInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export function TicketInput({ label, ...props }: TicketInputProps) {
    return (
        <div className="flex flex-col gap-2 w-full group">
            <label className="text-[10px] uppercase tracking-[0.4em] text-charcoal/40 font-bold px-4">
                {label}
            </label>
            <div className="relative">
                <input
                    {...props}
                    autoComplete="off" // Added autoComplete prop
                    className="w-full bg-white/50 border border-charcoal/10 rounded-2xl px-6 py-4 text-xl text-charcoal outline-none transition-all focus:bg-white focus:shadow-xl focus:border-primary/50 group-hover:border-charcoal/30"
                    style={{ fontFamily: fonts.handwriting }}
                />
                <div className="absolute inset-0 border-2 border-primary/0 rounded-2xl pointer-events-none group-focus-within:border-primary/20 transition-all scale-[1.02]"></div>
            </div>
        </div>
    );
}

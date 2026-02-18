"use client";

import React from 'react';
import { SectionHeader } from '@/components/SectionHeader';
import { TicketInput } from './TicketInput';
import { Button } from '@/components/Button';
import { WaiverSection } from './WaiverSection';
import { TicketTier } from './FestivalPass';

interface StepDetailsProps {
    formData: {
        name: string;
        email: string;
        phone: string;
        age?: string;
        gender?: string;
        waiverAccepted: boolean;
    };
    onChange: (field: string, value: string | boolean) => void;
    onNext: () => void;
    onBack: () => void;
    selectedTier: TicketTier | null;
}

export function StepDetails({ formData, onChange, onNext, onBack, selectedTier }: StepDetailsProps) {
    return (
        <div className="w-full max-w-2xl mx-auto px-4">
            <div className="flex flex-col items-center mb-16">
                <SectionHeader
                    line1="Your"
                    line2="Details"
                    subtitle={`Securing your ${selectedTier?.title || 'Pass'}.`}
                    className="text-center"
                />
            </div>

            <div className="flex flex-col gap-6">
                <TicketInput
                    label="Full Name"
                    placeholder="Enter your name..."
                    value={formData.name}
                    onChange={(e) => onChange('name', e.target.value)}
                    autoComplete="name"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TicketInput
                        label="Age"
                        type="number"
                        placeholder="e.g. 25"
                        value={formData.age}
                        onChange={(e) => onChange('age', e.target.value)}
                        autoComplete="bday-age"
                    />
                    <TicketInput
                        label="Gender"
                        placeholder="e.g. Female / Non-binary"
                        value={formData.gender}
                        onChange={(e) => onChange('gender', e.target.value)}
                        autoComplete="sex"
                    />
                </div>

                <TicketInput
                    label="Email Address"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => onChange('email', e.target.value)}
                    autoComplete="email"
                />
                <TicketInput
                    label="Phone Number"
                    type="tel"
                    placeholder="+44 000 000 000"
                    value={formData.phone}
                    onChange={(e) => onChange('phone', e.target.value)}
                    autoComplete="tel"
                />

                <div className="mt-8">
                    <label className="text-[10px] uppercase tracking-[0.4em] text-charcoal/40 font-bold px-4 mb-4 block">
                        Health & Safety Waiver
                    </label>
                    <WaiverSection />
                    <label className="flex items-center gap-4 cursor-pointer group px-4">
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={formData.waiverAccepted}
                                onChange={(e) => onChange('waiverAccepted', e.target.checked)}
                                className="sr-only"
                            />
                            <div className={`w-8 h-8 rounded-lg border-2 transition-all flex items-center justify-center ${formData.waiverAccepted ? 'bg-primary border-primary shadow-lg scale-110' : 'bg-white/50 border-charcoal/10 group-hover:border-charcoal/30'}`}>
                                {formData.waiverAccepted && <span className="text-white text-xl">✓</span>}
                            </div>
                        </div>
                        <span className="text-xs font-mono text-charcoal/60 uppercase tracking-widest group-hover:text-charcoal transition-colors">
                            I have read and agree to the Health & Safety instructions
                        </span>
                    </label>
                </div>

                <div className="mt-12 flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="text-charcoal/40 hover:text-charcoal font-bold uppercase tracking-widest text-xs transition-colors"
                    >
                        ← Back to Tiers
                    </button>
                    <Button onClick={onNext} disabled={!formData.name || !formData.email || !formData.waiverAccepted}>
                        Confirm Booking
                    </Button>
                </div>
            </div>
        </div>
    );
}

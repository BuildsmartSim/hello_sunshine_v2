"use client";

import React from 'react';
import { SectionHeader } from '@/components/SectionHeader';
import { TicketInput } from './TicketInput';
import { Button } from '@/components/Button';
import { TicketTier } from './FestivalPass';

interface StepDetailsProps {
    formData: {
        name: string;
        email: string;
        phone: string;
    };
    onChange: (field: string, value: string) => void;
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
                />
                <TicketInput
                    label="Email Address"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => onChange('email', e.target.value)}
                />
                <TicketInput
                    label="Phone Number"
                    type="tel"
                    placeholder="+44 000 000 000"
                    value={formData.phone}
                    onChange={(e) => onChange('phone', e.target.value)}
                />

                <div className="mt-12 flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="text-charcoal/40 hover:text-charcoal font-bold uppercase tracking-widest text-xs transition-colors"
                    >
                        ← Back to Tiers
                    </button>
                    <Button onClick={onNext} disabled={!formData.name || !formData.email}>
                        Confirm Booking
                    </Button>
                </div>
            </div>
        </div>
    );
}

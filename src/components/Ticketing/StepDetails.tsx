"use client";

import React from 'react';
import { SectionHeader } from '@/components/SectionHeader';
import { TicketInput } from './TicketInput';
import { Button } from '@/components/Button';
import { TicketTier } from './FestivalPass';
import { sendGAEvent } from '@next/third-parties/google';
import { VitalityIcon, TowelIcon, AgreementIcon } from '@/components/Icons';
import { TicketSubTier } from '@/data/festivals';

interface StepDetailsProps {
    formData: {
        name: string;
        email: string;
        phone: string;
        age?: string;
        gender?: string;
        waiverHealthy: boolean;
        waiverTowels: boolean;
        termsAccepted: boolean;
        mailingList: boolean;
        quantity: number;
        guestEmails: string[];
        guestNames: string[];
    };
    onChange: (field: string, value: string | boolean | number | string[]) => void;
    onNext: () => void;
    onBack: () => void;
    selectedTier: TicketTier | null;
    selectedSubTier: TicketSubTier | null;
}

export function StepDetails({ formData, onChange, onNext, onBack, selectedTier, selectedSubTier }: StepDetailsProps) {
    const handleNext = () => {
        if (selectedSubTier) {
            const numericPrice = Number(selectedSubTier.price?.replace(/[^0-9.-]+/g, "") || 0);
            sendGAEvent('event', 'begin_checkout', {
                currency: 'GBP',
                value: numericPrice * formData.quantity,
                items: [{
                    item_id: selectedSubTier.id,
                    item_name: selectedTier?.title || '',
                    quantity: formData.quantity,
                }]
            });
        }
        onNext();
    };

    const handleQuantityChange = (newQuantity: number) => {
        // Ensure guest arrays are the right length (quantity - 1)
        const newGuestEmails = [...formData.guestEmails];
        const newGuestNames = [...formData.guestNames || []];

        if (newQuantity > formData.quantity) {
            while (newGuestEmails.length < newQuantity - 1) {
                newGuestEmails.push('');
                newGuestNames.push('');
            }
        } else {
            newGuestEmails.splice(newQuantity - 1);
            newGuestNames.splice(newQuantity - 1);
        }

        onChange('guestEmails', newGuestEmails);
        onChange('guestNames', newGuestNames);
        onChange('quantity', newQuantity);
    };

    const handleGuestEmailChange = (index: number, value: string) => {
        const newGuestEmails = [...formData.guestEmails];
        newGuestEmails[index] = value;
        onChange('guestEmails', newGuestEmails);
    };

    const handleGuestNameChange = (index: number, value: string) => {
        const newGuestNames = [...(formData.guestNames || [])];
        newGuestNames[index] = value;
        onChange('guestNames', newGuestNames);
    };

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
                <div className="flex flex-col gap-2 w-full group">
                    <label className="text-xs uppercase tracking-[0.4em] text-charcoal/70 font-bold px-4">
                        Number of Passes
                    </label>
                    <div className="relative">
                        <select
                            value={formData.quantity}
                            onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                            className="w-full bg-white/50 border border-charcoal/10 rounded-2xl px-6 py-4 text-xl text-charcoal outline-none transition-all focus:bg-white focus:shadow-xl focus:border-primary/50 group-hover:border-charcoal/30 font-bold appearance-none cursor-pointer"
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                                <option key={num} value={num}>{num} Pass{num > 1 ? 'es' : ''}</option>
                            ))}
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-charcoal/50">
                            ▼
                        </div>
                        <div className="absolute inset-0 border-2 border-primary/0 rounded-2xl pointer-events-none group-focus-within:border-primary/20 transition-all scale-[1.02]"></div>
                    </div>
                </div>

                <TicketInput
                    label="Primary Pass Holder Name"
                    name="name"
                    placeholder="Enter your name..."
                    value={formData.name}
                    onChange={(e) => onChange('name', e.target.value)}
                    autoComplete="name"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TicketInput
                        label="Age"
                        type="number"
                        name="age"
                        placeholder="e.g. 25"
                        value={formData.age}
                        onChange={(e) => onChange('age', e.target.value)}
                        autoComplete="bday-age"
                    />
                    <TicketInput
                        label="Gender"
                        name="sex"
                        placeholder="e.g. Female / Non-binary"
                        value={formData.gender}
                        onChange={(e) => onChange('gender', e.target.value)}
                        autoComplete="sex"
                    />
                </div>

                <TicketInput
                    label="Primary Email Address"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => onChange('email', e.target.value)}
                    autoComplete="email"
                />

                {formData.quantity > 1 && (
                    <div className="bg-white/30 border border-charcoal/5 rounded-2xl p-6 flex flex-col gap-6">
                        <div className="text-center mb-2">
                            <h4 className="font-handwriting text-xl text-charcoal">Going together?</h4>
                            <p className="text-xs text-charcoal/60 font-mono mt-2">
                                Provide names and emails for your guests so we can send their passes directly.
                                <br />If left blank, guest passes will require signing waivers at the door.
                            </p>
                        </div>
                        {Array.from({ length: formData.quantity - 1 }).map((_, i) => (
                            <div key={`guest-${i}`} className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-charcoal/5 last:border-b-0 last:pb-0">
                                <TicketInput
                                    label={`Pass Holder ${i + 2} Name (Optional)`}
                                    name={`guest-name-${i}`}
                                    placeholder="Guest Name"
                                    value={formData.guestNames?.[i] || ''}
                                    onChange={(e) => handleGuestNameChange(i, e.target.value)}
                                />
                                <TicketInput
                                    label={`Pass Holder ${i + 2} Email (Optional)`}
                                    type="email"
                                    placeholder={`guest${i + 2}@example.com`}
                                    value={formData.guestEmails[i] || ''}
                                    onChange={(e) => handleGuestEmailChange(i, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                )}

                <TicketInput
                    label="Phone Number"
                    type="tel"
                    name="tel"
                    placeholder="+44 000 000 000"
                    value={formData.phone}
                    onChange={(e) => onChange('phone', e.target.value)}
                    autoComplete="tel"
                />

                <div className="mt-8 border-t border-charcoal/10 pt-8">
                    <label className="text-sm uppercase tracking-[0.4em] text-primary font-black px-4 mb-6 block text-center">
                        The Sunshine Promises
                    </label>

                    <div className="flex flex-col gap-4">
                        {/* Checkpoint 1: Health */}
                        <label className="flex items-start gap-4 cursor-pointer group bg-white/40 p-5 rounded-2xl border border-charcoal/5 hover:border-primary/30 transition-all hover:bg-white/60">
                            <div className="relative mt-1">
                                <input
                                    type="checkbox"
                                    checked={formData.waiverHealthy}
                                    onChange={(e) => onChange('waiverHealthy', e.target.checked)}
                                    className="sr-only"
                                />
                                <div className={`w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center ${formData.waiverHealthy ? 'bg-primary border-primary shadow-lg scale-110' : 'bg-white/50 border-charcoal/20 group-hover:border-primary/50'}`}>
                                    {formData.waiverHealthy && <span className="text-white text-sm">✓</span>}
                                </div>
                            </div>
                            <div className="flex-1">
                                <span className="text-lg mb-1 flex items-center gap-2"><VitalityIcon className="w-6 h-6 text-primary" /> <strong className="text-charcoal font-handwriting tracking-wide">I feel great today!</strong></span>
                                <span className="text-xs text-charcoal/60 leading-relaxed font-mono">
                                    I confirm I am physically fit to enjoy a sauna. I don't suffer from heart/circulatory problems, abnormal blood pressure, or conditions advised against sauna use (including pregnancy). I accept responsibility for my own wellbeing.
                                </span>
                            </div>
                        </label>

                        {/* Checkpoint 2: Etiquette */}
                        <label className="flex items-start gap-4 cursor-pointer group bg-white/40 p-5 rounded-2xl border border-charcoal/5 hover:border-primary/30 transition-all hover:bg-white/60">
                            <div className="relative mt-1">
                                <input
                                    type="checkbox"
                                    checked={formData.waiverTowels}
                                    onChange={(e) => onChange('waiverTowels', e.target.checked)}
                                    className="sr-only"
                                />
                                <div className={`w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center ${formData.waiverTowels ? 'bg-primary border-primary shadow-lg scale-110' : 'bg-white/50 border-charcoal/20 group-hover:border-primary/50'}`}>
                                    {formData.waiverTowels && <span className="text-white text-sm">✓</span>}
                                </div>
                            </div>
                            <div className="flex-1">
                                <span className="text-lg mb-1 flex items-center gap-2"><TowelIcon className="w-6 h-6 text-primary" /> <strong className="text-charcoal font-handwriting tracking-wide">I promise to bring 2 towels!</strong></span>
                                <span className="text-xs text-charcoal/60 leading-relaxed font-mono">
                                    I will bring one towel to sit on and one to dry off. I also agree to shower beforehand, remove jewelry, and respect the peaceful sanctuary vibe by keeping noise down.
                                </span>
                            </div>
                        </label>

                        {/* Checkpoint 3: Terms */}
                        <label className="flex items-start gap-4 cursor-pointer group bg-white/40 p-5 rounded-2xl border border-charcoal/5 hover:border-primary/30 transition-all hover:bg-white/60">
                            <div className="relative mt-1">
                                <input
                                    type="checkbox"
                                    checked={formData.termsAccepted}
                                    onChange={(e) => onChange('termsAccepted', e.target.checked)}
                                    className="sr-only"
                                />
                                <div className={`w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center ${formData.termsAccepted ? 'bg-primary border-primary shadow-lg scale-110' : 'bg-white/50 border-charcoal/20 group-hover:border-primary/50'}`}>
                                    {formData.termsAccepted && <span className="text-white text-sm">✓</span>}
                                </div>
                            </div>
                            <div className="flex-1 pt-1">
                                <span className="text-sm font-mono text-charcoal/80 uppercase tracking-widest group-hover:text-charcoal transition-colors flex items-center gap-2">
                                    <AgreementIcon className="w-6 h-6 text-primary shrink-0" /> I agree to the <a href="/terms" target="_blank" className="text-primary hover:underline font-bold">Terms & Conditions</a>
                                </span>
                            </div>
                        </label>
                    </div>

                    <label className="flex items-center gap-4 cursor-pointer group px-4 mt-8 justify-center">
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={formData.mailingList}
                                onChange={(e) => onChange('mailingList', e.target.checked)}
                                className="sr-only"
                            />
                            <div className={`w-8 h-8 rounded-lg border-2 transition-all flex items-center justify-center ${formData.mailingList ? 'bg-primary border-primary shadow-lg scale-110' : 'bg-white/50 border-charcoal/10 group-hover:border-charcoal/30'}`}>
                                {formData.mailingList && <span className="text-white text-xl">✓</span>}
                            </div>
                        </div>
                        <span className="text-sm font-mono text-charcoal/70 uppercase tracking-widest group-hover:text-charcoal transition-colors">
                            Join the mailing list to be informed of future Early Bird releases
                        </span>
                    </label>
                </div>

                <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <button
                        onClick={onBack}
                        className="text-charcoal/40 hover:text-charcoal font-bold uppercase tracking-widest text-xs transition-colors self-start sm:self-auto"
                    >
                        ← Back to Tiers
                    </button>

                    <div className="flex items-center gap-6 self-stretch sm:self-auto justify-between sm:justify-end">
                        {selectedSubTier && (
                            <div className="text-right">
                                <div className="text-xs uppercase tracking-[0.4em] text-charcoal/50 font-bold mb-1">Total</div>
                                <div className="text-2xl font-black text-charcoal">
                                    £{(Number(selectedSubTier.price?.replace(/[^0-9.-]+/g, "") || 0) * formData.quantity).toFixed(2)}
                                </div>
                            </div>
                        )}
                        <Button onClick={handleNext} disabled={!formData.name || !formData.email || !formData.waiverHealthy || !formData.waiverTowels || !formData.termsAccepted}>
                            Confirm Booking
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

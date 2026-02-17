"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { StandardSection } from '@/components/StandardSection';
import { StepSelection } from '@/components/Ticketing/StepSelection';
import { StepDetails } from '@/components/Ticketing/StepDetails';
import { StepConfirmation } from '@/components/Ticketing/StepConfirmation';
import { TierPicker } from '@/components/Ticketing/TierPicker';
import { FestivalGuide } from '@/components/Ticketing/FestivalGuide';
import { DeskBackground } from '@/components/Ticketing/DeskBackground';
import { TicketTier, TicketSubTier } from '@/components/Ticketing/FestivalPass';

type Step = 'selection' | 'guide' | 'tiers' | 'details' | 'confirmation';

export default function TicketingPage() {
    const [currentStep, setCurrentStep] = useState<Step>('selection');
    const [selectedEvent, setSelectedEvent] = useState<TicketTier | null>(null);
    const [selectedSubTier, setSelectedSubTier] = useState<TicketSubTier | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
    });

    const handleEventSelect = (event: TicketTier) => {
        setSelectedEvent(event);
        setCurrentStep('guide');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleTierSelect = (tier: TicketSubTier) => {
        setSelectedSubTier(tier);
        setCurrentStep('details');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFormChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleConfirm = () => {
        setCurrentStep('confirmation');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen flex flex-col relative">
            <DeskBackground />
            <Header />

            <main className="flex-1 pt-32 pb-20 relative z-10">
                <StandardSection id="tickets" variant="naturalPaper" className="!bg-transparent !border-transparent relative z-10">
                    <div className="relative z-10 min-h-[600px]">
                        <AnimatePresence mode="wait">
                            {currentStep === 'selection' && (
                                <motion.div
                                    key="selection"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.5, ease: "anticipate" }}
                                >
                                    <StepSelection
                                        selectedTier={selectedEvent}
                                        onSelect={handleEventSelect}
                                    />
                                </motion.div>
                            )}

                            {currentStep === 'guide' && selectedEvent && (
                                <motion.div
                                    key="guide"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ duration: 0.5, ease: "anticipate" }}
                                >
                                    <FestivalGuide
                                        event={selectedEvent}
                                        onContinue={() => setCurrentStep('tiers')}
                                        onBack={() => setCurrentStep('selection')}
                                    />
                                </motion.div>
                            )}

                            {currentStep === 'tiers' && selectedEvent && (
                                <motion.div
                                    key="tiers"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.5, ease: "anticipate" }}
                                >
                                    <div className="text-center mb-0">
                                        <button
                                            onClick={() => setCurrentStep('guide')}
                                            className="text-charcoal/40 hover:text-charcoal font-bold uppercase tracking-widest text-[10px] mb-8 transition-colors"
                                        >
                                            ← Back to Guide
                                        </button>
                                    </div>
                                    <TierPicker
                                        event={selectedEvent}
                                        selectedTierId={selectedSubTier?.id}
                                        onSelect={handleTierSelect}
                                    />
                                </motion.div>
                            )}

                            {currentStep === 'details' && selectedEvent && (
                                <motion.div
                                    key="details"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.5, ease: "anticipate" }}
                                >
                                    <StepDetails
                                        formData={formData}
                                        onChange={handleFormChange}
                                        onBack={() => setCurrentStep('tiers')}
                                        onNext={handleConfirm}
                                        selectedTier={selectedEvent}
                                    />
                                </motion.div>
                            )}

                            {currentStep === 'confirmation' && selectedEvent && selectedSubTier && (
                                <motion.div
                                    key="confirmation"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.6, ease: "backOut" }}
                                >
                                    <StepConfirmation
                                        selectedTier={{
                                            ...selectedEvent,
                                            title: `${selectedEvent.title} - ${selectedSubTier.name}`,
                                            featuredPrice: selectedSubTier.price
                                        } as any}
                                        formData={formData}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Progress Indicator */}
                    <div className="mt-20 flex flex-col items-center gap-6 relative z-10">
                        <div className="flex justify-center gap-4">
                            {[1, 2, 3, 4, 5].map((s) => {
                                const stepNames: Step[] = ['selection', 'guide', 'tiers', 'details', 'confirmation'];
                                const stepKey = stepNames[s - 1];
                                const isActive = currentStep === stepKey;
                                const currentIndex = stepNames.indexOf(currentStep);
                                const isDone = stepNames.indexOf(stepKey) < currentIndex;

                                return (
                                    <div
                                        key={s}
                                        className={`w-3 h-3 rounded-full transition-all duration-500 border-2 ${isActive
                                            ? 'bg-primary border-primary scale-125 shadow-[0_0_15px_rgba(255,184,76,0.5)]'
                                            : isDone
                                                ? 'bg-charcoal border-charcoal'
                                                : 'bg-transparent border-charcoal/20'
                                            }`}
                                    />
                                );
                            })}
                        </div>
                        <p className="text-[10px] uppercase tracking-[0.4em] font-black text-charcoal/30">
                            {currentStep === 'selection' && "Step 1: Choose Event"}
                            {currentStep === 'guide' && "Step 2: Festival Guide"}
                            {currentStep === 'tiers' && "Step 3: Choose Pass Type"}
                            {currentStep === 'details' && "Step 4: Your Details"}
                            {currentStep === 'confirmation' && "Step 5: Confirmed"}
                        </p>
                    </div>
                </StandardSection>
            </main>

            <Footer />
        </div>
    );
}

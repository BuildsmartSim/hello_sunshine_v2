"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { StandardSection } from "@/components/StandardSection";
import { StepDetails } from "@/components/Ticketing/StepDetails";
import { StepConfirmation } from "@/components/Ticketing/StepConfirmation";
import { UnifiedEventPanel } from "@/components/Ticketing/UnifiedEventPanel";
import { DeskBackground } from "@/components/Ticketing/DeskBackground";
import { checkInventoryAction } from "@/app/actions/inventory";
import { getEventsAction } from "@/app/actions/events";
import { EventData, TicketSubTier, createSlug } from "@/data/festivals";
import { Schema } from "@/components/Schema";

type Step = "overview" | "details" | "confirmation";

export default function SingleTicketClient() {
    const params = useParams();
    const router = useRouter();
    const eventSlug = params.slug as string;

    const [currentStep, setCurrentStep] = useState<Step>("overview");
    const [event, setEvent] = useState<EventData | null>(null);
    const [selectedSubTier, setSelectedSubTier] = useState<TicketSubTier | null>(null);
    const [inventory, setInventory] = useState<Record<string, { remaining: number; soldOut: boolean }>>({});
    const [isLoadingData, setIsLoadingData] = useState(true);

    const [formData, setFormData] = useState<{
        name: string;
        email: string;
        phone: string;
        age: string;
        gender: string;
        waiverHealthy: boolean;
        waiverTowels: boolean;
        termsAccepted: boolean;
        mailingList: boolean;
        quantity: number;
        guestEmails: string[];
        guestNames: string[];
    }>({
        name: "",
        email: "",
        phone: "",
        age: "",
        gender: "",
        waiverHealthy: false,
        waiverTowels: false,
        termsAccepted: false,
        mailingList: false,
        quantity: 1,
        guestEmails: [],
        guestNames: [],
    });
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch single event
    useEffect(() => {
        setIsLoadingData(true);
        getEventsAction()
            .then((data) => {
                const foundEvent = data.find((e) => createSlug(e.title) === eventSlug);
                if (foundEvent) {
                    setEvent(foundEvent);
                } else {
                    // Redirect back if not found
                    router.push("/tickets");
                }
            })
            .catch((err) => {
                console.error("Failed to load event:", err);
                router.push("/tickets");
            })
            .finally(() => {
                setIsLoadingData(false);
            });
    }, [eventSlug, router]);

    // Fetch inventory when event loads
    useEffect(() => {
        if (event) {
            const updatedIds = event.tiers.map((t) => t.id);
            checkInventoryAction(updatedIds).then((data) => {
                setInventory((prev) => ({ ...prev, ...data }));
            });
        }
    }, [event]);

    const handleTierSelect = (tier: TicketSubTier) => {
        setSelectedSubTier(tier);
        setCurrentStep("details");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleFormChange = (field: string, value: string | boolean | number | string[]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleConfirm = async () => {
        setIsCheckingOut(true);
        setError(null);

        try {
            const numericPrice = Number(selectedSubTier?.price?.replace(/[^0-9.-]+/g, "") || 0);
            const unitAmount = Math.round(numericPrice * 100);

            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    priceId: selectedSubTier?.id,
                    email: formData.email,
                    name: formData.name,
                    quantity: formData.quantity,
                    unitAmount: unitAmount,
                    metadata: {
                        event_id: event?.id,
                        age: formData.age,
                        gender: formData.gender,
                        phone: formData.phone,
                        waiver_accepted: (formData.waiverHealthy && formData.waiverTowels).toString(),
                        waiver_accepted_at: new Date().toISOString(),
                        terms_accepted: formData.termsAccepted.toString(),
                        mailing_list_optin: formData.mailingList.toString(),
                        guest_emails: JSON.stringify(formData.guestEmails),
                        guest_names: JSON.stringify(formData.guestNames),
                        referral_code:
                            document.cookie
                                .split("; ")
                                .find((row) => row.startsWith("sunshine_referral="))
                                ?.split("=")[1] || null,
                    },
                }),
            });

            if (!response.ok) {
                const text = await response.text();
                try {
                    const data = JSON.parse(text);
                    throw new Error(data.error || "Something went wrong");
                } catch {
                    throw new Error(`Server returned an error (${response.status})`);
                }
            }

            const data = await response.json();
            window.location.href = data.url;
        } catch (err: any) {
            console.error("Checkout failed:", err);
            setError(err.message || "Payment system unreachable");
        } finally {
            setIsCheckingOut(false);
        }
    };

    if (isLoadingData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <p className="text-charcoal/50 font-mono tracking-widest text-sm py-12">
                    LOADING SANCTUARY...
                </p>
            </div>
        );
    }

    if (!event) return null; // Or some fallback UI

    const eventSchema = {
        "@context": "https://schema.org",
        "@type": "Event",
        "name": event.title,
        "description": event.description,
        "startDate": event.dates, // e.g. "April 2025"
        "location": {
            "@type": "Place",
            "name": event.location,
            "address": {
                "@type": "PostalAddress",
                "addressLocality": event.location,
                "addressCountry": "UK"
            }
        },
        "image": event.logoSrc ? `https://hellosunshinesauna.com${event.logoSrc}` : "https://hellosunshinesauna.com/optimized/photographs/webp/hero-sunshine.webp",
        "offers": event.tiers.map((tier) => ({
            "@type": "Offer",
            "name": tier.name,
            "price": tier.price.replace(/[^0-9.]/g, ''), // Strip currency symbols
            "priceCurrency": "GBP",
            "url": `https://hellosunshinesauna.com/tickets/${createSlug(event.title)}`
        }))
    };

    return (
        <div className="min-h-screen flex flex-col relative">
            <Schema data={eventSchema} />
            <DeskBackground />
            <Header />

            <main className="flex-1 pt-28 pb-12 relative z-10 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    <StandardSection
                        id="ticket-view"
                        variant="naturalPaper"
                        className="rounded-[32px] md:rounded-[48px] shadow-2xl border border-charcoal/10 relative z-10"
                    >
                        <div className="relative z-10 min-h-[400px] py-4 md:py-6">
                            <AnimatePresence mode="wait">
                                {currentStep === "overview" && (
                                    <motion.div
                                        key="overview"
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        transition={{ duration: 0.5, ease: "anticipate" }}
                                    >
                                        <div id="tiers-section" className="mt-0">
                                            <UnifiedEventPanel
                                                event={event}
                                                selectedTierId={selectedSubTier?.id}
                                                onSelect={handleTierSelect}
                                                inventory={inventory}
                                            />
                                        </div>

                                        <div className="mt-16 text-center">
                                            <button
                                                onClick={() => router.push("/tickets")}
                                                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full border border-charcoal/20 text-charcoal/60 hover:text-charcoal hover:border-charcoal/40 hover:bg-charcoal/5 font-bold uppercase tracking-[0.2em] text-[11px] transition-all duration-300 group"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transform group-hover:-translate-x-1 transition-transform"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
                                                Back to All Events
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {currentStep === "details" && (
                                    <motion.div
                                        key="details"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.5, ease: "anticipate" }}
                                    >
                                        {error && (
                                            <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 font-mono text-sm">
                                                {error}
                                            </div>
                                        )}
                                        <StepDetails
                                            formData={formData}
                                            onChange={handleFormChange}
                                            onNext={handleConfirm}
                                            onBack={() => {
                                                setCurrentStep("overview");
                                                setSelectedSubTier(null);
                                            }}
                                            selectedTier={event}
                                            selectedSubTier={selectedSubTier}
                                        />
                                    </motion.div>
                                )}

                                {currentStep === "confirmation" && selectedSubTier && (
                                    <motion.div
                                        key="confirmation"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.6, ease: "backOut" }}
                                    >
                                        <StepConfirmation
                                            selectedTier={{
                                                ...event,
                                                title: `${event.title} - ${selectedSubTier.name}`,
                                                featuredPrice: selectedSubTier.price,
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
                                {[1, 2, 3].map((s) => {
                                    const stepNames: Step[] = ["overview", "details", "confirmation"];
                                    const stepKey = stepNames[s - 1];
                                    const isActive = currentStep === stepKey;
                                    const currentIndex = stepNames.indexOf(currentStep);
                                    const isDone = stepNames.indexOf(stepKey) < currentIndex;

                                    return (
                                        <div
                                            key={s}
                                            className={`w-3 h-3 rounded-full transition-all duration-500 border-2 ${isActive
                                                ? "bg-primary border-primary scale-125 shadow-[0_0_15px_rgba(255,184,76,0.5)]"
                                                : isDone
                                                    ? "bg-charcoal border-charcoal"
                                                    : "bg-transparent border-charcoal/20"
                                                }`}
                                        />
                                    );
                                })}
                            </div>
                            <p className="text-[10px] uppercase tracking-[0.4em] font-black text-charcoal/30">
                                {currentStep === "overview" && "Step 1: Event Details & Passes"}
                                {currentStep === "details" && "Step 2: Your Details"}
                                {currentStep === "confirmation" && "Step 3: Confirmed"}
                            </p>
                        </div>
                    </StandardSection>
                </div>
            </main>

            <Footer />
        </div>
    );
}

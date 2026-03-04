"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { StandardSection } from "@/components/StandardSection";
import { DeskBackground } from "@/components/Ticketing/DeskBackground";
import { SectionHeader } from "@/components/SectionHeader";
import { Button } from "@/components/Button";
import { fonts } from "@/design-system/tokens";
import { getEventsAction } from "@/app/actions/events";
import { checkInventoryAction } from "@/app/actions/inventory";
import { EventData, createSlug } from "@/data/festivals";
import { useHasMounted } from "@/design-system/MediaContext";

export default function EventsListPage() {
    const hasMounted = useHasMounted();
    const [events, setEvents] = useState<EventData[]>([]);
    const [inventory, setInventory] = useState<Record<string, { remaining: number; soldOut: boolean }>>({});

    useEffect(() => {
        getEventsAction().then(async (data) => {
            setEvents(data);

            const priceIds = data.flatMap((e) => e.tiers.map((t) => t.id));
            if (priceIds.length > 0) {
                const stock = await checkInventoryAction(priceIds);
                setInventory(stock);
            }
        });
    }, []);

    const getEventAvailability = (event: EventData) => {
        let totalRemaining = 0;
        let allSoldOut = true;
        let hasData = false;

        for (const tier of event.tiers) {
            const stock = inventory[tier.id];
            if (stock) {
                hasData = true;
                totalRemaining += stock.remaining || 0;
                if (!stock.soldOut) {
                    allSoldOut = false;
                }
            }
        }

        if (!hasData) return "Checking...";
        if (allSoldOut) return "Sold Out";
        if (totalRemaining > 0 && totalRemaining <= 10) return "Selling Fast";
        return "Available";
    };

    if (!hasMounted) return null;

    return (
        <div className="min-h-screen flex flex-col relative">
            <DeskBackground />
            <Header />

            <main className="flex-1 pt-32 pb-20 relative z-10 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    <StandardSection
                        id="events-list"
                        variant="naturalPaper"
                        className="rounded-[32px] md:rounded-[48px] shadow-2xl border border-charcoal/10 relative z-10"
                    >
                        <div className="relative z-10 min-h-[600px] py-8 md:py-12 px-4 md:px-8">
                            <div className="md:mb-16 border-b border-charcoal/10 pb-12">
                                <SectionHeader
                                    line1="Choose"
                                    line2="Sanctuary"
                                    handwriting="Select your path into the warmth."
                                    centered={true}
                                />
                            </div>

                            <div className="flex flex-col relative mt-12 max-w-5xl mx-auto">
                                {/* Header Row */}
                                <div className="hidden md:flex items-center justify-between py-2 border-b-2 border-charcoal text-charcoal/40 font-mono text-[9px] uppercase tracking-[0.2em] font-bold px-6">
                                    <div className="w-[120px] lg:w-1/4">Dates</div>
                                    <div className="flex-1">Sanctuary</div>
                                    <div className="w-[160px] text-right">Access</div>
                                </div>

                                {events.length === 0 && (
                                    <p className="text-charcoal/50 font-mono tracking-widest text-sm py-12 text-center md:text-left">
                                        LOADING SANCTUARIES...
                                    </p>
                                )}

                                {events.map((pass) => (
                                    <Link
                                        key={pass.id}
                                        href={`/tickets/${createSlug(pass.title)}`}
                                        className="block group border-b border-charcoal/10 hover:bg-black/[0.02] transition-colors md:px-6 py-8"
                                    >
                                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
                                            {/* Dates & Mobile Location */}
                                            <div className="flex flex-col gap-1 w-[120px] lg:w-1/4">
                                                <h4 className="text-charcoal/60 text-[10px] sm:text-[11px] uppercase font-mono tracking-[0.2em] font-bold">
                                                    {pass.dates}
                                                </h4>
                                                <p className="text-[10px] font-mono text-charcoal/40 font-bold tracking-[0.2em] uppercase md:hidden">
                                                    {pass.location}
                                                </p>
                                            </div>

                                            {/* Title & Desktop Location */}
                                            <div className="flex flex-col gap-1 flex-1">
                                                <h3 className="h3 group-hover:text-primary transition-colors text-2xl sm:text-3xl lg:text-4xl uppercase">
                                                    {pass.title}
                                                </h3>
                                                <p className="text-[10px] font-mono text-charcoal/50 font-bold tracking-[0.2em] uppercase hidden md:block group-hover:text-charcoal/70 transition-colors">
                                                    {pass.location}
                                                </p>
                                            </div>

                                            {/* Availability & Button */}
                                            <div className="flex items-center gap-4 md:gap-8 w-full md:w-[160px] justify-between md:justify-end shrink-0">
                                                <div className="flex flex-row md:flex-col items-baseline md:items-end gap-2 md:gap-0">
                                                    <span
                                                        className={`text-[11px] md:text-[13px] font-bold uppercase tracking-widest ${getEventAvailability(pass) === "Sold Out"
                                                            ? "text-red-500/70"
                                                            : getEventAvailability(pass) === "Selling Fast"
                                                                ? "text-primary"
                                                                : "text-charcoal/70"
                                                            }`}
                                                    >
                                                        {getEventAvailability(pass)}
                                                    </span>
                                                </div>
                                                <Button
                                                    variant="deepDry"
                                                    className="!px-4 !py-2 !text-[11px] md:!text-[14px] md:!px-8 md:!py-3"
                                                >
                                                    Explore
                                                </Button>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </StandardSection>
                </div>
            </main>

            <Footer />
        </div>
    );
}

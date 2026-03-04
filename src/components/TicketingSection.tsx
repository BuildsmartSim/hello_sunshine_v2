"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { SectionHeader } from "@/components/SectionHeader";
import { StandardSection } from "@/components/StandardSection";
import { EventData } from "@/data/festivals";
import { getEventsAction } from "@/app/actions/events";
import { checkInventoryAction } from "@/app/actions/inventory";
import { useHasMounted } from "@/design-system/MediaContext";
import { Polaroid } from "@/components/Polaroid";
import { Button } from "@/components/Button";
import { fonts } from "@/design-system/tokens";
import { motion, AnimatePresence } from "framer-motion";

export default function TicketingSection() {
  const hasMounted = useHasMounted();
  const [events, setEvents] = useState<EventData[]>([]);
  const [hoveredEvent, setHoveredEvent] = useState<EventData | null>(null);
  const [inventory, setInventory] = useState<Record<string, { remaining: number; soldOut: boolean }>>({});

  useEffect(() => {
    getEventsAction().then(async (data) => {
      // Only show featured events on the homepage
      const featured = data.filter((e) => e.isFeatured);
      setEvents(featured);
      if (featured.length > 0) {
        setHoveredEvent(featured[0]);
      }

      const priceIds = featured.flatMap(e => e.tiers.map(t => t.id));
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
    <StandardSection id="ticketing" variant="naturalPaper">
      <div className="md:mb-16 border-b border-charcoal/10 pb-12">
        <SectionHeader
          line1="Festival"
          line2="Season"
          handwriting="Choose your journey into warmth."
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 relative mt-12">
        {/* Left Column: Typographic List */}
        <div className="flex-1 flex flex-col">
          {/* Header Row */}
          <div className="hidden md:flex items-center justify-between py-2 border-b-2 border-charcoal text-charcoal/40 font-mono text-[9px] uppercase tracking-[0.2em] font-bold px-6">
            <div className="w-[120px] lg:w-1/4">Dates</div>
            <div className="flex-1">Sanctuary</div>
            <div className="w-[160px] text-right">Access</div>
          </div>

          {events.length === 0 && (
            <p className="text-charcoal/50 font-mono tracking-widest text-sm py-12">
              LOADING SANCTUARIES...
            </p>
          )}

          {events.map((pass) => (
            <Link
              key={pass.id}
              href={`/tickets/${pass.id}`}
              className="block group border-b border-charcoal/10 hover:bg-black/[0.02] transition-colors md:px-6 py-8"
              onMouseEnter={() => setHoveredEvent(pass)}
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
                  <h3 className="h3 group-hover:text-primary transition-colors text-xl sm:text-2xl lg:text-3xl uppercase">
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

          <div className="mt-12 mb-12 md:mb-16 flex justify-center md:justify-start lg:pl-6">
            <Link href="/tickets">
              <Button variant="deepDry" className="!px-8 !py-3 tracking-[0.2em] text-[12px] uppercase">
                See All Events
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Column: Sticky Polaroid */}
        <div className="hidden lg:block w-[320px] shrink-0 relative">
          <div className="sticky top-32">
            <AnimatePresence mode="wait">
              {hoveredEvent && (
                <motion.div
                  key={hoveredEvent.id}
                  initial={{ opacity: 0, rotate: -5, scale: 0.95 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 5, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="origin-bottom"
                >
                  <Polaroid
                    src={hoveredEvent.title.toLowerCase().includes('avalon') ? "/optimized/photographs/webp/ticketing/Avalon-people-dancing.webp" : (hoveredEvent.logoSrc || "/canvas-background.png")}
                    label={hoveredEvent.title}
                    size="w-full max-w-[320px] mx-auto"
                    rotation="rotate-[-2deg]"
                    variant="A"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </StandardSection>
  );
}

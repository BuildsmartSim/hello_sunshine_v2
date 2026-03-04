"use client";

import React, { useState } from "react";
import Image from "next/image";
import SanctuarySection from "@/components/SanctuarySection";
import HeroSection from "@/components/HeroSection";
import TicketingSection from "@/components/TicketingSection";
import Guestbook from "@/components/Guestbook";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Polaroid } from "@/components/Polaroid";
import { SectionHeader } from "@/components/SectionHeader";
import { StandardSection } from "@/components/StandardSection";
import { useDesign } from "@/design-system/DesignContext";
import { ContactSection } from "@/components/ContactSection";
import { Schema } from "@/components/Schema";
import { AnimatePresence, motion } from "framer-motion";

export default function Home() {
  const { state } = useDesign();
  const [guestbookSpread, setGuestbookSpread] = useState(0);

  const guestbookPolaroidSets = [
    // Spread 0 (Cover) - Landing page polaroids
    [
      { src: "/optimized/photographs/webp/Plunge/man-bathes-plunge-sunshine-avalon.webp", label: "Community" },
      { src: "/optimized/photographs/webp/naked-woman-lying-on.webp", label: "Radiance" },
      { src: "/optimized/photographs/webp/three-women-hugging-posing.webp", label: "Together" }
    ],
    // Spread 1 (Page 1)
    [
      { src: "/optimized/photographs/webp/man-bathes-plunge-sunshine.webp", label: "Cold Plunge" },
      { src: "/optimized/photographs/webp/Tim/bearded-men-smiling-out.webp", label: "Good Times" },
      { src: "/optimized/photographs/webp/Tim/three-men-hugging.webp", label: "Brothers" }
    ],
    // Spread 2 (Page 2)
    [
      { src: "/optimized/photographs/webp/two-women-embracing-out.webp", label: "Embrace" },
      { src: "/optimized/photographs/webp/woman-painting-face.webp", label: "Free Spirit" },
      { src: "/optimized/photographs/webp/tattooed-man-headstand.webp", label: "Balance" }
    ],
    // Spread 3 (Back cover)
    [
      { src: "/optimized/photographs/webp/three-friends-brushing.webp", label: "Sun kissed" },
      { src: "/optimized/photographs/webp/smiling-couple-outdoor-festival.webp", label: "Festival Smiles" },
      { src: "/optimized/photographs/webp/bearded-man-smiling.webp", label: "Inner peace" }
    ]
  ];

  // Safeguard array index
  const activePolaroids = guestbookPolaroidSets[guestbookSpread] || guestbookPolaroidSets[0];

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    "name": "Hello Sunshine Sauna",
    "image": "https://hellosunshinesauna.com/optimized/photographs/webp/man-bathes-plunge-sunshine.webp",
    "description": "Hand-built saunas for the wandering soul. Experience community, warmth, and nature.",
    "url": "https://hellosunshinesauna.com",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "London",
      "addressCountry": "UK"
    },
    "priceRange": "$$"
  };

  return (
    <div className="min-h-screen bg-[#FDFCF9]">
      <Schema data={localBusinessSchema} />
      <Header />

      <main>
        {/* HERO SECTION */}
        <HeroSection />


        {/* SANCTUARY SECTION */}
        <SanctuarySection />

        {/* GUESTBOOK SECTION */}
        <StandardSection id="guestbook" variant="naturalPaper">
          {/* Content row: polaroids left, book right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

            {/* Left: Polaroid stack — 3 cols */}
            <div className="hidden lg:flex lg:col-span-3 flex-col items-center pb-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={guestbookSpread}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="flex flex-col items-center w-full relative"
                >
                  <Polaroid
                    src={activePolaroids[0].src}
                    label={activePolaroids[0].label}
                    rotation="rotate-[-5deg]"
                    size="w-48 md:w-80"
                    className="z-10"
                  />
                  <div className="-mt-16 md:-mt-32 translate-x-3 md:translate-x-6 z-20">
                    <Polaroid
                      src={activePolaroids[1].src}
                      label={activePolaroids[1].label}
                      rotation="rotate-[4deg]"
                      size="w-48 md:w-80"
                    />
                  </div>
                  <div className="relative inline-block overflow-visible -translate-x-3 md:-translate-x-6 -mt-16 md:-mt-32 z-30">
                    <Polaroid
                      src={activePolaroids[2].src}
                      label={activePolaroids[2].label}
                      rotation="rotate-[-3deg]"
                      size="w-48 md:w-80"
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right: Header (centered) + rule + book — 9 cols */}
            <div className="lg:col-span-9 flex flex-col items-center">
              <SectionHeader
                centered={true}
                line1="The"
                line2="Guestbook"
                handwriting="Voices from the steam. Moments captured in the wild."
                withSeparator={true}
              />
              <div className="w-full">
                <Guestbook onSpreadChange={setGuestbookSpread} />
              </div>
            </div>

          </div>
        </StandardSection>

        {/* TICKETING SECTION */}
        <TicketingSection />

        {/* CONTACT SECTION */}
        <ContactSection />
      </main>

      <Footer />
    </div>
  );
}


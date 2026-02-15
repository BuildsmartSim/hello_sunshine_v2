"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Logo from "@/components/Logo";
import SanctuarySection from "@/components/SanctuarySection";
import HeroSection from "@/components/HeroSection";
import TicketingSection from "@/components/TicketingSection";
import Guestbook from "@/components/Guestbook";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { fonts } from "@/design-system/tokens";
import { Polaroid } from "@/components/Polaroid";

export default function Home() {

  return (
    <div className="min-h-screen bg-[#FDFCF9]">
      <Header />

      <main>
        {/* HERO SECTION */}
        <HeroSection />


        {/* SANCTUARY SECTION */}
        <SanctuarySection />

        {/* GUESTBOOK SECTION */}
        <section className="py-24 md:py-40 bg-[#F3EFE6] relative overflow-hidden border-y border-charcoal/5">
          {/* Paper Texture Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply"
            style={{
              backgroundImage: `url('https://www.transparenttextures.com/patterns/natural-paper.png')`,
              backgroundSize: '400px',
            }}></div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">

              {/* Left Column: Polaroid Stack (Desktop Only) */}
              <div className="hidden lg:flex lg:col-span-4 flex-col gap-12 items-center justify-center -mt-10">
                <Polaroid
                  src="/optimized/polaroids/sauna-garden.webp"
                  label="Morning Mist"
                  rotation="rotate-[-6deg]"
                  size="w-64"
                  className="hover:z-50 transition-all"
                />
                <Polaroid
                  src="/optimized/polaroids/caravan-fire-chairs-heart.webp"
                  label="Nightfall"
                  rotation="rotate-[4deg]"
                  size="w-64"
                  className="hover:z-50 transition-all -mt-4 translate-x-4"
                />
                <Polaroid
                  src="/optimized/polaroids/interior-fire.webp"
                  label="The Hearth"
                  rotation="rotate-[-2deg]"
                  size="w-64"
                  className="hover:z-50 transition-all -mt-4 -translate-x-2"
                />
              </div>

              {/* Right Column: Title + Guestbook */}
              <div className="lg:col-span-8 flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="mb-16">
                  <span className="font-handwriting text-3xl text-primary mb-4 block">Our Shared Story</span>
                  <h2 className="text-6xl md:text-8xl text-wood-dark mb-6" style={{ fontFamily: fonts.accent }}>The Guestbook</h2>
                  <p className="text-xl font-display italic text-charcoal/40 max-w-xl">
                    Voices from the steam. Moments captured in the wild. Flip through the memories of those who came before.
                  </p>
                </div>

                <div className="relative w-full py-8 md:py-12 flex justify-center lg:justify-start">
                  <div className="lg:pl-12">
                    <Guestbook />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-20 -left-20 opacity-5 rotate-12 pointer-events-none">
            <Image src="/icons/heart.png" alt="" width={300} height={300} />
          </div>
        </section>

        {/* TICKETING SECTION */}
        <TicketingSection />
      </main>

      <Footer />
    </div>
  );
}


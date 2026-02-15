import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, Caveat, IBM_Plex_Mono, Lora, Handlee, Patrick_Hand } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { GlobalFilters } from "@/components/GlobalFilters";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

const handlee = Handlee({
  variable: "--font-handlee",
  subsets: ["latin"],
  weight: ["400"],
});

const patrickHand = Patrick_Hand({
  variable: "--font-patrick-hand",
  subsets: ["latin"],
  weight: ["400"],
});

// Using a more standard path within the app directory
const chicle = localFont({
  src: "./_fonts/Chicle-Regular.ttf",
  variable: "--font-chicle",
  display: "swap",
});

const cormorantGaramond = localFont({
  src: "./_fonts/CormorantGaramond-VariableFont_wght.ttf",
  variable: "--font-cormorant",
  display: "swap",
});

const fraunces = localFont({
  src: "./_fonts/Fraunces-VariableFont_SOFT,WONK,opsz,wght.ttf",
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hello Sunshine Sauna - Elemental Minimalist",
  description: "Hand-built saunas for the wandering soul.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </head>
      <body
        className={`${playfair.variable} ${dmSans.variable} ${caveat.variable} ${chicle.variable} ${cormorantGaramond.variable} ${fraunces.variable} ${plexMono.variable} ${lora.variable} ${handlee.variable} ${patrickHand.variable} antialiased font-body bg-background-light dark:bg-background-dark text-black dark:text-wood-light transition-colors duration-500 overflow-x-hidden`}
      >
        {children}
        <GlobalFilters />
      </body>
    </html>
  );
}

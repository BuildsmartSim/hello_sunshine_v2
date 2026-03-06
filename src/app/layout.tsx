import type { Metadata } from "next";
import { DM_Sans, Caveat } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { GlobalFilters } from "@/components/GlobalFilters";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800", "900"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

// Using a more standard path within the app directory
const chicle = localFont({
  src: "./_fonts/Chicle-Regular.ttf",
  variable: "--font-chicle",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://hellosunshinesauna.com'),
  title: {
    default: "Hello Sunshine Sauna | Mobile Wood-Fired Sauna in the South West",
    template: "%s | Hello Sunshine Sauna",
  },
  description: "Mobile wood-fired sauna in the South West of England. Hand-built saunas for the wandering soul. Experience community, warmth, and nature.",
  openGraph: {
    title: "Hello Sunshine Sauna | Mobile Wood-Fired Sauna in the South West",
    description: "Mobile wood-fired sauna in the South West of England. Hand-built saunas for the wandering soul. Experience community, warmth, and nature.",
    url: "/",
    siteName: "Hello Sunshine",
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hello Sunshine Sauna",
    description: "Mobile wood-fired sauna in the South West of England. Hand-built saunas for the wandering soul.",
  },
};

import { DesignProvider } from "@/design-system/DesignContext";

import { MediaProvider } from "@/design-system/MediaContext";
import { MediaViewer } from "@/components/MediaViewer";
import { ReferralTracker } from "@/components/ReferralTracker";
import { Suspense } from "react";
import { GoogleAnalytics } from '@next/third-parties/google';

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
        className={`${dmSans.variable} ${chicle.variable} ${caveat.variable} antialiased`}
      >
        <DesignProvider>
          <MediaProvider>
            <Suspense fallback={null}>
              <ReferralTracker />
            </Suspense>
            {children}
            <MediaViewer />
          </MediaProvider>
        </DesignProvider>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-DUMMY123'} />
      </body>
    </html>
  );
}

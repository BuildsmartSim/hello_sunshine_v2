import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Turbopack-compatible config (Next.js 16 uses Turbopack by default) */
  turbopack: {},
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 60 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 5,
  },
};

export default nextConfig;

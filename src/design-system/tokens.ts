/**
 * HELLO SUNSHINE — DESIGN SYSTEM TOKENS
 * ══════════════════════════════════════
 *
 * This is the SINGLE SOURCE OF TRUTH for all design decisions.
 * Every component, page, and layout must reference these tokens.
 * Do NOT hard-code colours, shadows, fonts, or spacing elsewhere.
 *
 * Last updated: 2026-02-13
 */

/* ─────────────────────────────────────────────────────
   1. COLOUR PALETTE
   ───────────────────────────────────────────────────── */
export const colors = {
    /** Core brand colours */
    primary: "#F8C630",     // Sun-faded yellow
    primaryBright: "#f9cb40",     // Sunlight Yellow (buttons, accents)
    secondary: "#D4A32A",     // Darker ochre

    /** Neutrals */
    charcoal: "#2C2C2C",     // Primary text
    charcoalDeep: "#1F1A17",     // Stroke / darkest ink
    smokedWood: "#322B28",     // Shadow tone champion (ID 36003)
    woodDark: "#3E2723",     // Deep cedar brown
    woodLight: "#E0D5C1",     // Paper / canvas tone

    /** Backgrounds */
    bgLight: "#F3EFE6",     // Natural Paper (warm off-white)
    bgPageBase: "#FDFCF9",     // Page body background
    bgDark: "#1F1A17",     // Very dark brown/black
    bgCedar: "#3E2723",     // Deep cedar

    /** Polaroid frame tones (Faded Memory series) */
    frameSoftWarmth: "#faf8f4",    // Variant A
    frameSunFaded: "#f5f0e8",    // Variant B
    frameBleached: "#f0ebe0",    // Variant C
} as const;


/* ─────────────────────────────────────────────────────
   2. TYPOGRAPHY
   ───────────────────────────────────────────────────── */
export const fonts = {
    /** Primary display header — hand-drawn, editorial voice */
    accent: "'ChicleForce', var(--font-chicle), cursive",
    /** Sub-headers, handwritten notes, annotations */
    handwriting: "var(--font-caveat), cursive",
    /** Body text — clean, geometric, high readability */
    body: "var(--font-dm-sans), sans-serif",
    /** Display serif (rarely used, reserved for editorial italics) */
    display: "var(--font-playfair), serif",
    /** Monospace for code / specs */
    mono: "var(--font-plex-mono), monospace",
} as const;

/** Approved font hierarchy — DO NOT MIX outside of these roles */
export const fontRoles = {
    h1: { font: fonts.accent, weight: "normal" },
    h2: { font: fonts.accent, weight: "normal" },
    h3: { font: fonts.accent, weight: "normal" },
    subtitle: { font: fonts.handwriting, weight: "normal" },
    annotation: { font: fonts.handwriting, weight: "normal" },
    body: { font: fonts.body, weight: "400" },
    bodyBold: { font: fonts.body, weight: "700" },
    label: { font: fonts.body, weight: "700" },
} as const;


/* ─────────────────────────────────────────────────────
   3. PENCIL & HATCH SYSTEM
   ───────────────────────────────────────────────────── */
export const pencil = {
    /** Hatch CSS classes (defined in globals.css) */
    hatch: {
        yellowBold: "hatch-aesthetic-yellow-bold",
        yellow: "hatch-aesthetic-yellow",
        cream: "hatch-aesthetic-cream",
        creamBold: "hatch-aesthetic-cream-bold",
        charcoal: "hatch-aesthetic-charcoal",
        pencilGrey: "hatch-pencil-grey",
    },

    /** Blend modes */
    blend: {
        multiply: "pencil-blend-multiply",   // Best for light paper
        screen: "pencil-blend-screen",      // Best for dark wood
        overlay: "pencil-blend-overlay",     // General organic
    },

    /** Softness utilities */
    soft: "pencil-soft",          // opacity: 0.65
    extraSoft: "pencil-extra-soft",    // opacity: 0.45

    /** Stroke presets (for WebkitTextStroke) */
    strokes: {
        hero: { width: "1.5px", color: colors.charcoalDeep },
        standard: { width: "1.2px", color: colors.charcoalDeep },
        fine: { width: "1px", color: colors.charcoalDeep },
        lightOnDark: { width: "1px", color: colors.bgLight },
    },
} as const;


/* ─────────────────────────────────────────────────────
   4. SHADOWS
   ───────────────────────────────────────────────────── */
export const shadows = {
    /** Photo shadow — Champion Hero (ID 47002) */
    photo: `0 15px 30px -5px rgba(50, 43, 40, 0.45)`,

    /** Polaroid shadow — Smoked Wood, tight contact */
    polaroid: `0 4px 6px -1px rgba(50, 43, 40, 0.65)`,

    /** Elevated card / section */
    section: `0 50px 100px -20px rgba(0, 0, 0, 0.1)`,

    /** Polaroid hover lift */
    polaroidHover: `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)`,

    /** Photo inset bevel (recessed into paper) */
    photoInset: `inset 0 3px 8px rgba(0, 0, 0, 0.15)`,

    /** Deep photo inset */
    photoInsetDeep: `inset 0 6px 16px rgba(0, 0, 0, 0.25)`,
} as const;


/* ─────────────────────────────────────────────────────
   5. PHOTO STYLING (ID 37001 Champion)
   ───────────────────────────────────────────────────── */
export const photo = {
    borderSize: "12px",
    borderColor: "#ffffff",
    borderRadius: "4px",
    tilt: "1.5deg",
} as const;


/* ─────────────────────────────────────────────────────
   6. LAYOUT GRID (Champion Hero ID 47002)
   ───────────────────────────────────────────────────── */
export const layout = {
    hero: {
        photoColumns: 9,
        textColumns: 3,
        gap: "32px",        // Ledger gap
        headerStack: "-12px",       // Tight vertical interlock
    },

    /** Standard page padding */
    pagePadding: "96px",         // p-24
    sectionRadius: "120px",        // rounded-[120px]
    sectionBorder: "8px",          // border-8

    /** Content widths */
    maxContentWidth: "1280px",       // max-w-7xl
} as const;


/* ─────────────────────────────────────────────────────
   7. BACKGROUNDS & TEXTURES
   ───────────────────────────────────────────────────── */
export const textures = {
    canvas: "/canvas-background.png",
    pencilGrain: "/textures/organic-pencil.png",
    paper: "https://www.transparenttextures.com/patterns/natural-paper.png",
    cedar: "https://www.transparenttextures.com/patterns/wood-pattern.png",
} as const;

export const backgrounds = {
    /** Named surface presets */
    naturalPaper: { bg: colors.bgLight, borderClass: "border-charcoal/5", isDark: false },
    charcoal: { bg: colors.bgDark, borderClass: "border-white/5", isDark: true },
    sunlightYellow: { bg: colors.primaryBright, borderClass: "border-charcoal/5", isDark: false },
    cedar: { bg: colors.woodDark, borderClass: "border-white/10", isDark: true },
} as const;


/* ─────────────────────────────────────────────────────
   8. ICON SET (Hand-Drawn, in /public/icons/)
   ───────────────────────────────────────────────────── */
export const icons = {
    sauna: "/icons/sauna.png",
    hotTub: "/icons/hot-tub.png",
    plungePool: "/icons/plunge-pool.png",
    firePit: "/icons/fire-pit.png",
    shower: "/icons/shower.png",
    towels: "/icons/towels.png",
    home: "/icons/home.png",
    heart: "/icons/heart.png",
    calendar: "/icons/calendar.png",
    location: "/icons/location.png",
    phone: "/icons/phone.png",
    mail: "/icons/mail.png",
    mobilePhone: "/icons/mobile-phone.png",
    burger: "/icons/burgur.png",
    downArrow: "/icons/down-arrow.png",
    upArrow: "/icons/up-arrow.png",
    facebook: "/icons/facebook.png",
    instagram: "/icons/instagram.png",
} as const;

export const logo = {
    primary: "/logo-black-yellow.png",
    alt: "/HSSLOGO black YELLOW.png",
} as const;


/* ─────────────────────────────────────────────────────
   9. ANIMATION & INTERACTION
   ───────────────────────────────────────────────────── */
export const animation = {
    /** Standard hover transition */
    hoverDuration: "500ms",
    hoverScale: "1.05",
    hoverRotateReset: "0deg",

    /** Polaroid hover */
    polaroidHoverScale: "1.03",
    polaroidDuration: "700ms",

    /** Photo zoom on hover */
    photoZoomScale: "1.10",
    photoZoomDuration: "1000ms",
    photoZoomEasing: "ease-out",
} as const;


/* ─────────────────────────────────────────────────────
   10. SPACING & RHYTHM
   ───────────────────────────────────────────────────── */
export const spacing = {
    /** Section-level vertical gaps */
    sectionGap: "128px",    // space-y-32
    componentGap: "48px",     // gap-12
    elementGap: "32px",     // gap-8

    /** Border radii */
    pill: "9999px",   // rounded-full
    card: "24px",     // rounded-3xl
    sectionCard: "60px",     // rounded-[60px]
    heroCard: "120px",    // rounded-[120px]
} as const;


/* ─────────────────────────────────────────────────────
   11. SVG FILTER (Hand-Drawn Wobble)
   ───────────────────────────────────────────────────── */
export const svgFilter = {
    id: "hand-drawn",
    turbulence: { type: "fractalNoise", baseFrequency: 0.05, numOctaves: 3 },
    displacement: { scale: 4, xChannel: "R", yChannel: "G" },
} as const;

"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import NextImage from 'next/image';
import { fonts } from '@/design-system/tokens';

/* ─────────────────────────────────────────────────────
   AUTHENTIC LEGACY GUESTBOOK
   
   Architecture: Stacked Sheets with Dynamic Z-Index
   Inspired by Book3D.tsx logic.
   ───────────────────────────────────────────────────── */

// --- Assets & Data ---

type SheetContent = {
    src?: string;         // For Cover images
    paper?: string;       // For Paper textures
    overlay?: string | null; // For Handwritten notes
    overlayStyle?: string; // Rotation/adjustments
    imageStyle?: string; // Custom image transforms (e.g. scale-x-[-1])
    alt: string;
};

type Sheet = {
    id: number;
    type: 'cover' | 'page';
    front: SheetContent;
    back: SheetContent;
};

const SHEETS: Sheet[] = [
    {
        id: 0,
        type: 'cover',
        front: { src: '/Guestbook_png/BOOK_COVER_FRONT.png', alt: 'Cover' },
        back: { src: '/Guestbook_png/BACK_SIDE_BOOK_RIGHT.png', alt: 'Inside Cover' }
    },
    {
        id: 1,
        type: 'page',
        front: {
            paper: '/Guestbook_png/paper_page_right.png',
            overlay: '/Guestbook_png/Testimonial_overlays/testem1.png',
            overlayStyle: 'rotate-2',
            alt: 'Page 1'
        },
        back: {
            paper: '/Guestbook_png/paper_page_LEFT.png',
            overlay: '/Guestbook_png/Testimonial_overlays/Thank you for the warmth.png',
            overlayStyle: '-rotate-1',
            alt: 'Page 1 Back'
        }
    },
    {
        id: 2,
        type: 'page',
        front: {
            paper: '/Guestbook_png/paper_page_right.png',
            overlay: '/Guestbook_png/Testimonial_overlays/Thank you its been really supportive.png',
            overlayStyle: '-rotate-1',
            alt: 'Page 2'
        },
        back: {
            paper: '/Guestbook_png/paper_page_LEFT.png',
            overlay: null,
            alt: 'Page 2 Back'
        }
    },
    {
        id: 3,
        type: 'cover', // Changed to cover for correct rounded styling
        front: {
            paper: '/Guestbook_png/BACK_SIDE_BOOK_LEFT.png',
            imageStyle: 'scale-x-[-1]',
            overlay: null,
            alt: 'Inside Back Cover'
        },
        back: {
            paper: '/Guestbook_png/BOOK_COVER_BACK.png',
            overlay: null,
            alt: 'Back Cover'
        }
    }
];

// --- Components ---

const FlippingSheet = ({
    sheet,
    index,
    spreadIndex,
    onFlipNext,
    onFlipPrev
}: {
    sheet: Sheet,
    index: number,
    spreadIndex: number,
    onFlipNext: () => void,
    onFlipPrev: () => void
}) => {
    // Logic: If spreadIndex > index, this sheet is flipped (Left side).
    const isFlipped = spreadIndex > index;

    // Z-Index Strategy
    const zIndex = isFlipped ? index : (50 - index);

    // Transition Logic:
    const zIndexDelay = isFlipped ? 0.4 : 0;

    return (
        <motion.div
            className="absolute top-0 left-1/2 h-full origin-left [transform-style:preserve-3d] cursor-pointer"
            style={{ width: '50.5%' }} // Pivot at exactly 50% center
            initial={false}
            animate={{ rotateY: isFlipped ? -180 : 0, zIndex }}
            transition={{
                duration: 0.8,
                ease: [0.645, 0.045, 0.355, 1],
                zIndex: { delay: zIndexDelay }
            }}
        >
            {/* FRONT FACE (Right Side) - Click to Flip NEXT (Left) */}
            <div
                className={`absolute inset-0 [backface-visibility:hidden] overflow-hidden shadow-md flex items-center justify-center ${sheet.type === 'cover' ? 'rounded-r-md' : 'bg-[#F3EFE6]'}`}
                onClick={(e) => { e.stopPropagation(); onFlipNext(); }}
            >
                {/* Paper/Cover Image */}
                <NextImage
                    src={sheet.front.src || sheet.front.paper || ''}
                    alt={sheet.front.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className={`object-cover ${sheet.front.imageStyle || ''}`}
                    priority={index < 2 || index === 3}
                />

                {/* Spine Depth Shadow (Right Page) */}
                <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black/25 via-black/5 to-transparent pointer-events-none z-20" />

                {/* Overlay Component (if exists) */}
                {sheet.front.overlay && (
                    <div className="absolute inset-0 flex items-center justify-center p-6 z-10 pointer-events-none">
                        <div className={`relative w-[90%] h-full ${sheet.front.overlayStyle || ''}`}>
                            <NextImage
                                src={sheet.front.overlay}
                                alt="Note"
                                fill
                                className="object-contain mix-blend-multiply opacity-90"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* BACK FACE (Left Side) - Click to Flip PREV (Right) */}
            <div
                className={`absolute inset-0 [backface-visibility:hidden] overflow-hidden shadow-md flex items-center justify-center [transform:rotateY(180deg)] ${sheet.type === 'cover' ? 'rounded-r-md' : 'bg-[#F3EFE6]'}`}
                onClick={(e) => { e.stopPropagation(); onFlipPrev(); }}
            >
                {/* Paper/Inner Cover Image */}
                <NextImage
                    src={sheet.back.src || sheet.back.paper || ''}
                    alt={sheet.back.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className={`object-cover ${sheet.type === 'cover' ? 'transform scale-x-[-1]' : ''} ${sheet.back.imageStyle || ''}`}
                    priority={index < 2 || index === 3}
                />

                {/* Spine Depth Shadow (Left Page) */}
                <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black/25 via-black/5 to-transparent pointer-events-none z-20" />

                {/* Overlay Component (if exists) */}
                {sheet.back.overlay && (
                    <div className="absolute inset-0 flex items-center justify-center p-6 z-10 pointer-events-none">
                        <div className={`relative w-[90%] h-full ${sheet.back.overlayStyle || ''}`}>
                            <NextImage
                                src={sheet.back.overlay}
                                alt="Note Back"
                                fill
                                className="object-contain mix-blend-multiply opacity-90"
                            />
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default function Guestbook() {
    const [spreadIndex, setSpreadIndex] = useState(0);

    const handleNext = () => {
        if (spreadIndex < SHEETS.length) setSpreadIndex(spreadIndex + 1);
    };

    const handlePrev = () => {
        if (spreadIndex > 0) setSpreadIndex(spreadIndex - 1);
    };

    return (
        <div className={`relative w-[500px] h-[350px] md:w-[600px] md:h-[420px] [perspective:1500px] mx-auto select-none group`}>

            {/* Spine Gutter (Hides sub-pixel gaps and adds realism) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[6px] h-full bg-black/60 z-0 shadow-[0_0_10px_rgba(0,0,0,0.5)]" />

            <div className="relative w-full h-full [transform-style:preserve-3d]">

                {/* === DYNAMIC SHEETS === */}
                {/* 
                   Sheet 0 = Cover
                   Sheet 1..N = Pages
                   Sheet N+1 = Back Cover (Acts as Base when Unflipped)
                */}
                {SHEETS.map((sheet, index) => (
                    <FlippingSheet
                        key={sheet.id}
                        sheet={sheet}
                        index={index}
                        spreadIndex={spreadIndex}
                        onFlipNext={handleNext}
                        onFlipPrev={handlePrev}
                    />
                ))}

            </div>

            {/* Simple Instructions */}
            <div className="absolute -bottom-12 left-0 right-0 text-center">
                <p className="text-xs font-mono text-charcoal/40 uppercase tracking-widest">
                    {spreadIndex === 0 ? "Click cover to open" : "Use pages to flip"}
                </p>
                <div className="mt-2 flex justify-center gap-4 text-xs opacity-50">
                    <button onClick={() => setSpreadIndex(0)} className="hover:underline">Reset</button>
                    <span>|</span>
                    <span>Spread: {spreadIndex} / {SHEETS.length}</span>
                </div>
            </div>
        </div>
    );
}

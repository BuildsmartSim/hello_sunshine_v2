import React from 'react';
import { fonts } from '@/design-system/tokens';

type ButtonVariant = 'deepDry' | 'ghostDry' | 'primary';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    children: React.ReactNode;
    className?: string;
}

export function Button({ variant = 'deepDry', children, className = '', ...props }: ButtonProps) {

    // Base styles + Variant styles
    let variantStyles = '';

    switch (variant) {
        case 'deepDry':
            // "The Deep Dry" (Standard) - User Selection #1
            // High contrast rim, handwriting font.
            variantStyles = `
                px-10 py-4 rounded-[2.5rem]
                bg-primary/10 text-charcoal font-bold
                shadow-[inset_0_0_0_4px_rgba(248,198,48,0.4),inset_0_0_10px_8px_rgba(212,163,42,0.3)]
                hover:shadow-[inset_0_0_0_4px_rgba(248,198,48,0.6),inset_0_0_15px_10px_rgba(212,163,42,0.5)]
                transition-all duration-500
            `;
            break;

        case 'ghostDry':
            // "Ghost Dry" - User Selection #8
            // Minimalist rim only, no fill.
            variantStyles = `
                px-10 py-4 rounded-[2.5rem]
                bg-transparent text-[#3E2723]/80 font-bold
                shadow-[inset_0_0_0_1px_rgba(62,39,35,0.2),inset_0_0_6px_rgba(62,39,35,0.1)]
                hover:shadow-[inset_0_0_0_1px_rgba(62,39,35,0.4),inset_0_0_10px_rgba(62,39,35,0.2)]
                transition-all duration-500
            `;
            break;

        case 'primary':
            // Fallback / Standard Primary (if needed)
            variantStyles = `
                px-10 py-4 rounded-full
                bg-primary text-charcoal font-bold
                hover:bg-primaryBright transition-colors
            `;
            break;
    }

    return (
        <button
            className={`${variantStyles} ${className} cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-[0.3em] font-black text-xs md:text-sm`}
            style={{ fontFamily: fonts.body }}
            {...props}
        >
            <span className="disable-selection">
                {children}
            </span>
        </button>
    );
}

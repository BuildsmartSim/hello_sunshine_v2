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
            variantStyles = `
                px-8 py-3 rounded-full border-2 border-primary
                bg-primary text-charcoal font-bold
                hover:bg-charcoal hover:text-primary hover:border-charcoal
                transition-all duration-300
            `;
            break;

        case 'ghostDry':
            variantStyles = `
                px-8 py-3 rounded-full border-2 border-charcoal/20
                bg-transparent text-charcoal/80 font-bold
                hover:border-charcoal hover:text-charcoal
                transition-all duration-300
            `;
            break;

        case 'primary':
            variantStyles = `
                px-8 py-3 rounded-full border-2 border-primary
                bg-primary text-charcoal font-bold
                hover:bg-charcoal hover:text-primary hover:border-charcoal
                transition-all duration-300
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

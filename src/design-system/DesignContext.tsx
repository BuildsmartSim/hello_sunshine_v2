"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * THE DESIGN VALUES
 * Pure visual properties that can be overridden per section.
 */
export interface DesignValues {
    // Vertical Rhythm
    sectionPaddingDesktop: number;
    sectionPaddingMobile: number;
    headerGapDesktop: number;
    headerGapMobile: number;
    sectionOverlap: number;

    // Typography
    headerInterlock: number;
    headerSubtitleGap: number;

    // Depth
    shadowIntensity: number;
    cardTilt: number;

    // Identity
    primaryColor: string;
    charcoalColor: string;

    // Layout
    siteWidth: number;
}

export interface DesignState {
    global: DesignValues;
    sectionOverrides: Record<string, Partial<DesignValues>>;
    selectedSectionId: string; // 'global' or a specific section ID
}

interface DesignContextType {
    state: DesignState;
    updateDesign: (updates: Partial<DesignValues>, scope?: string) => void;
    selectSection: (id: string) => void;
    getEffectiveDesign: (sectionId?: string) => DesignValues;
    resetDesign: () => void;
}

const DEFAULT_VALUES: DesignValues = {
    sectionPaddingDesktop: 128,
    sectionPaddingMobile: 96,
    headerGapDesktop: 48,
    headerGapMobile: 32,
    sectionOverlap: 48,
    headerInterlock: 0,
    headerSubtitleGap: 16,
    shadowIntensity: 1,
    cardTilt: 2,
    primaryColor: "#F8C630",
    charcoalColor: "#2C2C2C",
    siteWidth: 1440,
};

const DEFAULT_STATE: DesignState = {
    global: DEFAULT_VALUES,
    sectionOverrides: {
        sanctuary: {
            sectionPaddingDesktop: 148
        },
        guestbook: {
            sectionPaddingDesktop: 64,
            sectionOverlap: 45,
            siteWidth: 1296
        },
        hero: {
            shadowIntensity: 1
        },
        ticketing: {
            sectionPaddingDesktop: 160,
            sectionPaddingMobile: 120,
            sectionOverlap: 60
        }
    },
    selectedSectionId: 'global',
};

const DesignContext = createContext<DesignContextType | undefined>(undefined);

export function DesignProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<DesignState>(DEFAULT_STATE);
    const [isLoaded, setIsLoaded] = useState(false);

    // Initialize from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('hss-design-state-v9');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setState(prev => ({ // eslint-disable-line react-hooks/set-state-in-effect
                    ...prev,
                    global: { ...DEFAULT_VALUES, ...(parsed.global || parsed) }, // Support v2 upgrade
                    sectionOverrides: parsed.sectionOverrides || {},
                }));
            } catch (e) {
                console.error("Failed to parse saved design state", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // 1. Inject global design state into CSS Variables
    useEffect(() => {
        const root = document.documentElement;
        const v = state.global;
        root.style.setProperty('--hss-shadow-intensity', v.shadowIntensity.toString());
        root.style.setProperty('--hss-card-tilt', `${v.cardTilt}deg`);
        root.style.setProperty('--hss-primary', v.primaryColor);
        root.style.setProperty('--hss-charcoal', v.charcoalColor);
        root.style.setProperty('--hss-section-overlap', `${v.sectionOverlap}px`);
        root.style.setProperty('--hss-site-width', `${v.siteWidth}px`);

        if (isLoaded) {
            localStorage.setItem('hss-design-state-v9', JSON.stringify(state));
        }
    }, [state, isLoaded]);

    const selectSection = (id: string) => {
        setState(prev => ({ ...prev, selectedSectionId: id }));
    };

    const updateDesign = (updates: Partial<DesignValues>, scope?: string) => {
        const targetScope = scope || state.selectedSectionId;

        setState(prev => {
            if (targetScope === 'global') {
                return { ...prev, global: { ...prev.global, ...updates } };
            } else {
                return {
                    ...prev,
                    sectionOverrides: {
                        ...prev.sectionOverrides,
                        [targetScope]: { ...(prev.sectionOverrides[targetScope] || {}), ...updates }
                    }
                };
            }
        });
    };

    const getEffectiveDesign = (sectionId?: string): DesignValues => {
        if (!sectionId || sectionId === 'global') return state.global;
        const overrides = state.sectionOverrides[sectionId] || {};
        return { ...state.global, ...overrides };
    };

    const resetDesign = () => {
        setState(DEFAULT_STATE);
        localStorage.removeItem('hss-design-state-v9');
    };

    return (
        <DesignContext.Provider value={{ state, updateDesign, selectSection, getEffectiveDesign, resetDesign }}>
            <style jsx global>{`
                :root {
                    --hss-pad-v: ${state.global.sectionPaddingMobile}px;
                    --hss-gap-v: ${state.global.headerGapMobile}px;
                }
                @media (min-width: 1024px) {
                    :root {
                        --hss-pad-v: ${state.global.sectionPaddingDesktop}px;
                        --hss-gap-v: ${state.global.headerGapDesktop}px;
                    }
                }
            `}</style>
            {children}
        </DesignContext.Provider>
    );
}

export function useDesign() {
    const context = useContext(DesignContext);
    if (context === undefined) {
        throw new Error('useDesign must be used within a DesignProvider');
    }
    return context;
}

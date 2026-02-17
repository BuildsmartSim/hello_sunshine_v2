"use client";

import React from 'react';
import { useDesign, DesignValues } from '@/design-system/DesignContext';

const ControllerGroup = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="space-y-4 pb-6 border-b border-charcoal/10 last:border-0 last:pb-0">
        <h3 className="text-[10px] uppercase tracking-[0.2em] font-mono font-bold text-charcoal/40">{title}</h3>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const Slider = ({ label, value, min, max, unit = "px", field, onUpdate }: {
    label: string,
    value: number,
    min: number,
    max: number,
    unit?: string,
    field: keyof DesignValues,
    onUpdate: (updates: Partial<DesignValues>) => void
}) => (
    <div className="space-y-2">
        <div className="flex justify-between text-[11px] font-mono font-medium">
            <span className="text-charcoal/60">{label}</span>
            <span className="text-charcoal">{value}{unit}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={unit === "x" ? 0.1 : 1}
            value={value}
            onChange={(e) => onUpdate({ [field]: parseFloat(e.target.value) })}
            className="w-full accent-primary h-1 bg-charcoal/5 rounded-full appearance-none cursor-pointer"
        />
    </div>
);

export function DesignController() {
    const { state, updateDesign, selectSection, getEffectiveDesign, resetDesign } = useDesign();
    const currentValues = getEffectiveDesign(state.selectedSectionId);

    const sections = [
        { id: 'global', label: 'Global Defaults' },
        { id: 'hero', label: 'Hero Section' },
        { id: 'sanctuary', label: 'Sanctuary (Main)' },
        { id: 'ticketing', label: 'Festival Passes' },
        { id: 'guestbook', label: 'Guestbook' },
    ];

    return (
        <div className="w-80 bg-white/90 backdrop-blur-xl border border-charcoal/10 shadow-2xl p-6 rounded-2xl space-y-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-4">
                <div className="space-y-1">
                    <h2 className="text-sm font-bold uppercase tracking-widest">Design Control</h2>
                    <p className="text-[9px] font-mono text-charcoal/40 italic">Real-time Layout Tuning</p>
                </div>
                <button
                    onClick={resetDesign}
                    className="text-[10px] uppercase tracking-tighter font-bold text-red-500 hover:text-red-600 transition-colors"
                >
                    Reset
                </button>
            </div>

            {/* Scope Selector */}
            <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.2em] font-mono font-bold text-charcoal/40">Editing Scope</span>
                <select
                    value={state.selectedSectionId}
                    onChange={(e) => selectSection(e.target.value)}
                    className="w-full bg-charcoal/5 border border-charcoal/10 rounded-lg px-3 py-2 text-xs font-bold text-charcoal outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                >
                    {sections.map(s => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                </select>
            </div>

            {/* 1. Vertical Rhythm */}
            <ControllerGroup title="Vertical Rhythm">
                <Slider label="Section Padding (Desktop)" field="sectionPaddingDesktop" value={currentValues.sectionPaddingDesktop} min={0} max={256} onUpdate={updateDesign} />
                <Slider label="Section Padding (Mobile)" field="sectionPaddingMobile" value={currentValues.sectionPaddingMobile} min={0} max={128} onUpdate={updateDesign} />
                <Slider label="Header -> Content Gap" field="headerGapDesktop" value={currentValues.headerGapDesktop} min={0} max={128} onUpdate={updateDesign} />
                <Slider label="Section Overlap (Pull)" field="sectionOverlap" value={currentValues.sectionOverlap} min={0} max={200} onUpdate={updateDesign} />
            </ControllerGroup>

            {/* 2. Typography Lockup */}
            <ControllerGroup title="Typography Lockup">
                <Slider label="Header Line Interlock" field="headerInterlock" value={currentValues.headerInterlock} min={-40} max={40} onUpdate={updateDesign} />
                <Slider label="Title -> Subtitle Gap" field="headerSubtitleGap" value={currentValues.headerSubtitleGap} min={0} max={64} onUpdate={updateDesign} />
            </ControllerGroup>

            {/* 3. Deep Detail */}
            <ControllerGroup title="Deep Detail">
                <Slider label="Shadow Intensity" field="shadowIntensity" value={currentValues.shadowIntensity} min={0} max={2} unit="x" onUpdate={updateDesign} />
                <Slider label="Card Tilt" field="cardTilt" value={currentValues.cardTilt} min={-5} max={5} unit="deg" onUpdate={updateDesign} />
            </ControllerGroup>

            {/* 4. Global Colors */}
            <ControllerGroup title="Identity">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <span className="text-[11px] font-mono font-medium text-charcoal/60">Primary Color</span>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={currentValues.primaryColor}
                                onChange={(e) => updateDesign({ primaryColor: e.target.value })}
                                className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"
                            />
                            <code className="text-[11px] font-mono self-center px-2 py-1 bg-charcoal/5 rounded uppercase">{currentValues.primaryColor}</code>
                        </div>
                    </div>
                </div>
            </ControllerGroup>

            {/* 5. Layout & Canvas */}
            <ControllerGroup title="Layout & Canvas">
                <Slider
                    label="Site Max Width"
                    field="siteWidth"
                    value={currentValues.siteWidth}
                    min={1000}
                    max={1920}
                    unit="px"
                    onUpdate={updateDesign}
                />
            </ControllerGroup>

            {/* 6. Export / Bake */}
            <ControllerGroup title="Permanent Configuration">
                <div className="space-y-4">
                    <p className="text-[10px] text-charcoal/50 leading-relaxed italic">
                        Send this JSON to me to &quot;bake&quot; these settings as the new permanent defaults.
                    </p>

                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(JSON.stringify(state, null, 2));
                                alert("Design settings copied! Share this with your AI engineer.");
                            }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-charcoal text-white text-xs font-bold rounded-xl hover:bg-charcoal/90 transition-all active:scale-95 shadow-xl"
                        >
                            <span className="material-icons text-sm">content_copy</span>
                            Copy Design JSON
                        </button>

                        <div className="relative group/export">
                            <pre className="text-[9px] font-mono bg-charcoal/[0.03] p-4 rounded-xl overflow-x-auto max-h-40 border border-charcoal/5 leading-relaxed text-charcoal/60">
                                {JSON.stringify(state, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            </ControllerGroup>

            <div className="pt-4 text-[9px] font-mono text-center text-charcoal/30 flex flex-col gap-1">
                <span>Changes persist to local storage.</span>
                <span className="opacity-50">Repo: HelloSunshine_v2</span>
            </div>
        </div>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
import { getSeoAnswers, saveSeoAnswer } from '@/app/actions/seo';

const SEO_QUESTIONS = [
    {
        key: 'q1_pain_point',
        title: 'The "Pain Point"',
        q: 'Why do your best customers book with you? Are they looking to recover from a crazy festival weekend, seeking spiritual/wellness healing, or just looking for a fun group activity?'
    },
    {
        key: 'q2_feeling',
        title: 'The Feeling',
        q: 'What is the most common feeling or word people use right after they step out of your sauna? (e.g., Rejuvenated, grounded, cleansed)'
    },
    {
        key: 'q3_unique_traits',
        title: 'The Setup',
        q: 'If you had to describe the physical setup to a blind person, what are the most unique physical traits? (e.g., Wood-fired, vintage caravan, off-grid, mobile, cedar-lined)'
    },
    {
        key: 'q4_best_part',
        title: 'The Magic',
        q: 'What is the absolute best, most magical part of the experience that your competitors do not have?'
    },
    {
        key: 'q5_ideal_customer',
        title: 'The Ideal Customer',
        q: 'Describe your favorite customer. Are we mostly trying to attract individuals buying single tickets at a festival, or event organizers who want to hire the whole caravan for a weekend?'
    },
    {
        key: 'q6_location',
        title: 'The Geography',
        q: 'Do you only operate at specific festivals, or do you travel anywhere in the UK for private hire? If someone was searching for you on Google Maps, what exact phrases would they type in?'
    }
];

export default function SeoStrategyPage() {
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [savingStates, setSavingStates] = useState<Record<string, 'idle' | 'saving' | 'saved' | 'error'>>({});

    useEffect(() => {
        const loadAnswers = async () => {
            const data = await getSeoAnswers();
            setAnswers(data);
        };
        loadAnswers();
    }, []);

    const handleChange = (key: string, value: string) => {
        setAnswers(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async (key: string) => {
        setSavingStates(prev => ({ ...prev, [key]: 'saving' }));
        const currentAnswer = answers[key] || '';

        try {
            const success = await saveSeoAnswer(key, currentAnswer);
            if (success) {
                setSavingStates(prev => ({ ...prev, [key]: 'saved' }));
                setTimeout(() => {
                    setSavingStates(prev => ({ ...prev, [key]: 'idle' }));
                }, 2000);
            } else {
                setSavingStates(prev => ({ ...prev, [key]: 'error' }));
            }
        } catch (err) {
            setSavingStates(prev => ({ ...prev, [key]: 'error' }));
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="bg-white p-6 md:p-8 border border-neutral-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400 rotate-45 transform translate-x-16 -translate-y-16 group-hover:bg-yellow-300 transition-colors pointer-events-none" />
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-neutral-900 flex items-center gap-3">
                    <svg className="w-8 h-8 md:w-10 md:h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    SEO Discovery Profile
                </h1>
                <p className="font-mono text-sm text-neutral-500 max-w-2xl mt-4 leading-relaxed tracking-tight">
                    Answer these questions whenever you have a spare moment. These insights directly inform how we write the website&apos;s code so that Google puts you in front of the exact right customers.
                </p>
            </div>

            {/* Questions List */}
            <div className="space-y-6">
                {SEO_QUESTIONS.map((item, idx) => (
                    <div key={item.key} className="bg-white p-6 md:p-8 border border-neutral-200 relative group transition-colors hover:border-neutral-300">
                        {/* Question Number Badge */}
                        <div className="absolute -left-3 -top-3 w-8 h-8 bg-neutral-900 text-white font-mono text-sm font-bold flex items-center justify-center transform -rotate-6 shadow-md shadow-neutral-900/20 group-hover:rotate-0 transition-transform">
                            {idx + 1}
                        </div>

                        <div className="mb-4">
                            <h2 className="text-sm font-mono font-bold text-neutral-900 uppercase tracking-widest mb-1">
                                {item.title}
                            </h2>
                            <p className="text-neutral-600 font-medium leading-relaxed">
                                {item.q}
                            </p>
                        </div>

                        <div className="relative">
                            <textarea
                                value={answers[item.key] || ''}
                                onChange={(e) => handleChange(item.key, e.target.value)}
                                onBlur={() => handleSave(item.key)}
                                placeholder="Type your answer here... (It saves automatically when you click away)"
                                className="w-full min-h-[120px] p-4 bg-neutral-50 border border-neutral-200 text-neutral-900 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all resize-y"
                            />

                            {/* Save Status Indicator */}
                            <div className="absolute bottom-4 right-4 flex items-center gap-2 pointer-events-none">
                                {savingStates[item.key] === 'saving' && (
                                    <span className="text-xs font-mono font-bold text-neutral-400 flex items-center gap-1 bg-white/90 px-2 py-1 shadow-sm">
                                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        SAVING...
                                    </span>
                                )}
                                {savingStates[item.key] === 'saved' && (
                                    <span className="text-xs font-mono font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-1 shadow-sm border border-emerald-100">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        SAVED
                                    </span>
                                )}
                                {savingStates[item.key] === 'error' && (
                                    <span className="text-xs font-mono font-bold text-red-600 flex items-center gap-1 bg-red-50 px-2 py-1 shadow-sm border border-red-100">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        ERROR SAVING
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center pt-8 pb-12">
                <p className="font-mono text-xs text-neutral-400 uppercase tracking-widest">
                    Your answers are securely stored and automatically saved.
                </p>
            </div>
        </div>
    );
}

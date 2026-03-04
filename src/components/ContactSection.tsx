'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { StandardSection } from './StandardSection';
import { submitContactForm } from '@/app/actions/contact';
import { Button } from './Button';
import { Polaroid } from './Polaroid';

/* ─────────────────────────────────────────────
   CONTACT SECTION — "Say Hello"
   Editorial form, warm paper aesthetic, brand voice
   ───────────────────────────────────────────── */




export function ContactSection() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus('idle');
        setErrorMessage('');

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            message: formData.get('message') as string,
        };

        const result = await submitContactForm(data);

        if (result.success) {
            setStatus('success');
            (e.target as HTMLFormElement).reset();
        } else {
            setStatus('error');
            setErrorMessage(result.error || 'Something went wrong.');
        }
        setIsSubmitting(false);
    };

    return (
        <StandardSection id="contact" variant="naturalPaper" className="overflow-visible">
            {/* Watermark sun icon */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
                <Image
                    src="/icons/sun.png"
                    alt=""
                    width={600}
                    height={600}
                    className="opacity-[0.03] rotate-12"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-start relative z-10 w-full max-w-7xl mx-auto">

                {/* ── Text column (Now on the right) ── */}
                <div className="flex flex-col gap-6 md:pt-4 w-full flex-1 md:pl-6 lg:pl-20 md:order-2">

                    {/* Header */}
                    <div>
                        <h2 className="super-header mb-0">Say Hello</h2>
                        <div className="mt-4 flex items-center gap-4">
                            <div className="h-px flex-1 bg-charcoal/10" />
                            <p className="text-charcoal/40 text-[10px] md:text-xs font-mono uppercase tracking-[0.3em] font-bold shrink-0">
                                Let's talk
                            </p>
                        </div>
                    </div>

                    {/* Body copy */}
                    <p className="font-body text-charcoal/80 leading-relaxed text-lg lg:text-xl max-w-lg w-full">
                        Whether you're looking to book a private sanctuary, inquire about a festival, or just want to chat about the steam — we're here.
                    </p>

                    {/* Tim's voice */}
                    <p className="text-2xl mt-4 text-charcoal/70 handwritten-text" style={{ transform: 'rotate(-1deg)' }}>
                        "The fire's always on — drop us a note."
                    </p>

                    {/* Polaroid */}
                    <div className="mt-8 self-center lg:self-start">
                        <Polaroid
                            src="/optimized/polaroids/webp/night-fire-pit-heart-decor-chairs.webp"
                            label="Warm greetings."
                            rotation="rotate-[3deg]"
                            size="w-56 lg:w-72 shadow-xl"
                            className="hover:-rotate-1 hover:scale-105 transition-all duration-500"
                        />
                    </div>
                </div>

                {/* ── Form card (Now on the left) ── */}
                <div
                    className="relative w-full max-w-xl mr-auto md:ml-0 md:order-1"
                    style={{ transform: 'rotate(-0.8deg)' }}
                >
                    {/* Paper-texture card */}
                    <div
                        className="relative overflow-hidden"
                        style={{
                            backgroundColor: '#FDFAF3',
                            borderRadius: '4px',
                            boxShadow: '0 4px 24px rgba(44,44,44,0.08), 0 1px 4px rgba(44,44,44,0.06)',
                            border: '1px solid rgba(44,44,44,0.07)',
                        }}
                    >
                        {/* Subtle paper grain overlay */}
                        <div
                            className="absolute inset-0 pointer-events-none opacity-30 mix-blend-multiply"
                            style={{
                                backgroundImage: `url('/textures/paper.png')`,
                                backgroundSize: '400px',
                            }}
                        />

                        <div className="relative z-10 p-5 sm:p-8 md:p-10">
                            {status === 'success' ? (
                                <div className="flex flex-col items-center justify-center text-center py-12 gap-5">
                                    <div
                                        className="w-16 h-16 rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: 'rgba(248,198,48,0.15)' }}
                                    >
                                        <svg className="w-8 h-8" fill="none" stroke="#F8C630" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-display font-bold text-charcoal">Message Sent</h3>
                                    <p className="text-charcoal/50 font-body">We've received your note and will be in touch shortly.</p>
                                    <button
                                        onClick={() => setStatus('idle')}
                                        className="mt-4 text-sm font-body font-bold uppercase tracking-widest text-charcoal/40 hover:text-charcoal/80 transition-colors"
                                    >
                                        Send another →
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="flex flex-col gap-7">
                                    {status === 'error' && (
                                        <div className="p-4 bg-red-50 text-red-600 rounded text-sm border border-red-100">
                                            {errorMessage}
                                        </div>
                                    )}

                                    {/* Name */}
                                    <div className="flex flex-col gap-2 group">
                                        <label htmlFor="name" className="text-xs uppercase tracking-[0.4em] text-charcoal/70 font-bold px-4">
                                            Your name
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            required
                                            className="w-full bg-white/50 border border-charcoal/10 rounded-2xl px-6 py-4 text-xl text-charcoal outline-none transition-all focus:bg-white focus:shadow-xl focus:border-primary/50 group-hover:border-charcoal/30 font-body block"
                                            placeholder="First & last"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="flex flex-col gap-2 group">
                                        <label htmlFor="email" className="text-xs uppercase tracking-[0.4em] text-charcoal/70 font-bold px-4">
                                            Email address
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            required
                                            className="w-full bg-white/50 border border-charcoal/10 rounded-2xl px-6 py-4 text-xl text-charcoal outline-none transition-all focus:bg-white focus:shadow-xl focus:border-primary/50 group-hover:border-charcoal/30 font-body block"
                                            placeholder="hello@example.com"
                                        />
                                    </div>

                                    {/* Message */}
                                    <div className="flex flex-col gap-2 group">
                                        <label htmlFor="message" className="text-xs uppercase tracking-[0.4em] text-charcoal/70 font-bold px-4">
                                            Your message
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            rows={4}
                                            required
                                            className="w-full bg-white/50 border border-charcoal/10 rounded-2xl px-6 py-4 text-xl text-charcoal outline-none transition-all focus:bg-white focus:shadow-xl focus:border-primary/50 group-hover:border-charcoal/30 resize-none font-body block"
                                            placeholder="How can we help?"
                                        />
                                    </div>

                                    {/* Submit */}
                                    <Button
                                        type="submit"
                                        variant="deepDry"
                                        disabled={isSubmitting}
                                        className="w-full justify-center mt-2"
                                    >
                                        {isSubmitting ? 'Sending…' : 'Send Message'}
                                    </Button>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Drop shadow / lift effect */}
                    <div
                        className="absolute inset-0 -z-10 opacity-20 blur-md translate-y-3 translate-x-1"
                        style={{ backgroundColor: '#2C2C2C', borderRadius: '4px' }}
                    />
                </div>

            </div>
        </StandardSection>
    );
}

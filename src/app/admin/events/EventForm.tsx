'use client';

import React, { useState } from 'react';
import { saveEventAction } from '@/app/actions/event_management';
import { useRouter } from 'next/navigation';
import { PINOverrideModal } from '@/components/PINOverrideModal';
import { SEOAnalyzer } from '@/components/Admin/SEOAnalyzer';
import { useAdminRole } from '@/hooks/useAdminRole';
import { TIER_CATEGORIES } from '@/data/festivals';

const AVAILABLE_SERVICES = ['sauna', 'plunge', 'shower', 'tub', 'fire', 'heart', 'towels'];
const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIME_OPTIONS = Array.from({ length: 24 * 2 }).map((_, i) => {
    const hours = Math.floor(i / 2);
    const mins = i % 2 === 0 ? '00' : '30';
    return `${hours.toString().padStart(2, '0')}:${mins}`;
});

const PRICE_INCREMENTS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 150, 200];

export default function EventForm({ initialData }: { initialData?: any }) {
    const isAdmin = useAdminRole();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'ticketing' | 'seo'>('general');

    // Parse initial opening times from array of strings (e.g. "Mon: 09:00-17:00") into matrix state
    const defaultMatrix: Record<string, { isOpen: boolean, open: string, close: string }> = {};
    DAYS_OF_WEEK.forEach(d => {
        defaultMatrix[d] = { isOpen: false, open: '09:00', close: '17:00' };
    });

    if (initialData?.opening_times && Array.isArray(initialData.opening_times)) {
        initialData.opening_times.forEach((str: string) => {
            const [day, times] = str.split(':').map(s => s.trim());
            if (day && times) {
                const [open, close] = times.split('-').map(s => s.trim());
                if (defaultMatrix[day]) {
                    defaultMatrix[day] = { isOpen: true, open, close };
                }
            }
        });
    }

    const [formData, setFormData] = useState({
        id: initialData?.id || '',
        title: initialData?.title || '',
        location: initialData?.location || '',
        dates: initialData?.dates || '',
        description: initialData?.description || '',
        logo_src: initialData?.logo_src || '',
        featured_price: initialData?.featured_price || '',
        facilities: initialData?.facilities?.join(', ') || '',
        opening_times: defaultMatrix, // Now an object matrix
        external_url: initialData?.external_url || '',
        services: initialData?.services || [],
        tiers: initialData?.tiers || [],
        is_active: initialData?.is_active ?? true,
        is_featured: initialData?.is_featured ?? false,
        seo_title: initialData?.seo_title || '',
        seo_description: initialData?.seo_description || '',
        event_year: initialData?.event_year || new Date().getFullYear().toString(),
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMatrixChange = (day: string, field: 'isOpen' | 'open' | 'close', value: any) => {
        setFormData(prev => ({
            ...prev,
            opening_times: {
                ...prev.opening_times,
                [day]: { ...prev.opening_times[day], [field]: value }
            }
        }));
    };

    const handleServiceToggle = (service: string) => {
        setFormData(prev => {
            const newServices = prev.services.includes(service)
                ? prev.services.filter((s: string) => s !== service)
                : [...prev.services, service];
            return { ...prev, services: newServices };
        });
    };

    const addTier = () => {
        setFormData(prev => ({
            ...prev,
            tiers: [...prev.tiers, { id: `tier-${Date.now()}`, name: '', price: '0', description: '', stock_limit: '' }]
        }));
    };

    const updateTier = (index: number, field: string, value: string) => {
        setFormData(prev => {
            const newTiers = [...prev.tiers];
            newTiers[index] = { ...newTiers[index], [field]: value };
            return { ...prev, tiers: newTiers };
        });
    };

    const removeTier = (index: number) => {
        setFormData(prev => ({
            ...prev,
            tiers: prev.tiers.filter((_: any, i: number) => i !== index)
        }));
    };

    const requestSaveAuth = (e: React.FormEvent) => {
        e.preventDefault();
        if (isAdmin) {
            handleConfirmSave('');
        } else {
            setIsPinModalOpen(true);
        }
    };

    const handleConfirmSave = async (pin: string) => {
        setIsPinModalOpen(false);
        setIsLoading(true);
        setErrorMsg('');

        const payload = {
            ...formData,
            facilities: formData.facilities.split(',').map((s: string) => s.trim()).filter(Boolean),
            opening_times: formData.opening_times, // Leave as matrix for action to process
        };

        const res = await saveEventAction(payload, pin);
        if (res.success) {
            router.push('/admin/events');
        } else {
            setErrorMsg(res.error || 'Failed to save event');
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Tabs */}
            <div className="flex border-b border-neutral-200 bg-neutral-50/50">
                <button
                    type="button"
                    onClick={() => setActiveTab('general')}
                    className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === 'general' ? 'border-neutral-900 text-neutral-900 bg-white' : 'border-transparent text-neutral-500 hover:text-neutral-700'}`}
                >
                    General Details
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('ticketing')}
                    className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === 'ticketing' ? 'border-neutral-900 text-neutral-900 bg-white' : 'border-transparent text-neutral-500 hover:text-neutral-700'}`}
                >
                    Ticketing & Tiers
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('seo')}
                    className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === 'seo' ? 'border-neutral-900 text-neutral-900 bg-white' : 'border-transparent text-neutral-500 hover:text-neutral-700'}`}
                >
                    Meta & SEO
                </button>
            </div>

            <form onSubmit={requestSaveAuth} className="p-8 space-y-8 relative">
                {errorMsg && <div className="p-4 bg-red-50 text-red-600 font-bold border border-red-200 rounded-xl uppercase text-xs tracking-widest">{errorMsg}</div>}

                {/* GENERAL DETAILS TAB */}
                {activeTab === 'general' && (
                    <div className="space-y-8 animate-in fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2 font-mono">Event Title *</label>
                                <input required name="title" value={formData.title} onChange={handleChange} className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all font-bold" placeholder="e.g. Summer Solstice Retreat" />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2 font-mono">Location *</label>
                                <input required name="location" value={formData.location} onChange={handleChange} className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all font-bold" placeholder="e.g. The Secret Garden" />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2 font-mono">Dates String *</label>
                                <input required name="dates" value={formData.dates} onChange={handleChange} className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all font-bold" placeholder="e.g. 21st - 23rd June" />
                                <p className="text-[10px] text-neutral-400 mt-1 uppercase tracking-widest">How it appears on cards</p>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2 font-mono">Event Year (Historic Tag) *</label>
                                <select required name="event_year" value={formData.event_year} onChange={handleChange} className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all font-bold">
                                    <option value="2024">2024</option>
                                    <option value="2025">2025</option>
                                    <option value="2026">2026</option>
                                    <option value="2027">2027</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2 font-mono">Full Description *</label>
                                <textarea required name="description" value={formData.description} onChange={handleChange} className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all min-h-[120px]" placeholder="Detailed description of what to expect..." />
                            </div>

                            <div className="md:col-span-2 border-t border-neutral-100 pt-6">
                                <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-4 font-mono">Weekly Opening Matrix</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {DAYS_OF_WEEK.map(day => {
                                        const dayData = formData.opening_times[day];
                                        return (
                                            <div key={day} className={`p-4 rounded-xl border transition-all ${dayData.isOpen ? 'border-neutral-900 bg-neutral-50 shadow-sm' : 'border-neutral-200 bg-white opacity-60'}`}>
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="font-bold text-sm uppercase">{day}</span>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input type="checkbox" checked={dayData.isOpen} onChange={(e) => handleMatrixChange(day, 'isOpen', e.target.checked)} className="sr-only peer" />
                                                        <div className="w-9 h-5 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-neutral-900"></div>
                                                    </label>
                                                </div>
                                                {dayData.isOpen && (
                                                    <div className="flex items-center gap-2 animate-in fade-in zoom-in-95">
                                                        <select value={dayData.open} onChange={(e) => handleMatrixChange(day, 'open', e.target.value)} className="w-full text-xs p-2 bg-white border border-neutral-200 rounded-lg">
                                                            {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                                        </select>
                                                        <span className="text-neutral-400 text-xs">-</span>
                                                        <select value={dayData.close} onChange={(e) => handleMatrixChange(day, 'close', e.target.value)} className="w-full text-xs p-2 bg-white border border-neutral-200 rounded-lg">
                                                            {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                                        </select>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="md:col-span-2 border-t border-neutral-100 pt-6">
                                <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-4 font-mono">Available Services</label>
                                <div className="flex flex-wrap gap-3">
                                    {AVAILABLE_SERVICES.map(svc => {
                                        const isSelected = formData.services.includes(svc);
                                        return (
                                            <label key={svc} className={`flex items-center space-x-2 cursor-pointer px-4 py-3 rounded-xl border transition-all ${isSelected ? 'bg-neutral-900 border-neutral-900 text-white shadow-md transform scale-[1.02]' : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-neutral-400'}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleServiceToggle(svc)}
                                                    className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-0"
                                                />
                                                <span className="text-sm font-bold capitalize">{svc}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TICKETING & TIERS TAB */}
                {activeTab === 'ticketing' && (
                    <div className="space-y-8 animate-in fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-amber-50/50 p-6 rounded-2xl border border-amber-100">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2 font-mono">Event Logo / Ticket Background URL</label>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <select
                                        value={['/HSSLOGO black YELLOW.png', '/ticket_background.png', '/canvas-background.png'].includes(formData.logo_src) ? formData.logo_src : (formData.logo_src ? 'custom' : '')}
                                        onChange={(e) => {
                                            if (e.target.value !== 'custom') {
                                                setFormData(prev => ({ ...prev, logo_src: e.target.value }));
                                            }
                                        }}
                                        className="w-full sm:w-1/3 p-4 bg-white border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 font-bold"
                                    >
                                        <option value="">No Logo</option>
                                        <option value="/HSSLOGO black YELLOW.png">Default Yellow/Black</option>
                                        <option value="/ticket_background.png">Paper Ticket Background</option>
                                        <option value="/canvas-background.png">Canvas Background</option>
                                        <option value="custom">Custom URL...</option>
                                    </select>
                                    <input
                                        name="logo_src"
                                        value={formData.logo_src}
                                        onChange={handleChange}
                                        className="flex-1 p-4 bg-white border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 transition-all font-mono text-sm"
                                        placeholder="Or type a custom image/logo URL..."
                                    />
                                </div>
                                <p className="text-[10px] text-amber-600 mt-2 font-bold uppercase tracking-widest">This image appears on the digital ticket pass and the event overview card.</p>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2 font-mono">Host Festival / External Website URL (Optional)</label>
                                <input name="external_url" value={formData.external_url} onChange={handleChange} className="w-full p-4 bg-white border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 transition-all font-mono text-sm" placeholder="https://external-festival-site.com" />
                                <p className="text-[10px] text-amber-600 mt-2 font-bold uppercase tracking-widest">A button will appear on the event details page linking guests back to the main festival site.</p>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2 font-mono">Featured "From" Price</label>
                                <select name="featured_price" value={formData.featured_price} onChange={handleChange} className="w-full p-4 bg-white border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 transition-all font-bold">
                                    <option value="">Hide from price</option>
                                    {PRICE_INCREMENTS.map(p => (
                                        <option key={p} value={`£${p}`}>£{p}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-xl font-black text-neutral-900">Local Ticket Tiers</h3>
                                    <p className="text-xs text-neutral-500 font-mono uppercase tracking-widest mt-1">Stripe products will be generated automatically</p>
                                </div>
                                <button type="button" onClick={addTier} className="px-6 py-3 bg-neutral-900 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-neutral-800 transition-transform active:scale-95 shadow-md flex items-center gap-2">
                                    <span>+ Add Tier</span>
                                </button>
                            </div>

                            {formData.tiers.length === 0 ? (
                                <div className="p-12 border-2 border-dashed border-neutral-200 rounded-2xl text-center bg-neutral-50">
                                    <p className="text-sm text-neutral-500 font-bold">No local tickets configured.</p>
                                    <p className="text-xs text-neutral-400 mt-2 font-mono uppercase tracking-widest">Will use external URL or act as display only.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {formData.tiers.map((tier: any, idx: number) => (
                                        <div key={idx} className="p-6 border border-neutral-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow relative group">
                                            <button type="button" onClick={() => removeTier(idx)} className="absolute top-4 right-4 text-neutral-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all bg-red-50 p-2 rounded-lg">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>

                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pr-12">
                                                <div className="md:col-span-4 flex items-center gap-3 border-b border-neutral-100 pb-4 mb-2">
                                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-neutral-900 text-white text-xs font-black">{idx + 1}</span>
                                                    <span className="text-[10px] font-mono text-neutral-400 lowercase italic tracking-wide">ID: {tier.id}</span>
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1 font-mono">Tier Name</label>
                                                    <input required value={tier.name} onChange={(e) => updateTier(idx, 'name', e.target.value)} list={`tier-suggestions-${idx}`} className="w-full text-base font-bold p-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-neutral-900" placeholder="e.g. Early Birds" />
                                                    <datalist id={`tier-suggestions-${idx}`}>
                                                        {TIER_CATEGORIES.map(c => <option key={c} value={c} />)}
                                                    </datalist>
                                                    <p className="text-[10px] text-neutral-400 mt-1 uppercase tracking-widest font-mono">Start with a known category (e.g. Early Birds) to auto-sort.</p>
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1 font-mono">Price</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">£</span>
                                                        <select required value={tier.price?.replace('£', '')} onChange={(e) => updateTier(idx, 'price', e.target.value)} className="w-full text-base font-bold pl-8 p-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-neutral-900 appearance-none">
                                                            {PRICE_INCREMENTS.map(p => (
                                                                <option key={p} value={p}>{p}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1 font-mono">Stock Limit (Empty = ∞)</label>
                                                    <input type="number" min="1" value={tier.stock_limit || ''} onChange={(e) => updateTier(idx, 'stock_limit', e.target.value)} className="w-full text-base font-bold p-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-neutral-900" placeholder="∞" />
                                                </div>

                                                <div className="md:col-span-4">
                                                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1 font-mono">Perks / Description</label>
                                                    <input required value={tier.description} onChange={(e) => updateTier(idx, 'description', e.target.value)} className="w-full text-sm p-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-neutral-900" placeholder="Includes full weekend access and complimentary towel..." />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* META & SEO TAB */}
                {activeTab === 'seo' && (
                    <div className="space-y-8 animate-in fade-in">
                        <div className="bg-neutral-900 rounded-2xl p-8 text-white">
                            <h3 className="text-xl font-black mb-2">Search Engine Optimization</h3>
                            <p className="text-sm text-neutral-400 font-mono">Customize how this event appears on Google, Facebook, and Twitter.</p>

                            <div className="mt-8 space-y-6">
                                <div>
                                    <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2 font-mono">Meta Title (Max 60 chars recommended)</label>
                                    <input name="seo_title" value={formData.seo_title} onChange={handleChange} placeholder={formData.title || "Enter an SEO optimized title..."} className="w-full p-4 bg-neutral-800 border border-neutral-700 rounded-xl focus:ring-2 focus:ring-white text-white font-bold transition-all placeholder:text-neutral-600" />
                                    <div className="flex justify-end mt-1">
                                        <span className={`text-[10px] uppercase font-mono tracking-widest ${formData.seo_title.length > 60 ? 'text-red-400' : 'text-neutral-500'}`}>{formData.seo_title.length}/60 chars</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest mb-2 font-mono">Meta Description (Max 160 chars recommended)</label>
                                    <textarea name="seo_description" value={formData.seo_description} onChange={handleChange} placeholder="Write a compelling meta description to improve click-through rates..." className="w-full p-4 bg-neutral-800 border border-neutral-700 rounded-xl focus:ring-2 focus:ring-white text-white font-medium transition-all min-h-[120px] placeholder:text-neutral-600"></textarea>
                                    <div className="flex justify-end mt-1">
                                        <span className={`text-[10px] uppercase font-mono tracking-widest ${formData.seo_description.length > 160 ? 'text-red-400' : 'text-neutral-500'}`}>{formData.seo_description.length}/160 chars</span>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-neutral-800">
                                    <label className="block text-xs font-black text-white uppercase tracking-widest mb-4 font-mono">Live Google Preview</label>
                                    <div className="bg-white p-6 rounded-xl">
                                        <SEOAnalyzer
                                            title={formData.seo_title || formData.title}
                                            description={formData.seo_description}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="pt-8 flex justify-between items-center border-t border-neutral-100">
                    <button type="button" onClick={() => router.push('/admin/events')} className="px-6 py-4 font-black text-neutral-400 hover:text-neutral-900 uppercase tracking-widest text-xs transition-colors">
                        Discard & Return
                    </button>
                    <button type="submit" disabled={isLoading} className="px-10 py-4 bg-neutral-900 text-white font-black rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] hover:shadow-[0_10px_40px_-5px_rgba(0,0,0,0.7)] hover:-translate-y-1 transition-all disabled:opacity-50 text-xs uppercase tracking-[0.2em]">
                        {isLoading ? 'Encrypting...' : 'Save Configuration'}
                    </button>
                </div>
            </form>

            <PINOverrideModal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                onSuccess={handleConfirmSave}
                title="Authorization Required"
                description={`Enter Manager PIN to save this event configuration.`}
            />
        </div>
    );
}

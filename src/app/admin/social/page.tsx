'use client';

import { useState, useTransition, useRef, useCallback } from 'react';
import { LivePreview } from '@/components/social/LivePreview';
import type { TemplateStyle } from '@/components/social/SunshineTemplate';

type Platform = 'facebook' | 'instagram';
type MediaType = 'image' | 'video';

interface PublishResult {
    success: boolean;
    imageUrl?: string;
    results?: Record<string, unknown>;
    errors?: Record<string, string>;
    error?: string;
}

const TEMPLATE_OPTIONS: { id: TemplateStyle; label: string; description: string }[] = [
    { id: 'festival', label: '🌅 Festival', description: 'Warm amber gradient — great for events' },
    { id: 'announcement', label: '📢 Announcement', description: 'Deep charcoal + gold — news & updates' },
];

const PLATFORM_OPTIONS: { id: Platform; label: string }[] = [
    { id: 'facebook', label: 'Facebook' },
    { id: 'instagram', label: 'Instagram' },
];

export default function SocialPublisherPage() {
    const [style, setStyle] = useState<TemplateStyle>('festival');
    const [headline, setHeadline] = useState('');
    const [body, setBody] = useState('');
    const [caption, setCaption] = useState('');
    const [targets, setTargets] = useState<Platform[]>(['instagram', 'facebook']);
    const [bgDataUrl, setBgDataUrl] = useState<string | undefined>();
    const [mediaType, setMediaType] = useState<MediaType>('image');
    const [rawFile, setRawFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [result, setResult] = useState<PublishResult | null>(null);
    const [isPending, startTransition] = useTransition();

    const [isAIPending, startAITransition] = useTransition();

    const fileInputRef = useRef<HTMLInputElement>(null);

    /* ── Photo/Video handlers ─────────────────────────────────────────────── */

    const handleFile = useCallback((file: File) => {
        const isVideo = file.type.startsWith('video/');
        const isImage = file.type.startsWith('image/');
        if (!isVideo && !isImage) return;

        setMediaType(isVideo ? 'video' : 'image');
        setRawFile(file);

        if (isVideo) {
            setBgDataUrl(URL.createObjectURL(file));
        } else {
            const reader = new FileReader();
            reader.onload = (e) => setBgDataUrl(e.target?.result as string);
            reader.readAsDataURL(file);
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };

    /* ── AI Magic Polish ────────────────────────────────────────────── */

    const handleMagicPolish = () => {
        // Use either the caption, body, or headline as the prompt basis
        const promptText = caption || body || headline;
        if (!promptText.trim()) {
            alert('Please enter some text in the caption or headline first so the AI knows what to write about!');
            return;
        }

        startAITransition(async () => {
            try {
                const res = await fetch('/api/social/ai-assist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: promptText, type: mediaType })
                });
                const data = await res.json();
                if (data.success) {
                    if (data.headline) setHeadline(data.headline);
                    if (data.caption) {
                        setCaption(data.caption + '\n\n' + (data.hashtags || ''));
                        // Optionally update body if they haven't set it
                        if (!body) setBody(data.caption.slice(0, 100) + '...');
                    }
                } else {
                    alert('AI failed: ' + data.error);
                }
            } catch (err: any) {
                alert('AI error: ' + err.message);
            }
        });
    };

    /* ── Publish handler ────────────────────────────────────────────── */

    const togglePlatform = (p: Platform) =>
        setTargets((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);

    const handlePublish = () => {
        if (!headline.trim() && mediaType !== 'video') return;
        
        startTransition(async () => {
            setResult(null);
            try {
                let finalMediaUrl = bgDataUrl;

                // If video, we must upload it to Supabase first
                if (mediaType === 'video' && rawFile) {
                    const ext = rawFile.name.split('.').pop() || 'mp4';
                    const fileName = `video-${Date.now()}.${ext}`;
                    
                    // 1. Get signed URL
                    const urlRes = await fetch('/api/social/upload-url', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ fileName })
                    });
                    const urlData = await urlRes.json();
                    if (!urlData.success) throw new Error(urlData.error);

                    // 2. Upload directly
                    const uploadRes = await fetch(urlData.signedUrl, {
                        method: 'PUT',
                        headers: { 'Content-Type': rawFile.type },
                        body: rawFile
                    });
                    
                    if (!uploadRes.ok) throw new Error('Failed to upload video to storage');

                    finalMediaUrl = urlData.publicUrl;
                }

                // 3. Publish
                const res = await fetch('/api/social/publish', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        style, headline, body,
                        caption: caption || headline,
                        bgImageUrl: finalMediaUrl,
                        targets,
                        mediaType
                    }),
                });
                setResult(await res.json());
            } catch (err: any) {
                setResult({ success: false, error: err.message });
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-800">Social Publisher</h2>
                    <p className="text-sm text-neutral-500 font-mono mt-1">
                        Design a post or Reel and publish to Facebook &amp; Instagram
                    </p>
                </div>
            </div>

            {/* Credential reminder */}
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <span className="text-blue-500 text-lg mt-0.5">ℹ</span>
                <div>
                    <p className="text-sm font-bold text-blue-800">Ensure Meta is configured</p>
                    <p className="text-xs text-blue-700 mt-0.5 font-mono">
                        Publishing requires Meta credentials. You can set up your Facebook and Instagram integration in the <a href="/admin/settings" className="underline font-bold">Admin Settings</a> page.
                    </p>
                </div>
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">

                {/* ── LEFT: Composer ──────────────────────────────────────────── */}
                <div className="space-y-5">

                    {/* 1. Template Style */}
                    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-4">
                        <h3 className="text-xs font-bold text-neutral-600 uppercase tracking-widest font-mono">
                            1 · Format & Style
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {TEMPLATE_OPTIONS.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setStyle(t.id)}
                                    className={`text-left p-4 rounded-lg border-2 transition-all ${style === t.id
                                            ? 'border-neutral-900 bg-neutral-900 text-white shadow-md'
                                            : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-neutral-400'
                                        }`}
                                >
                                    <p className="font-bold text-sm">{t.label}</p>
                                    <p className={`text-xs mt-1 font-mono leading-snug ${style === t.id ? 'text-neutral-300' : 'text-neutral-400'}`}>
                                        {t.description}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 2. Background Photo / Video */}
                    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-4">
                        <h3 className="text-xs font-bold text-neutral-600 uppercase tracking-widest font-mono">
                            2 · Photo or Video
                            <span className="ml-2 normal-case font-normal text-neutral-400">(optional)</span>
                        </h3>

                        {/* Drop zone */}
                        <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer transition-all min-h-[140px] ${isDragging
                                    ? 'border-neutral-900 bg-neutral-100'
                                    : bgDataUrl
                                        ? 'border-neutral-300 bg-neutral-50'
                                        : 'border-neutral-200 bg-neutral-50 hover:border-neutral-400 hover:bg-white'
                                }`}
                        >
                            {bgDataUrl ? (
                                /* Thumbnail preview */
                                <div className="flex items-center gap-4 w-full px-4">
                                    {mediaType === 'video' ? (
                                        <video
                                            src={bgDataUrl}
                                            className="w-16 h-16 object-cover rounded-lg shadow-sm flex-shrink-0"
                                            muted
                                        />
                                    ) : (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={bgDataUrl}
                                            alt="Background preview"
                                            className="w-16 h-16 object-cover rounded-lg shadow-sm flex-shrink-0"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-neutral-700">{mediaType === 'video' ? 'Video' : 'Photo'} selected</p>
                                        <p className="text-xs text-neutral-400 font-mono mt-0.5">Click to change</p>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setBgDataUrl(undefined); setRawFile(null); setMediaType('image'); }}
                                        className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-200 hover:bg-red-100 hover:text-red-600 text-neutral-500 flex items-center justify-center text-xs transition-colors font-bold"
                                        title="Remove media"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <span className="text-3xl">📱</span>
                                    <p className="text-sm font-bold text-neutral-600">
                                        {isDragging ? 'Drop it!' : 'Drop a photo or video, or click to browse'}
                                    </p>
                                    <p className="text-xs font-mono text-neutral-400">
                                        JPG, PNG, MP4, MOV · From your device
                                    </p>
                                </>
                            )}
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/*"
                            className="sr-only"
                            onChange={handleFileChange}
                        />

                        <p className="text-xs text-neutral-400 font-mono">
                            💡 Tip: For Reels, select a video. For static posts, use a square photo.
                        </p>
                    </div>

                    {/* 3. Content */}
                    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xs font-bold text-neutral-600 uppercase tracking-widest font-mono">3 · Content</h3>
                            <button 
                                onClick={handleMagicPolish}
                                disabled={isAIPending}
                                className="flex items-center gap-1.5 text-xs font-bold bg-fuchsia-50 hover:bg-fuchsia-100 text-fuchsia-600 px-3 py-1.5 rounded-full transition-colors border border-fuchsia-200 disabled:opacity-50"
                            >
                                {isAIPending ? '⏳ Thinking...' : '🪄 AI Magic Polish'}
                            </button>
                        </div>

                        {mediaType === 'image' && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider font-mono">Headline (Visual Overlay) *</label>
                                <input
                                    type="text"
                                    value={headline}
                                    onChange={(e) => setHeadline(e.target.value)}
                                    placeholder="e.g. Summer Sauna Festival"
                                    maxLength={60}
                                    className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-neutral-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-neutral-400 placeholder:font-normal placeholder:text-neutral-300"
                                />
                                <p className="text-xs text-neutral-400 font-mono text-right">{headline.length}/60</p>
                            </div>
                        )}

                        {mediaType === 'image' && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider font-mono">Sub-copy (Visual Overlay)</label>
                                <textarea
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    placeholder="Short description shown on the visual"
                                    maxLength={120}
                                    rows={2}
                                    className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 resize-none placeholder:text-neutral-300"
                                />
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider font-mono">
                                Post Caption
                                <span className="ml-1 normal-case font-normal text-neutral-400">(text below the post)</span>
                            </label>
                            <textarea
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                placeholder="Write something rough, then click AI Magic Polish! ✨"
                                maxLength={2200}
                                rows={6}
                                className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 resize-none placeholder:text-neutral-300"
                            />
                            <p className="text-xs text-neutral-400 font-mono text-right">{caption.length}/2200</p>
                        </div>
                    </div>

                    {/* 4. Platforms */}
                    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 space-y-4">
                        <h3 className="text-xs font-bold text-neutral-600 uppercase tracking-widest font-mono">4 · Publish To</h3>
                        <div className="flex gap-3">
                            {PLATFORM_OPTIONS.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => togglePlatform(p.id)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border-2 transition-all text-sm font-bold ${targets.includes(p.id)
                                            ? 'border-neutral-900 bg-neutral-900 text-white'
                                            : 'border-neutral-200 text-neutral-500 hover:border-neutral-400'
                                        }`}
                                >
                                    {p.label} {mediaType === 'video' && p.id === 'instagram' ? '(Reel)' : ''}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Publish */}
                    <button
                        onClick={handlePublish}
                        disabled={isPending || (!headline.trim() && mediaType !== 'video') || !targets.length}
                        className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all shadow-sm ${isPending || (!headline.trim() && mediaType !== 'video') || !targets.length
                                ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                                : 'bg-neutral-900 text-white hover:bg-neutral-800 hover:shadow-md active:scale-[0.99]'
                            }`}
                    >
                        {isPending ? '⏳ Generating & publishing…' : '🚀 Publish Post'}
                    </button>

                    {/* Result */}
                    {result && (
                        <div className={`rounded-xl border p-4 text-sm font-mono space-y-2 ${result.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
                            }`}>
                            {result.success ? (
                                <>
                                    <p className="font-bold">✓ Published successfully</p>
                                    {result.imageUrl && (
                                        <p>
                                            Media:{' '}
                                            <a href={result.imageUrl} target="_blank" rel="noreferrer" className="underline">
                                                View in Supabase Storage
                                            </a>
                                        </p>
                                    )}
                                    {result.results && (
                                        <pre className="text-xs bg-white/60 rounded p-2 overflow-auto max-h-32">
                                            {JSON.stringify(result.results, null, 2)}
                                        </pre>
                                    )}
                                    {result.errors && Object.keys(result.errors).length > 0 && (
                                        <p className="text-amber-700 font-bold">
                                            ⚠ Some platforms failed:{' '}
                                            {Object.entries(result.errors).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                        </p>
                                    )}
                                </>
                            ) : (
                                <p className="font-bold">✗ {result.error}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* ── RIGHT: Live Preview ─────────────────────────────────────── */}
                <div className="sticky top-24">
                    {mediaType === 'image' ? (
                        <LivePreview style={style} headline={headline} body={body} bgImageUrl={bgDataUrl} />
                    ) : (
                        <div className="bg-black text-white rounded-xl overflow-hidden shadow-2xl relative aspect-[9/16] w-full max-w-[360px] mx-auto flex flex-col justify-end">
                            {bgDataUrl ? (
                                <video src={bgDataUrl} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-neutral-600 bg-neutral-900">
                                    <span className="text-sm font-mono uppercase tracking-widest">No Video Selected</span>
                                </div>
                            )}
                            
                            {/* Reel UI Overlay */}
                            <div className="relative z-10 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-white/20"></div>
                                    <span className="font-bold text-sm">hellosunshine</span>
                                </div>
                                <p className="text-sm line-clamp-2">
                                    {caption || "Write an engaging caption and use the AI to generate hashtags!"}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

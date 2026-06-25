/**
 * POST /api/social/publish
 *
 * Generates the visual template image, then publishes to Facebook and/or Instagram.
 *
 *  ┌─ NOTE: Meta credentials are stubbed until credentials are available ─┐
 *  │  Set these env vars in .env.local to enable live posting:            │
 *  │  META_ACCESS_TOKEN     — Long-lived Page Access Token                │
 *  │  META_FB_PAGE_ID       — Facebook Page ID                            │
 *  │  META_IG_USER_ID       — Instagram Business Account ID               │
 *  └───────────────────────────────────────────────────────────────────────┘
 *
 * Body: {
 *   style: "festival" | "announcement",
 *   headline: string,
 *   body: string,
 *   bgImageUrl?: string,
 *   caption: string,          // The text caption for the social post
 *   targets: ("facebook" | "instagram")[],
 * }
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

const META_API_BASE = 'https://graph.facebook.com/v19.0';

/* ── Helpers ────────────────────────────────────────────────────────────────── */

async function generateImage(postData: object, baseUrl: string): Promise<string> {
    const res = await fetch(`${baseUrl}/api/social/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Image generation failed');
    return json.url as string;
}

async function postToFacebook(imageUrl: string, caption: string, token?: string, pageId?: string, mediaType: 'image' | 'video' = 'image'): Promise<object> {
    if (!pageId || !token) {
        // ── STUB: credentials not yet configured ──────────────────────────────
        console.log('[social/publish] Facebook stub — would post:', { imageUrl, caption, mediaType });
        return { stubbed: true, platform: 'facebook', imageUrl, message: caption, mediaType };
    }

    const endpoint = mediaType === 'video' ? `/${pageId}/videos` : `/${pageId}/photos`;
    const mediaParam = mediaType === 'video' ? 'file_url' : 'url';
    const messageParam = mediaType === 'video' ? 'description' : 'message';

    const res = await fetch(
        `${META_API_BASE}${endpoint}?${mediaParam}=${encodeURIComponent(imageUrl)}&${messageParam}=${encodeURIComponent(caption)}&access_token=${token}`,
        { method: 'POST' }
    );
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Facebook post failed');
    return json;
}

async function postToInstagram(imageUrl: string, caption: string, token?: string, igUserId?: string, mediaType: 'image' | 'video' = 'image'): Promise<object> {
    if (!igUserId || !token) {
        // ── STUB: credentials not yet configured ──────────────────────────────
        console.log('[social/publish] Instagram stub — would post:', { imageUrl, caption, mediaType });
        return { stubbed: true, platform: 'instagram', imageUrl, message: caption, mediaType };
    }

    // Step A: Create media container
    const mediaParams = mediaType === 'video' 
        ? `media_type=REELS&video_url=${encodeURIComponent(imageUrl)}`
        : `image_url=${encodeURIComponent(imageUrl)}`;
        
    const containerRes = await fetch(
        `${META_API_BASE}/${igUserId}/media?${mediaParams}&caption=${encodeURIComponent(caption)}&access_token=${token}`,
        { method: 'POST' }
    );
    const container = await containerRes.json();
    if (!containerRes.ok) throw new Error(container.error?.message || 'IG container creation failed');

    // Step B: Publish the container
    const publishRes = await fetch(
        `${META_API_BASE}/${igUserId}/media_publish?creation_id=${container.id}&access_token=${token}`,
        { method: 'POST' }
    );
    const published = await publishRes.json();
    if (!publishRes.ok) throw new Error(published.error?.message || 'IG publish failed');
    return published;
}

/* ── Route handler ──────────────────────────────────────────────────────────── */

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { style, headline, body: templateBody, bgImageUrl, caption, targets = [], mediaType = 'image' } = body as {
            style: string;
            headline: string;
            body: string;
            bgImageUrl?: string;
            caption: string;
            targets: string[];
            mediaType?: 'image' | 'video';
        };

        if (!targets.length) {
            return NextResponse.json({ error: 'No platforms selected' }, { status: 400 });
        }

        // Determine base URL for internal API calls
        const host =
            process.env.NEXT_PUBLIC_SITE_URL ||
            (req.headers.get('host') ? `http://${req.headers.get('host')}` : 'http://localhost:3000');

        // Fetch credentials from admin_settings
        const { data: settings } = await supabaseAdmin
            .from('admin_settings')
            .select('meta_access_token, meta_fb_page_id, meta_ig_user_id')
            .eq('id', 'default')
            .single();

        const token = settings?.meta_access_token;
        const fbPageId = settings?.meta_fb_page_id;
        const igUserId = settings?.meta_ig_user_id;

        let finalMediaUrl = '';

        if (mediaType === 'video') {
            // For video, bgImageUrl is already the public URL uploaded to Supabase
            if (!bgImageUrl) throw new Error('Video URL is required for video posts');
            finalMediaUrl = bgImageUrl;
        } else {
            /* 1. Generate image */
            finalMediaUrl = await generateImage({ style, headline, body: templateBody, bgImageUrl }, host);
        }

        /* 2. Post to selected platforms in parallel */
        const results: Record<string, unknown> = {};
        const errors: Record<string, string> = {};

        await Promise.allSettled(
            targets.map(async (platform: string) => {
                try {
                    if (platform === 'facebook') results.facebook = await postToFacebook(finalMediaUrl, caption, token, fbPageId, mediaType);
                    if (platform === 'instagram') results.instagram = await postToInstagram(finalMediaUrl, caption, token, igUserId, mediaType);
                } catch (e: unknown) {
                    errors[platform] = e instanceof Error ? e.message : String(e);
                }
            })
        );

        return NextResponse.json({ success: true, imageUrl: finalMediaUrl, results, errors });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('[social/publish]', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

/**
 * POST /api/social/generate-image
 *
 * Generates a 1080×1080 PNG social media image using Satori with:
 *  - The real Hello Sunshine logo (fetched from /public)
 *  - Chicle font loaded from the local TTF file
 *
 * Then uploads the PNG to Supabase Storage and returns the public URL.
 */

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getSiteOrigin } from '@/lib/site-origin';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { createClient } from '@supabase/supabase-js';
import { readFile } from 'fs/promises';
import path from 'path';
import React from 'react';
import { SunshineTemplate, type TemplateStyle } from '@/components/social/SunshineTemplate';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Required: @resvg/resvg-js uses native Node bindings

const CANVAS_SIZE = 1080;

/* ── Supabase admin client ───────────────────────────────────────────────── */
function getSupabase() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Supabase env vars not configured');
    return createClient(url, key);
}

/* ── Site base URL (used so Satori can resolve the /public logo) ─────────── */
function getSiteUrl(): string {
    return getSiteOrigin();
}

/* ── Load Chicle from local TTF (fast, no network call) ──────────────────── */
async function loadFonts() {
    const chicleFile = path.join(process.cwd(), 'src', 'app', '_fonts', 'Chicle-Regular.ttf');
    const [chicleData, interData] = await Promise.all([
        readFile(chicleFile),
        readFile(path.join(process.cwd(), 'src', 'app', '_fonts', 'Inter-Regular.ttf')),
    ]);

    return [
        {
            name: 'Chicle',
            data: chicleData,
            weight: 400 as const,
            style: 'normal' as const,
        },
        { name: 'Inter', data: interData, weight: 400 as const, style: 'normal' as const },
    ];
}

export async function POST(req: Request) {
    const auth = await requireAdmin();
    if (!auth.authorized) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 401 });
    }
    try {
        const body = await req.json();
        const { style = 'festival', headline = '', body: caption = '', bgImageUrl } = body as {
            style?: TemplateStyle;
            headline?: string;
            body?: string;
            bgImageUrl?: string;
        };

        const siteUrl = getSiteUrl();

        /* 1. Generate SVG via Satori ──────────────────────────────────────────── */
        const fonts = await loadFonts();

        const svg = await satori(
            React.createElement(SunshineTemplate, {
                style,
                headline,
                body: caption,
                bgImageUrl,
                siteUrl,
                scale: 1,
            }),
            { width: CANVAS_SIZE, height: CANVAS_SIZE, fonts }
        );

        /* 2. Convert SVG → PNG ────────────────────────────────────────────────── */
        const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: CANVAS_SIZE } });
        const pngData = resvg.render().asPng();

        /* 3. Upload to Supabase Storage ──────────────────────────────────────── */
        const supabase = getSupabase();
        const fileName = `social-${Date.now()}.png`;

        const { error: uploadError } = await supabase.storage
            .from('social-images')
            .upload(fileName, pngData, { contentType: 'image/png', upsert: false });

        if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

        const { data: urlData } = supabase.storage.from('social-images').getPublicUrl(fileName);

        return NextResponse.json({ success: true, url: urlData.publicUrl, fileName });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('[generate-image]', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

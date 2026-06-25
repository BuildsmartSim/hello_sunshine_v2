import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { fileName } = body;

        if (!fileName) {
            return NextResponse.json({ error: 'fileName is required' }, { status: 400 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // We use createSignedUploadUrl to allow the client to upload directly
        const { data, error } = await supabase.storage
            .from('social-images')
            .createSignedUploadUrl(fileName);

        if (error) {
            throw error;
        }

        // We also need to return the future public URL of this file
        const { data: publicUrlData } = supabase.storage
            .from('social-images')
            .getPublicUrl(fileName);

        return NextResponse.json({ 
            success: true, 
            signedUrl: data.signedUrl, 
            token: data.token,
            path: data.path,
            publicUrl: publicUrlData.publicUrl 
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('[upload-url]', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

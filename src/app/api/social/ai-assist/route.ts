import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { text, type } = body as { text: string; type: 'image' | 'video' };

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const prompt = `You are a social media expert for 'Hello Sunshine', a premium wood-fired sauna festival and wellness brand.
The user wants to post about: "${text}"
The post is for ${type === 'video' ? 'an Instagram Reel / Facebook Video' : 'an Instagram/Facebook Image post'}.

Please generate:
1. A very short, punchy 'headline' (max 60 chars). For images, this will go on the visual overlay. For video, this is the hook text.
2. An engaging social media caption. Use emojis appropriately. Keep it exciting but premium.
3. 5-8 relevant hashtags.

Return exactly in this JSON format:
{
  "headline": "...",
  "caption": "...",
  "hashtags": "#hello #sunshine ..."
}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json'
            }
        });

        const resultText = response.text || '{}';
        const result = JSON.parse(resultText);

        return NextResponse.json({ success: true, ...result });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('[ai-assist]', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

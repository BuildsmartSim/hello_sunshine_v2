import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import { searchSerper } from '@/utils/agents/serper';
import { scrapeUrl } from '@/utils/agents/firecrawl';
import { verifyCronAuth } from '@/lib/auth';

const NEGATIVE_TERMS = " -site:timeout.com -site:the-independent.com -site:cntraveller.com -site:theguardian.com -site:gq-magazine.co.uk -site:countryandtownhouse.com -site:instagram.com -site:tiktok.com -site:facebook.com -inurl:blog -inurl:article -inurl:news";

const SYSTEM_PROMPT = `
You are an AI scouting for a premium mobile wood-fired sauna business called 'Hello Sunshine'. 
We are looking for B2B partnerships, boutique wellness integrations, and pop-up events at INDIVIDUAL festivals or physical locations. 

CRITICAL RULE:
If the website is a news article, a listicle (e.g., "The 50 Best Festivals", "Top 10 Glamping Sites"), an aggregator, or a blog post discussing multiple events, you MUST set the vibe_score to 0 and state "Listicle/Article - Not a direct lead" in the vibe_notes. We ONLY want websites belonging to a single, specific festival or location.

Your task is to analyze the provided markdown text from a website and return a JSON object with the following structure:
{
  "name": "The specific name of the festival or spot (NOT the title of an article)",
  "location_name": "The specific city, county, or region this event takes place in. (e.g. 'Brighton, East Sussex')",
  "emails": ["list of contact emails found"],
  "vibe_score": An integer from 1 to 100,
  "vibe_notes": "A short summary of *why* you gave this score based on their website copy."
}

Scoring Rules (if it's a valid single target):
- We need locations or events with outdoor space, water access, and a crowd that appreciates high-quality relaxation.
- Prioritize festivals that explicitly mention 'boutique camping', 'VIP areas', 'healing fields', or 'wellness sanctuaries'. Give these high scores (80-100).
- If the site is a wild swimming club or luxury glamping site, give it a high score (80-100).
- If it seems like a generic corporate event or an indoor location, give it a low score (< 40).

Return ONLY valid JSON.
`;

export const maxDuration = 300;

async function geocodeLocation(locationName: string): Promise<{ lat: number, lng: number } | null> {
    if (!locationName || locationName.trim() === '') return null;
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=1`, {
            headers: {
                'User-Agent': 'HelloSunshineApp/1.0'
            }
        });
        const data = await res.json();
        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
            };
        }
    } catch (e) {
        console.error(`Geocoding failed for ${locationName}`, e);
    }
    return null;
}

export async function GET(request: Request) {
    if (!verifyCronAuth(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = new URL(request.url).searchParams;
    const isManual = searchParams.get('key') === process.env.CRON_SECRET;

    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const country = searchParams.get('country') || 'UK';
        const region = searchParams.get('region') || '';
        const city = searchParams.get('city') || '';
        const eventType = searchParams.get('type') || 'boutique festival';

        // Construct dynamic query
        const locationTokens = [city, region, country].filter(Boolean).map(t => `"${t}"`).join(' ');
        const query = `${eventType} ${locationTokens} "tickets"${NEGATIVE_TERMS}`;

        const randomPage = Math.floor(Math.random() * 5) + 1; // Deep crawl mitigation
        console.log(`[Discovery] Running search for: "${query}" (Page ${randomPage})`);

        const searchResults = await searchSerper(query, randomPage);
        if (!searchResults.length) {
            return NextResponse.json({ message: 'No search results found.' });
        }

        const processedUrls: string[] = [];
        let addedCount = 0;

        const limitStr = searchParams.get('limit');
        const searchLimit = limitStr ? parseInt(limitStr, 10) : 5;

        for (const result of searchResults.slice(0, searchLimit)) {
            const url = result.link;

            const { data: existing } = await supabase
                .from('discovery_leads')
                .select('id')
                .eq('url', url)
                .single();

            if (existing) {
                console.log(`[Discovery] Skipping existing URL: ${url}`);
                continue;
            }

            console.log(`[Discovery] Scraping ${url}...`);

            const markdown = await scrapeUrl(url);
            if (!markdown) {
                console.log(`[Discovery] Could not scrape ${url}, skipping.`);
                continue;
            }

            console.log(`[Discovery] Analyzing markdown for ${url}...`);

            try {
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: [
                        { text: SYSTEM_PROMPT },
                        { text: `WEBSITE MARKDOWN:\n\n${markdown.substring(0, 50000)}` }
                    ],
                    config: {
                        responseMimeType: 'application/json',
                    }
                });

                const jsonText = String((response as any).text);
                if (!jsonText) throw new Error("No text response from Gemini");

                const extractedData = JSON.parse(jsonText);

                const isFestival =
                    query.includes('festival') ||
                    extractedData.name?.toLowerCase().includes('festival');

                const type = isFestival ? 'festival' : 'popup_spot';

                const score = extractedData.vibe_score || 0;
                if (score < 40) {
                    console.log(`[Discovery] Rejected lead ${url} - Score too low (${score}).`);
                    continue;
                }

                // Geocode the extracted location string
                console.log(`[Discovery] Geocoding location: ${extractedData.location_name}`);
                const coords = await geocodeLocation(extractedData.location_name || city || region || country);

                const { error: insertError } = await supabase
                    .from('discovery_leads')
                    .insert({
                        type,
                        name: extractedData.name || result.title,
                        url,
                        location_name: extractedData.location_name || '',
                        latitude: coords?.lat || null,
                        longitude: coords?.lng || null,
                        emails: Array.isArray(extractedData.emails) ? extractedData.emails : [],
                        vibe_score: score,
                        vibe_notes: extractedData.vibe_notes || '',
                        source: isManual ? 'manual' : 'cron',
                        status: 'PENDING'
                    });

                if (insertError) {
                    console.error(`[Discovery] DB Insert Error for ${url}:`, insertError);
                } else {
                    console.log(`[Discovery] successfully added: ${extractedData.name} at ${coords?.lat}, ${coords?.lng}`);
                    addedCount++;
                    processedUrls.push(url);
                }
            } catch (geminiError) {
                console.error(`[Discovery] Gemini Extraction Error for ${url}:`, geminiError);
            }
        }

        return NextResponse.json({
            success: true,
            query,
            processed: processedUrls.length,
            added: addedCount
        });

    } catch (err: any) {
        console.error("[Discovery] Global Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import { searchSerper } from '@/utils/agents/serper';
import { scrapeUrl } from '@/utils/agents/firecrawl';



const NEGATIVE_TERMS = " -site:timeout.com -site:the-independent.com -site:cntraveller.com -site:theguardian.com -site:gq-magazine.co.uk -site:countryandtownhouse.com -inurl:blog -inurl:article -inurl:news";

const QUERIES = [
    `UK boutique festival "camping" "tickets"${NEGATIVE_TERMS}`,
    `independent music festival UK "lineup" "tickets"${NEGATIVE_TERMS}`,
    `UK wellness retreat festival "sauna"${NEGATIVE_TERMS}`,
    `small holistic gatherings UK  "healing"${NEGATIVE_TERMS}`,
    `UK wild swimming club${NEGATIVE_TERMS}`,
    `boutique glamping site UK "sauna"${NEGATIVE_TERMS}`,
    `UK trail running event "village"${NEGATIVE_TERMS}`
];

const SYSTEM_PROMPT = `
You are an AI scouting for a premium mobile wood-fired sauna business called 'Hello Sunshine'. 
We are looking for B2B partnerships, boutique wellness integrations, and pop-up events at INDIVIDUAL festivals or physical locations. 

CRITICAL RULE:
If the website is a news article, a listicle (e.g., "The 50 Best Festivals", "Top 10 Glamping Sites"), an aggregator, or a blog post discussing multiple events, you MUST set the vibe_score to 0 and state "Listicle/Article - Not a direct lead" in the vibe_notes. We ONLY want websites belonging to a single, specific festival or location.

Your task is to analyze the provided markdown text from a website and return a JSON object with the following structure:
{
  "name": "The specific name of the festival or spot (NOT the title of an article)",
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

export async function GET(request: Request) {
    // 1. Check authorization (Vercel Cron or manual admin)
    const authHeader = request.headers.get('authorization');
    const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;
    const isManual = new URL(request.url).searchParams.get('key') === process.env.CRON_SECRET;

    if (!isVercelCron && !isManual && process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        // 2. Select a random query and random page offset to avoid hitting the exact same results
        const query = QUERIES[Math.floor(Math.random() * QUERIES.length)];
        const randomPage = Math.floor(Math.random() * 5) + 1; // Google pages 1 to 5
        console.log(`[Discovery] Running search for: "${query}" (Page ${randomPage})`);

        // 3. Search Serper
        const searchResults = await searchSerper(query, randomPage);
        if (!searchResults.length) {
            return NextResponse.json({ message: 'No search results found.' });
        }

        const processedUrls: string[] = [];
        let addedCount = 0;

        // Process top 15 results to skip over SEO listicles
        for (const result of searchResults.slice(0, 15)) {
            const url = result.link;

            // 4. Check if URL already exists in DB
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

            // 5. Scrape with Firecrawl
            const markdown = await scrapeUrl(url);
            if (!markdown) {
                console.log(`[Discovery] Could not scrape ${url}, skipping.`);
                continue;
            }

            console.log(`[Discovery] Analyzing markdown for ${url}...`);

            // 6. Extract with Gemini
            try {
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: [
                        { text: SYSTEM_PROMPT },
                        { text: `WEBSITE MARKDOWN:\n\n${markdown.substring(0, 50000)}` } // Limit to 50k chars
                    ],
                    config: {
                        responseMimeType: 'application/json',
                    }
                });

                // Use type assertion to avoid TS complaining about the getter
                const jsonText = String((response as any).text);
                if (!jsonText) throw new Error("No text response from Gemini");

                const extractedData = JSON.parse(jsonText);

                // Determine Type rough guess
                const isFestival =
                    query.includes('festival') ||
                    extractedData.name?.toLowerCase().includes('festival');

                const type = isFestival ? 'festival' : 'popup_spot';

                // Extremely strict filtering
                const score = extractedData.vibe_score || 0;
                if (score < 40) {
                    console.log(`[Discovery] Rejected lead ${url} - Score too low (${score}). Notes: ${extractedData.vibe_notes}`);
                    continue;
                }

                // 7. Save to DB
                const { error: insertError } = await supabase
                    .from('discovery_leads')
                    .insert({
                        type,
                        name: extractedData.name || result.title,
                        url,
                        emails: Array.isArray(extractedData.emails) ? extractedData.emails : [],
                        vibe_score: score,
                        vibe_notes: extractedData.vibe_notes || '',
                        source: isManual ? 'manual' : 'cron',
                        status: 'PENDING'
                    });

                if (insertError) {
                    console.error(`[Discovery] DB Insert Error for ${url}:`, insertError);
                } else {
                    console.log(`[Discovery] successfully added: ${extractedData.name}`);
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

export async function scrapeUrl(url: string): Promise<string | null> {
    try {
        const apiKey = process.env.FIRECRAWL_API_KEY;
        if (!apiKey) throw new Error('FIRECRAWL_API_KEY is not configured');
        if (!url.trim()) throw new Error('URL cannot be empty');

        // Use the REST API directly: the SDK still depends on vulnerable Zod 3.
        const apiUrl = (process.env.FIRECRAWL_API_URL ?? 'https://api.firecrawl.dev').replace(/\/$/, '');
        const request = () => fetch(`${apiUrl}/v2/scrape`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: url.trim(), formats: ['markdown'] }),
            signal: AbortSignal.timeout(300_000),
            cache: 'no-store',
        });
        let response = await request();
        // Preserve the SDK's bounded retry behavior for temporary gateway errors.
        for (let attempt = 0; response.status === 502 && attempt < 2; attempt++) {
            await response.body?.cancel();
            await new Promise(resolve => setTimeout(resolve, 500 * 2 ** attempt));
            response = await request();
        }
        if (!response.ok) throw new Error(`Firecrawl request failed (${response.status})`);

        const result = await response.json() as {
            success?: boolean;
            data?: { markdown?: unknown };
        } | null;
        if (result?.success !== true) throw new Error('Firecrawl scrape failed');
        const markdown = result.data?.markdown;
        return typeof markdown === 'string' && markdown ? markdown : null;
    } catch (error) {
        // Do not log upstream bodies or request objects containing credentials.
        console.error('Firecrawl scrape failed:', error instanceof Error ? error.message : 'Unknown error');
        return null;
    }
}

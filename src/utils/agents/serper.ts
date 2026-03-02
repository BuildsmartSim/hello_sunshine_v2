export interface SerperResult {
    title: string;
    link: string;
    snippet: string;
}

export async function searchSerper(query: string, page: number = 1): Promise<SerperResult[]> {
    const url = 'https://google.serper.dev/search';
    const apiKey = process.env.SERPER_API_KEY;

    if (!apiKey) {
        console.error('SERPER_API_KEY is not set');
        return [];
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'X-API-KEY': apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: query,
                gl: 'uk', // Google location: UK
                hl: 'en', // Language: English
                page: page
            })
        });

        if (!response.ok) {
            console.error(`Serper API error: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error(text);
            return [];
        }

        const data = (await response.json()) as { organic?: SerperResult[] };
        return data.organic || [];
    } catch (error) {
        console.error(`Error querying Serper for '${query}':`, error);
        return [];
    }
}

import type { MetadataRoute } from 'next';
import { getFestivalData, createSlug } from '@/data/festivals';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hellosunshinesauna.com';

    // 1. Static Pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/tickets`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
    ];

    try {
        // 2. Dynamic Event Pages
        const events = await getFestivalData();

        const eventPages: MetadataRoute.Sitemap = events.map((event) => ({
            url: `${baseUrl}/tickets/${createSlug(event.title)}`,
            lastModified: new Date(), // Could be created_at if available
            changeFrequency: 'daily',
            priority: 0.8,
        }));

        return [...staticPages, ...eventPages];
    } catch (error) {
        console.error('Sitemap generation error:', error);
        // If fetching fails, at least return static pages so Google has something
        return staticPages;
    }
}

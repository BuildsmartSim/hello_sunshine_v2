import 'server-only';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { EventData } from './festivals';
import { unstable_cache } from 'next/cache';

// Inner function that does the actual DB fetching
const fetchEventsFromDB = async (): Promise<EventData[]> => {
    try {
        console.log('[DEBUG] fetchEventsFromDB: Querying app_events directly...');
        const { data, error } = await supabaseAdmin
            .from('app_events')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: true });

        if (error) {
            console.error("[DEBUG] fetchEventsFromDB: Supabase Error during fetch:", error.message || error);
            return [];
        }

        if (!data) {
            console.warn("[DEBUG] fetchEventsFromDB: Supabase returned null data.");
            return [];
        }

        console.log(`[DEBUG] fetchEventsFromDB: Successfully received ${data.length} raw events.`);

        return data.map((event: any): EventData => ({
            id: event.id,
            title: event.title,
            location: event.location,
            dates: event.dates,
            description: event.description,
            logoSrc: event.logo_src,
            featuredPrice: event.featured_price,
            facilities: event.facilities || [],
            tiers: event.tiers || [],
            openingTimes: event.opening_times || [],
            externalUrl: event.external_url || '',
            services: event.services || [],
            isFeatured: event.is_featured || false,
            seoTitle: event.seo_title || '',
            seoDescription: event.seo_description || '',
        }));
    } catch (err) {
        console.error("Failed to fetch festival data from DB:", err);
        return [];
    }
};

/**
 * Fetches all active events.
 * Wrapped in Next.js unstable_cache to prevent overwhelming Supabase.
 * Revalidates automatically every 60 seconds.
 */
export const getFestivalData = unstable_cache(
    async () => {
        return await fetchEventsFromDB();
    },
    ['festival-data-cache'],
    {
        revalidate: 60,
        tags: ['events']
    }
);

import { textures } from '@/design-system/tokens';
import { supabaseAdmin } from '@/lib/supabaseAdmin';


export const TIER_CATEGORIES = [
    'Early Birds',
    'Full Weekend',
    'Full Weekend Couples',
    'Single Session',
    'Crew',
    'Traders',
    'UC/Benefits Claimants',
    'Other'
];

export function sortTiersByType(tiers: TicketSubTier[]): TicketSubTier[] {
    return [...tiers].sort((a, b) => {
        // Find if the tier name STARTS WITH any of our predefined categories. 
        // This allows them to add extra info (e.g. "Early Birds - Saturday") but still sort correctly.
        let indexA = TIER_CATEGORIES.findIndex(cat => a.name.startsWith(cat));
        let indexB = TIER_CATEGORIES.findIndex(cat => b.name.startsWith(cat));

        indexA = indexA === -1 ? TIER_CATEGORIES.length : indexA;
        indexB = indexB === -1 ? TIER_CATEGORIES.length : indexB;

        return indexA - indexB;
    });
}

/**
 * Safely formats a ticket price string to ensure it has a £ symbol if it is a monetary value.
 * Ignores empty values and strings like "Free" or "Donate".
 */
export function formatTicketPrice(price: string): string {
    if (!price) return "";

    const trimmed = price.trim();
    // If it already has a pound sign, or it's a non-numeric word like "Free"
    if (trimmed.startsWith('£') || isNaN(Number(trimmed.replace(/,/g, '')))) {
        return trimmed;
    }

    return `£${trimmed}`;
}

/**
 * Creates a URL-friendly slug from an event title.
 * e.g. "Avalon Dance Odyssey" -> "avalon-dance-odyssey"
 */
export function createSlug(title: string): string {
    if (!title) return "";
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric characters with hyphens
        .replace(/(^-|-$)+/g, ''); // Remove leading and trailing hyphens
}

export type TicketSubTier = {
    id: string;
    name: string;
    price: string;
    description: string;
    stock_limit?: number | null;
};

export type EventData = {
    id: string;
    title: string;
    location: string;
    dates: string;
    description: string;
    logoSrc: string;
    featuredPrice: string;
    facilities: string[];
    tiers: TicketSubTier[];
    openingTimes: string[];
    externalUrl: string;
    services: ('sauna' | 'plunge' | 'shower' | 'tub' | 'fire' | 'heart' | 'towels')[];
    isFeatured: boolean;
    seoTitle?: string;
    seoDescription?: string;
};

export const SERVICE_ICONS: Record<string, string> = {
    sauna: '/icons/sauna.png',
    plunge: '/icons/plunge-pool.png',
    shower: '/icons/shower.png',
    tub: '/icons/hot-tub.png',
    fire: '/icons/fire-pit.png',
    heart: '/icons/heart.png',
    towels: '/icons/towels.png'
};

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


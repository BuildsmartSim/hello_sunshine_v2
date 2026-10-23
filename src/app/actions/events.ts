'use server';

import { getFestivalData } from '@/data/festivals.server';

export async function getEventsAction() {
    try {
        console.log('[DEBUG] getEventsAction: Starting fetch...');
        const events = await getFestivalData();
        console.log(`[DEBUG] getEventsAction: Successfully fetched ${events.length} events.`);
        return events;
    } catch (error: any) {
        console.error('[DEBUG] getEventsAction: Failed to fetch events:', error.message || error);
        return [];
    }
}

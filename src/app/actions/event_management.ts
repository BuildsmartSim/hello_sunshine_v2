'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';

import { requireAdminOrPin } from '@/lib/auth';

export async function saveEventAction(eventData: any, pin?: string) {
    try {
        const auth = await requireAdminOrPin(pin);
        if (!auth.authorized) throw new Error(auth.error);

        // 1. Upsert the event into app_events
        const eventToSave = { ...eventData };
        if (eventToSave.opening_times && typeof eventToSave.opening_times !== 'string') {
            // New Matrix format comes in as an object/array, we should stringify it or save it directly if it's a JSON column.
            // Currently app_events.opening_times is likely text[] or jsonb. Assuming it's a JSONB or text array.
            eventToSave.opening_times = Object.keys(eventToSave.opening_times).map(day => {
                const dayData = eventToSave.opening_times[day];
                if (!dayData.isOpen) return null;
                return `${day}: ${dayData.open}-${dayData.close}`;
            }).filter(Boolean);
        }

        if (!eventToSave.id) {
            delete eventToSave.id; // Let supabase generate ID if creating new
        }

        const { data: savedEvent, error: eventError } = await supabaseAdmin
            .from('app_events')
            .upsert(eventToSave)
            .select()
            .single();

        if (eventError) throw eventError;

        // 2. We need a location_id for products. 
        let locationId = 'b0f807df-6228-4ad0-bab8-868c2ee886a1'; // arbitrary fallback if no DB sync works
        if (eventData.location) {
            const { data: existingLoc } = await supabaseAdmin
                .from('locations')
                .select('id')
                .eq('name', eventData.location)
                .single();

            if (existingLoc) {
                locationId = existingLoc.id;
            } else {
                const { data: newLoc } = await supabaseAdmin
                    .from('locations')
                    .insert({ name: eventData.location, type: 'pop_up', is_active: true })
                    .select('id')
                    .single();
                if (newLoc) locationId = newLoc.id;
            }
        }

        // 3. Upsert products for each tier
        if (eventData.tiers && Array.isArray(eventData.tiers)) {
            for (const tier of eventData.tiers) {
                const stockLimit = (tier.stock_limit !== undefined && tier.stock_limit !== null && tier.stock_limit !== '')
                    ? parseInt(tier.stock_limit.toString(), 10)
                    : null;

                // Parse price into pence (e.g. "£45" -> 4500, "45.50" -> 4550)
                let pricePence = 0;
                if (tier.price) {
                    const numMatch = tier.price.toString().replace(/[^\d.]/g, ''); // strip £
                    const floatPrice = parseFloat(numMatch);
                    if (!isNaN(floatPrice)) {
                        pricePence = Math.round(floatPrice * 100);
                    }
                }

                const { data: existingProduct } = await supabaseAdmin
                    .from('products')
                    .select('id')
                    .eq('price_id', tier.id)
                    .single();

                if (existingProduct) {
                    await supabaseAdmin.from('products').update({
                        name: tier.name,
                        stock_limit: stockLimit,
                        location_id: locationId,
                        price_amount_pence: pricePence
                    }).eq('id', existingProduct.id);
                } else {
                    await supabaseAdmin.from('products').insert({
                        price_id: tier.id,
                        name: tier.name,
                        stock_limit: stockLimit,
                        location_id: locationId,
                        price_amount_pence: pricePence,
                        is_scheduled: false
                    });
                }
            }
        }

        revalidatePath('/admin');
        revalidatePath('/admin/events');
        revalidatePath('/');
        return { success: true, eventId: savedEvent.id };
    } catch (error) {
        console.error('Failed to save event:', error);
        return { success: false, error: (error as any).message };
    }
}

export async function deleteEventAction(eventId: string, pin?: string) {
    try {
        const auth = await requireAdminOrPin(pin);
        if (!auth.authorized) throw new Error(auth.error);

        const { error } = await supabaseAdmin
            .from('app_events')
            .delete()
            .eq('id', eventId);

        if (error) throw error;

        revalidatePath('/admin');
        revalidatePath('/admin/events');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete event:', error);
        return { success: false, error: (error as any).message };
    }
}

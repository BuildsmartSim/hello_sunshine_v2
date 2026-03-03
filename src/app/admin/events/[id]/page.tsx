import React from 'react';
import EventForm from '../EventForm';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const revalidate = 0;

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch the event
    const { data: event, error: eventError } = await supabaseAdmin
        .from('app_events')
        .select('*')
        .eq('id', id)
        .single();

    if (eventError || !event) {
        return <div className="p-8 text-neutral-500">Event not found.</div>;
    }

    // Fetch stock limits from products for the tiers
    const processedTiers = await Promise.all((event.tiers || []).map(async (tier: any) => {
        let stock_limit = '';
        if (tier && tier.id) {
            const { data: product } = await supabaseAdmin
                .from('products')
                .select('stock_limit')
                .eq('price_id', tier.id)
                .single();
            stock_limit = product?.stock_limit ?? '';
        }

        return {
            ...tier,
            stock_limit
        };
    }));

    const initialData = {
        ...event,
        logoSrc: event.logo_src,
        featuredPrice: event.featured_price,
        openingTimes: event.opening_times,
        externalUrl: event.external_url,
        tiers: processedTiers
    };

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Edit Event: {event.title}</h1>
                    <p className="text-neutral-500 mt-1">Update event details and ticket tiers.</p>
                </div>
                <Link href="/admin" className="text-sm font-bold text-neutral-500 hover:text-neutral-800 transition-colors">
                    &larr; Back to Dashboard
                </Link>
            </div>

            <EventForm initialData={initialData} />
        </div>
    );
}

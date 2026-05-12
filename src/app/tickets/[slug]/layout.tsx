import { Metadata, ResolvingMetadata } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type Props = {
    params: Promise<{ slug: string }>;
};

import { getFestivalData } from '@/data/festivals';
import { createSlug } from '@/data/festivals';

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { slug } = await params;

    // Fetch data using the cached getFestivalData to match the slug
    const events = await getFestivalData();
    const event = events.find((e) => createSlug(e.title) === slug);

    if (!event) {
        // Fallback: try to reconstruct title from the slug
        const fallbackTitle = slug
            ? slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
            : 'Event';

        return {
            title: `${fallbackTitle} | Hello Sunshine Sauna`,
            description: "Book your tickets for this elemental sanctuary experience.",
        };
    }

    // Fallback to standard title/description if SEO specific ones aren't provided
    const title = event.seoTitle || event.title;
    const description = event.seoDescription || event.description;

    // Ensure image URL is absolute
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hellosunshinesauna.com';
    const images = event.logoSrc ? [{ url: `${baseUrl}${event.logoSrc}` }] : [];

    return {
        title: `${title} | Hello Sunshine Sauna`,
        description,
        alternates: {
            canonical: `${baseUrl}/tickets/${slug}`,
        },
        openGraph: {
            title: `${title} | Hello Sunshine Sauna`,
            description,
            url: `${baseUrl}/tickets/${slug}`,
            images,
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${title} | Hello Sunshine Sauna`,
            description,
            images,
        },
    };
}

export default function TicketLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

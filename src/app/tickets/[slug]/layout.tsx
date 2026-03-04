import { Metadata, ResolvingMetadata } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { slug } = await params;

    // Fetch data
    const { data: event } = await supabaseAdmin
        .from('app_events')
        .select('title, description, seo_title, seo_description, logo_src')
        .eq('id', slug)
        .single();

    if (!event) {
        // Fallback: try to reconstruct title from the slug (id)
        // because app_events might not be seeded but local data has the event
        const fallbackTitle = slug
            ? slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
            : 'Event';

        return {
            title: `${fallbackTitle} | Hello Sunshine Sauna`,
            description: "Book your tickets for this elemental sanctuary experience.",
        };
    }

    // Fallback to standard title/description if SEO specific ones aren't provided
    const title = event.seo_title || event.title;
    const description = event.seo_description || event.description;
    const images = event.logo_src ? [{ url: event.logo_src }] : [];

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images,
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
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

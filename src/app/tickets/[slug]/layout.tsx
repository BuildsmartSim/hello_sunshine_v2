import { Metadata, ResolvingMetadata } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type Props = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { id } = await params;

    // Fetch data
    const { data: event } = await supabaseAdmin
        .from('app_events')
        .select('title, description, seo_title, seo_description, logo_src')
        .eq('id', id)
        .single();

    if (!event) {
        return {
            title: 'Event Not Found',
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

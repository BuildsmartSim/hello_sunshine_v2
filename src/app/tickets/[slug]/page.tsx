import { getFestivalData, createSlug } from '@/data/festivals';
import SingleTicketClient from '@/components/Ticketing/SingleTicketClient';

type Props = {
    params: { slug: string };
};

export async function generateMetadata({ params }: Props) {
    const data = await getFestivalData();
    const event = data.find((e) => createSlug(e.title) === params.slug);

    if (!event) {
        return {
            title: 'Event Not Found | Hello Sunshine Sauna',
            description: 'The sauna event you are looking for could not be found.',
        };
    }

    const title = event.seoTitle || `Sauna at ${event.title} | Hello Sunshine`;
    const description = event.seoDescription || `Book your wood-fired sauna sessions for ${event.title} in ${event.location}. Experience community, warmth, and nature with Hello Sunshine.`;
    const image = event.logoSrc ? `https://hellosunshinesauna.com${event.logoSrc}` : "https://hellosunshinesauna.com/optimized/photographs/webp/hero-sunshine.webp";

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [
                {
                    url: image,
                    width: 1200,
                    height: 630,
                    alt: title,
                }
            ],
            type: 'website',
            url: `https://hellosunshinesauna.com/tickets/${params.slug}`
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [image],
        }
    };
}

export default function SingleTicketPage() {
    return <SingleTicketClient />;
}

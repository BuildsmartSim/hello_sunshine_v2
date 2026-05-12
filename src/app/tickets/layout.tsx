import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sanctuaries & Tickets | Hello Sunshine Sauna',
    description: 'Book your spot at our mobile wood-fired saunas. Explore upcoming festivals, pop-ups, and wild sanctuary locations across the South West.',
    openGraph: {
        title: 'Sanctuaries & Tickets | Hello Sunshine Sauna',
        description: 'Book your spot at our mobile wood-fired saunas. Explore upcoming festivals, pop-ups, and wild sanctuary locations across the South West.',
        url: '/tickets',
    },
    alternates: {
        canonical: '/tickets',
    },
};

export default function TicketsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

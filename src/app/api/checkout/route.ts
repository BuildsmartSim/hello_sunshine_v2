import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { priceId, email, name, metadata } = body;

        console.log('Checkout requested for:', email);

        if (!process.env.STRIPE_SECRET_KEY) {
            console.warn('Stripe not configured. Redirecting to mock success for development.');
            const mockSessionId = `test_session_${Date.now()}`;
            const origin = req.headers.get('origin') || 'http://localhost:3000';

            return NextResponse.json({
                url: `${origin}/tickets/success?session_id=${mockSessionId}&id=demo-ticket-id`
            });
        }

        const stripe = (await import('@/lib/stripe')).getStripe();

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'payment',
            customer_email: email,
            success_url: `${req.headers.get('origin')}/tickets/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.get('origin')}/tickets`,
            metadata: {
                customer_name: name,
                ...metadata
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        console.error('Checkout API error:', err);
        return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
    }
}

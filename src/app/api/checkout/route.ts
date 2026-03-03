import { NextResponse } from 'next/server';
import { inventory } from '@/lib/inventory';
export const dynamic = 'force-dynamic';

import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { priceId, email, name, quantity = 1, metadata, unitAmount: clientUnitAmount } = body;
        const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

        console.log(`Checkout requested for: ${email}, ${priceId}, qty: ${quantity}`);

        // Fetch Geolocation data
        let location_city = null;
        let location_country = null;
        try {
            // Get IP from headers (works on Vercel, DO, most proxies)
            const forwardedFor = req.headers.get('x-forwarded-for');
            const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : null;

            if (ip) {
                // Quick free API call to get location (doesn't require an API key)
                const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=city,country`, {
                    next: { revalidate: 3600 } // cache for IP if somehow called repeatedly
                });
                if (geoRes.ok) {
                    const geoData = await geoRes.json();
                    location_city = geoData.city;
                    location_country = geoData.country;
                }
            }
        } catch (geoErr) {
            console.error('Failed to fetch geolocation in background:', geoErr);
            // Non-blocking error, we still proceed with checkout
        }

        // 1. Check Inventory
        const stock = await inventory.checkAvailability(priceId);
        if (!stock.available || stock.remaining < quantity) {
            console.warn(`Blocked checkout for item due to stock: ${priceId}`);
            return NextResponse.json(
                { error: `Sorry, we only have ${stock.remaining || 0} tickets remaining for this tier.` },
                { status: 409 } // 409 Conflict
            );
        }

        if (!process.env.STRIPE_SECRET_KEY) {
            console.warn('Stripe not configured. Redirecting to mock success for development.');
            const mockSessionId = `test_session_${Date.now()}`;

            return NextResponse.json({
                url: `${origin}/tickets/success?session_id=${mockSessionId}&id=demo-ticket-id`
            });
        }

        const stripe = (await import('@/lib/stripe')).getStripe();
        const supabase = (await import('@/lib/supabaseAdmin')).supabaseAdmin;

        let serverUnitAmount = 0;
        const { data: events } = await supabase.from('app_events').select('tiers');
        if (events) {
            outerLoop: for (const ev of events) {
                if (!ev.tiers) continue;
                // Find the tier where id matches priceId
                const match = ev.tiers.find((t: any) => t.id === priceId);
                if (match && match.price) {
                    const numericPrice = Number(match.price.toString().replace(/[^0-9.-]+/g, ""));
                    serverUnitAmount = Math.round(numericPrice * 100);
                    break outerLoop;
                }
            }
        }

        if (serverUnitAmount < 30) {
            console.error(`[SECURITY] Invalid price looked up for tier ${priceId}: ${serverUnitAmount}p. Refusing checkout.`);
            return NextResponse.json(
                { error: `Pricing error for tier.` },
                { status: 400 }
            );
        }

        // 2. Create Session with Metadata
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    quantity: quantity,
                    price_data: {
                        currency: 'gbp',
                        product_data: {
                            name: stock.productName || `Pass: ${priceId}`
                        },
                        unit_amount: serverUnitAmount
                    }
                }
            ],
            mode: 'payment',
            customer_email: email,
            success_url: `${origin}/tickets/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/tickets`,
            metadata: {
                customer_name: name,
                product_id: stock.productId, // Link to our internal UUID
                internal_tier_id: priceId,
                referral_code: metadata?.referral_code || null,
                location_city,
                location_country,
                quantity: quantity.toString(),
                ...metadata
            },
        });

        // 3. Create Pending Ticket Reservations to lock inventory
        const pendingTickets = Array.from({ length: quantity }).map(() => ({
            product_id: stock.productId,
            stripe_session_id: session.id,
            status: 'pending'
        }));

        const { error: reserveError } = await supabase
            .from('tickets')
            .insert(pendingTickets);

        if (reserveError) {
            console.error('Failed to reserve pending ticket:', reserveError);
            // We still proceed, but log that inventory lock failed for this checkout.
        }

        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        console.error('Checkout API error:', err);
        return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
    }
}

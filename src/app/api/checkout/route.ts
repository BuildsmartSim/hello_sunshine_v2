import { NextResponse } from 'next/server';
import { inventory } from '@/lib/inventory';
export const dynamic = 'force-dynamic';

import { getSiteOrigin } from '@/lib/site-origin';
import { isIP } from 'node:net';

// Simple in-memory rate limiter (10 requests per minute per IP)
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60000;

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    // Bound memory usage even when attackers send many distinct addresses.
    if (rateLimitMap.size > 10_000) {
        for (const [key, value] of rateLimitMap) {
            if (now - value.timestamp > RATE_LIMIT_WINDOW_MS) rateLimitMap.delete(key);
        }
        if (rateLimitMap.size > 10_000) return false;
    }
    const record = rateLimitMap.get(ip);

    if (!record) {
        rateLimitMap.set(ip, { count: 1, timestamp: now });
        return true;
    }

    if (now - record.timestamp > RATE_LIMIT_WINDOW_MS) {
        // Reset window
        rateLimitMap.set(ip, { count: 1, timestamp: now });
        return true;
    }

    if (record.count >= RATE_LIMIT_MAX) {
        return false; // Rate limited
    }

    record.count += 1;
    return true;
}

export async function POST(req: Request) {
    try {
        // Get IP from headers for rate limiting and geolocation
        const forwardedFor = req.headers.get('x-forwarded-for');
        const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown-ip';

        if (!checkRateLimit(ip)) {
            console.warn(`[SECURITY] Rate limit exceeded for IP: ${ip} on Checkout Route`);
            return NextResponse.json(
                { error: "Too many checkout requests. Please wait a minute and try again." },
                { status: 429 }
            );
        }

        const body = await req.json();
        const { priceId, email, name, quantity = 1, metadata = {} } = body;
        const origin = getSiteOrigin();
        const requestOrigin = req.headers.get('origin');
        if (requestOrigin && requestOrigin !== origin && requestOrigin !== origin.replace('://', '://www.')) {
            return NextResponse.json({ error: 'Untrusted checkout origin' }, { status: 403 });
        }
        if (typeof priceId !== 'string' || priceId.length > 200 || typeof email !== 'string' ||
            email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
            typeof name !== 'string' || !name.trim() || name.length > 200 ||
            !Number.isInteger(quantity) || quantity < 1 || quantity > 8 ||
            !metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
            return NextResponse.json({ error: 'Invalid booking details' }, { status: 400 });
        }
        const allowedMetadata: Record<string, string> = {};
        for (const key of ['event_id', 'age', 'gender', 'phone', 'waiver_accepted', 'waiver_accepted_at',
            'terms_accepted', 'mailing_list_optin', 'guest_emails', 'guest_names', 'referral_code']) {
            if (metadata[key] != null) {
                if (typeof metadata[key] !== 'string' || metadata[key].length > 500) {
                    return NextResponse.json({ error: 'Invalid booking metadata' }, { status: 400 });
                }
                allowedMetadata[key] = metadata[key];
            }
        }
        if (allowedMetadata.waiver_accepted !== 'true' || allowedMetadata.terms_accepted !== 'true') {
            return NextResponse.json({ error: 'Please accept the booking terms and sauna promises' }, { status: 400 });
        }
        for (const key of ['guest_emails', 'guest_names']) {
            try {
                const values = JSON.parse(allowedMetadata[key] || '[]');
                if (!Array.isArray(values) || values.length > quantity - 1 || values.some((v: unknown) => typeof v !== 'string')) {
                    return NextResponse.json({ error: 'Invalid guest details' }, { status: 400 });
                }
            } catch {
                return NextResponse.json({ error: 'Invalid guest details' }, { status: 400 });
            }
        }

        console.log(`Checkout requested for: ${email}, ${priceId}, qty: ${quantity}`);

        // Fetch Geolocation data
        let location_city = req.headers.get('x-vercel-ip-city') ? decodeURIComponent(req.headers.get('x-vercel-ip-city')!) : null;
        let location_country = req.headers.get('x-vercel-ip-country') || null;

        if (!location_city && isIP(ip) && ip !== '127.0.0.1' && ip !== '::1') {
            try {
                // Secure HTTPS fallback call to get location with a strict timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5s timeout

                const geoRes = await fetch(`https://ip-api.com/json/${ip}?fields=city,country`, {
                    signal: controller.signal,
                    next: { revalidate: 3600 }
                });
                clearTimeout(timeoutId);

                if (geoRes.ok) {
                    const geoData = await geoRes.json();
                    location_city = geoData.city;
                    location_country = geoData.country;
                }
            } catch (geoErr: any) {
                if (geoErr.name === 'AbortError') {
                    console.warn('Geolocation fetch timed out after 1.5s, proceeding with checkout...');
                } else {
                    console.error('Failed to fetch geolocation in background:', geoErr);
                }
            }
        }

        // 1. Check Inventory
        const stock = await inventory.checkAvailability(priceId);
        if (!stock.available || !stock.productId || stock.remaining < quantity) {
            console.warn(`Blocked checkout for item due to stock: ${priceId}`);
            return NextResponse.json(
                { error: `Sorry, we only have ${stock.remaining || 0} tickets remaining for this tier.` },
                { status: 409 } // 409 Conflict
            );
        }

        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json({ error: 'Payments are temporarily unavailable' }, { status: 503 });
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
            expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // Stripe minimum is 30 minutes
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
                ...allowedMetadata
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
        return NextResponse.json({ error: 'Unable to start checkout. Please try again.' }, { status: 500 });
    }
}

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const quiet = { log() {}, warn() {}, error() {} };
const fixtureId = '11111111-1111-4111-8111-111111111111';

function load(file, stubs = {}, overrides = {}) {
    const exports = {};
    const source = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
        compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
    }).outputText;
    const sandbox = {
        exports, URL, Request, Response, Headers, AbortController, AbortSignal, setTimeout, clearTimeout,
        console: quiet,
        process: { env: { NODE_ENV: 'production', STRIPE_SECRET_KEY: 'audit-fixture-only' }, cwd: () => root, execPath: process.execPath },
        require(name) {
            if (name in stubs) return stubs[name];
            if (name === 'server-only') return {};
            if (name === '@/lib/public-ticket') return load('src/lib/public-ticket.ts');
            if (name === '@/lib/site-origin') return { getSiteOrigin: () => 'https://hellosunshinesauna.com' };
            if (name.startsWith('@/')) throw new Error('Unexpected real application import: ' + name);
            return require(name);
        },
        ...overrides,
    };
    vm.runInNewContext(source, sandbox, { filename: file });
    return exports;
}

function lookupFixture({ payment = 'paid', sessionStatus = 'complete', status = 'active', profile = true } = {}) {
    let reads = 0;
    const ticket = {
        id: fixtureId, status, stripe_session_id: 'cs_test_fixture',
        profile: { full_name: 'Audit Fixture', email: 'audit@example.invalid', phone: 'private', medical_notes: 'private', terms_accepted: true },
        product: { name: 'Fixture Pass', internal_secret: 'private' },
    };
    const api = load('src/app/api/tickets/from-session/route.ts', {
        '@/lib/stripe': { getStripe: () => ({ checkout: { sessions: { retrieve: async () => ({ payment_status: payment, status: sessionStatus, mode: 'payment' }) } } }) },
        '@/lib/ticketing': { getTicketWithDetails: async () => ticket },
        '@/lib/supabaseAdmin': { supabaseAdmin: { from() {
            reads++;
            return { select() { return this; }, eq() { return this; }, order: async () => ({ data: [{ id: fixtureId, status, profile_id: profile ? 'fixture-profile' : null }] }) };
        } } },
    });
    return { api, reads: () => reads, ticket };
}

test('unpaid and incomplete checkout sessions never read or activate tickets', async () => {
    for (const opts of [{ payment: 'unpaid' }, { sessionStatus: 'open' }]) {
        const fixture = lookupFixture(opts);
        const response = await fixture.api.GET(new Request('https://audit.invalid/api/tickets/from-session?session_id=cs_test_fixture'));
        assert.equal(response.status, 202);
        assert.equal(fixture.reads(), 0);
        assert.equal((await response.json()).ticket, null);
    }
});

test('paid bookings wait for webhook fulfillment without activating records', async () => {
    for (const opts of [{ status: 'pending' }, { profile: false }]) {
        const { api } = lookupFixture(opts);
        const response = await api.GET(new Request('https://audit.invalid/api/tickets/from-session?session_id=cs_test_fixture'));
        assert.equal(response.status, 202);
        assert.equal((await response.json()).paymentStatus, 'paid');
    }
});

test('paid fulfilled bookings return display fields without customer contact or medical data', async () => {
    const { api } = lookupFixture();
    const response = await api.GET(new Request('https://audit.invalid/api/tickets/from-session?session_id=cs_test_fixture'));
    assert.equal(response.status, 200);
    assert.match(response.headers.get('cache-control'), /no-store/);
    const body = await response.json();
    assert.equal(body.ticket.profile.full_name, 'Audit Fixture');
    assert.equal(body.ticket.profile.email, undefined);
    assert.equal(body.ticket.profile.medical_notes, undefined);
    assert.equal(body.ticket.stripe_session_id, undefined);
    assert.equal(body.ticket.product.internal_secret, undefined);
});

test('ticket links reject cancelled tickets, malformed IDs and mock sessions', async () => {
    const { api } = lookupFixture({ status: 'refunded' });
    for (const query of ['id=demo-ticket-id', 'session_id=test_session_123', 'id=../secret', 'id=' + fixtureId + '&session_id=cs_test_fixture']) {
        assert.equal((await api.GET(new Request('https://audit.invalid/?' + query))).status, 400);
    }
    assert.equal((await api.GET(new Request('https://audit.invalid/?id=' + fixtureId))).status, 409);
});

for (const name of ['upload-url', 'ai-assist', 'generate-image', 'publish']) {
    test('social ' + name + ' rejects unauthorized callers before reading their payload', async () => {
        const authStub = { requireAdmin: async () => ({ authorized: false }) };
        const stubs = {
            '@/lib/auth': authStub,
            '@/lib/supabaseAdmin': { supabaseAdmin: {} },
            'satori': () => { throw new Error('Renderer must not run'); },
            '@resvg/resvg-js': {},
            '@/components/social/SunshineTemplate': {},
        };
        const api = load('src/app/api/social/' + name + '/route.ts', stubs);
        let read = false;
        const response = await api.POST({ json() { read = true; throw new Error('Must not parse body'); } });
        assert.equal(response.status, 401);
        assert.equal(read, false);
    });
}

test('authorized social publishing forwards the admin cookie only to the configured site', async () => {
    const calls = [];
    const api = load('src/app/api/social/publish/route.ts', {
        '@/lib/auth': { requireAdmin: async () => ({ authorized: true }) },
        '@/lib/supabaseAdmin': { supabaseAdmin: { from() { return { select() { return this; }, eq() { return this; }, single: async () => ({ data: {} }) }; } } },
    }, {
        fetch: async (url, options) => { calls.push({ url, options }); return { ok: true, json: async () => ({ url: 'https://audit.invalid/image.png' }) }; },
    });
    const response = await api.POST(new Request('https://hellosunshinesauna.com/api/social/publish', {
        method: 'POST', headers: { host: 'attacker.invalid', Cookie: 'fixture-session=1', 'Content-Type': 'application/json' },
        body: JSON.stringify({ targets: ['facebook'], headline: 'Fixture' }),
    }));
    assert.equal(response.status, 200);
    assert.equal(calls[0].url, 'https://hellosunshinesauna.com/api/social/generate-image');
    assert.equal(calls[0].options.headers.Cookie, 'fixture-session=1');
});

test('every dashboard action and ambassador creation stops on denied authorization', async () => {
    let reads = 0;
    const stubs = {
        '@/lib/auth': { assertAdmin: async () => { throw new Error('Admin access required'); } },
        '@/lib/supabaseAdmin': { supabaseAdmin: { from() { reads++; throw new Error('Database must not be reached'); } } },
        'next/cache': { revalidatePath() {} },
    };
    const actions = load('src/app/actions/dashboard.ts', stubs);
    for (const fn of Object.values(actions)) {
        const response = await fn();
        assert.equal(response.success, false);
    }
    const ambassador = await load('src/app/actions/ambassadors.ts', stubs).createAmbassadorAction({ name: 'Fixture' });
    assert.equal(ambassador.success, false);
    assert.equal(reads, 0);
});

test('check-in rejects unpaid, refunded, cancelled and already used tickets', async () => {
    for (const status of ['pending', 'refunded', 'cancelled', 'used']) {
        let writes = 0;
        const api = load('src/lib/ticketing.ts', {
            './supabaseAdmin': { supabaseAdmin: { from() { return {
                select() { return this; }, eq() { return this; },
                single: async () => ({ data: { id: fixtureId, status }, error: null }),
                update() { writes++; throw new Error('Must not update'); },
            }; } } },
        });
        await assert.rejects(api.checkInTicket(fixtureId), /active, unused/);
        assert.equal(writes, 0);
    }
});

test('photo renaming requires admin access and rejects traversal and symlinks', async () => {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'sunshine-photo-test-'));
    try {
        fs.mkdirSync(path.join(temp, 'public/optimized'), { recursive: true });
        fs.mkdirSync(path.join(temp, 'images/photographs'), { recursive: true });
        fs.writeFileSync(path.join(temp, 'public/optimized/manifest.json'), JSON.stringify({
            'original.jpg': { webp: '/optimized/photographs/webp/original.webp' },
            'link.jpg': { webp: '/optimized/photographs/webp/link.webp' },
        }));
        fs.writeFileSync(path.join(temp, 'images/photographs/original.jpg'), 'fixture-image');
        fs.symlinkSync(path.join(temp, 'images/photographs/original.jpg'), path.join(temp, 'images/photographs/link.jpg'));
        const overrides = { process: { cwd: () => temp, execPath: process.execPath, env: { NODE_ENV: 'test' } } };
        const denied = load('src/app/admin/photos/actions.ts', { '@/lib/auth': { requireAdmin: async () => ({ authorized: false }) } }, overrides);
        await assert.rejects(denied.renamePhoto('original.jpg', 'safe'), /Admin access/);
        const api = load('src/app/admin/photos/actions.ts', {
            '@/lib/auth': { requireAdmin: async () => ({ authorized: true }) },
            'node:child_process': { execFile(_bin, _args, _options, callback) { callback(null, '', ''); } },
        }, overrides);
        for (const name of ['../outside', '/tmp/outside', '..\\outside', 'unsafe.name', 'a/b']) {
            await assert.rejects(api.renamePhoto('original.jpg', name), /Invalid photo/);
        }
        await assert.rejects(api.renamePhoto('../original.jpg', 'safe'), /Invalid photo/);
        await assert.rejects(api.renamePhoto('link.jpg', 'safe'), /regular file/);
        fs.writeFileSync(path.join(temp, 'images/photographs/existing.jpg'), 'keep-me');
        await assert.rejects(api.renamePhoto('original.jpg', 'existing'), /EEXIST/);
        assert.equal(fs.readFileSync(path.join(temp, 'images/photographs/existing.jpg'), 'utf8'), 'keep-me');
        await api.renamePhoto('original.jpg', 'safe-new-name');
        assert.equal(fs.readFileSync(path.join(temp, 'images/photographs/safe-new-name.jpg'), 'utf8'), 'fixture-image');
        assert.equal(fs.existsSync(path.join(temp, 'images/photographs/original.jpg')), false);
    } finally { fs.rmSync(temp, { recursive: true, force: true }); }
});

test('signed unpaid Stripe events never fulfill or access the database', async () => {
    for (const eventType of ['checkout.session.completed', 'checkout.session.async_payment_succeeded']) {
        let reads = 0;
        const api = load('src/app/api/webhook/stripe/route.ts', {
            'next/headers': { headers: async () => new Headers({ 'stripe-signature': 'fixture' }) },
            '@/lib/stripe': { stripe: { webhooks: { constructEvent: () => ({ type: eventType, data: { object: { payment_status: 'unpaid', status: 'complete', mode: 'payment' } } }) } } },
            '@/lib/ticketing': { upsertProfile() { throw new Error('No profile mutation'); } },
            '@/lib/emails': { sendTicketEmailStatic() { throw new Error('No email'); } },
            '@/lib/supabaseAdmin': { supabaseAdmin: { from() { reads++; throw new Error('No database access'); } } },
        });
        const response = await api.POST(new Request('https://audit.invalid/', { method: 'POST', body: '{}' }));
        assert.equal(response.status, 200);
        assert.equal((await response.json()).fulfilled, false);
        assert.equal(reads, 0);
    }
});

test('checkout keeps server price and identity metadata and uses trusted redirect URLs', async () => {
    let checkout;
    let reservations;
    const api = load('src/app/api/checkout/route.ts', {
        '@/lib/inventory': { inventory: { checkAvailability: async () => ({ available: true, remaining: 20, productId: fixtureId, productName: 'Fixture Pass' }) } },
        '@/lib/stripe': { getStripe: () => ({ checkout: { sessions: { create: async payload => { checkout = payload; return { id: 'cs_test_fixture', url: 'https://checkout.stripe.com/fixture' }; } } } }) },
        '@/lib/supabaseAdmin': { supabaseAdmin: { from(table) {
            if (table === 'app_events') return { select: async () => ({ data: [{ tiers: [{ id: 'fixture-tier', price: '£30' }] }] }) };
            return { insert: async rows => { reservations = rows; return { error: null }; } };
        } } },
    });
    const booking = {
        priceId: 'fixture-tier', email: 'audit@example.invalid', name: 'Audit Fixture', quantity: 2, unitAmount: 1,
        metadata: { waiver_accepted: 'true', terms_accepted: 'true', guest_emails: '["guest@example.invalid"]', guest_names: '["Guest Fixture"]', product_id: 'forged', quantity: '99', customer_name: 'Forged' },
    };
    const request = (body, origin = 'https://hellosunshinesauna.com') => new Request('https://hellosunshinesauna.com/api/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin, 'x-forwarded-for': '127.0.0.1' }, body: JSON.stringify(body),
    });
    assert.equal((await api.POST(request(booking, 'https://attacker.invalid'))).status, 403);
    for (const quantity of [0, -1, 1.5, 9, '2']) assert.equal((await api.POST(request({ ...booking, quantity }))).status, 400);
    const response = await api.POST(request(booking));
    assert.equal(response.status, 200);
    assert.equal(checkout.line_items[0].price_data.unit_amount, 3000);
    assert.equal(checkout.line_items[0].quantity, 2);
    assert.equal(checkout.metadata.product_id, fixtureId);
    assert.equal(checkout.metadata.quantity, '2');
    assert.equal(checkout.metadata.customer_name, 'Audit Fixture');
    assert.match(checkout.success_url, /^https:\/\/hellosunshinesauna\.com\//);
    assert.equal(reservations.length, 2);
    assert.ok(reservations.every(row => row.status === 'pending'));
});

test('paid Stripe webhooks fulfill reservations and retries preserve used or refunded tickets', async () => {
    for (const initialStatus of ['pending', 'active', 'used', 'refunded']) {
        const state = { id: fixtureId, status: initialStatus, profile_id: initialStatus === 'pending' ? null : 'fixture-profile', email_sent: false };
        let sends = 0;
        let loyalty = 0;
        const db = {
            from() {
                const filters = {};
                let update;
                return {
                    select() { return this; },
                    eq(key, value) { filters[key] = value; return this; },
                    order: async () => ({ data: [{ ...state }], error: null }),
                    update(values) { update = values; return this; },
                    maybeSingle: async () => {
                        if (state.status !== filters.status) return { data: null, error: null };
                        Object.assign(state, update);
                        return { data: { id: state.id }, error: null };
                    },
                };
            },
            rpc: async () => { loyalty++; return { error: null }; },
        };
        const event = { type: 'checkout.session.completed', data: { object: {
            id: 'cs_test_fixture', payment_status: 'paid', status: 'complete', mode: 'payment',
            customer_details: { email: 'audit@example.invalid', name: 'Fixture' }, metadata: {},
        } } };
        const api = load('src/app/api/webhook/stripe/route.ts', {
            'next/headers': { headers: async () => new Headers({ 'stripe-signature': 'fixture' }) },
            '@/lib/stripe': { stripe: { webhooks: { constructEvent: () => event } } },
            '@/lib/ticketing': { upsertProfile: async () => ({ id: 'fixture-profile', email: 'audit@example.invalid' }) },
            '@/lib/emails': { sendTicketEmailStatic: async () => { sends++; } },
            '@/lib/supabaseAdmin': { supabaseAdmin: db },
        });
        const response = await api.POST(new Request('https://audit.invalid/', { method: 'POST', body: '{}' }));
        assert.equal(response.status, 200);
        assert.equal(state.status, initialStatus === 'pending' ? 'active' : initialStatus);
        assert.equal(sends, ['pending', 'active'].includes(initialStatus) ? 1 : 0);
        assert.equal(loyalty, initialStatus === 'pending' ? 1 : 0);
    }
});

test('check-in updates only an active ticket and handles a concurrent cancellation', async () => {
    for (const cancelled of [false, true]) {
        const filters = {};
        let increments = 0;
        let update;
        const api = load('src/lib/ticketing.ts', {
            './supabaseAdmin': { supabaseAdmin: {
                from() { return {
                    select() { return this; }, eq(key, value) { filters[key] = value; return this; },
                    is(key, value) { filters[key] = value; return this; },
                    single: async () => ({ data: { id: fixtureId, status: 'active', profile_id: 'fixture-profile' } }),
                    update(values) { update = values; return this; },
                    maybeSingle: async () => ({ data: cancelled ? null : { id: fixtureId }, error: null }),
                }; },
                rpc: async () => { increments++; return { error: null }; },
            } },
        });
        if (cancelled) await assert.rejects(api.checkInTicket(fixtureId), /no longer available/);
        else assert.equal((await api.checkInTicket(fixtureId)).success, true);
        assert.equal(filters.status, 'active');
        assert.equal(filters.check_in_at, null);
        assert.equal(update.status, 'used');
        assert.equal(increments, cancelled ? 0 : 1);
    }
});

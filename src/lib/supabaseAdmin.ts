import { createClient } from '@supabase/supabase-js'

/**
 * Creates a fresh, server-side Supabase client using the Service Role Key.
 * Configured with strict timeouts and disabled session persistence to prevent
 * stale socket pool hangs in long-running serverless environments.
 */
export function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://dummy-project.supabase.co';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_service_key_for_local_dev';

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
        },
        global: {
            fetch: (url, options = {}) => {
                // Attach 10-second request timeout and force un-cached fetch
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);
                
                // If caller provided a signal, chain it
                if (options.signal) {
                    options.signal.addEventListener('abort', () => controller.abort());
                }

                return fetch(url, {
                    ...options,
                    cache: 'no-store',
                    signal: controller.signal,
                }).finally(() => clearTimeout(timeoutId));
            },
        },
    });
}

let _supabaseInstance: any = null;

export function getAdminClient() {
    if (!_supabaseInstance) {
        _supabaseInstance = createAdminClient();
    }
    return _supabaseInstance;
}

export function resetAdminClient() {
    _supabaseInstance = null;
}

/**
 * Backward-compatible proxy for `supabaseAdmin`.
 * Automatically delegates calls to `getAdminClient()`.
 */
export const supabaseAdmin = new Proxy({} as any, {
    get(target, prop) {
        const client = getAdminClient();
        const value = client[prop];
        return typeof value === 'function' ? value.bind(client) : value;
    }
});

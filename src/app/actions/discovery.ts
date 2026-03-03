'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';
import { requireAdminOrPin } from '@/lib/auth';

export async function getDiscoveryLeadsAction() {
    try {
        const auth = await requireAdminOrPin();
        if (!auth.authorized) throw new Error(auth.error);

        const { data, error } = await supabaseAdmin
            .from('discovery_leads')
            .select('*')
            .order('vibe_score', { ascending: false });

        if (error) throw error;
        return { success: true, data: data || [] };
    } catch (error) {
        console.error('Failed to fetch discovery leads:', error);
        return { success: false, data: [] };
    }
}

export async function updateDiscoveryLeadStatusAction(id: string, status: string) {
    try {
        const auth = await requireAdminOrPin();
        if (!auth.authorized) throw new Error(auth.error);

        const { error } = await supabaseAdmin
            .from('discovery_leads')
            .update({ status })
            .eq('id', id);

        if (error) throw error;
        revalidatePath('/admin/discovery');
        return { success: true };
    } catch (error) {
        console.error('Failed to update lead status:', error);
        return { success: false };
    }
}

export async function deleteDiscoveryLeadAction(id: string) {
    try {
        const auth = await requireAdminOrPin();
        if (!auth.authorized) throw new Error(auth.error);

        const { error } = await supabaseAdmin
            .from('discovery_leads')
            .delete()
            .eq('id', id);

        if (error) throw error;
        revalidatePath('/admin/discovery');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete lead:', error);
        return { success: false };
    }
}

export async function triggerDiscoveryAgentAction(
    origin: string,
    isDeepScan: boolean = false,
    params?: { country?: string; region?: string; city?: string; type?: string }
) {
    try {
        const auth = await requireAdminOrPin();
        if (!auth.authorized) throw new Error(auth.error);

        const secret = process.env.CRON_SECRET;
        if (!secret) throw new Error("CRON_SECRET is not configured");

        const targetUrl = new URL(`/api/cron/discovery`, origin === 'http://localhost:3000' || process.env.NODE_ENV !== 'production' ? origin : 'http://127.0.0.1:3000');
        targetUrl.searchParams.set('key', secret);

        if (isDeepScan) {
            targetUrl.searchParams.set('limit', '15');
        }

        if (params?.country) targetUrl.searchParams.set('country', params.country);
        if (params?.region) targetUrl.searchParams.set('region', params.region);
        if (params?.city) targetUrl.searchParams.set('city', params.city);
        if (params?.type) targetUrl.searchParams.set('type', params.type);

        // Bypass public Nginx to avoid 60-second proxy timeouts on long-running scrapes
        const res = await fetch(targetUrl.toString(), {
            method: 'GET',
            cache: 'no-store'
        });

        const text = await res.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error('Non-JSON response from agent:', text.substring(0, 500));
            return { success: false, error: 'Agent timed out or returned invalid response.' };
        }

        if (!res.ok) {
            return { success: false, error: data.error || data.message || 'API request failed' };
        }

        return { success: true, data };
    } catch (error: any) {
        console.error('Failed to run agent:', error);
        return { success: false, error: error.message };
    }
}

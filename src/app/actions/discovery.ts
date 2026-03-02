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

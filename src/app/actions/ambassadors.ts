'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';
import { assertAdmin } from '@/lib/auth';

export async function createAmbassadorAction(data: { name: string, email: string, referralCode: string }) {
    try {
        await assertAdmin();
        const { error } = await supabaseAdmin
            .from('ambassadors')
            .insert({
                name: data.name,
                email: data.email,
                referral_code: data.referralCode
            });

        if (error) {
            if (error.code === '23505') { // Postgres unique violation error code
                return { success: false, error: 'An ambassador with this email or referral code already exists.' };
            }
            throw error;
        }

        revalidatePath('/admin');
        revalidatePath('/admin/ambassadors');
        return { success: true };
    } catch (error) {
        console.error('Failed to create ambassador:', error);
        return { success: false, error: (error as any).message || 'An unexpected error occurred' };
    }
}

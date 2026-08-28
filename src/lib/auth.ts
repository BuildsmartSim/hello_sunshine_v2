import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from './supabaseAdmin';

export async function requireAdminOrPin(pin?: string): Promise<{ authorized: boolean, error?: string }> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { authorized: false, error: 'Not authenticated' };
        }

        // 1. Check if natively admin
        const { data: roleData } = await supabaseAdmin
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single();

        if (roleData?.role === 'admin') {
            return { authorized: true };
        }

        // 2. If not admin, verify PIN
        if (pin && pin.trim().length > 0) {
            const { data: settings } = await supabaseAdmin
                .from('admin_settings')
                .select('manager_pin')
                .eq('id', 'default')
                .single();

            if (settings && settings.manager_pin && settings.manager_pin === pin) {
                return { authorized: true };
            }
        }

        return { authorized: false, error: 'Unauthorized. Manager PIN required for this action.' };
    } catch (err: any) {
        console.error('Authorization error:', err);
        return { authorized: false, error: 'Failed to verify authorization.' };
    }
}

export async function requireAdmin(): Promise<{ authorized: boolean; user?: any; error?: string }> {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return { authorized: false, error: 'Not authenticated' };
        }

        const { data: roleData } = await supabaseAdmin
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single();

        if (roleData?.role === 'admin') {
            return { authorized: true, user };
        }

        return { authorized: false, error: 'Forbidden: Admin role required' };
    } catch (err: any) {
        console.error('Admin authorization error:', err);
        return { authorized: false, error: 'Failed to verify authorization' };
    }
}

export async function requireStaffOrAdmin(pin?: string): Promise<{ authorized: boolean; user?: any; error?: string }> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const { data: roleData } = await supabaseAdmin
                .from('user_roles')
                .select('role')
                .eq('user_id', user.id)
                .single();

            if (roleData?.role === 'admin' || roleData?.role === 'clerk') {
                return { authorized: true, user };
            }
        }

        // Verify PIN if user is not logged in or doesn't have explicit role
        if (pin && pin.trim().length > 0) {
            const { data: settings } = await supabaseAdmin
                .from('admin_settings')
                .select('manager_pin')
                .eq('id', 'default')
                .single();

            if (settings && settings.manager_pin && settings.manager_pin === pin) {
                return { authorized: true };
            }
        }

        return { authorized: false, error: 'Unauthorized: Staff session or Manager PIN required.' };
    } catch (err: any) {
        console.error('Staff authorization error:', err);
        return { authorized: false, error: 'Failed to verify authorization.' };
    }
}

export function verifyCronAuth(req: Request): boolean {
    const authHeader = req.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret) {
        console.warn('[SECURITY WARNING] CRON_SECRET is not configured in environment variables.');
        return process.env.NODE_ENV !== 'production';
    }

    // 1. Standard Vercel Cron header check: Authorization: Bearer <CRON_SECRET>
    if (authHeader === `Bearer ${expectedSecret}`) {
        return true;
    }

    // 2. Query param key check: ?key=<CRON_SECRET>
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    if (key === expectedSecret) {
        return true;
    }

    return false;
}



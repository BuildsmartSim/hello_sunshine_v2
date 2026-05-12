'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import Stripe from 'stripe';
import { revalidatePath } from 'next/cache';
import { requireAdminOrPin } from '@/lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key', {
    apiVersion: '2025-01-27.acacia' as any,
});

export async function searchTicketsAction(query: string, pin?: string) {
    try {
        const auth = await requireAdminOrPin(pin);
        if (!auth.authorized) throw new Error(auth.error);

        if (!query) {
            const { data } = await supabaseAdmin
                .from('tickets')
                .select(`
                id, created_at, status, stripe_session_id,
                profile:profiles ( full_name, email ),
                product:products ( name ),
                slot:slots (
                    product:products ( name )
                )
            `)
                .order('created_at', { ascending: false })
                .limit(10);
            return { success: true, data: data || [] };
        }

        const { data: profiles, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`);

        if (profileError) {
            console.error('Failed to search profiles:', profileError);
            return { success: false, error: 'Database search error' };
        }

        const profileIds = profiles.map((p: any) => p.id);

        if (profileIds.length === 0) {
            return { success: true, data: [] };
        }

        const { data: tickets, error: ticketError } = await supabaseAdmin
            .from('tickets')
            .select(`
            id, created_at, status, stripe_session_id,
            profile:profiles!inner ( full_name, email ),
            product:products ( name ),
            slot:slots (
                product:products ( name )
            )
        `)
            .in('profile_id', profileIds)
            .order('created_at', { ascending: false });

        if (ticketError) {
            console.error('Failed to fetch tickets for search:', ticketError);
            return { success: false, error: 'Failed to fetch tickets' };
        }

        const { data: archived, error: archiveError } = await supabaseAdmin
            .from('archived_bookings')
            .select('*')
            .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`);

        const archivedTickets = (archived || []).map((arc: any) => ({
            id: arc.id,
            created_at: arc.created_at,
            status: 'archived',
            stripe_session_id: null,
            profile: {
                full_name: `${arc.first_name || ''} ${arc.last_name || ''}`.trim(),
                email: arc.email
            },
            slot: null,
            product: { name: `${arc.event_name || 'Historical Event'} (${arc.event_year})` }
        }));

        const combined = [...(tickets || []), ...archivedTickets].sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        return { success: true, data: combined };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

export async function refundTicketAction(ticketId: string, stripeSessionId: string | null, reason: string, pin?: string) {
    try {
        const auth = await requireAdminOrPin(pin);
        if (!auth.authorized) throw new Error(auth.error);

        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error("Missing STRIPE_SECRET_KEY. Cannot process live refunds locally.");
        }

        if (stripeSessionId) {
            const session = await stripe.checkout.sessions.retrieve(stripeSessionId);
            if (session.payment_intent) {
                await stripe.refunds.create({
                    payment_intent: session.payment_intent as string,
                    reason: 'requested_by_customer'
                });
            }
        }

        // 1. Update database status and store reason
        const { data: ticket, error: updateError } = await supabaseAdmin
            .from('tickets')
            .update({
                status: 'refunded',
                refund_reason: reason
            })
            .eq('id', ticketId)
            .select('*, profile:profiles(full_name, email), product:products(name)')
            .single();

        if (updateError) throw updateError;

        // 2. Fetch Chief's notification details
        const { data: settings } = await supabaseAdmin
            .from('admin_settings')
            .select('*')
            .eq('id', 'default')
            .single();

        // 3. Trigger Email Notification (Placeholder for Telegram)
        if (settings?.chief_email && ticket) {
            try {
                const { resend } = await import('@/lib/resend');
                await resend.emails.send({
                    from: 'Hello Sunshine <onboarding@resend.dev>',
                    to: settings.chief_email,
                    subject: `⚠️ Refund Issued: ${ticket.profile?.full_name}`,
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                            <h2 style="color: #d32f2f; text-transform: uppercase;">Refund Alert</h2>
                            <p>A refund has been processed for a ticket.</p>
                            <hr />
                            <p><strong>Guest:</strong> ${ticket.profile?.full_name} (${ticket.profile?.email})</p>
                            <p><strong>Product:</strong> ${ticket.product?.name}</p>
                            <p><strong>Reason:</strong> ${reason}</p>
                            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                            <hr />
                            <p style="font-size: 10px; color: #999; text-transform: uppercase;">Log entry created in Admin Dashboard</p>
                        </div>
                    `
                });
            } catch (emailErr) {
                console.error('Failed to send refund email notice:', emailErr);
            }
        }

        // 4. Telegram Notification
        if (settings?.telegram_bot_token && settings?.telegram_chat_id && ticket) {
            try {
                const { sendTelegramMessage } = await import('@/utils/telegram');
                const message = `
<b>⚠️ REFUND ISSUED</b>
<b>Guest:</b> ${ticket.profile?.full_name}
<b>Product:</b> ${ticket.product?.name}
<b>Reason:</b> ${reason}
<b>Email:</b> ${ticket.profile?.email}
<i>Log entry created in Admin Dashboard</i>
                `.trim();
                await sendTelegramMessage(settings.telegram_bot_token, settings.telegram_chat_id, message);
            } catch (tgErr) {
                console.error('Failed to send Telegram refund notice:', tgErr);
            }
        }

        revalidatePath('/admin/refunds');
        revalidatePath('/admin');
        return { success: true };
    } catch (error: any) {
        console.error('Refund action failed:', error);
        return { success: false, error: error.message || 'Refund failed' };
    }
}

export async function checkInTicketAction(ticketId: string, notes?: string, pin?: string) {
    console.log('CHECK_IN_ACTION_RECEIVED_ID:', ticketId);
    try {
        const auth = await requireAdminOrPin(pin);
        if (!auth.authorized) throw new Error(auth.error);

        // 1. Fetch ticket with latest status
        const { data: ticket, error: fetchError } = await supabaseAdmin
            .from('tickets')
            .select(`
                *,
                profile:profiles(full_name, email),
                product:products(name),
                slot:slots(
                    product:products(name)
                )
            `)
            .eq('id', ticketId)
            .single();

        if (fetchError || !ticket) {
            return { success: false, error: 'Ticket not found.' };
        }

        // 2. Validation Business Rules
        if (ticket.status === 'pending') {
            return { success: false, error: 'PAYMENT PENDING: This ticket is not yet active.' };
        }

        if (ticket.status === 'refunded') {
            return { success: false, error: 'CANCELLED: This ticket has been refunded.' };
        }

        if (ticket.check_in_at) {
            return {
                success: false,
                error: `ALREADY SCANNED: This ticket was used at ${new Date(ticket.check_in_at).toLocaleTimeString()}.`,
                guestName: ticket.profile?.full_name
            };
        }

        if (ticket.profile && ticket.profile.terms_accepted === false) {
            return {
                success: false,
                error: 'TERMS NOT ACCEPTED - PLEASE SIGN WAIVER AT DESK',
                guestName: ticket.profile?.full_name,
                productName: ticket.slot?.product?.name || ticket.product?.name
            };
        }

        // 3. Mark as Checked In
        const { error: updateError } = await supabaseAdmin
            .from('tickets')
            .update({
                check_in_at: new Date().toISOString(),
                // check_in_notes: notes || null,
                status: 'used' // Mark as used
            })
            .eq('id', ticketId);

        if (updateError) throw updateError;

        revalidatePath('/admin');
        revalidatePath('/admin/scanner');

        return {
            success: true,
            guestName: ticket.profile?.full_name,
            productName: ticket.slot?.product?.name || ticket.product?.name
        };
    } catch (error: any) {
        console.error('Check-in action failed:', error);
        return { success: false, error: 'Server error during check-in.' };
    }
}

export async function getRoleAction() {
    try {
        const { createClient } = await import('@/utils/supabase/server');
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { success: false, error: 'Not authenticated' };

        const { data, error } = await supabaseAdmin
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single();

        if (error) {
            // Default to clerk if no role record exists
            return { success: true, role: 'clerk' };
        }

        return { success: true, role: data.role };
    } catch (error: any) {
        console.error('Failed to get role:', error);
        return { success: false, error: error.message };
    }
}

export async function updateSettingsAction(settings: {
    chief_email: string;
    telegram_bot_token: string;
    telegram_chat_id: string;
    manager_pin: string;
}, pin?: string) {
    try {
        const auth = await requireAdminOrPin(pin);
        if (!auth.authorized) throw new Error(auth.error);

        // Removed native role check since requireAdminOrPin handles it


        const { createClient } = await import('@/utils/supabase/server');
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await supabaseAdmin
            .from('admin_settings')
            .update({
                chief_email: settings.chief_email,
                telegram_bot_token: settings.telegram_bot_token,
                telegram_chat_id: settings.telegram_chat_id,
                manager_pin: settings.manager_pin,
                updated_at: new Date().toISOString(),
                updated_by: user?.id || 'system'
            })
            .eq('id', 'default');

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        console.error('Failed to update settings:', error);
        return { success: false, error: error.message || 'Server error' };
    }
}

export async function sendTestNotificationAction(pin?: string) {
    try {
        const auth = await requireAdminOrPin(pin);
        if (!auth.authorized) throw new Error(auth.error);

        const { createClient } = await import('@/utils/supabase/server');
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { success: false, error: 'Not authenticated' };

        // 1. Fetch current settings
        const { data: settings, error: settingsError } = await supabaseAdmin
            .from('admin_settings')
            .select('*')
            .eq('id', 'default')
            .single();

        if (settingsError || !settings) return { success: false, error: 'Failed to fetch settings' };

        const results = { email: false, telegram: false };

        // 2. Test Email via Resend
        if (settings.chief_email) {
            try {
                const { resend } = await import('@/lib/resend');
                await resend.emails.send({
                    from: 'Hello Sunshine Alerts <hello@hellosunshinesauna.com>',
                    to: [settings.chief_email],
                    subject: '🔔 TEST: Hello Sunshine Notification System',
                    text: `This is a test notification from your Hello Sunshine management portal. If you can see this, your email alerts are working correctly! \n\nTime Sent: ${new Date().toLocaleString()}`
                });
                results.email = true;
            } catch (err) {
                console.error('Test email failed:', err);
            }
        }

        // 3. Test Telegram
        if (settings.telegram_bot_token && settings.telegram_chat_id) {
            try {
                const message = `🔔 *TEST: Hello Sunshine Notification System*\n\nIf you see this, your Telegram alerts are working correctly!\n\n_Time Sent: ${new Date().toLocaleString()}_`;
                const url = `https://api.telegram.org/bot${settings.telegram_bot_token}/sendMessage`;
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: settings.telegram_chat_id,
                        text: message,
                        parse_mode: 'Markdown'
                    })
                });
                if (response.ok) results.telegram = true;
            } catch (err) {
                console.error('Test telegram failed:', err);
            }
        }
        if (!results.email && !results.telegram) {
            return { success: false, error: 'Both notification methods failed. Check your credentials.' };
        }

        return {
            success: true,
            message: `Tests initiated. Email: ${results.email ? '✅' : '❌'}, Telegram: ${results.telegram ? '✅' : '❌'}`
        };

    } catch (error: any) {
        console.error('Notification test failed:', error);
        return { success: false, error: error.message || 'Server error' };
    }
}

export async function reconcileStripeAction(sessionId: string, pin?: string) {
    try {
        const auth = await requireAdminOrPin(pin);
        if (!auth.authorized) throw new Error(auth.error);

        const { createClient } = await import('@/utils/supabase/server');
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { success: false, error: 'Not authenticated' };

        // 1. Fetch Session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (!session || session.status !== 'complete') {
            return { success: false, error: 'Session not found or not completed in Stripe' };
        }

        // 2. Check if a ticket already exists for this session
        const { data: existingTicket } = await supabaseAdmin
            .from('tickets')
            .select('id, status')
            .eq('stripe_session_id', sessionId)
            .single();

        if (existingTicket && existingTicket.status === 'active') {
            return { success: false, error: 'A ticket already exists and is active for this session' };
        }

        // 3. Trigger the Webhook Logic Manually (Simulated POST to internal logic)
        // We'll use our existing webhook processing logic or similar
        // For safety, let's look at what the webhook does and replicate the core parts.

        const { customer_details, metadata } = session;
        const { upsertProfile, sendTicketEmail } = await import('@/lib/ticketing');

        // A. Profile
        const profile = await upsertProfile({
            email: customer_details?.email || '',
            full_name: metadata?.customer_name || customer_details?.name || 'Guest',
        });

        // B. Ticket
        const { data: ticket, error: ticketError } = await supabaseAdmin
            .from('tickets')
            .upsert({
                profile_id: profile.id,
                slot_id: metadata?.slot_id || null,
                product_id: metadata?.product_id || null,
                stripe_session_id: session.id,
                status: 'active'
            }, { onConflict: 'stripe_session_id' })
            .select()
            .single();

        if (ticketError) throw ticketError;

        // C. Email
        try {
            await sendTicketEmail(ticket.id);
        } catch (emailErr) {
            console.error('Email fails during reconciliation:', emailErr);
        }

        return { success: true, message: `Reconciliation successful! Ticket issued to ${profile.email}.` };

    } catch (error: any) {
        console.error('Reconciliation failed:', error);
        return { success: false, error: error.message || 'Server error' };
    }
}

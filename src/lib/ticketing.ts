import { supabaseAdmin } from './supabaseAdmin';
import { Profile, Ticket, Location, Product, Slot } from '@/types/ticketing';

/**
 * Upserts a client profile in Supabase.
 * This is used to capture client data regardless of whether a purchase is completed.
 */
export async function upsertProfile(profile: Partial<Profile>) {
    if (!profile.email) throw new Error('Email is required for profile');

    const { data, error } = await supabaseAdmin
        .from('profiles')
        .upsert({
            email: profile.email,
            full_name: profile.full_name,
            phone: profile.phone,
            age: profile.age ? parseInt(profile.age.toString()) : null,
            gender: profile.gender,
            waiver_accepted: profile.waiver_accepted,
            waiver_accepted_at: profile.waiver_accepted_at,
            medical_notes: profile.medical_notes,
        }, { onConflict: 'email' })
        .select()
        .single();

    if (error) {
        console.error('Error upserting profile:', error);
        throw error;
    }

    return data as Profile;
}

/**
 * Fetches all active locations for the ticketing UI.
 */
export async function getActiveLocations() {
    const { data, error } = await supabaseAdmin
        .from('locations')
        .select('*, products(*, slots(*))')
        .eq('is_active', true);

    if (error) {
        console.error('Error fetching locations:', error);
        return [];
    }

    return data;
}

/**
 * Increments the total sweeps for a profile.
 */
export async function incrementSweats(profileId: string) {
    const { error } = await supabaseAdmin.rpc('increment_sweats', { profile_uuid: profileId });
    if (error) {
        console.error('Error incrementing sweats:', error);
    }
}

/**
 * Fetches a single ticket with its full relational data.
 */
export async function getTicketWithDetails(id: string) {
    if (id === 'demo-ticket-id') {
        return {
            id: 'demo-ticket-id',
            status: 'active',
            profile: {
                full_name: 'Demo Guest',
                email: 'demo@example.com'
            },
            slot: {
                start_time: new Date().toISOString(),
                product: {
                    name: 'Demo Pass',
                    location: {
                        name: 'Brighton Sanctuary'
                    }
                }
            }
        };
    }

    const { data, error } = await supabaseAdmin
        .from('tickets')
        .select(`
      *,
      profile:profiles(*),
      slot:slots(
        *,
        product:products(
          *,
          location:locations(*)
        )
      )
    `)
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching ticket details:', error);
        return null;
    }

    return data;
}

/**
 * Marks a ticket as checked in and increments the user's loyalty count.
 */
export async function checkInTicket(id: string) {
    // 1. Get the ticket to find the profileId
    const ticket = await getTicketWithDetails(id);
    if (!ticket) throw new Error('Ticket not found');
    if (ticket.status === 'used') throw new Error('Ticket already used');

    // 2. Update ticket status
    const { error: ticketError } = await supabaseAdmin
        .from('tickets')
        .update({
            status: 'used',
            check_in_at: new Date().toISOString()
        })
        .eq('id', id);

    if (ticketError) throw ticketError;

    // 3. Increment loyalty
    if (ticket.profile_id) {
        await incrementSweats(ticket.profile_id);
    }

    return { success: true };
}
/**
 * Sends a confirmation email with a link to the digital ticket.
 */
export async function sendTicketEmail(ticketId: string) {
    const { resend } = await import('./resend');
    const { TicketEmail } = await import('@/emails/TicketEmail');
    const ticket = await getTicketWithDetails(ticketId);

    if (!ticket) throw new Error('Ticket not found for email');

    const customerEmail = ticket.profile?.email;
    if (!customerEmail) throw new Error('Customer email missing');

    const { data, error } = await resend.emails.send({
        from: 'Hello Sunshine Sauna <hello@hellosunshinesauna.com>',
        to: [customerEmail],
        subject: `Your Ticket for ${ticket.slot?.product?.location?.name || 'Hello Sunshine Sauna'}`,
        react: TicketEmail({
            customerName: ticket.profile?.full_name || 'Guest',
            eventTitle: ticket.slot?.product?.location?.name || 'Hello Sunshine Sauna',
            passName: ticket.slot?.product?.name || 'General Entry',
            date: ticket.slot ? new Date(ticket.slot.start_time).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Season Pass',
            ticketId: ticket.id,
        }) as React.ReactElement,
    });

    if (error) {
        console.error('Error sending email:', error);
        throw error;
    }

    return data;
}

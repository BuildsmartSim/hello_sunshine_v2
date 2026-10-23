// Ticket links are bearer links. Send only the fields needed to display the pass.
type Product = { name?: string; location?: { name?: string } | null };
type DisplayTicket = {
    id: string;
    status: string;
    profile?: { full_name?: string; terms_accepted?: boolean } | null;
    product?: Product | null;
    slot?: { start_time?: string; product?: Product | null } | null;
};

export function toPublicTicket(ticket: DisplayTicket) {
    const product = (value?: Product | null) => value ? {
        name: value.name,
        location: value.location ? { name: value.location.name } : null,
    } : null;
    return {
        id: ticket.id,
        status: ticket.status,
        profile: ticket.profile ? {
            full_name: ticket.profile.full_name,
            terms_accepted: ticket.profile.terms_accepted,
        } : null,
        product: product(ticket.product),
        slot: ticket.slot ? { start_time: ticket.slot.start_time, product: product(ticket.slot.product) } : null,
    };
}

export type LocationType = 'festival' | 'fixed_site' | 'pop_up';
export type TicketStatus = 'active' | 'used' | 'refunded';

export interface Location {
    id: string;
    name: string;
    type: LocationType;
    is_active: boolean;
    created_at: string;
}

export interface Product {
    id: string;
    location_id: string;
    name: string;
    price_id: string;
    stock_limit: number | null;
    is_scheduled: boolean;
    created_at: string;
    // Join data
    location?: Location;
}

export interface Slot {
    id: string;
    product_id: string;
    start_time: string;
    end_time: string;
    capacity: number;
    created_at: string;
}

export interface Profile {
    id: string;
    email: string;
    phone: string | null;
    full_name: string | null;
    age: number | null;
    gender: string | null;
    waiver_accepted: boolean;
    waiver_accepted_at: string | null;
    total_sweats: number;
    medical_notes: string | null;
    created_at: string;
}

export interface Ticket {
    id: string;
    profile_id: string;
    slot_id: string | null;
    status: TicketStatus;
    check_in_at: string | null;
    stripe_session_id: string | null;
    created_at: string;
    // Join data
    profile?: Profile;
    slot?: Slot;
}

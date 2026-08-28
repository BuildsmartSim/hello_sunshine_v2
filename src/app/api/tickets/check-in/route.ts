import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import { checkInTicket } from '@/lib/ticketing';
import { requireStaffOrAdmin } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, pin } = body;

        const auth = await requireStaffOrAdmin(pin);
        if (!auth.authorized) {
            return NextResponse.json({ error: auth.error || 'Unauthorized staff access' }, { status: 401 });
        }

        if (!id) {
            return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 });
        }

        const result = await checkInTicket(id);
        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Check-in API error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}


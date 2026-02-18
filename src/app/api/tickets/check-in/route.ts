import { NextRequest, NextResponse } from 'next/server';
import { checkInTicket } from '@/lib/ticketing';

export async function POST(req: NextRequest) {
    try {
        const { id } = await req.json();

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

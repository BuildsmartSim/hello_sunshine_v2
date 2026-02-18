import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import { sendTicketEmail } from '@/lib/ticketing';

export async function POST(req: Request) {
    try {
        const { email, ticketId } = await req.json();

        if (!process.env.RESEND_API_KEY) {
            return NextResponse.json({ error: 'RESEND_API_KEY is not set' }, { status: 500 });
        }

        const data = await sendTicketEmail(ticketId || 'demo-ticket-id');
        return NextResponse.json({ success: true, data });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

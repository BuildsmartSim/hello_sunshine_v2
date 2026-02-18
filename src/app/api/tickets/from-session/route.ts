import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
        return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
        .from('tickets')
        .select('id')
        .eq('stripe_session_id', sessionId)
        .single();

    if (error || !data) {
        return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({ ticketId: data.id });
}

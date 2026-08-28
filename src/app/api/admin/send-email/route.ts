import { NextResponse } from 'next/server';
import { sendTicketEmail } from '@/lib/ticketing';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: Request) {
    const auth = await requireAdmin();
    if (!auth.authorized) {
        return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    try {
        const result = await sendTicketEmail(id);
        return NextResponse.json({ success: true, result });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}


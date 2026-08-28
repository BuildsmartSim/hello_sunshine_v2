import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
    const auth = await requireAdmin();
    if (!auth.authorized) {
        return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    try {
        const logPath = path.join(process.cwd(), 'email_logs.txt');
        if (fs.existsSync(logPath)) {
            const data = fs.readFileSync(logPath, 'utf8');
            return NextResponse.json({ logs: data.split('\n') });
        } else {
            return NextResponse.json({ logs: ['No logs found'] });
        }
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}


import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const logPath = path.join(process.cwd(), 'email_logs.txt');
        if (fs.existsSync(logPath)) {
            const data = fs.readFileSync(logPath, 'utf8');
            return NextResponse.json({ logs: data.split('\n') });
        } else {
            return NextResponse.json({ logs: ['No logs found'] });
        }
    } catch (e: any) {
        return NextResponse.json({ error: e.message });
    }
}

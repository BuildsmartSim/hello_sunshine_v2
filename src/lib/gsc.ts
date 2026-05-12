import { google } from 'googleapis';
import * as path from 'path';

export async function getWeeklyGSCRankings() {
    try {
        const SITE_URL = 'https://hellosunshinesauna.com/';
        // When running in production (e.g. Next.js on DigitalOcean), process.cwd() is the root of the project
        const KEY_FILE_PATH = path.join(process.cwd(), 'secrets', 'gsc-credentials.json');

        const end = new Date();
        const start = new Date(end);
        start.setDate(end.getDate() - 7);

        const startDate = start.toISOString().split('T')[0];
        const endDate = end.toISOString().split('T')[0];

        const auth = new google.auth.GoogleAuth({
            keyFile: KEY_FILE_PATH,
            scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
        });

        const authClient = await auth.getClient();
        const searchconsole = google.searchconsole({
            version: 'v1',
            auth: authClient as any,
        });

        const response = await searchconsole.searchanalytics.query({
            siteUrl: SITE_URL,
            requestBody: {
                startDate: startDate,
                endDate: endDate,
                dimensions: ['query'],
                rowLimit: 10,
            },
        });

        const rows = response.data.rows || [];

        return rows.map((row) => ({
            keyword: row.keys ? row.keys[0] : 'Unknown',
            clicks: row.clicks || 0,
            impressions: row.impressions || 0,
            position: row.position ? row.position.toFixed(1) : 'N/A',
        })).sort((a, b) => b.clicks - a.clicks);

    } catch (error) {
        console.error("GSC Integration Error:", error);
        return [];
    }
}

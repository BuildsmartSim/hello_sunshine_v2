export function getSiteOrigin(): string {
    const configured = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL;
    const fallback = process.env.NODE_ENV === 'production'
        ? 'https://hellosunshinesauna.com'
        : 'http://localhost:3000';
    const url = new URL(configured || fallback);
    if (url.protocol !== 'https:' && !(process.env.NODE_ENV !== 'production' && url.hostname === 'localhost')) {
        throw new Error('Site URL must use HTTPS');
    }
    return url.origin;
}

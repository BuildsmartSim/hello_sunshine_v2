import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, readlink, writeFile, rename } from 'node:fs/promises';
import { connect } from 'node:tls';
import { auditFindings, nodeFindings, commitRun } from './core.mjs';

const exec = promisify(execFile);
const site = 'https://hellosunshinesauna.com';
const stateFile = `${process.env.STATE_DIRECTORY || '/var/lib/hellosunshine-security'}/state.json`;

async function request(url, options = {}) {
    return fetch(url, { ...options, signal: AbortSignal.timeout(20000), redirect: 'error' });
}

async function json(url, options) {
    const response = await request(url, options);
    if (!response.ok) throw new Error(`Remote service returned HTTP ${response.status}`);
    return response.json();
}

async function dependencies() {
    let output;
    try {
        ({ stdout: output } = await exec('/usr/bin/npm', ['audit', '--json', '--include=dev', '--registry=https://registry.npmjs.org'], {
            cwd: '/srv/hellosunshine/current', timeout: 180000, maxBuffer: 8 * 1024 * 1024,
            // npm does not need database, Stripe, email or other application secrets.
            env: { PATH: '/usr/bin:/bin', HOME: process.env.STATE_DIRECTORY, npm_config_cache: `${process.env.STATE_DIRECTORY}/npm-cache`, npm_config_update_notifier: 'false' },
        }));
    } catch (error) {
        if (error.code !== 1 || !error.stdout) throw new Error('npm audit could not complete');
        output = error.stdout; // npm exits 1 when it finds vulnerabilities.
    }
    return auditFindings(JSON.parse(output));
}

async function runtime() {
    const [releases, schedule] = await Promise.all([
        json('https://nodejs.org/dist/index.json'),
        json('https://raw.githubusercontent.com/nodejs/Release/main/schedule.json'),
    ]);
    return nodeFindings(process.version, releases, schedule);
}

async function website() {
    const probes = [
        ['/', 200], ['/tickets', 200], ['/api/admin/logs', 401],
        ['/api/social/upload-url', 401, 'POST'],
        ['/api/tickets/from-session?session_id=test_session_123', 400],
    ];
    const findings = [];
    for (const [path, expected, method = 'GET'] of probes) {
        const response = await request(site + path, {
            method, headers: { 'User-Agent': 'HelloSunshine-SecurityMonitor/1.0', ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}) },
            ...(method === 'POST' ? { body: '{}' } : {}),
        });
        await response.body?.cancel();
        if (response.status !== expected) findings.push({
            id: `website:${path}`, severity: expected === 401 ? 'high' : 'warning',
            detail: `${method} ${path} returned ${response.status}, expected ${expected}. Review availability or the access control regression.`,
        });
    }
    return findings;
}

async function certificate() {
    const expires = await new Promise((resolve, reject) => {
        const socket = connect({ host: 'hellosunshinesauna.com', port: 443, servername: 'hellosunshinesauna.com', rejectUnauthorized: true }, () => {
            const date = socket.getPeerCertificate().valid_to;
            socket.end(); resolve(date);
        });
        socket.setTimeout(20000, () => socket.destroy(new Error('TLS timeout')));
        socket.once('error', () => reject(new Error('HTTPS certificate validation or connection failed')));
    });
    if (!Number.isFinite(Date.parse(expires))) throw new Error('HTTPS certificate expiry could not be read');
    return Date.parse(expires) - Date.now() < 14 * 86400000 ? [{
        id: 'tls:expiry', severity: 'high', detail: `HTTPS certificate expires ${expires}. Check Certbot renewal.`,
    }] : [];
}

async function service() {
    const [{ stdout: properties }, { stdout: listeners }] = await Promise.all([
        exec('/usr/bin/systemctl', ['show', 'hellosunshine.service', '--property=User,ActiveState,MainPID']),
        exec('/usr/bin/ss', ['-H', '-ltn']),
    ]);
    const values = Object.fromEntries(properties.trim().split('\n').map(line => line.split('=')));
    const findings = [];
    if (values.User !== 'hellosunshine' || values.ActiveState !== 'active') findings.push({
        id: 'service:ownership', severity: 'high', detail: 'Website service is inactive or no longer configured to run as the dedicated hellosunshine user.',
    });
    if (listeners.split('\n').some(line => {
        const address = line.trim().split(/\s+/)[3];
        return address?.endsWith(':3000') && address !== '127.0.0.1:3000' && address !== '[::1]:3000';
    })) findings.push({ id: 'service:port', severity: 'high', detail: 'Application port 3000 is listening beyond loopback. Restore the private app binding.' });
    if (Number(values.MainPID) > 0 && (await readlink(`/proc/${values.MainPID}/exe`)).endsWith(' (deleted)')) findings.push({
        id: 'service:restart', severity: 'high', detail: 'The running app uses a replaced executable. Restart the service so the installed Node.js patch is loaded.',
    });
    return findings;
}

async function notify(next, test) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.RESEND_API_KEY) throw new Error('Alert credentials are missing');
    const settings = await json(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/admin_settings?id=eq.default&select=chief_email`, {
        headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` },
    });
    const destination = settings?.[0]?.chief_email;
    if (!destination) throw new Error('Existing admin alert email is not configured');
    const all = Object.values(next.checks).flat();
    const section = (label, entries) => entries.length ? `\n${label}\n${entries.map(f => `- [${f.severity}] ${f.detail}`).join('\n')}\n` : '';
    const text = `${test ? 'Security monitoring is enabled. This is the initial delivery test.\n' : ''}` +
        `Site: ${site}\nSchedule: every six hours, on the production server.\n` +
        section('New or changed findings:', next.changed) + section('Resolved findings:', next.resolved) +
        (!all.length ? '\nAll configured checks passed; no known dependency vulnerabilities or outstanding Node.js security releases were found.\n' : section('Current findings:', all)) +
        '\nChecks: production lockfile (including build dependencies), Node.js security releases/support, HTTPS certificate, public access guards, app service user and port binding.\n' +
        'Only changes generate alerts. Failed checks also alert; unchanged findings are not repeated. Updates require review and are not installed automatically.\n' +
        'These checks detect known advisories and selected regressions, and do not replace a full security audit.\n';
    const result = await json('https://api.resend.com/emails', {
        method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: 'Hello Sunshine Security <hello@hellosunshinesauna.com>', to: [destination],
            subject: test ? 'Hello Sunshine: security monitoring enabled (test)' : `Hello Sunshine security: ${next.changed.length} new/changed, ${next.resolved.length} resolved`, text }),
    });
    if (!result.id) throw new Error('Email provider did not acknowledge the alert');
    console.log(JSON.stringify({ notificationAccepted: true, emailId: result.id }));
}

async function main() {
    let previous = { version: 1, checks: {} };
    try {
        previous = JSON.parse(await readFile(stateFile, 'utf8'));
        if (previous.version !== 1 || !previous.checks || typeof previous.checks !== 'object') throw new Error('Invalid monitor state');
    } catch (error) {
        if (error.code !== 'ENOENT') throw new Error('Monitor state is invalid; refusing to discard alert history');
    }
    const results = {};
    for (const [name, check] of Object.entries({ dependencies, runtime, website, certificate, service })) {
        try { results[name] = { findings: await check() }; }
        // Keep errors generic: remote URLs/errors can contain credentials or private response data.
        catch { results[name] = { error: 'unable to complete; inspect the monitor service and network connectivity' }; }
    }
    const next = await commitRun({ previous, results, test: process.argv.includes('--test-notification'), notify,
        persist: async state => {
            await writeFile(stateFile + '.tmp', JSON.stringify(state, null, 2) + '\n', { mode: 0o600 });
            await rename(stateFile + '.tmp', stateFile);
        },
    });
    console.log(JSON.stringify({ checkedAt: new Date().toISOString(), findings: Object.values(next.checks).flat().length,
        newOrChanged: next.changed.length, resolved: next.resolved.length,
        checks: Object.fromEntries(Object.entries(results).map(([name, result]) => [name, result.error ? 'failed' : 'passed'])) }));
}

main().catch(() => { console.error('Security monitor failed; alert history was not advanced. Check configuration, state permissions, network connectivity and email provider.'); process.exitCode = 1; });

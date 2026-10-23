export function auditFindings(report) {
    if (report?.error || report?.auditReportVersion !== 2 || !report.vulnerabilities || !report.metadata?.vulnerabilities) {
        throw new Error('Dependency audit returned an invalid report');
    }
    return Object.entries(report.vulnerabilities).map(([name, issue]) => {
        const advisories = issue.via.filter(value => typeof value === 'object');
        return {
            id: `npm:${name}`,
            severity: issue.severity,
            detail: `${name}: ${issue.severity}; affected range ${issue.range}. ` +
                advisories.map(a => `${a.title} (${a.url})`).join('; ') +
                (advisories.length ? '' : ` Affected through: ${issue.via.join(', ')}.`) +
                (issue.fixAvailable ? ' A dependency update is available.' : ' No automatic fix is listed; review the advisory.'),
        };
    });
}

function versionParts(version) {
    if (!/^v?\d+\.\d+\.\d+$/.test(version)) throw new Error('Invalid Node.js release version');
    return version.replace(/^v/, '').split('.').map(Number);
}

export function nodeFindings(version, releases, schedule, now = new Date()) {
    const installed = versionParts(version);
    const lifecycle = schedule?.[`v${installed[0]}`];
    if (!Array.isArray(releases) || !releases.length || !lifecycle?.end || !Number.isFinite(Date.parse(lifecycle.end))) {
        throw new Error('Node.js advisory or support schedule is unavailable');
    }
    const newerSecurity = releases.filter(release => {
        const parts = versionParts(release.version);
        return release.security === true && parts[0] === installed[0] &&
            (parts[1] > installed[1] || (parts[1] === installed[1] && parts[2] > installed[2]));
    }).sort((a, b) => {
        const aa = versionParts(a.version), bb = versionParts(b.version);
        return bb[1] - aa[1] || bb[2] - aa[2];
    });
    // Require the installed release line to be present; a truncated feed is not a clean scan.
    if (!releases.some(r => versionParts(r.version)[0] === installed[0])) throw new Error('Node.js release line missing from feed');
    const findings = [];
    if (newerSecurity.length) findings.push({
        id: 'node:security-update', severity: 'high',
        detail: `Node.js ${version} is behind security release ${newerSecurity[0].version}. Review https://nodejs.org/en/blog/vulnerability and upgrade/restart the app.`,
    });
    const days = (Date.parse(lifecycle.end) - now.getTime()) / 86400000;
    if (days <= 30) findings.push({
        id: 'node:support', severity: days <= 0 ? 'high' : 'warning',
        detail: `Node.js ${installed[0]} ${days <= 0 ? 'has reached' : 'is within 30 days of'} end of support (${lifecycle.end}). Move to a supported release.`,
    });
    return findings;
}

export function reconcile(previous, results) {
    const checks = {};
    for (const [name, result] of Object.entries(results)) {
        checks[name] = result.error
            ? [...(previous.checks?.[name] || []).filter(f => !f.id.startsWith('check:')), {
                id: `check:${name}`, severity: 'warning', detail: `${name} check failed: ${result.error}. Existing findings are retained until this check succeeds.`,
            }]
            : result.findings;
    }
    const flatten = groups => Object.values(groups || {}).flat();
    const old = new Map(flatten(previous.checks).map(f => [f.id, f]));
    const current = new Map(flatten(checks).map(f => [f.id, f]));
    const changed = [...current.values()].filter(f => JSON.stringify(f) !== JSON.stringify(old.get(f.id)));
    const resolved = [...old.values()].filter(f => !current.has(f.id));
    return { checks, changed, resolved };
}

export async function commitRun({ previous, results, notify, persist, test = false }) {
    const next = reconcile(previous, results);
    if (test || next.changed.length || next.resolved.length) await notify(next, test);
    // A rejected notification must not suppress the same findings on the next run.
    await persist({ version: 1, checkedAt: new Date().toISOString(), checks: next.checks });
    return next;
}

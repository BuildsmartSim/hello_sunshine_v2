import test from 'node:test';
import assert from 'node:assert/strict';
import { auditFindings, nodeFindings, reconcile, commitRun } from '../ops/security-monitor/core.mjs';

const finding = { id: 'npm:example', severity: 'high', detail: 'Fixture advisory' };
const prior = { version: 1, checks: { dependencies: [finding] } };
const cleanAudit = { auditReportVersion: 2, vulnerabilities: {}, metadata: { vulnerabilities: { total: 0 } } };

test('audit failures cannot be interpreted as a clean scan', () => {
    for (const report of [{}, { error: { code: 'ENETWORK' } }, { ...cleanAudit, metadata: {} }]) {
        assert.throws(() => auditFindings(report), /invalid report/);
    }
    assert.deepEqual(auditFindings(cleanAudit), []);
});

test('direct and transitive advisories retain severity and remediation information', () => {
    const result = auditFindings({ ...cleanAudit, vulnerabilities: {
        example: { severity: 'high', range: '<2.0.0', via: [{ title: 'Fixture vulnerability', url: 'https://example.invalid/advisory' }], fixAvailable: true },
        parent: { severity: 'moderate', range: '*', via: ['example'], fixAvailable: false },
    } });
    assert.equal(result.length, 2);
    assert.match(result[0].detail, /example.invalid\/advisory/);
    assert.match(result[1].detail, /Affected through: example/);
});

test('Node alerts cover newer security fixes in the installed line and impending EOL', () => {
    const releases = [{ version: 'v22.23.4', security: true }, { version: 'v22.24.0', security: false }, { version: 'v24.22.1', security: true }];
    const schedule = { v22: { end: '2027-04-30' } };
    assert.deepEqual(nodeFindings('v22.23.4', releases, schedule, new Date('2026-10-23')), []);
    assert.equal(nodeFindings('v22.23.3', releases, schedule, new Date('2026-10-23'))[0].id, 'node:security-update');
    assert.equal(nodeFindings('v22.23.4', releases, schedule, new Date('2027-04-15'))[0].severity, 'warning');
    assert.equal(nodeFindings('v22.23.4', releases, schedule, new Date('2027-05-01'))[0].severity, 'high');
    assert.throws(() => nodeFindings('v22.23.4', [], schedule));
    assert.throws(() => nodeFindings('v22.23.4', releases, {}));
});

test('unchanged scans stay quiet; a severity change and resolution notify', () => {
    assert.equal(reconcile(prior, { dependencies: { findings: [finding] } }).changed.length, 0);
    assert.equal(reconcile(prior, { dependencies: { findings: [{ ...finding, severity: 'critical' }] } }).changed.length, 1);
    assert.deepEqual(reconcile(prior, { dependencies: { findings: [] } }).resolved, [finding]);
});

test('failed scans retain old vulnerabilities and deduplicate the failure alert', () => {
    const result = reconcile(prior, { dependencies: { error: 'unavailable' } });
    assert.deepEqual(result.resolved, []);
    assert.deepEqual(result.checks.dependencies[0], finding);
    assert.equal(result.changed[0].id, 'check:dependencies');
    assert.equal(reconcile(result, { dependencies: { error: 'unavailable' } }).changed.length, 0);
    const recovery = reconcile(result, { dependencies: { findings: [finding] } });
    assert.equal(recovery.resolved[0].id, 'check:dependencies');
});

test('rejected delivery never advances persisted state and is retried next run', async () => {
    let saves = 0, sends = 0;
    const options = { previous: { checks: {} }, results: { dependencies: { findings: [finding] } },
        notify: async () => { sends++; throw new Error('Email rejected'); }, persist: async () => { saves++; } };
    await assert.rejects(commitRun(options), /Email rejected/);
    await assert.rejects(commitRun(options), /Email rejected/);
    assert.equal(sends, 2);
    assert.equal(saves, 0);
});

test('clean repeated runs persist health timestamps without email; setup test explicitly sends', async () => {
    let sends = 0, saves = 0;
    const options = { previous: { checks: {} }, results: { dependencies: { findings: [] } },
        notify: async () => { sends++; }, persist: async () => { saves++; } };
    await commitRun(options);
    assert.equal(sends, 0);
    await commitRun({ ...options, test: true });
    assert.equal(sends, 1);
    assert.equal(saves, 2);
});

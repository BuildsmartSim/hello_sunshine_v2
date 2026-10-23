# Security monitoring

The production server runs `hellosunshine-security.timer` at 00:15, 06:15,
12:15 and 18:15 UTC, with up to ten minutes of jitter. `Persistent=true` catches
up a missed run after a restart. This runs independently of the website and of
the owner's computer. Existing hourly ticketing alerts keep their own schedule.

The monitor checks the live release's npm lockfile, including build dependencies,
against the npm advisory registry; the installed Node.js version against the
official security release feed and support schedule; HTTPS certificate validity
and expiry within 14 days; homepage/ticket page availability; selected admin,
social upload and ticket lookup access guards; service ownership and private
port 3000 binding; and whether the app needs restarting after a binary update.
It does not submit bookings, send customer emails or create payments.

Notifications use the existing `admin_settings.chief_email` and Resend account,
with the verified `hello@hellosunshinesauna.com` sender. Updating the admin email
in the website's settings also changes the monitor destination. No credentials
or customer records are included in alerts. Telegram is not currently configured.

New/changed findings, resolutions and failed/recovered checks generate an email.
Unchanged scans stay quiet. Failed scans retain previous findings rather than
reporting a false resolution. Resend must acknowledge an email before alert
history advances. Rejected deliveries fail the service and retry after 15
minutes, up to three starts per two hours; the next scheduled run also retries.
An accepted email is not a guarantee of inbox delivery. The initial setup email
is explicitly labelled as a test. This does not automatically upgrade packages.

Code is installed root-owned in `/usr/local/lib/hellosunshine-security/`, and
the two systemd units in `/etc/systemd/system/`. The service runs without root
privileges, with read-only access to the application. Credentials are injected
from `/etc/hellosunshine/environment`; npm receives only a minimal environment.
State and the npm cache live in `/var/lib/hellosunshine-security/` with mode 0700.
Monitor code is independent of app releases; deploy monitor changes explicitly.

Validate with `node --test tests/security-monitor.test.mjs` and
`systemd-analyze verify ops/hellosunshine-security.{service,timer}` on Linux.
Install both `.mjs` files and the units, then run `systemctl daemon-reload`,
`systemctl enable --now hellosunshine-security.timer` and
`systemctl start hellosunshine-security.service`. Inspect results with
`journalctl -u hellosunshine-security.service` and
`systemctl list-timers hellosunshine-security.timer`.
For an explicit delivery test, temporarily add `--test-notification` to the
service ExecStart via a runtime drop-in, start the service, and remove the
drop-in afterward. Never put secrets on a command line or in the journal.

Coverage is known npm advisories, released Node.js security fixes and selected
site/configuration checks. It does not scan Ubuntu packages, discover every
application vulnerability, monitor traffic for compromise, or provide an
external dead-man alert if the whole server goes offline. Existing DigitalOcean
infrastructure alerts remain useful alongside this monitoring.

Sources: [npm audit](https://docs.npmjs.com/cli/v10/commands/npm-audit/),
[Node releases](https://nodejs.org/dist/index.json),
[Node support schedule](https://github.com/nodejs/Release/blob/main/schedule.json).

# Production deployment after the October 2026 security update

The production app runs as `hellosunshine`, managed by `hellosunshine.service`.
Its working directory is `/srv/hellosunshine/current`, a symlink to a verified
release under `/srv/hellosunshine/releases/`. The service unit is maintained in
`ops/hellosunshine.service`.

Production credentials are stored in `/etc/hellosunshine/environment` (root mode
0600) and injected by systemd. Never commit them or include them in public assets.
Build releases with public configuration and the anonymous Supabase key only.

Before deployment, run `npm run test:security`, `npm audit`, TypeScript checks and
a local production build with patched Node 22.23.4 or a newer Node 22 release.
Commit and push the reviewed changes when deployment is authorized. Install the
locked dependencies and build a separate release on the server. Preserve shared
images, optimized assets, the optimizer cache and the protected email log.
Materialize image folders inside the release during the Turbopack build, then
replace those copies with shared symlinks after the build. On the small droplet,
allow a 3072 MB build heap with its existing swap for TypeScript checking.
Check the release on a
temporary loopback port before switching `current` and restarting the service.
Code is root-owned; only the writable paths in the service unit belong to the
service user. The release directory must not contain production credentials.

The app must listen only on 127.0.0.1:3000. Nginx proxies to this address and
must overwrite X-Forwarded-For with its actual remote address and set
X-Forwarded-Proto from the connection scheme. External port 3000 must reject
connections. Keep the existing SSH and TLS certificate access intact.

Verify homepage, tickets, event details, booking form, login, confirmation error
states, API authentication, dependency audit, service ownership and startup.
Exercise successful and failed payment fulfillment using isolated regression
fixtures or Stripe test credentials; do not charge real cards or create live
reservations for deployment testing.

Keep root-only rollback copies of the previous release target, Nginx config and
service units. Restore and verify the previous deployment if health checks fail.
The former `/root/hello_sunshine_v2` PM2 checkout is an emergency rollback only;
normal deployments must not restart the old root PM2 process or build in a live
release. Do not recreate swap or reset the server checkout to deploy a release.

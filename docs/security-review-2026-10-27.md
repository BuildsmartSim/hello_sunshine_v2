# Dependency security review — 27 October 2026

Reviewed and deployed to production on 27 October 2026 at 23:08 UTC (London).
Application release: `b49f3d9d9c0ea931710abd30df005d904a1e6e1c`.

- Upgrade Satori from 0.19.2 to 0.33.5, the first release patched for
  [SVG escaping](https://github.com/advisories/GHSA-wx4j-mvgx-mqwp).
- Override only Satori's pinned `fflate` dependency to the compatible 0.7.5
  patch. Its default 0.7.3 introduces a separate
  [malformed ZIP64 denial of service](https://github.com/advisories/GHSA-px8p-9vwx-vf98).
- Remove `@mendable/firecrawl-js`. Its current release still requires Zod 3;
  npm's suggested downgrade to 0.0.16 would discard the API version used here.
  The discovery helper now calls the documented
  [v2 scrape API](https://docs.firecrawl.dev/agent-source-of-truth/curl#scrape)
  directly, preserving markdown-or-null results, API origin configuration,
  authentication, the five-minute timeout and bounded retries for HTTP 502.
- Resolve the remaining, build-only Zod dependency to 4.6.7 through the existing
  compatible ESLint peer range. This exceeds the 4.6.6
  [security fix](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5).
- The complete authorized image-route check exposed an unsupported WOFF2 font
  download. Bundle Google's Inter Regular TTF and its SIL Open Font License,
  load both fonts locally as Buffers, and test the complete route with fixture
  authentication and storage. Image generation no longer downloads fonts.

Validation:

- Full npm audit, including build dependencies: zero known vulnerabilities.
- Node 22.23.4: all 34 security, monitoring and rendering regression tests pass
  locally and on the production server.
- Both social templates render 1080 × 1080 PNGs with the real local logo and
  Chicle font, with both gradient and photo backgrounds. Tests embed the logo
  locally and exercise the SVG-to-PNG pipeline without uploads.
- Firecrawl smoke request to example.com returns markdown using the local key.
- TypeScript and an isolated Next.js production build pass with fixture public
  configuration and no production credentials. The build reports the existing
  middleware deprecation warning; live Supabase content is not verified by this
  fixture build.
- Changed TypeScript passes ESLint. CommonJS test files pass with the
  `@typescript-eslint/no-require-imports` rule disabled, matching the existing
  test suite's Node CommonJS style.

Deployment verification:

- Built a separate release on the server and verified 164 source/configuration
  hashes before activation. The full staged audit reported zero vulnerabilities.
- Preserved the configured public map, analytics and Supabase settings; preserved
  shared images, optimized assets, optimizer cache and protected email log.
- Private preview and live checks pass for the homepage, tickets, event details,
  login, confirmation error state and protected API responses. The browser shows
  the correct event title and booking form; no booking or payment was submitted.
- Source files are root-owned and read-only to the service user. The app runs as
  `hellosunshine` on 127.0.0.1:3000; external port 3000 rejects connections.
- At 23:08:45 UTC the production security monitor reported zero findings, all
  five checks passed, and all three original findings resolved. Its resolution
  notification was accepted by the email provider.
- The six-hour timer remains active. The previous release and root-only rollback
  snapshots remain available; the temporary preview service was stopped.

Future releases should follow [the release procedure](security-deployment.md).

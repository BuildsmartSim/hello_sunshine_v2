# Dependency security review — 27 October 2026

Local changes prepared for review. Production has not been updated.

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

Validation:

- Full npm audit, including build dependencies: zero known vulnerabilities.
- Node 22.23.4: security, monitoring and rendering regression suites pass.
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

Deploy only after review, using [the release procedure](security-deployment.md).
The six-hour server monitor and its notification behavior are unchanged.
Production findings remain until a reviewed release is deployed and scanned.

# Interactions Audit Report (apps/web)

## Routes audited (completed)

- `/` (Home): **audited + fully interaction-tested** with stable `data-testid` selectors and Playwright console/page/network integrity guard.

## Click Integrity Guard

- **Added** `apps/web/e2e/utils/click-integrity-guard.ts`
  - Fails tests on:
    - `pageerror`
    - `console.error` (no allowlist currently used in tests)
    - `requestfailed` (ignores expected navigation abort/cancel signals such as `net::ERR_ABORTED`, `NS_BINDING_ABORTED`, `Load request cancelled`)

## Stable selectors added (high-signal)

### Home (`/`)

- **Top nav**
  - `topnav-logo`
  - `topnav-theme-toggle`
  - `topnav-link-features`
  - `topnav-link-integrations`
  - `topnav-link-pricing`
  - `topnav-link-docs`
  - `topnav-auth-sign-in`
  - `topnav-auth-sign-up`
- **Hero / CTA**
  - `home-cta-start-testing`
  - `home-cta-view-docs`
  - `home-cta-get-started`
- **Pricing CTAs**
  - `home-pricing-cta-free`
  - `home-pricing-cta-pro`
  - `home-pricing-cta-enterprise`
- **Footer**
  - `footer-link-features`
  - `footer-link-integrations`
  - `footer-link-pricing`
  - `footer-link-changelog`
  - `footer-link-docs`
  - `footer-link-cli-reference`
  - `footer-link-api`
  - `footer-link-blog`
  - `footer-link-about`
  - `footer-link-privacy`
  - `footer-link-terms`
  - `footer-link-github`

## Playwright coverage updates

- **Homepage interactions** are now validated via `data-testid` selectors (no fragile text selectors required for critical CTAs).
- **All Playwright tests pass** locally after installing browsers (`playwright install --with-deps`).

## Fixes made (wiring / reliability)

- **Docs anchor scrolling links** on the homepage and footer are now tested via stable selectors.
- **Health endpoint DB check** now skips DB probing when DB URL env vars are absent:
  - `apps/web/app/api/health/route.ts` now requires `POSTGRES_PRISMA_URL` (or `DATABASE_URL`) before running `db.$queryRaw`.

## Remaining work (not yet audited / still TODO)

Per `apps/web/INTERACTIONS.md`, the following routes still need:
1) full interaction inventory
2) stable `data-testid` coverage for meaningful interactive elements
3) Playwright tests that validate *every declared interaction* per route

### Public pages (pending)

- `/features`
- `/integrations`
- `/pricing`
- `/docs`
- `/blog`
- `/blog/[slug]`
- `/about`
- `/privacy`
- `/terms`
- `/changelog`

### Auth pages (pending)

- `/sign-in`
- `/sign-up`
- `/forgot-password`

### Dashboard (pending)

- `/dashboard` and all subroutes listed in `apps/web/INTERACTIONS.md`


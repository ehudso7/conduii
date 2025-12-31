# Interaction Map (apps/web)

This document enumerates **every user-visible interactive element** in the `apps/web` Next.js App Router app.

## Conventions

- **Selector contract**: every meaningful interactive element must have a stable `data-testid`.
- **Test rule**: Playwright must validate every interaction listed for a route, and must fail on:
  - `pageerror`
  - `console.error`
  - failed network requests (except explicitly allowlisted in the Click Integrity Guard)

### Suggested `data-testid` naming

- **Top nav**: `topnav-logo`, `topnav-link-features`, `topnav-link-integrations`, `topnav-link-pricing`, `topnav-link-docs`, `topnav-theme-toggle`, `topnav-auth-sign-in`, `topnav-auth-sign-up`, `topnav-auth-dashboard`, `topnav-auth-user`
- **Footer**: `footer-link-features`, `footer-link-integrations`, `footer-link-pricing`, `footer-link-changelog`, `footer-link-docs`, `footer-link-blog`, `footer-link-about`, `footer-link-privacy`, `footer-link-terms`, `footer-link-github`
- **Page CTAs**: prefix with route, e.g. `home-cta-start`, `features-cta-get-started`, `docs-cta-get-started`
- **Forms**: `*-field-*`, `*-submit`, `*-error-*`

---

## Route inventory (App Router)

### Public marketing/content

- `/`
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

### Auth

- `/sign-in`
- `/sign-up`
- `/forgot-password`

### Dashboard (authenticated)

- `/dashboard`
- `/dashboard/projects`
- `/dashboard/projects/new`
- `/dashboard/projects/[projectId]`
- `/dashboard/projects/[projectId]/runs`
- `/dashboard/projects/[projectId]/runs/[runId]`
- `/dashboard/projects/[projectId]/settings`
- `/dashboard/discover`
- `/dashboard/generate`
- `/dashboard/insights`
- `/dashboard/settings`
- `/dashboard/billing`

---

## Per-route interaction map

> Fill in each table **only with elements that are intended to be interactive** (click/press/type/select/submit).

### `/` (Home)

| Element | `data-testid` | Type | Expected outcome |
| --- | --- | --- | --- |
| Logo | `topnav-logo` | link | Navigate to `/` |
| Theme toggle | `topnav-theme-toggle` | button | Toggle theme (light/dark) |
| Top nav: Features | `topnav-link-features` | link | Scroll to `#features` (URL becomes `/#features`) |
| Top nav: Integrations | `topnav-link-integrations` | link | Scroll to `#integrations` (URL becomes `/#integrations`) |
| Top nav: Pricing | `topnav-link-pricing` | link | Scroll to `#pricing` (URL becomes `/#pricing`) |
| Top nav: Docs | `topnav-link-docs` | link | Navigate to `/docs` |
| Auth (signed out): Sign In | `topnav-auth-sign-in` | button | Navigate to `/sign-in` |
| Auth (signed out): Get Started | `topnav-auth-sign-up` | button | Navigate to `/sign-up` |
| Auth (signed in): Dashboard | `topnav-auth-dashboard` | button | Navigate to `/dashboard` |
| Auth (signed in): User menu | `topnav-auth-user` | button | Opens user menu (Clerk) |
| Hero CTA: Start Testing | `home-cta-start-testing` | button | Signed out: `/sign-up`; Signed in: `/dashboard` |
| Hero CTA: View Documentation | `home-cta-view-docs` | link | Navigate to `/docs` |
| CTA section: Get Started | `home-cta-get-started` | button | Signed out: `/sign-up`; Signed in: `/dashboard` |
| Pricing CTA (Free) | `home-pricing-cta-free` | link/button | Navigate to `/sign-up` |
| Pricing CTA (Pro) | `home-pricing-cta-pro` | link/button | Navigate to `/sign-up` |
| Pricing CTA (Enterprise) | `home-pricing-cta-enterprise` | link/button | Open mail client (`mailto:`) |
| Footer: Features | `footer-link-features` | link | Navigate to `/features` |
| Footer: Integrations | `footer-link-integrations` | link | Navigate to `/integrations` |
| Footer: Pricing | `footer-link-pricing` | link | Navigate to `/pricing` |
| Footer: Changelog | `footer-link-changelog` | link | Navigate to `/changelog` |
| Footer: Documentation | `footer-link-docs` | link | Navigate to `/docs` |
| Footer: CLI Reference | `footer-link-cli-reference` | link | Navigate to `/docs#cli-discover` |
| Footer: API | `footer-link-api` | link | Navigate to `/docs#api-auth` |
| Footer: Blog | `footer-link-blog` | link | Navigate to `/blog` |
| Footer: About | `footer-link-about` | link | Navigate to `/about` |
| Footer: Privacy | `footer-link-privacy` | link | Navigate to `/privacy` |
| Footer: Terms | `footer-link-terms` | link | Navigate to `/terms` |
| Footer: GitHub | `footer-link-github` | link | Navigate to GitHub repo (new tab ok) |

### `/features`

| Element | `data-testid` | Type | Expected outcome |
| --- | --- | --- | --- |
| (TODO) |  |  |  |

### `/integrations`

| Element | `data-testid` | Type | Expected outcome |
| --- | --- | --- | --- |
| (TODO) |  |  |  |

### `/pricing`

| Element | `data-testid` | Type | Expected outcome |
| --- | --- | --- | --- |
| (TODO) |  |  |  |

### `/docs`

| Element | `data-testid` | Type | Expected outcome |
| --- | --- | --- | --- |
| (TODO) |  |  |  |

### `/blog`

| Element | `data-testid` | Type | Expected outcome |
| --- | --- | --- | --- |
| (TODO) |  |  |  |

### `/blog/[slug]`

| Element | `data-testid` | Type | Expected outcome |
| --- | --- | --- | --- |
| (TODO) |  |  |  |

### `/about`

| Element | `data-testid` | Type | Expected outcome |
| --- | --- | --- | --- |
| (TODO) |  |  |  |

### `/privacy`

| Element | `data-testid` | Type | Expected outcome |
| --- | --- | --- | --- |
| (TODO) |  |  |  |

### `/terms`

| Element | `data-testid` | Type | Expected outcome |
| --- | --- | --- | --- |
| (TODO) |  |  |  |

### `/changelog`

| Element | `data-testid` | Type | Expected outcome |
| --- | --- | --- | --- |
| (TODO) |  |  |  |

### `/sign-in`

| Element | `data-testid` | Type | Expected outcome |
| --- | --- | --- | --- |
| (TODO) |  |  |  |

### `/sign-up`

| Element | `data-testid` | Type | Expected outcome |
| --- | --- | --- | --- |
| (TODO) |  |  |  |

### `/forgot-password`

| Element | `data-testid` | Type | Expected outcome |
| --- | --- | --- | --- |
| (TODO) |  |  |  |

### `/dashboard`

| Element | `data-testid` | Type | Expected outcome |
| --- | --- | --- | --- |
| (TODO) |  |  |  |

### `/dashboard/projects`

| Element | `data-testid` | Type | Expected outcome |
| --- | --- | --- | --- |
| (TODO) |  |  |  |

### `/dashboard/projects/new`

| Element | `data-testid` | Type | Expected outcome |
| --- | --- | --- | --- |
| (TODO) |  |  |  |

### `/dashboard/projects/[projectId]`

| Element | `data-testid` | Type | Expected outcome |
| --- | --- | --- | --- |
| (TODO) |  |  |  |

### `/dashboard/projects/[projectId]/runs`

| Element | `data-testid` | Type | Expected outcome |
| --- | --- | --- | --- |
| (TODO) |  |  |  |

### `/dashboard/projects/[projectId]/runs/[runId]`

| Element | `data-testid` | Type | Expected outcome |
| --- | --- | --- | --- |
| (TODO) |  |  |  |

### `/dashboard/projects/[projectId]/settings`

| Element | `data-testid` | Type | Expected outcome |
| --- | --- | --- | --- |
| (TODO) |  |  |  |

### `/dashboard/discover`

| Element | `data-testid` | Type | Expected outcome |
| --- | --- | --- | --- |
| (TODO) |  |  |  |

### `/dashboard/generate`

| Element | `data-testid` | Type | Expected outcome |
| --- | --- | --- | --- |
| (TODO) |  |  |  |

### `/dashboard/insights`

| Element | `data-testid` | Type | Expected outcome |
| --- | --- | --- | --- |
| (TODO) |  |  |  |

### `/dashboard/settings`

| Element | `data-testid` | Type | Expected outcome |
| --- | --- | --- | --- |
| (TODO) |  |  |  |

### `/dashboard/billing`

| Element | `data-testid` | Type | Expected outcome |
| --- | --- | --- | --- |
| (TODO) |  |  |  |


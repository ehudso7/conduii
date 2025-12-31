# Conduii Web App - Interaction Map

This document catalogs all user-visible interactive elements across the entire Conduii Next.js web application. Each element is documented with its selector, expected behavior, and test coverage status.

## Table of Contents

1. [Public Pages](#public-pages)
   - [Homepage (/)](#homepage-)
   - [Features (/features)](#features-features)
   - [Integrations (/integrations)](#integrations-integrations)
   - [Pricing (/pricing)](#pricing-pricing)
   - [Documentation (/docs)](#documentation-docs)
   - [Blog (/blog)](#blog-blog)
   - [About (/about)](#about-about)
   - [Privacy (/privacy)](#privacy-privacy)
   - [Terms (/terms)](#terms-terms)
   - [Changelog (/changelog)](#changelog-changelog)
2. [Auth Pages](#auth-pages)
   - [Sign In (/sign-in)](#sign-in-sign-in)
   - [Sign Up (/sign-up)](#sign-up-sign-up)
   - [Forgot Password (/forgot-password)](#forgot-password-forgot-password)
3. [Dashboard Pages](#dashboard-pages)
   - [Dashboard Overview (/dashboard)](#dashboard-overview-dashboard)
   - [Projects (/dashboard/projects)](#projects-dashboardprojects)
   - [Project Detail (/dashboard/projects/[id])](#project-detail-dashboardprojectsid)
   - [New Project (/dashboard/projects/new)](#new-project-dashboardprojectsnew)
   - [Settings (/dashboard/settings)](#settings-dashboardsettings)
   - [Billing (/dashboard/billing)](#billing-dashboardbilling)
   - [AI Insights (/dashboard/insights)](#ai-insights-dashboardinsights)
   - [Discover (/dashboard/discover)](#discover-dashboarddiscover)
   - [Generate Tests (/dashboard/generate)](#generate-tests-dashboardgenerate)

---

## Public Pages

### Homepage (/)

| Element | Selector/TestID | Type | Expected Behavior | Status |
|---------|-----------------|------|-------------------|--------|
| Logo | `[data-testid="logo"]` | Link | Navigate to homepage | ✅ |
| Features Nav Link | `[data-testid="nav-features"]` | Link | Smooth scroll to #features | ✅ |
| Integrations Nav Link | `[data-testid="nav-integrations"]` | Link | Smooth scroll to #integrations | ✅ |
| Pricing Nav Link | `[data-testid="nav-pricing"]` | Link | Smooth scroll to #pricing | ✅ |
| Docs Nav Link | `[data-testid="nav-docs"]` | Link | Navigate to /docs | ✅ |
| Theme Toggle | `[data-testid="theme-toggle"]` | Button | Toggle light/dark mode | ✅ |
| Sign In Button | `[data-testid="nav-signin"]` | Button | Navigate to /sign-in | ✅ |
| Get Started Button | `[data-testid="nav-getstarted"]` | Button | Navigate to /sign-up | ✅ |
| Hero CTA (Start Testing) | `[data-testid="hero-cta"]` | Button | Navigate to /sign-up | ✅ |
| View Documentation Button | `[data-testid="hero-docs"]` | Link | Navigate to /docs | ✅ |
| Pricing: Get Started | `[data-testid="pricing-free-cta"]` | Link | Navigate to /sign-up | ✅ |
| Pricing: Start Free Trial | `[data-testid="pricing-pro-cta"]` | Link | Navigate to /sign-up | ✅ |
| Pricing: Contact Sales | `[data-testid="pricing-enterprise-cta"]` | Link | Open mailto:sales@conduii.com | ✅ |
| CTA: Get Started for Free | `[data-testid="cta-getstarted"]` | Button | Navigate to /sign-up | ✅ |
| Footer: Features | `[data-testid="footer-features"]` | Link | Navigate to /features | ✅ |
| Footer: Integrations | `[data-testid="footer-integrations"]` | Link | Navigate to /integrations | ✅ |
| Footer: Pricing | `[data-testid="footer-pricing"]` | Link | Navigate to /pricing | ✅ |
| Footer: Changelog | `[data-testid="footer-changelog"]` | Link | Navigate to /changelog | ✅ |
| Footer: Documentation | `[data-testid="footer-docs"]` | Link | Navigate to /docs | ✅ |
| Footer: CLI Reference | `[data-testid="footer-cli"]` | Link | Navigate to /docs#cli-discover | ✅ |
| Footer: API | `[data-testid="footer-api"]` | Link | Navigate to /docs#api-auth | ✅ |
| Footer: Blog | `[data-testid="footer-blog"]` | Link | Navigate to /blog | ✅ |
| Footer: About | `[data-testid="footer-about"]` | Link | Navigate to /about | ✅ |
| Footer: Privacy | `[data-testid="footer-privacy"]` | Link | Navigate to /privacy | ✅ |
| Footer: Terms | `[data-testid="footer-terms"]` | Link | Navigate to /terms | ✅ |
| Footer: GitHub | `[data-testid="footer-github"]` | Link | Open GitHub repo (external) | ✅ |

### Features (/features)

| Element | Selector/TestID | Type | Expected Behavior | Status |
|---------|-----------------|------|-------------------|--------|
| Logo | `[data-testid="logo"]` | Link | Navigate to homepage | ✅ |
| Back to Home | `[data-testid="back-home"]` | Link | Navigate to / | ✅ |
| Nav: Features | `[data-testid="nav-features"]` | Link | Current page (active) | ✅ |
| Nav: Integrations | `[data-testid="nav-integrations"]` | Link | Navigate to /integrations | ✅ |
| Nav: Pricing | `[data-testid="nav-pricing"]` | Link | Navigate to /pricing | ✅ |
| Nav: Docs | `[data-testid="nav-docs"]` | Link | Navigate to /docs | ✅ |
| Theme Toggle | `[data-testid="theme-toggle"]` | Button | Toggle light/dark mode | ✅ |
| Sign In | `[data-testid="nav-signin"]` | Link | Navigate to /sign-in | ✅ |
| Get Started | `[data-testid="nav-getstarted"]` | Link | Navigate to /sign-up | ✅ |
| CTA: Get Started Free | `[data-testid="cta-getstarted"]` | Link | Navigate to /sign-up | ✅ |
| CTA: Read the Docs | `[data-testid="cta-docs"]` | Link | Navigate to /docs | ✅ |
| Footer: Privacy | `[data-testid="footer-privacy"]` | Link | Navigate to /privacy | ✅ |
| Footer: Terms | `[data-testid="footer-terms"]` | Link | Navigate to /terms | ✅ |
| Footer: Documentation | `[data-testid="footer-docs"]` | Link | Navigate to /docs | ✅ |

### Integrations (/integrations)

| Element | Selector/TestID | Type | Expected Behavior | Status |
|---------|-----------------|------|-------------------|--------|
| Logo | `[data-testid="logo"]` | Link | Navigate to homepage | ✅ |
| Back to Home | `[data-testid="back-home"]` | Link | Navigate to / | ✅ |
| Nav Links | Same as Features page | Links | Navigate to respective pages | ✅ |
| Sign In | `[data-testid="nav-signin"]` | Link | Navigate to /sign-in | ✅ |
| Get Started | `[data-testid="nav-getstarted"]` | Link | Navigate to /sign-up | ✅ |
| CTA: Get Started Free | `[data-testid="cta-getstarted"]` | Link | Navigate to /sign-up | ✅ |
| CTA: Read the Docs | `[data-testid="cta-docs"]` | Link | Navigate to /docs | ✅ |

### Pricing (/pricing)

| Element | Selector/TestID | Type | Expected Behavior | Status |
|---------|-----------------|------|-------------------|--------|
| Logo | `[data-testid="logo"]` | Link | Navigate to homepage | ✅ |
| Back to Home | `[data-testid="back-home"]` | Link | Navigate to / | ✅ |
| Free: Get Started | `[data-testid="pricing-free-cta"]` | Link | Navigate to /sign-up | ✅ |
| Pro: Start Free Trial | `[data-testid="pricing-pro-cta"]` | Link | Navigate to /sign-up | ✅ |
| Enterprise: Contact Sales | `[data-testid="pricing-enterprise-cta"]` | Link | Open mailto:sales@conduii.com | ✅ |
| CTA: Start Free Trial | `[data-testid="cta-trial"]` | Link | Navigate to /sign-up | ✅ |
| CTA: Read the Docs | `[data-testid="cta-docs"]` | Link | Navigate to /docs | ✅ |

### Documentation (/docs)

| Element | Selector/TestID | Type | Expected Behavior | Status |
|---------|-----------------|------|-------------------|--------|
| Logo | `[data-testid="logo"]` | Link | Navigate to homepage | ✅ |
| Back to Home | `[data-testid="back-home"]` | Link | Navigate to / | ✅ |
| Get Started Free | `[data-testid="docs-getstarted"]` | Link | Navigate to /sign-up | ✅ |
| Copy Code Buttons | `[data-testid="copy-code-*"]` | Button | Copy code to clipboard | ✅ |
| Section Anchors | `#getting-started`, `#cli-*`, `#api-*` | Anchor | Scroll to section | ✅ |

### Blog (/blog)

| Element | Selector/TestID | Type | Expected Behavior | Status |
|---------|-----------------|------|-------------------|--------|
| Logo | `[data-testid="logo"]` | Link | Navigate to homepage | ✅ |
| Back to Home | `[data-testid="back-home"]` | Link | Navigate to / | ✅ |
| Blog Post Cards | `[data-testid="blog-post-*"]` | Link | Navigate to /blog/[slug] | ✅ |

### Blog Post (/blog/[slug])

| Element | Selector/TestID | Type | Expected Behavior | Status |
|---------|-----------------|------|-------------------|--------|
| Logo | `[data-testid="logo"]` | Link | Navigate to homepage | ✅ |
| Back to Blog | `[data-testid="back-blog"]` | Link | Navigate to /blog | ✅ |
| Share: Twitter | `[data-testid="share-twitter"]` | Button | Open Twitter share (external) | ✅ |
| Share: LinkedIn | `[data-testid="share-linkedin"]` | Button | Open LinkedIn share (external) | ✅ |
| Share: Copy Link | `[data-testid="share-copy"]` | Button | Copy URL to clipboard | ✅ |

### About (/about)

| Element | Selector/TestID | Type | Expected Behavior | Status |
|---------|-----------------|------|-------------------|--------|
| Logo | `[data-testid="logo"]` | Link | Navigate to homepage | ✅ |
| Back to Home | `[data-testid="back-home"]` | Link | Navigate to / | ✅ |
| Docs | `[data-testid="nav-docs"]` | Link | Navigate to /docs | ✅ |
| Sign In | `[data-testid="nav-signin"]` | Link/Button | Navigate to /sign-in | ✅ |
| Get Started | `[data-testid="nav-getstarted"]` | Link/Button | Navigate to /sign-up | ✅ |
| Start Testing for Free | `[data-testid="cta-getstarted"]` | Link/Button | Navigate to /sign-up | ✅ |
| Footer Links | Same as other pages | Links | Navigate to respective pages | ✅ |

### Privacy (/privacy)

| Element | Selector/TestID | Type | Expected Behavior | Status |
|---------|-----------------|------|-------------------|--------|
| Logo | `[data-testid="logo"]` | Link | Navigate to homepage | ✅ |
| Back to Home | `[data-testid="back-home"]` | Link | Navigate to / | ✅ |
| Footer Links | Same as other pages | Links | Navigate to respective pages | ✅ |

### Terms (/terms)

| Element | Selector/TestID | Type | Expected Behavior | Status |
|---------|-----------------|------|-------------------|--------|
| Logo | `[data-testid="logo"]` | Link | Navigate to homepage | ✅ |
| Back to Home | `[data-testid="back-home"]` | Link | Navigate to / | ✅ |
| Footer Links | Same as other pages | Links | Navigate to respective pages | ✅ |

### Changelog (/changelog)

| Element | Selector/TestID | Type | Expected Behavior | Status |
|---------|-----------------|------|-------------------|--------|
| Logo | `[data-testid="logo"]` | Link | Navigate to homepage | ✅ |
| Back to Home | `[data-testid="back-home"]` | Link | Navigate to / | ✅ |
| Footer Links | Same as other pages | Links | Navigate to respective pages | ✅ |

---

## Auth Pages

### Sign In (/sign-in)

| Element | Selector/TestID | Type | Expected Behavior | Status |
|---------|-----------------|------|-------------------|--------|
| Back to Home | `[data-testid="back-home"]` | Link | Navigate to / | ✅ |
| Clerk SignIn Widget (when configured) | `.cl-signIn` | Form | Authenticate user | ✅ |
| Fallback: Create Account | `[data-testid="auth-create-account"]` | Link | Navigate to /sign-up | ✅ |
| Fallback: Back to Home | `[data-testid="auth-back-home"]` | Link | Navigate to / | ✅ |

### Sign Up (/sign-up)

| Element | Selector/TestID | Type | Expected Behavior | Status |
|---------|-----------------|------|-------------------|--------|
| Back to Home | `[data-testid="back-home"]` | Link | Navigate to / | ✅ |
| Clerk SignUp Widget (when configured) | `.cl-signUp` | Form | Register user | ✅ |
| Fallback: Back to Home | `[data-testid="auth-back-home"]` | Link | Navigate to / | ✅ |
| Fallback: Go to Sign In | `[data-testid="auth-signin"]` | Link | Navigate to /sign-in | ✅ |

### Forgot Password (/forgot-password)

| Element | Selector/TestID | Type | Expected Behavior | Status |
|---------|-----------------|------|-------------------|--------|
| Back to Home | `[data-testid="back-home"]` | Link | Navigate to / | ✅ |
| Email Input | `[data-testid="forgot-email"]` | Input | Enter email address | ✅ |
| Send Reset Link | `[data-testid="forgot-submit"]` | Button | Submit form, show success | ✅ |
| Sign In Link | `[data-testid="forgot-signin"]` | Link | Navigate to /sign-in | ✅ |
| (After Submit) Return to Sign In | `[data-testid="forgot-return"]` | Link | Navigate to /sign-in | ✅ |
| (After Submit) Try Different Email | `[data-testid="forgot-retry"]` | Button | Reset form | ✅ |

---

## Dashboard Pages

*Note: Dashboard pages require authentication. When Clerk is not configured, these redirect to /sign-in.*

### Dashboard Overview (/dashboard)

| Element | Selector/TestID | Type | Expected Behavior | Status |
|---------|-----------------|------|-------------------|--------|
| Logo | `[data-testid="dashboard-logo"]` | Link | Navigate to /dashboard | ✅ |
| Nav: Overview | `[data-testid="nav-overview"]` | Link | Navigate to /dashboard | ✅ |
| Nav: AI Insights | `[data-testid="nav-insights"]` | Link | Navigate to /dashboard/insights | ✅ |
| Nav: Discover | `[data-testid="nav-discover"]` | Link | Navigate to /dashboard/discover | ✅ |
| Nav: Generate Tests | `[data-testid="nav-generate"]` | Link | Navigate to /dashboard/generate | ✅ |
| Nav: Projects | `[data-testid="nav-projects"]` | Link | Navigate to /dashboard/projects | ✅ |
| Nav: Settings | `[data-testid="nav-settings"]` | Link | Navigate to /dashboard/settings | ✅ |
| Nav: Billing | `[data-testid="nav-billing"]` | Link | Navigate to /dashboard/billing | ✅ |
| Theme Toggle | `[data-testid="theme-toggle"]` | Button | Toggle light/dark mode | ✅ |
| Notifications | `[data-testid="notifications"]` | Button | Open notifications dropdown | ✅ |
| User Button | `[data-testid="user-button"]` | Button | Open user menu (Clerk) | ✅ |
| Search | `[data-testid="dashboard-search"]` | Input | Open command palette | ✅ |
| New Project | `[data-testid="new-project"]` | Link/Button | Navigate to /dashboard/projects/new | ✅ |
| AI Insights Button | `[data-testid="btn-insights"]` | Link | Navigate to /dashboard/insights | ✅ |
| Generate Tests Button | `[data-testid="btn-generate"]` | Link | Navigate to /dashboard/generate | ✅ |
| Run Tests Button | `[data-testid="btn-run-tests"]` | Link | Navigate to /dashboard/projects | ✅ |
| View All Projects | `[data-testid="view-all-projects"]` | Link | Navigate to /dashboard/projects | ✅ |
| Project Cards | `[data-testid="project-card-*"]` | Link | Navigate to /dashboard/projects/[id] | ✅ |

### Projects (/dashboard/projects)

| Element | Selector/TestID | Type | Expected Behavior | Status |
|---------|-----------------|------|-------------------|--------|
| New Project Button | `[data-testid="new-project"]` | Link | Navigate to /dashboard/projects/new | ✅ |
| Project Card: View Details | `[data-testid="project-details-*"]` | Link | Navigate to /dashboard/projects/[id] | ✅ |
| Project Card: Run Tests | `[data-testid="project-run-*"]` | Link | Navigate to /dashboard/projects/[id]/runs | ✅ |
| Add New Project Card | `[data-testid="add-project-card"]` | Link | Navigate to /dashboard/projects/new | ✅ |
| Empty State: Create First Project | `[data-testid="create-first-project"]` | Link | Navigate to /dashboard/projects/new | ✅ |

### Project Detail (/dashboard/projects/[id])

| Element | Selector/TestID | Type | Expected Behavior | Status |
|---------|-----------------|------|-------------------|--------|
| Run Tests | `[data-testid="run-tests"]` | Button | Trigger test run | ✅ |
| View Runs | `[data-testid="view-runs"]` | Link | Navigate to /dashboard/projects/[id]/runs | ✅ |
| Settings | `[data-testid="project-settings"]` | Link | Navigate to /dashboard/projects/[id]/settings | ✅ |
| Re-discover Services | `[data-testid="rediscover"]` | Button | Trigger service discovery | ✅ |
| Service Cards | `[data-testid="service-*"]` | Interactive | View service details | ✅ |

### New Project (/dashboard/projects/new)

| Element | Selector/TestID | Type | Expected Behavior | Status |
|---------|-----------------|------|-------------------|--------|
| Project Name Input | `[data-testid="project-name"]` | Input | Enter project name | ✅ |
| Description Input | `[data-testid="project-description"]` | Textarea | Enter description | ✅ |
| Repository URL Input | `[data-testid="project-repo"]` | Input | Enter repository URL | ✅ |
| Create Project Button | `[data-testid="create-project"]` | Button | Submit form, create project | ✅ |
| Cancel Button | `[data-testid="cancel"]` | Link | Navigate back to projects | ✅ |

### Settings (/dashboard/settings)

| Element | Selector/TestID | Type | Expected Behavior | Status |
|---------|-----------------|------|-------------------|--------|
| Profile: Name Input | `[data-testid="profile-name"]` | Input | Edit name | ✅ |
| Profile: Save Button | `[data-testid="profile-save"]` | Button | Save profile changes | ✅ |
| Org: Name Input | `[data-testid="org-name"]` | Input | Edit organization name | ✅ |
| Org: Slug Input | `[data-testid="org-slug"]` | Input | Edit organization slug | ✅ |
| Org: Save Button | `[data-testid="org-save"]` | Button | Save organization changes | ✅ |
| API Keys: Create Key | `[data-testid="create-api-key"]` | Button | Open create key modal | ✅ |
| API Keys: Copy Key | `[data-testid="copy-api-key-*"]` | Button | Copy key to clipboard | ✅ |
| API Keys: Revoke Key | `[data-testid="revoke-api-key-*"]` | Button | Revoke API key | ✅ |
| Notifications: Toggle | `[data-testid="notification-toggle-*"]` | Switch | Toggle notification preference | ✅ |
| Danger Zone: Delete Org | `[data-testid="delete-org"]` | Button | Open confirmation dialog | ✅ |
| Danger Zone: Confirm Delete | `[data-testid="confirm-delete"]` | Button | Delete organization | ✅ |

### Billing (/dashboard/billing)

| Element | Selector/TestID | Type | Expected Behavior | Status |
|---------|-----------------|------|-------------------|--------|
| Manage Billing | `[data-testid="manage-billing"]` | Button | Open Stripe portal | ✅ |
| Upgrade to Pro | `[data-testid="upgrade-pro"]` | Button | Open Stripe checkout | ✅ |
| Contact Sales | `[data-testid="contact-sales"]` | Button | Open mailto:sales@conduii.com | ✅ |
| Download Invoice | `[data-testid="download-invoice-*"]` | Button | Download PDF invoice | ✅ |

### AI Insights (/dashboard/insights)

| Element | Selector/TestID | Type | Expected Behavior | Status |
|---------|-----------------|------|-------------------|--------|
| Refresh Insights | `[data-testid="refresh-insights"]` | Button | Reload AI insights | ✅ |
| View Details | `[data-testid="insight-details-*"]` | Button | Expand insight details | ✅ |

### Discover (/dashboard/discover)

| Element | Selector/TestID | Type | Expected Behavior | Status |
|---------|-----------------|------|-------------------|--------|
| Start Discovery | `[data-testid="start-discovery"]` | Button | Trigger service discovery | ✅ |
| Service Selection | `[data-testid="service-select-*"]` | Checkbox | Select services to test | ✅ |
| Generate Tests | `[data-testid="generate-from-discovery"]` | Button | Generate tests from discovered services | ✅ |

### Generate Tests (/dashboard/generate)

| Element | Selector/TestID | Type | Expected Behavior | Status |
|---------|-----------------|------|-------------------|--------|
| Code Input | `[data-testid="code-input"]` | Textarea | Enter code to generate tests for | ✅ |
| Generate Button | `[data-testid="generate-tests"]` | Button | AI generate tests | ✅ |
| Copy Generated Tests | `[data-testid="copy-generated"]` | Button | Copy to clipboard | ✅ |
| Save to Project | `[data-testid="save-tests"]` | Button | Save tests to project | ✅ |

---

## Global Components

### Theme Toggle

| Element | Selector/TestID | Type | Expected Behavior | Status |
|---------|-----------------|------|-------------------|--------|
| Theme Toggle Button | `[data-testid="theme-toggle"]` | Button | Toggle between light/dark modes | ✅ |

### Command Palette

| Element | Selector/TestID | Type | Expected Behavior | Status |
|---------|-----------------|------|-------------------|--------|
| Search Input | `[data-testid="command-input"]` | Input | Filter commands/navigation | ✅ |
| Command Items | `[data-testid="command-item-*"]` | Button | Execute command or navigate | ✅ |

### Mobile Navigation

| Element | Selector/TestID | Type | Expected Behavior | Status |
|---------|-----------------|------|-------------------|--------|
| Menu Toggle | `[data-testid="mobile-menu"]` | Button | Open mobile nav drawer | ✅ |
| Nav Items | Same as desktop | Links | Navigate to pages | ✅ |

---

## Test Coverage Requirements

### For Each Route, Tests Must:

1. **Page Load Test**: Assert page renders without crash
2. **Console Error Test**: No JavaScript errors in console
3. **Network Error Test**: No failed network requests (except known allowed)
4. **Navigation Test**: All links navigate to correct destinations
5. **Button Action Test**: All buttons perform expected actions
6. **Form Submission Test**: Forms validate and submit correctly
7. **Auth State Test**: Correct behavior for authenticated/unauthenticated users

### Priority Matrix

| Priority | Route | Critical Interactions |
|----------|-------|----------------------|
| P0 | `/` | Hero CTA, Sign In/Up, Nav Links |
| P0 | `/sign-in` | Auth flow |
| P0 | `/sign-up` | Registration flow |
| P1 | `/dashboard` | All nav, project cards, action buttons |
| P1 | `/dashboard/projects` | Create, view, run projects |
| P2 | `/pricing` | All pricing CTAs |
| P2 | `/docs` | Nav, copy buttons |
| P3 | Other public pages | Nav, footer links |

---

## Coming Soon / Disabled Features

Features that are intentionally disabled should have visible "Coming Soon" UI and be excluded from "must work" tests.

| Feature | Location | Reason | Tracking |
|---------|----------|--------|----------|
| Organization Switching | Dashboard Nav | Multi-org not fully implemented | TODO |
| Real-time Updates | Dashboard | WebSocket integration pending | TODO |

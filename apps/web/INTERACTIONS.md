# Interaction Map - Conduii Web App

This document catalogs every user-visible interactive element across the entire web application. Each interaction is documented with its selector/testid, expected behavior, and test coverage status.

## Route Categories

### Public Routes
- `/` - Homepage
- `/features` - Features page
- `/integrations` - Integrations page
- `/pricing` - Pricing page
- `/docs` - Documentation page
- `/blog` - Blog index page
- `/blog/[slug]` - Individual blog post
- `/about` - About page
- `/privacy` - Privacy policy
- `/terms` - Terms of service
- `/changelog` - Changelog page

### Auth Routes
- `/sign-in` - Sign in page (Clerk)
- `/sign-up` - Sign up page (Clerk)
- `/forgot-password` - Password reset page

### Dashboard Routes (Protected)
- `/dashboard` - Main dashboard
- `/dashboard/projects` - Projects list
- `/dashboard/projects/new` - Create new project
- `/dashboard/projects/[projectId]` - Project details
- `/dashboard/projects/[projectId]/runs` - Test runs for project
- `/dashboard/projects/[projectId]/runs/[runId]` - Individual test run details
- `/dashboard/projects/[projectId]/settings` - Project settings
- `/dashboard/settings` - User/org settings
- `/dashboard/billing` - Billing and subscription
- `/dashboard/discover` - Auto-discover services
- `/dashboard/generate` - AI test generation
- `/dashboard/insights` - AI insights and analytics

---

## Public Routes

### `/` - Homepage

#### Navigation (Header)
| Element | Test ID | Type | Expected Behavior | Status |
|---------|---------|------|-------------------|--------|
| Logo | `logo-home-link` | Link | Navigate to `/` | ✅ Tested |
| Features Link | `nav-features-link` | Anchor | Scroll to `#features` section | ✅ Tested |
| Integrations Link | `nav-integrations-link` | Anchor | Scroll to `#integrations` section | ✅ Tested |
| Pricing Link | `nav-pricing-link` | Anchor | Scroll to `#pricing` section | ✅ Tested |
| Docs Link | `nav-docs-link` | Link | Navigate to `/docs` | ✅ Tested |
| Theme Toggle | `theme-toggle` | Button | Toggle dark/light theme | ⏳ Needs test |
| Sign In Button | `nav-sign-in-btn` | Button | Navigate to `/sign-in` | ⏳ Needs testid |
| Get Started Button | `nav-get-started-btn` | Button | Navigate to `/sign-up` | ⏳ Needs testid |
| Dashboard Button (Auth) | `nav-dashboard-btn` | Button | Navigate to `/dashboard` (if signed in) | ⏳ Needs testid |

#### Hero Section
| Element | Test ID | Type | Expected Behavior | Status |
|---------|---------|------|-------------------|--------|
| Start Testing Free Button | `hero-cta-primary` | Button | Navigate to `/sign-up` | ⏳ Needs testid |
| View Documentation Button | `hero-cta-docs` | Link | Navigate to `/docs` | ⏳ Needs testid |
| Go to Dashboard Button (Auth) | `hero-cta-dashboard` | Button | Navigate to `/dashboard` (if signed in) | ⏳ Needs testid |

#### Pricing Section
| Element | Test ID | Type | Expected Behavior | Status |
|---------|---------|------|-------------------|--------|
| Free Plan - Get Started | `pricing-free-cta` | Link | Navigate to `/sign-up` | ⏳ Needs testid |
| Pro Plan - Start Free Trial | `pricing-pro-cta` | Link | Navigate to `/sign-up` | ⏳ Needs testid |
| Enterprise - Contact Sales | `pricing-enterprise-cta` | Link | Open email to `sales@conduii.com` | ⏳ Needs testid |

#### CTA Section
| Element | Test ID | Type | Expected Behavior | Status |
|---------|---------|------|-------------------|--------|
| Get Started for Free Button | `cta-get-started` | Button | Navigate to `/sign-up` | ⏳ Needs testid |

#### Footer
| Element | Test ID | Type | Expected Behavior | Status |
|---------|---------|------|-------------------|--------|
| Features Link | `footer-features-link` | Link | Navigate to `/features` | ✅ Tested |
| Integrations Link | `footer-integrations-link` | Link | Navigate to `/integrations` | ✅ Tested |
| Pricing Link | `footer-pricing-link` | Link | Navigate to `/pricing` | ✅ Tested |
| Changelog Link | `footer-changelog-link` | Link | Navigate to `/changelog` | ✅ Tested |
| Documentation Link | `footer-docs-link` | Link | Navigate to `/docs` | ✅ Tested |
| CLI Reference Link | `footer-cli-link` | Link | Navigate to `/docs#cli-discover` | ⏳ Needs testid |
| API Link | `footer-api-link` | Link | Navigate to `/docs#api-auth` | ⏳ Needs testid |
| Blog Link | `footer-blog-link` | Link | Navigate to `/blog` | ✅ Tested |
| About Link | `footer-about-link` | Link | Navigate to `/about` | ✅ Tested |
| Privacy Link | `footer-privacy-link` | Link | Navigate to `/privacy` | ✅ Tested |
| Terms Link | `footer-terms-link` | Link | Navigate to `/terms` | ✅ Tested |
| GitHub Link | `footer-github-link` | Link | Navigate to GitHub repo (external) | ⏳ Needs testid |

---

### `/features` - Features Page

#### Navigation
| Element | Test ID | Type | Expected Behavior | Status |
|---------|---------|------|-------------------|--------|
| Logo | `logo-home-link` | Link | Navigate to `/` | ⏳ Needs test |
| Features Link | `nav-features-link` | Link | Navigate to `/features` (active) | ⏳ Needs test |
| Integrations Link | `nav-integrations-link` | Link | Navigate to `/integrations` | ⏳ Needs test |
| Pricing Link | `nav-pricing-link` | Link | Navigate to `/pricing` | ⏳ Needs test |
| Docs Link | `nav-docs-link` | Link | Navigate to `/docs` | ⏳ Needs test |
| Theme Toggle | `theme-toggle` | Button | Toggle dark/light theme | ⏳ Needs test |
| Sign In Button | `nav-sign-in-btn` | Link | Navigate to `/sign-in` | ⏳ Needs testid |
| Get Started Button | `nav-get-started-btn` | Link | Navigate to `/sign-up` | ⏳ Needs testid |

#### Content
| Element | Test ID | Type | Expected Behavior | Status |
|---------|---------|------|-------------------|--------|
| Back to Home Link | `back-to-home-link` | Link | Navigate to `/` | ⏳ Needs testid |
| Get Started Free Button | `features-cta-signup` | Link | Navigate to `/sign-up` | ⏳ Needs testid |
| Read the Docs Button | `features-cta-docs` | Link | Navigate to `/docs` | ⏳ Needs testid |

#### Footer
| Element | Test ID | Type | Expected Behavior | Status |
|---------|---------|------|-------------------|--------|
| Privacy Link | `footer-privacy-link` | Link | Navigate to `/privacy` | ⏳ Needs test |
| Terms Link | `footer-terms-link` | Link | Navigate to `/terms` | ⏳ Needs test |
| Documentation Link | `footer-docs-link` | Link | Navigate to `/docs` | ⏳ Needs test |

---

### `/integrations` - Integrations Page

#### Navigation
| Element | Test ID | Type | Expected Behavior | Status |
|---------|---------|------|-------------------|--------|
| Logo | `logo-home-link` | Link | Navigate to `/` | ⏳ Needs test |
| Features Link | `nav-features-link` | Link | Navigate to `/features` | ⏳ Needs test |
| Integrations Link | `nav-integrations-link` | Link | Navigate to `/integrations` (active) | ⏳ Needs test |
| Pricing Link | `nav-pricing-link` | Link | Navigate to `/pricing` | ⏳ Needs test |
| Docs Link | `nav-docs-link` | Link | Navigate to `/docs` | ⏳ Needs test |
| Theme Toggle | `theme-toggle` | Button | Toggle dark/light theme | ⏳ Needs test |
| Sign In Button | `nav-sign-in-btn` | Link | Navigate to `/sign-in` | ⏳ Needs testid |
| Get Started Button | `nav-get-started-btn` | Link | Navigate to `/sign-up` | ⏳ Needs testid |

#### Content
| Element | Test ID | Type | Expected Behavior | Status |
|---------|---------|------|-------------------|--------|
| Back to Home Link | `back-to-home-link` | Link | Navigate to `/` | ⏳ Needs testid |
| Request Integration Link | `request-integration-link` | Link | Open contact form or email | ⏳ Needs testid |
| Get Started Button | `integrations-cta-signup` | Link | Navigate to `/sign-up` | ⏳ Needs testid |

---

### `/pricing` - Pricing Page

#### Navigation
| Element | Test ID | Type | Expected Behavior | Status |
|---------|---------|------|-------------------|--------|
| Logo | `logo-home-link` | Link | Navigate to `/` | ⏳ Needs test |
| Features Link | `nav-features-link` | Link | Navigate to `/features` | ⏳ Needs test |
| Integrations Link | `nav-integrations-link` | Link | Navigate to `/integrations` | ⏳ Needs test |
| Pricing Link | `nav-pricing-link` | Link | Navigate to `/pricing` (active) | ⏳ Needs test |
| Docs Link | `nav-docs-link` | Link | Navigate to `/docs` | ⏳ Needs test |
| Theme Toggle | `theme-toggle` | Button | Toggle dark/light theme | ⏳ Needs test |
| Sign In Button | `nav-sign-in-btn` | Link | Navigate to `/sign-in` | ⏳ Needs testid |
| Get Started Button | `nav-get-started-btn` | Link | Navigate to `/sign-up` | ⏳ Needs testid |

#### Content
| Element | Test ID | Type | Expected Behavior | Status |
|---------|---------|------|-------------------|--------|
| Back to Home Link | `back-to-home-link` | Link | Navigate to `/` | ⏳ Needs testid |
| Free Plan - Get Started | `pricing-free-cta` | Link | Navigate to `/sign-up` | ⏳ Needs testid |
| Pro Plan - Start Free Trial | `pricing-pro-cta` | Link | Navigate to `/sign-up` | ⏳ Needs testid |
| Enterprise - Contact Sales | `pricing-enterprise-cta` | Link | Open email to `sales@conduii.com` | ⏳ Needs testid |

---

### `/docs` - Documentation Page

#### Navigation
| Element | Test ID | Type | Expected Behavior | Status |
|---------|---------|------|-------------------|--------|
| Logo | `logo-home-link` | Link | Navigate to `/` | ⏳ Needs test |
| Back to Home Link | `back-to-home-link` | Link | Navigate to `/` | ⏳ Needs testid |
| Section Links | `docs-nav-{section}` | Anchors | Scroll to section | ⏳ Needs testid |

---

### `/blog` - Blog Index Page

#### Navigation
| Element | Test ID | Type | Expected Behavior | Status |
|---------|---------|------|-------------------|--------|
| Logo | `logo-home-link` | Link | Navigate to `/` | ⏳ Needs test |
| Back to Home Link | `back-to-home-link` | Link | Navigate to `/` | ⏳ Needs testid |

#### Content
| Element | Test ID | Type | Expected Behavior | Status |
|---------|---------|------|-------------------|--------|
| Blog Post Links | `blog-post-{slug}` | Links | Navigate to `/blog/[slug]` | ⏳ Needs testid |

---

### `/about` - About Page

#### Navigation
| Element | Test ID | Type | Expected Behavior | Status |
|---------|---------|------|-------------------|--------|
| Logo | `logo-home-link` | Link | Navigate to `/` | ⏳ Needs test |
| Back to Home Link | `back-to-home-link` | Link | Navigate to `/` | ⏳ Needs testid |

---

### `/privacy` - Privacy Policy

#### Navigation
| Element | Test ID | Type | Expected Behavior | Status |
|---------|---------|------|-------------------|--------|
| Logo | `logo-home-link` | Link | Navigate to `/` | ⏳ Needs test |
| Back to Home Link | `back-to-home-link` | Link | Navigate to `/` | ⏳ Needs testid |

---

### `/terms` - Terms of Service

#### Navigation
| Element | Test ID | Type | Expected Behavior | Status |
|---------|---------|------|-------------------|--------|
| Logo | `logo-home-link` | Link | Navigate to `/` | ⏳ Needs test |
| Back to Home Link | `back-to-home-link` | Link | Navigate to `/` | ⏳ Needs testid |

---

### `/changelog` - Changelog

#### Navigation
| Element | Test ID | Type | Expected Behavior | Status |
|---------|---------|------|-------------------|--------|
| Logo | `logo-home-link` | Link | Navigate to `/` | ⏳ Needs test |
| Back to Home Link | `back-to-home-link` | Link | Navigate to `/` | ⏳ Needs testid |

---

## Auth Routes

### `/sign-in` - Sign In

| Element | Test ID | Type | Expected Behavior | Status |
|---------|---------|------|-------------------|--------|
| Clerk Sign In Component | N/A | Component | Clerk handles auth | ⏳ Needs test |
| Logo (if visible) | `logo-home-link` | Link | Navigate to `/` | ⏳ Needs test |

### `/sign-up` - Sign Up

| Element | Test ID | Type | Expected Behavior | Status |
|---------|---------|------|-------------------|--------|
| Clerk Sign Up Component | N/A | Component | Clerk handles auth | ⏳ Needs test |
| Logo (if visible) | `logo-home-link` | Link | Navigate to `/` | ⏳ Needs test |

### `/forgot-password` - Forgot Password

| Element | Test ID | Type | Expected Behavior | Status |
|---------|---------|------|-------------------|--------|
| Email Input | `forgot-password-email` | Input | Accept email address | ⏳ Needs testid |
| Submit Button | `forgot-password-submit` | Button | Submit reset request | ⏳ Needs testid |
| Back to Sign In Link | `forgot-password-back-link` | Link | Navigate to `/sign-in` | ⏳ Needs testid |

---

## Dashboard Routes

### `/dashboard` - Main Dashboard

#### Navigation
| Element | Test ID | Type | Expected Behavior | Status |
|---------|---------|------|-------------------|--------|
| Logo | `logo-home-link` | Link | Navigate to `/` | ⏳ Needs testid |
| Projects Nav Link | `sidebar-projects-link` | Link | Navigate to `/dashboard/projects` | ⏳ Needs testid |
| Settings Nav Link | `sidebar-settings-link` | Link | Navigate to `/dashboard/settings` | ⏳ Needs testid |
| Billing Nav Link | `sidebar-billing-link` | Link | Navigate to `/dashboard/billing` | ⏳ Needs testid |

#### Content
| Element | Test ID | Type | Expected Behavior | Status |
|---------|---------|------|-------------------|--------|
| AI Insights Button | `dashboard-ai-insights-btn` | Link | Navigate to `/dashboard/insights` | ⏳ Needs testid |
| Generate Tests Button | `dashboard-generate-tests-btn` | Link | Navigate to `/dashboard/generate` | ⏳ Needs testid |
| New Project Button | `dashboard-new-project-btn` | Link | Navigate to `/dashboard/projects/new` | ⏳ Needs testid |
| Run Tests Button | `dashboard-run-tests-btn` | Link | Navigate to `/dashboard/projects` | ⏳ Needs testid |
| Create First Project Button | `dashboard-create-first-project` | Link | Navigate to `/dashboard/projects/new` (empty state) | ⏳ Needs testid |
| Project Links | `project-card-{projectId}` | Links | Navigate to `/dashboard/projects/[projectId]` | ⏳ Needs testid |
| View All Projects Link | `dashboard-view-all-projects` | Link | Navigate to `/dashboard/projects` | ⏳ Needs testid |

---

### `/dashboard/projects` - Projects List

#### Navigation
| Element | Test ID | Type | Expected Behavior | Status |
|---------|---------|------|-------------------|--------|
| Sidebar Nav | See Dashboard | - | - | - |

#### Content
| Element | Test ID | Type | Expected Behavior | Status |
|---------|---------|------|-------------------|--------|
| Create Project Button | `projects-create-btn` | Link | Navigate to `/dashboard/projects/new` | ⏳ Needs testid |
| Project Cards | `project-card-{projectId}` | Links/Cards | Navigate to project detail or show actions | ⏳ Needs testid |
| Project Settings Icon | `project-settings-{projectId}` | Button | Navigate to project settings | ⏳ Needs testid |
| Run Tests Icon | `project-run-{projectId}` | Button | Trigger test run | ⏳ Needs testid |
| Search Projects Input | `projects-search` | Input | Filter projects list | ⏳ Needs testid |

---

### `/dashboard/projects/new` - Create New Project

#### Content
| Element | Test ID | Type | Expected Behavior | Status |
|---------|---------|------|-------------------|--------|
| Project Name Input | `new-project-name` | Input | Accept project name | ⏳ Needs testid |
| Repository URL Input | `new-project-repo-url` | Input | Accept repo URL | ⏳ Needs testid |
| Environment Select | `new-project-environment` | Select | Choose environment | ⏳ Needs testid |
| Create Project Button | `new-project-submit` | Button | Submit form, create project | ⏳ Needs testid |
| Cancel Button | `new-project-cancel` | Button | Navigate back or cancel | ⏳ Needs testid |

---

### `/dashboard/projects/[projectId]` - Project Details

#### Content
| Element | Test ID | Type | Expected Behavior | Status |
|---------|---------|------|-------------------|--------|
| Run Tests Button | `project-detail-run-tests` | Button | Trigger new test run | ⏳ Needs testid |
| View Runs Button | `project-detail-view-runs` | Link | Navigate to `/dashboard/projects/[projectId]/runs` | ⏳ Needs testid |
| Settings Button | `project-detail-settings` | Link | Navigate to `/dashboard/projects/[projectId]/settings` | ⏳ Needs testid |
| Test Run Cards | `test-run-{runId}` | Links | Navigate to run details | ⏳ Needs testid |
| Service Cards | `service-card-{serviceId}` | Cards | Show service status | ⏳ Needs testid |

---

### `/dashboard/projects/[projectId]/runs` - Test Runs List

#### Content
| Element | Test ID | Type | Expected Behavior | Status |
|---------|---------|------|-------------------|--------|
| Run New Test Button | `runs-new-test-btn` | Button | Trigger new test run | ⏳ Needs testid |
| Test Run Cards | `run-card-{runId}` | Links | Navigate to `/dashboard/projects/[projectId]/runs/[runId]` | ⏳ Needs testid |
| Filter Dropdown | `runs-filter` | Select | Filter runs by status | ⏳ Needs testid |

---

### `/dashboard/projects/[projectId]/runs/[runId]` - Test Run Details

#### Content
| Element | Test ID | Type | Expected Behavior | Status |
|---------|---------|------|-------------------|--------|
| Re-run Button | `run-detail-rerun` | Button | Trigger re-run | ⏳ Needs testid |
| View Logs Button | `run-detail-logs` | Button | Show/expand logs | ⏳ Needs testid |
| Test Result Cards | `test-result-{testId}` | Cards | Show individual test results | ⏳ Needs testid |
| AI Analysis Button | `run-detail-ai-analysis` | Button | Show AI failure analysis | ⏳ Needs testid |

---

### `/dashboard/projects/[projectId]/settings` - Project Settings

#### Content
| Element | Test ID | Type | Expected Behavior | Status |
|---------|---------|------|-------------------|--------|
| Project Name Input | `project-settings-name` | Input | Edit project name | ⏳ Needs testid |
| Save Changes Button | `project-settings-save` | Button | Save settings | ⏳ Needs testid |
| Delete Project Button | `project-settings-delete` | Button | Open delete confirmation | ⏳ Needs testid |
| Delete Confirm Button | `project-delete-confirm` | Button | Confirm deletion | ⏳ Needs testid |

---

### `/dashboard/settings` - User/Organization Settings

#### Content
| Element | Test ID | Type | Expected Behavior | Status |
|---------|---------|------|-------------------|--------|
| Profile Tab | `settings-tab-profile` | Button | Switch to profile tab | ⏳ Needs testid |
| Organization Tab | `settings-tab-organization` | Button | Switch to org tab | ⏳ Needs testid |
| Notifications Tab | `settings-tab-notifications` | Button | Switch to notifications tab | ⏳ Needs testid |
| API Keys Tab | `settings-tab-api-keys` | Button | Switch to API keys tab | ⏳ Needs testid |
| Save Settings Button | `settings-save` | Button | Save current tab settings | ⏳ Needs testid |
| Generate API Key Button | `settings-generate-api-key` | Button | Generate new API key | ⏳ Needs testid |
| Revoke API Key Button | `settings-revoke-api-key-{keyId}` | Button | Revoke specific API key | ⏳ Needs testid |

---

### `/dashboard/billing` - Billing & Subscription

#### Content
| Element | Test ID | Type | Expected Behavior | Status |
|---------|---------|------|-------------------|--------|
| Upgrade to Pro Button | `billing-upgrade-pro` | Button | Start Stripe checkout for Pro | ⏳ Needs testid |
| Upgrade to Enterprise Button | `billing-upgrade-enterprise` | Button | Contact sales or open form | ⏳ Needs testid |
| Manage Subscription Button | `billing-manage-subscription` | Button | Open Stripe portal | ⏳ Needs testid |
| View Invoices Button | `billing-view-invoices` | Button | Show invoice list | ⏳ Needs testid |
| Download Invoice Button | `billing-download-invoice-{id}` | Button | Download invoice PDF | ⏳ Needs testid |

---

### `/dashboard/discover` - Auto-Discover Services

#### Content
| Element | Test ID | Type | Expected Behavior | Status |
|---------|---------|------|-------------------|--------|
| Start Discovery Button | `discover-start` | Button | Trigger discovery process | ⏳ Needs testid |
| Stop Discovery Button | `discover-stop` | Button | Stop running discovery | ⏳ Needs testid |
| Select Project Dropdown | `discover-select-project` | Select | Choose project to discover | ⏳ Needs testid |

---

### `/dashboard/generate` - AI Test Generation

#### Content
| Element | Test ID | Type | Expected Behavior | Status |
|---------|---------|------|-------------------|--------|
| Prompt Input | `generate-prompt` | Textarea | Enter test generation prompt | ⏳ Needs testid |
| Generate Tests Button | `generate-submit` | Button | Trigger AI test generation | ⏳ Needs testid |
| Select Project Dropdown | `generate-select-project` | Select | Choose target project | ⏳ Needs testid |
| Copy Test Code Button | `generate-copy-code` | Button | Copy generated test code | ⏳ Needs testid |

---

### `/dashboard/insights` - AI Insights & Analytics

#### Content
| Element | Test ID | Type | Expected Behavior | Status |
|---------|---------|------|-------------------|--------|
| Time Range Selector | `insights-time-range` | Select | Change date range for insights | ⏳ Needs testid |
| Export Report Button | `insights-export` | Button | Export insights as PDF/CSV | ⏳ Needs testid |
| Insight Cards | `insight-card-{id}` | Cards | Show individual insights | ⏳ Needs testid |

---

## Testing Strategy

### Clerk Integration Tests
- **Without Clerk configured**: Should fallback to simple button navigation
- **With Clerk configured**: Should show auth-aware components
- **Auth state changes**: Should update UI dynamically

### Error Handling Tests
- Console error monitoring
- Failed network requests
- Page crash detection

### Responsive Tests
- Mobile viewport (375px)
- Tablet viewport (768px)
- Desktop viewport (1280px+)

### Accessibility Tests
- Keyboard navigation
- Screen reader support
- Focus management
- ARIA labels

---

## Test Coverage Goals

- ✅ **100% navigation tested**: All links work
- ✅ **100% buttons tested**: All interactive elements respond
- ✅ **Zero console errors**: No errors on any page
- ✅ **Zero broken links**: All routes resolve
- ✅ **Auth flows work**: Sign in/up/out without errors

---

## Legend

- ✅ **Tested**: Has test coverage and passing
- ⏳ **Needs testid**: Element exists but needs data-testid
- ❌ **Broken**: Not working, needs fix
- 🚧 **Coming soon**: Intentionally disabled with UI message
- 🔄 **In progress**: Currently being implemented

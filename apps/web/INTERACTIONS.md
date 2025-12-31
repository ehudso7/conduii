# Interaction Map

This document maps all user-visible interactive elements across the Conduii web application, their selectors, expected behaviors, and test coverage status.

## Structure

Each route/page section includes:
- **Route**: The URL path
- **Interactive Elements**: List of all clickable/typeable/submittable elements
- **Selector**: data-testid or stable selector used in tests
- **Expected Behavior**: What should happen when interacted with
- **Test Status**: ✅ Tested | ⚠️ Partial | ❌ Not Tested | 🚧 Coming Soon

---

## Public Routes

### `/` (Homepage)

#### Navigation Bar
| Element | Selector | Expected Behavior | Test Status |
|---------|----------|-------------------|-------------|
| Logo | `data-testid="logo"` | Navigate to `/` | ❌ |
| Features Link | `data-testid="nav-features"` | Smooth scroll to `#features` section | ❌ |
| Integrations Link | `data-testid="nav-integrations"` | Smooth scroll to `#integrations` section | ❌ |
| Pricing Link | `data-testid="nav-pricing"` | Smooth scroll to `#pricing` section | ❌ |
| Docs Link | `data-testid="nav-docs"` | Navigate to `/docs` | ❌ |
| Theme Toggle | `data-testid="theme-toggle"` | Toggle between light/dark theme | ❌ |
| Sign In Button | `data-testid="nav-sign-in"` | Navigate to `/sign-in` or show auth modal | ❌ |
| Get Started Button | `data-testid="nav-get-started"` | Navigate to `/sign-up` | ❌ |
| Dashboard Button (when signed in) | `data-testid="nav-dashboard"` | Navigate to `/dashboard` | ❌ |
| User Button (when signed in) | `data-testid="user-button"` | Open user menu | ❌ |

#### Hero Section
| Element | Selector | Expected Behavior | Test Status |
|---------|----------|-------------------|-------------|
| Start Testing Free Button | `data-testid="hero-start-testing"` | Navigate to `/sign-up` or `/dashboard` if signed in | ❌ |
| View Documentation Button | `data-testid="hero-view-docs"` | Navigate to `/docs` | ❌ |

#### Features Section (`#features`)
| Element | Selector | Expected Behavior | Test Status |
|---------|----------|-------------------|-------------|
| Feature Cards | `data-testid="feature-card-{title}"` | Display feature information (non-interactive) | ❌ |

#### Integrations Section (`#integrations`)
| Element | Selector | Expected Behavior | Test Status |
|---------|----------|-------------------|-------------|
| Integration Cards | `data-testid="integration-card-{name}"` | Display integration info (non-interactive) | ❌ |

#### Pricing Section (`#pricing`)
| Element | Selector | Expected Behavior | Test Status |
|---------|----------|-------------------|-------------|
| Free Plan CTA | `data-testid="pricing-free-cta"` | Navigate to `/sign-up` | ❌ |
| Pro Plan CTA | `data-testid="pricing-pro-cta"` | Navigate to `/sign-up` | ❌ |
| Enterprise Plan CTA | `data-testid="pricing-enterprise-cta"` | Open mailto link | ❌ |

#### CTA Section
| Element | Selector | Expected Behavior | Test Status |
|---------|----------|-------------------|-------------|
| Get Started for Free Button | `data-testid="cta-get-started"` | Navigate to `/sign-up` or `/dashboard` if signed in | ❌ |

#### Footer
| Element | Selector | Expected Behavior | Test Status |
|---------|----------|-------------------|-------------|
| Features Link | `data-testid="footer-features"` | Navigate to `/features` | ❌ |
| Integrations Link | `data-testid="footer-integrations"` | Navigate to `/integrations` | ❌ |
| Pricing Link | `data-testid="footer-pricing"` | Navigate to `/pricing` | ❌ |
| Changelog Link | `data-testid="footer-changelog"` | Navigate to `/changelog` | ❌ |
| Documentation Link | `data-testid="footer-docs"` | Navigate to `/docs` | ❌ |
| CLI Reference Link | `data-testid="footer-cli-ref"` | Navigate to `/docs#cli-discover` | ❌ |
| API Link | `data-testid="footer-api"` | Navigate to `/docs#api-auth` | ❌ |
| Blog Link | `data-testid="footer-blog"` | Navigate to `/blog` | ❌ |
| About Link | `data-testid="footer-about"` | Navigate to `/about` | ❌ |
| Privacy Link | `data-testid="footer-privacy"` | Navigate to `/privacy` | ❌ |
| Terms Link | `data-testid="footer-terms"` | Navigate to `/terms` | ❌ |
| GitHub Link | `data-testid="footer-github"` | Open external GitHub link | ❌ |

---

### `/features`

| Element | Selector | Expected Behavior | Test Status |
|---------|----------|-------------------|-------------|
| Navigation (same as homepage) | - | Same as homepage nav | ❌ |
| Feature Cards | `data-testid="feature-card-{title}"` | Display feature information | ❌ |
| CTA Buttons | `data-testid="features-cta"` | Navigate to `/sign-up` | ❌ |

---

### `/integrations`

| Element | Selector | Expected Behavior | Test Status |
|---------|----------|-------------------|-------------|
| Navigation (same as homepage) | - | Same as homepage nav | ❌ |
| Integration Cards | `data-testid="integration-card-{name}"` | Display integration info | ❌ |
| CTA Buttons | `data-testid="integrations-cta"` | Navigate to `/sign-up` | ❌ |

---

### `/pricing`

| Element | Selector | Expected Behavior | Test Status |
|---------|----------|-------------------|-------------|
| Navigation (same as homepage) | - | Same as homepage nav | ❌ |
| Free Plan CTA | `data-testid="pricing-free-cta"` | Navigate to `/sign-up` | ❌ |
| Pro Plan CTA | `data-testid="pricing-pro-cta"` | Navigate to `/sign-up` | ❌ |
| Enterprise Plan CTA | `data-testid="pricing-enterprise-cta"` | Open mailto link | ❌ |

---

### `/docs`

| Element | Selector | Expected Behavior | Test Status |
|---------|----------|-------------------|-------------|
| Navigation (same as homepage) | - | Same as homepage nav | ❌ |
| Documentation Content | - | Display documentation | ❌ |
| Internal Links | `data-testid="docs-link-{anchor}"` | Navigate to anchor or external page | ❌ |

---

### `/blog`

| Element | Selector | Expected Behavior | Test Status |
|---------|----------|-------------------|-------------|
| Navigation (same as homepage) | - | Same as homepage nav | ❌ |
| Blog Post Links | `data-testid="blog-post-{slug}"` | Navigate to `/blog/{slug}` | ❌ |
| Pagination | `data-testid="blog-pagination-{page}"` | Navigate to next/prev page | ❌ |

---

### `/blog/[slug]`

| Element | Selector | Expected Behavior | Test Status |
|---------|----------|-------------------|-------------|
| Navigation (same as homepage) | - | Same as homepage nav | ❌ |
| Share Buttons | `data-testid="share-{platform}"` | Share blog post | ❌ |
| Back to Blog Link | `data-testid="back-to-blog"` | Navigate to `/blog` | ❌ |

---

### `/about`

| Element | Selector | Expected Behavior | Test Status |
|---------|----------|-------------------|-------------|
| Navigation (same as homepage) | - | Same as homepage nav | ❌ |
| CTA Buttons | `data-testid="about-cta"` | Navigate to `/sign-up` | ❌ |

---

### `/privacy`

| Element | Selector | Expected Behavior | Test Status |
|---------|----------|-------------------|-------------|
| Navigation (same as homepage) | - | Same as homepage nav | ❌ |

---

### `/terms`

| Element | Selector | Expected Behavior | Test Status |
|---------|----------|-------------------|-------------|
| Navigation (same as homepage) | - | Same as homepage nav | ❌ |

---

### `/changelog`

| Element | Selector | Expected Behavior | Test Status |
|---------|----------|-------------------|-------------|
| Navigation (same as homepage) | - | Same as homepage nav | ❌ |
| Version Links | `data-testid="changelog-version-{version}"` | Scroll to version section | ❌ |

---

## Auth Routes

### `/sign-in`

| Element | Selector | Expected Behavior | Test Status |
|---------|----------|-------------------|-------------|
| Email Input | `data-testid="sign-in-email"` | Accept email input | ❌ |
| Password Input | `data-testid="sign-in-password"` | Accept password input | ❌ |
| Sign In Button | `data-testid="sign-in-submit"` | Submit form, authenticate user | ❌ |
| Forgot Password Link | `data-testid="sign-in-forgot-password"` | Navigate to `/forgot-password` | ❌ |
| Sign Up Link | `data-testid="sign-in-sign-up-link"` | Navigate to `/sign-up` | ❌ |
| Social Auth Buttons | `data-testid="sign-in-{provider}"` | Authenticate via provider | ❌ |

---

### `/sign-up`

| Element | Selector | Expected Behavior | Test Status |
|---------|----------|-------------------|-------------|
| Email Input | `data-testid="sign-up-email"` | Accept email input | ❌ |
| Password Input | `data-testid="sign-up-password"` | Accept password input | ❌ |
| Confirm Password Input | `data-testid="sign-up-confirm-password"` | Accept password confirmation | ❌ |
| Sign Up Button | `data-testid="sign-up-submit"` | Submit form, create account | ❌ |
| Sign In Link | `data-testid="sign-up-sign-in-link"` | Navigate to `/sign-in` | ❌ |
| Social Auth Buttons | `data-testid="sign-up-{provider}"` | Authenticate via provider | ❌ |

---

### `/forgot-password`

| Element | Selector | Expected Behavior | Test Status |
|---------|----------|-------------------|-------------|
| Email Input | `data-testid="forgot-password-email"` | Accept email input | ❌ |
| Submit Button | `data-testid="forgot-password-submit"` | Send password reset email | ❌ |
| Back to Sign In Link | `data-testid="forgot-password-back"` | Navigate to `/sign-in` | ❌ |

---

## Dashboard Routes

### `/dashboard`

| Element | Selector | Expected Behavior | Test Status |
|---------|----------|-------------------|-------------|
| Sidebar Navigation | `data-testid="sidebar-nav"` | Navigate to dashboard sections | ❌ |
| Quick Stats Cards | `data-testid="quick-stat-{metric}"` | Display metrics (non-interactive) | ❌ |
| Project Health Widget | `data-testid="project-health"` | Display project status | ❌ |
| Activity Feed | `data-testid="activity-feed"` | Display recent activity | ❌ |
| AI Insights | `data-testid="ai-insights"` | Display AI-generated insights | ❌ |
| Create Project Button | `data-testid="create-project"` | Navigate to `/dashboard/projects/new` | ❌ |
| View All Projects Link | `data-testid="view-all-projects"` | Navigate to `/dashboard/projects` | ❌ |

---

### `/dashboard/projects`

| Element | Selector | Expected Behavior | Test Status |
|---------|----------|-------------------|-------------|
| Create Project Button | `data-testid="create-project"` | Navigate to `/dashboard/projects/new` | ❌ |
| Project Cards | `data-testid="project-card-{id}"` | Navigate to `/dashboard/projects/{id}` | ❌ |
| Project Actions Menu | `data-testid="project-actions-{id}"` | Open actions menu | ❌ |
| Delete Project | `data-testid="delete-project-{id}"` | Delete project with confirmation | ❌ |
| Edit Project | `data-testid="edit-project-{id}"` | Open edit modal/form | ❌ |

---

### `/dashboard/projects/new`

| Element | Selector | Expected Behavior | Test Status |
|---------|----------|-------------------|-------------|
| Project Name Input | `data-testid="project-name"` | Accept project name | ❌ |
| Project Description Input | `data-testid="project-description"` | Accept description | ❌ |
| Create Button | `data-testid="create-project-submit"` | Create project, redirect to project page | ❌ |
| Cancel Button | `data-testid="create-project-cancel"` | Navigate back to `/dashboard/projects` | ❌ |

---

### `/dashboard/projects/[projectId]`

| Element | Selector | Expected Behavior | Test Status |
|---------|----------|-------------------|-------------|
| Project Settings Link | `data-testid="project-settings"` | Navigate to `/dashboard/projects/{id}/settings` | ❌ |
| View Runs Link | `data-testid="view-runs"` | Navigate to `/dashboard/projects/{id}/runs` | ❌ |
| Run Tests Button | `data-testid="run-tests"` | Trigger test run | ❌ |
| Project Actions Menu | `data-testid="project-actions"` | Open actions menu | ❌ |

---

### `/dashboard/projects/[projectId]/runs`

| Element | Selector | Expected Behavior | Test Status |
|---------|----------|-------------------|-------------|
| Run Cards | `data-testid="run-card-{runId}"` | Navigate to `/dashboard/projects/{id}/runs/{runId}` | ❌ |
| Filter Controls | `data-testid="run-filter-{filter}"` | Filter runs by status/date | ❌ |
| Sort Controls | `data-testid="run-sort"` | Sort runs | ❌ |

---

### `/dashboard/projects/[projectId]/runs/[runId]`

| Element | Selector | Expected Behavior | Test Status |
|---------|----------|-------------------|-------------|
| Back to Runs Link | `data-testid="back-to-runs"` | Navigate to `/dashboard/projects/{id}/runs` | ❌ |
| Test Results | `data-testid="test-result-{testId}"` | Display test result details | ❌ |
| AI Assistant | `data-testid="ai-assistant"` | Open AI assistant for failure analysis | ❌ |
| Retry Button | `data-testid="retry-run"` | Retry failed tests | ❌ |

---

### `/dashboard/projects/[projectId]/settings`

| Element | Selector | Expected Behavior | Test Status |
|---------|----------|-------------------|-------------|
| Project Name Input | `data-testid="settings-project-name"` | Update project name | ❌ |
| Project Description Input | `data-testid="settings-project-description"` | Update description | ❌ |
| Save Button | `data-testid="settings-save"` | Save changes | ❌ |
| Delete Project Button | `data-testid="settings-delete-project"` | Delete project with confirmation | ❌ |

---

### `/dashboard/settings`

| Element | Selector | Expected Behavior | Test Status |
|---------|----------|-------------------|-------------|
| Profile Form | `data-testid="profile-form"` | Update user profile | ❌ |
| API Key Management | `data-testid="api-key-management"` | Manage API keys | ❌ |
| Create API Key | `data-testid="create-api-key"` | Generate new API key | ❌ |
| Delete API Key | `data-testid="delete-api-key-{id}"` | Delete API key | ❌ |
| Notification Settings | `data-testid="notification-settings"` | Update notification preferences | ❌ |
| Organization Settings | `data-testid="organization-settings"` | Update org settings | ❌ |

---

### `/dashboard/billing`

| Element | Selector | Expected Behavior | Test Status |
|---------|----------|-------------------|-------------|
| Upgrade Plan Button | `data-testid="upgrade-plan"` | Navigate to `/pricing` or open upgrade modal | ❌ |
| Manage Subscription | `data-testid="manage-subscription"` | Open Stripe portal | ❌ |
| View Invoices | `data-testid="view-invoices"` | Display invoice list | ❌ |
| Payment Method | `data-testid="payment-method"` | Update payment method | ❌ |

---

### `/dashboard/discover`

| Element | Selector | Expected Behavior | Test Status |
|---------|----------|-------------------|-------------|
| Discover Button | `data-testid="discover-services"` | Trigger service discovery | ❌ |
| Service Cards | `data-testid="service-card-{service}"` | Display discovered services | ❌ |

---

### `/dashboard/generate`

| Element | Selector | Expected Behavior | Test Status |
|---------|----------|-------------------|-------------|
| Generate Tests Button | `data-testid="generate-tests"` | Generate tests using AI | ❌ |
| Test Generation Form | `data-testid="test-generation-form"` | Configure test generation | ❌ |

---

### `/dashboard/insights`

| Element | Selector | Expected Behavior | Test Status |
|---------|----------|-------------------|-------------|
| Insights Widgets | `data-testid="insight-{type}"` | Display insights | ❌ |
| Filter Controls | `data-testid="insights-filter"` | Filter insights | ❌ |

---

## Notes

- All interactive elements must have stable selectors (preferably `data-testid`)
- All interactions must be tested for:
  1. No console errors
  2. No dead-ends (no-op with no feedback)
  3. Correct behavior (navigation, modal, API call, etc.)
- Features marked as "Coming soon" should be disabled with visible UI message
- Tests should work in both Clerk configured and Clerk not configured scenarios

# Interaction Map

This document lists all user-visible interactive elements across the application, their expected behavior, and their testing status.

## Status Legend
- ✅ **Tested**: Covered by automated tests.
- ⚠️ **Untested**: Interaction exists but lacks specific coverage.
- 🚧 **Coming Soon**: Feature explicitly disabled/placeholder.
- ❌ **Broken**: Known issue to be fixed.

---

## 1. Public Pages

### Homepage (`/`)
| Element | Selector/TestID | Expected Behavior | Status |
|---------|-----------------|-------------------|--------|
| Logo | `nav-logo` | Link to homepage (top) | ✅ |
| Nav: Features | `nav-features` | Smooth scroll to Features section | ✅ |
| Nav: Integrations | `nav-integrations` | Smooth scroll to Integrations section | ✅ |
| Nav: Pricing | `nav-pricing` | Smooth scroll to Pricing section | ✅ |
| Nav: Docs | `nav-docs` | Navigate to /docs | ✅ |
| Theme Toggle | `theme-toggle` | Toggle light/dark mode | ✅ |
| Nav: Sign In | `nav-sign-in` | Navigate to /sign-in | ✅ |
| Nav: Get Started | `nav-get-started` | Navigate to /sign-up | ✅ |
| Hero: Start Testing | `hero-start-testing` | Navigate to /sign-up | ✅ |
| Hero: Docs | `hero-docs` | Navigate to /docs | ✅ |
| Pricing: Get Started | `pricing-get-started` | Navigate to /sign-up | ✅ |
| Pricing: Start Free Trial | `pricing-start-free-trial` | Navigate to /sign-up | ✅ |
| Pricing: Contact Sales | `pricing-contact-sales` | Mailto link | ✅ |
| CTA: Get Started | `cta-get-started` | Navigate to /sign-up | ✅ |
| Footer: Product Links | `footer-features`, etc. | Navigate to respective pages | ✅ |
| Footer: Resource Links | `footer-docs`, etc. | Navigate to respective pages | ✅ |
| Footer: Company Links | `footer-about`, etc. | Navigate to respective pages | ✅ |

### Features (`/features`)
| Element | Selector/TestID | Expected Behavior | Status |
|---------|-----------------|-------------------|--------|
| Nav Links | `nav-features`, etc. | Navigate to respective pages | ✅ |
| Auth Buttons | `nav-sign-in`, etc. | Navigate to auth pages | ✅ |
| Back Link | `back-to-home` | Navigate to / | ✅ |
| CTA: Get Started | `cta-get-started` | Navigate to /sign-up | ✅ |
| CTA: Docs | `cta-docs` | Navigate to /docs | ✅ |
| Footer Links | `footer-privacy`, etc. | Navigate to respective pages | ✅ |

### Integrations (`/integrations`)
| Element | Selector/TestID | Expected Behavior | Status |
|---------|-----------------|-------------------|--------|
| Nav Links | `nav-integrations`, etc. | Navigate to respective pages | ✅ |
| Back Link | `back-to-home` | Navigate to / | ✅ |
| Request Integration | `request-integration` | Mailto link | ✅ |
| CTA: Get Started | `cta-get-started` | Navigate to /sign-up | ✅ |
| CTA: Docs | `cta-docs` | Navigate to /docs | ✅ |

### Pricing (`/pricing`)
| Element | Selector/TestID | Expected Behavior | Status |
|---------|-----------------|-------------------|--------|
| Nav Links | `nav-pricing`, etc. | Navigate to respective pages | ✅ |
| Back Link | `back-to-home` | Navigate to / | ✅ |
| Plan CTA: Free | `pricing-cta-free` | Navigate to /sign-up | ✅ |
| Plan CTA: Pro | `pricing-cta-pro` | Navigate to /sign-up | ✅ |
| Plan CTA: Enterprise | `pricing-contact-sales` | Mailto link | ✅ |
| CTA: Start Trial | `cta-start-trial` | Navigate to /sign-up | ✅ |
| CTA: Docs | `cta-docs` | Navigate to /docs | ✅ |

### Docs (`/docs`)
| Element | Selector/TestID | Expected Behavior | Status |
|---------|-----------------|-------------------|--------|
| Back Link | `back-to-home` | Navigate to / | ✅ |
| Section Links | `section-[id]` | Scroll to section | ✅ |
| CTA: Get Started | `cta-get-started` | Navigate to /sign-up | ✅ |

### Blog (`/blog`)
| Element | Selector/TestID | Expected Behavior | Status |
|---------|-----------------|-------------------|--------|
| Back Link | `back-to-home` | Navigate to / | ✅ |
| Post Links | `blog-post-[slug]` | Navigate to post | ✅ |

### Blog Post (`/blog/[slug]`)
| Element | Selector/TestID | Expected Behavior | Status |
|---------|-----------------|-------------------|--------|
| Back Link | `back-to-blog` | Navigate to /blog | ✅ |
| Read More | `read-more` | Navigate to /blog | ✅ |

### About (`/about`)
| Element | Selector/TestID | Expected Behavior | Status |
|---------|-----------------|-------------------|--------|
| Header Links | `header-home`, etc. | Navigate to respective pages | ✅ |
| CTA: Start Testing | `cta-start-testing` | Navigate to /sign-up | ✅ |

### Privacy (`/privacy`)
| Element | Selector/TestID | Expected Behavior | Status |
|---------|-----------------|-------------------|--------|
| Header Links | `header-home`, etc. | Navigate to respective pages | ✅ |

### Terms (`/terms`)
| Element | Selector/TestID | Expected Behavior | Status |
|---------|-----------------|-------------------|--------|
| Header Links | `header-home`, etc. | Navigate to respective pages | ✅ |

### Changelog (`/changelog`)
| Element | Selector/TestID | Expected Behavior | Status |
|---------|-----------------|-------------------|--------|
| Back Link | `back-to-home` | Navigate to / | ✅ |

---

## 2. Auth Pages

### Sign In (`/sign-in`)
| Element | Selector/TestID | Expected Behavior | Status |
|---------|-----------------|-------------------|--------|
| Back Link | `back-to-home` | Navigate to / | ✅ |
| Fallback: Create Account | `create-account-link` | Navigate to /sign-up | ✅ |
| Fallback: Back to Home | `back-to-home-button` | Navigate to / | ✅ |

### Sign Up (`/sign-up`)
| Element | Selector/TestID | Expected Behavior | Status |
|---------|-----------------|-------------------|--------|
| Back Link | `back-to-home` | Navigate to / | ✅ |
| Fallback: Sign In | `go-to-sign-in-link` | Navigate to /sign-in | ✅ |
| Fallback: Back to Home | `back-to-home-button` | Navigate to / | ✅ |

### Forgot Password (`/forgot-password`)
| Element | Selector/TestID | Expected Behavior | Status |
|---------|-----------------|-------------------|--------|
| Back Link | `back-to-home` | Navigate to / | ✅ |
| Email Input | `email-input` | Accept email | ✅ |
| Submit Button | `submit-button` | Submit form | ✅ |
| Sign In Link | `sign-in-link` | Navigate to /sign-in | ✅ |
| Success: Try Different | `try-different-email` | Reset form | ✅ |
| Success: Return | `return-to-sign-in` | Navigate to /sign-in | ✅ |

---

## 3. Dashboard Pages (Authenticated)

**Note:** E2E tests verify redirection to Sign In when unauthenticated. Full functionality requires auth mocking which is pending backend environment setup.

### Layout / Navigation
| Element | Selector/TestID | Expected Behavior | Status |
|---------|-----------------|-------------------|--------|
| Logo | `dashboard-sidebar-logo` | Link to /dashboard | ⚠️ |
| Nav Links | `dashboard-nav-[name]` | Navigate to section | ⚠️ |
| Recent Project | `dashboard-project-link` | Navigate to project | ⚠️ |
| New Project | `dashboard-new-project` | Navigate to /dashboard/projects/new | ⚠️ |
| Mobile Menu | `mobile-menu-trigger` | Open mobile nav | ⚠️ |
| Search | `dashboard-search-trigger` | Open command palette | ⚠️ |
| Notifications | `notifications-trigger` | Open dropdown | ⚠️ |

### Dashboard Home (`/dashboard`)
| Element | Selector/TestID | Expected Behavior | Status |
|---------|-----------------|-------------------|--------|
| AI Insights | `header-ai-insights` | Navigate to insights | ⚠️ |
| Generate Tests | `header-generate-tests` | Navigate to generator | ⚠️ |
| Run Tests | `header-run-tests` | Navigate to projects | ⚠️ |
| Active Project | `active-project-[id]` | Navigate to project | ⚠️ |
| Add Project Card | `add-new-project-card` | Navigate to new project | ⚠️ |

### Projects List (`/dashboard/projects`)
| Element | Selector/TestID | Expected Behavior | Status |
|---------|-----------------|-------------------|--------|
| New Project | `new-project-button` | Navigate to new project | ⚠️ |
| Empty State CTA | `empty-state-new-project` | Navigate to new project | ⚠️ |
| Project Card | `project-card-[id]` | Display details | ⚠️ |
| View Project | `view-project-[id]` | Navigate to details | ⚠️ |
| Run Tests | `run-tests-[id]` | Navigate to runs | ⚠️ |
| New Project Card | `new-project-card` | Navigate to new project | ⚠️ |

### Project Detail (`/dashboard/projects/[projectId]`)
| Element | Selector/TestID | Expected Behavior | Status |
|---------|-----------------|-------------------|--------|
| Back Link | `back-to-projects` | Navigate to projects | ⚠️ |
| Run Tests Header | `run-tests-header` | Navigate to runs | ⚠️ |
| Actions Dropdown | `project-actions-dropdown` | Open menu | ⚠️ |
| Discover Services | `discover-services` | Trigger discovery | ⚠️ |
| Project Settings | `project-settings` | Navigate to settings | ⚠️ |
| Delete Project | `delete-project` | Open delete dialog | ⚠️ |
| Check Health | `check-health-button` | Trigger health check | ⚠️ |
| Service Item | `service-item-[id]` | Display service status | ⚠️ |
| View All Runs | `view-all-runs` | Navigate to runs | ⚠️ |
| Run Item | `run-item-[id]` | Navigate to run details | ⚠️ |
| Create Suite | `create-test-suite-button` | Open modal | ⚠️ |
| Run Suite | `run-test-suite-button-[id]` | Trigger suite run | ⚠️ |

### New Project (`/dashboard/projects/new`)
| Element | Selector/TestID | Expected Behavior | Status |
|---------|-----------------|-------------------|--------|
| Back Link | `back-to-projects` | Navigate to projects | ⚠️ |
| Name Input | `project-name-input` | Input text | ⚠️ |
| Cancel | `cancel-button` | Navigate back | ⚠️ |
| Create | `create-project-button` | Submit form | ⚠️ |

### Billing (`/dashboard/billing`)
| Element | Selector/TestID | Expected Behavior | Status |
|---------|-----------------|-------------------|--------|
| Manage Billing | `manage-billing-button` | Open portal | ⚠️ |
| Upgrade | `upgrade-button` | Start checkout | ⚠️ |
| Contact Sales | `contact-sales-button` | Mailto link | ⚠️ |

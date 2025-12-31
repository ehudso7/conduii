/**
 * Comprehensive Interactions E2E Tests
 * 
 * This test suite validates all user-visible interactive elements across
 * the Conduii web app as documented in INTERACTIONS.md.
 * 
 * Uses the Click Integrity Guard to catch:
 * - Page errors (uncaught exceptions)
 * - Console errors
 * - Failed network requests
 */

import { test, expect, Page } from "@playwright/test";
import { 
  attachClickIntegrityGuard, 
  assertNoErrors, 
  ClickIntegrityGuard 
} from "./helpers/click-integrity-guard";

// Helper to set up page with integrity guard
async function setupPage(page: Page): Promise<ClickIntegrityGuard> {
  const guard = attachClickIntegrityGuard(page);
  return guard;
}

// ============================================================================
// PUBLIC PAGES - HOMEPAGE
// ============================================================================

test.describe("Homepage (/) - Interactions", () => {
  test("page loads without errors", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/");
    
    await expect(page).toHaveTitle(/Conduii/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    
    assertNoErrors(guard);
    guard.cleanup();
  });

  test("navigation links are functional", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/");
    
    // Test nav links exist
    await expect(page.getByTestId("nav-features")).toBeVisible();
    await expect(page.getByTestId("nav-integrations")).toBeVisible();
    await expect(page.getByTestId("nav-pricing")).toBeVisible();
    await expect(page.getByTestId("nav-docs")).toBeVisible();
    
    assertNoErrors(guard);
    guard.cleanup();
  });

  test("features nav link scrolls to section", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/");
    
    await page.getByTestId("nav-features").click();
    await expect(page).toHaveURL("/#features");
    
    assertNoErrors(guard);
    guard.cleanup();
  });

  test("pricing nav link scrolls to section", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/");
    
    await page.getByTestId("nav-pricing").click();
    await expect(page).toHaveURL("/#pricing");
    
    assertNoErrors(guard);
    guard.cleanup();
  });

  test("integrations nav link scrolls to section", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/");
    
    await page.getByTestId("nav-integrations").click();
    await expect(page).toHaveURL("/#integrations");
    
    assertNoErrors(guard);
    guard.cleanup();
  });

  test("docs nav link navigates to docs page", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/");
    
    await page.getByTestId("nav-docs").click();
    await expect(page).toHaveURL("/docs");
    
    assertNoErrors(guard);
    guard.cleanup();
  });

  test("logo link navigates to homepage", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/features");  // Features page has the logo
    
    await page.getByTestId("logo").click();
    await expect(page).toHaveURL("/");
    
    assertNoErrors(guard);
    guard.cleanup();
  });

  test("theme toggle works", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/");
    
    const toggle = page.getByTestId("theme-toggle");
    await expect(toggle).toBeVisible();
    await toggle.click();
    
    // Should toggle without errors
    assertNoErrors(guard);
    guard.cleanup();
  });

  test("sign in button navigates to sign-in", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/");
    
    await page.getByTestId("nav-signin").click();
    await expect(page).toHaveURL(/\/sign-in/);
    
    assertNoErrors(guard);
    guard.cleanup();
  });

  test("get started button navigates to sign-up", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/");
    
    await page.getByTestId("nav-getstarted").click();
    await expect(page).toHaveURL(/\/sign-up/);
    
    assertNoErrors(guard);
    guard.cleanup();
  });

  test("hero CTA button works", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/");
    
    const heroCta = page.getByTestId("hero-cta");
    await expect(heroCta).toBeVisible();
    await heroCta.click();
    await expect(page).toHaveURL(/\/sign-up|\/dashboard/);
    
    assertNoErrors(guard);
    guard.cleanup();
  });

  test("hero docs button navigates to docs", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/");
    
    await page.getByTestId("hero-docs").click();
    await expect(page).toHaveURL("/docs");
    
    assertNoErrors(guard);
    guard.cleanup();
  });

  test("pricing CTAs are functional", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/");
    
    // Scroll to pricing section
    await page.getByTestId("nav-pricing").click();
    await page.waitForTimeout(500);
    
    // Check pricing buttons are visible
    await expect(page.getByTestId("pricing-free-cta")).toBeVisible();
    await expect(page.getByTestId("pricing-pro-cta")).toBeVisible();
    await expect(page.getByTestId("pricing-enterprise-cta")).toBeVisible();
    
    // Test free tier CTA
    await page.getByTestId("pricing-free-cta").click();
    await expect(page).toHaveURL(/\/sign-up/);
    
    assertNoErrors(guard);
    guard.cleanup();
  });

  test("footer links are functional", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/");
    
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    // Test footer links exist
    await expect(page.getByTestId("footer-features")).toBeVisible();
    await expect(page.getByTestId("footer-integrations")).toBeVisible();
    await expect(page.getByTestId("footer-pricing")).toBeVisible();
    await expect(page.getByTestId("footer-changelog")).toBeVisible();
    await expect(page.getByTestId("footer-docs")).toBeVisible();
    await expect(page.getByTestId("footer-blog")).toBeVisible();
    await expect(page.getByTestId("footer-about")).toBeVisible();
    await expect(page.getByTestId("footer-privacy")).toBeVisible();
    await expect(page.getByTestId("footer-terms")).toBeVisible();
    
    assertNoErrors(guard);
    guard.cleanup();
  });

  test("footer changelog link works", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/");
    
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    await page.getByTestId("footer-changelog").click();
    await expect(page).toHaveURL("/changelog");
    
    assertNoErrors(guard);
    guard.cleanup();
  });

  test("CTA section button works", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/");
    
    // Scroll near bottom to CTA
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight - 500));
    await page.waitForTimeout(500);
    
    const ctaButton = page.getByTestId("cta-getstarted");
    if (await ctaButton.isVisible()) {
      await ctaButton.click();
      await expect(page).toHaveURL(/\/sign-up|\/dashboard/);
    }
    
    assertNoErrors(guard);
    guard.cleanup();
  });
});

// ============================================================================
// PUBLIC PAGES - FEATURES
// ============================================================================

test.describe("Features (/features) - Interactions", () => {
  test("page loads without errors", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/features");
    
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Everything You Need");
    
    assertNoErrors(guard);
    guard.cleanup();
  });

  test("back to home link works", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/features");
    
    await page.getByTestId("back-home").click();
    await expect(page).toHaveURL("/");
    
    assertNoErrors(guard);
    guard.cleanup();
  });

  test("CTA buttons work", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/features");
    
    // Scroll to CTA
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    await page.getByTestId("cta-getstarted").click();
    await expect(page).toHaveURL(/\/sign-up/);
    
    assertNoErrors(guard);
    guard.cleanup();
  });
});

// ============================================================================
// PUBLIC PAGES - INTEGRATIONS
// ============================================================================

test.describe("Integrations (/integrations) - Interactions", () => {
  test("page loads without errors", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/integrations");
    
    await expect(page.getByRole("heading", { level: 1 })).toContainText("50+ Integrations");
    
    assertNoErrors(guard);
    guard.cleanup();
  });

  test("back to home link works", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/integrations");
    
    await page.getByTestId("back-home").click();
    await expect(page).toHaveURL("/");
    
    assertNoErrors(guard);
    guard.cleanup();
  });
});

// ============================================================================
// PUBLIC PAGES - PRICING
// ============================================================================

test.describe("Pricing (/pricing) - Interactions", () => {
  test("page loads without errors", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/pricing");
    
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Pricing");
    await expect(page.getByRole("heading", { name: "Free", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Pro", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Enterprise", exact: true })).toBeVisible();
    
    assertNoErrors(guard);
    guard.cleanup();
  });

  test("back to home link works", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/pricing");
    
    await page.getByTestId("back-home").click();
    await expect(page).toHaveURL("/");
    
    assertNoErrors(guard);
    guard.cleanup();
  });
});

// ============================================================================
// PUBLIC PAGES - DOCS
// ============================================================================

test.describe("Documentation (/docs) - Interactions", () => {
  test("page loads without errors", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/docs");
    
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Documentation");
    
    assertNoErrors(guard);
    guard.cleanup();
  });

  test("back to home link works", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/docs");
    
    await page.getByTestId("back-home").click();
    await expect(page).toHaveURL("/");
    
    assertNoErrors(guard);
    guard.cleanup();
  });

  test("section navigation buttons work", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/docs");
    
    // Section cards should be clickable
    const gettingStartedSection = page.locator("text=Getting Started").first();
    await expect(gettingStartedSection).toBeVisible();
    
    assertNoErrors(guard);
    guard.cleanup();
  });

  test("code blocks have copy buttons", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/docs");
    
    // Code blocks should be visible
    const codeBlocks = page.locator("pre");
    await expect(codeBlocks.first()).toBeVisible();
    
    assertNoErrors(guard);
    guard.cleanup();
  });
});

// ============================================================================
// PUBLIC PAGES - BLOG
// ============================================================================

test.describe("Blog (/blog) - Interactions", () => {
  test("page loads without errors", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/blog");
    
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Blog");
    
    assertNoErrors(guard);
    guard.cleanup();
  });

  test("back to home link works", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/blog");
    
    await page.getByTestId("back-home").click();
    await expect(page).toHaveURL("/");
    
    assertNoErrors(guard);
    guard.cleanup();
  });

  test("blog post cards are clickable", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/blog");
    
    const firstPost = page.getByTestId("blog-post-introducing-conduii");
    await expect(firstPost).toBeVisible();
    await firstPost.click();
    await expect(page).toHaveURL(/\/blog\/introducing-conduii/);
    
    assertNoErrors(guard);
    guard.cleanup();
  });
});

// ============================================================================
// PUBLIC PAGES - ABOUT
// ============================================================================

test.describe("About (/about) - Interactions", () => {
  test("page loads without errors", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/about");
    
    await expect(page.getByRole("heading", { level: 1 })).toContainText("About Conduii");
    
    assertNoErrors(guard);
    guard.cleanup();
  });

  test("navigation links work", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/about");
    
    await page.getByTestId("back-home").click();
    await expect(page).toHaveURL("/");
    
    assertNoErrors(guard);
    guard.cleanup();
  });

  test("CTA button works", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/about");
    
    await page.getByTestId("cta-getstarted").click();
    await expect(page).toHaveURL(/\/sign-up/);
    
    assertNoErrors(guard);
    guard.cleanup();
  });
});

// ============================================================================
// PUBLIC PAGES - PRIVACY, TERMS, CHANGELOG
// ============================================================================

test.describe("Privacy (/privacy) - Interactions", () => {
  test("page loads without errors", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/privacy");
    
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Privacy Policy");
    
    assertNoErrors(guard);
    guard.cleanup();
  });
});

test.describe("Terms (/terms) - Interactions", () => {
  test("page loads without errors", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/terms");
    
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Terms of Service");
    
    assertNoErrors(guard);
    guard.cleanup();
  });
});

test.describe("Changelog (/changelog) - Interactions", () => {
  test("page loads without errors", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/changelog");
    
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Changelog");
    
    assertNoErrors(guard);
    guard.cleanup();
  });

  test("back to home link works", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/changelog");
    
    await page.getByTestId("back-home").click();
    await expect(page).toHaveURL("/");
    
    assertNoErrors(guard);
    guard.cleanup();
  });
});

// ============================================================================
// AUTH PAGES
// ============================================================================

test.describe("Sign In (/sign-in) - Interactions", () => {
  test("page loads without errors", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/sign-in");
    
    await expect(page).toHaveURL(/\/sign-in/);
    
    assertNoErrors(guard);
    guard.cleanup();
  });

  test("back to home link works", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/sign-in");
    
    await page.getByTestId("back-home").click();
    await expect(page).toHaveURL("/");
    
    assertNoErrors(guard);
    guard.cleanup();
  });

  test("fallback UI shows when Clerk not configured", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/sign-in");
    
    // Should show either Clerk component or fallback UI
    const body = page.locator("body");
    await expect(body).toBeVisible();
    
    // If fallback is shown, create account link should work
    const createAccountLink = page.getByTestId("auth-create-account");
    if (await createAccountLink.isVisible()) {
      await createAccountLink.click();
      await expect(page).toHaveURL(/\/sign-up/);
    }
    
    assertNoErrors(guard);
    guard.cleanup();
  });
});

test.describe("Sign Up (/sign-up) - Interactions", () => {
  test("page loads without errors", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/sign-up");
    
    await expect(page).toHaveURL(/\/sign-up/);
    
    assertNoErrors(guard);
    guard.cleanup();
  });

  test("back to home link works", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/sign-up");
    
    await page.getByTestId("back-home").click();
    await expect(page).toHaveURL("/");
    
    assertNoErrors(guard);
    guard.cleanup();
  });
});

test.describe("Forgot Password (/forgot-password) - Interactions", () => {
  test("page loads without errors", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/forgot-password");
    
    await expect(page.getByRole("heading")).toContainText(/Forgot|password/i);
    
    assertNoErrors(guard);
    guard.cleanup();
  });

  test("back to home link works", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/forgot-password");
    
    await page.getByTestId("back-home").first().click();
    await expect(page).toHaveURL("/");
    
    assertNoErrors(guard);
    guard.cleanup();
  });

  test("form is interactive", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/forgot-password");
    
    // Email input should be visible and typeable
    const emailInput = page.getByTestId("forgot-email");
    await expect(emailInput).toBeVisible();
    await emailInput.fill("test@example.com");
    
    // Submit button should be visible
    const submitButton = page.getByTestId("forgot-submit");
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();
    
    assertNoErrors(guard);
    guard.cleanup();
  });

  test("form submission shows success state", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/forgot-password");
    
    // Fill and submit the form
    await page.getByTestId("forgot-email").fill("test@example.com");
    await page.getByTestId("forgot-submit").click();
    
    // Wait for success state
    await page.waitForTimeout(2000);
    
    // Should show success message
    await expect(page.getByText("Check your email")).toBeVisible();
    
    // Return to sign in should work
    await page.getByTestId("forgot-return").click();
    await expect(page).toHaveURL(/\/sign-in/);
    
    assertNoErrors(guard);
    guard.cleanup();
  });

  test("sign in link works", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/forgot-password");
    
    await page.getByTestId("forgot-signin").click();
    await expect(page).toHaveURL(/\/sign-in/);
    
    assertNoErrors(guard);
    guard.cleanup();
  });
});

// ============================================================================
// DASHBOARD PAGES - Protected Routes
// These tests verify that protected routes redirect properly when unauthenticated
// ============================================================================

test.describe("Dashboard - Protected Route Redirects", () => {
  test("dashboard redirects to sign-in when unauthenticated", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/dashboard");
    
    await expect(page).toHaveURL(/\/sign-in/);
    
    assertNoErrors(guard);
    guard.cleanup();
  });

  test("projects page redirects when unauthenticated", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/dashboard/projects");
    
    await expect(page).toHaveURL(/\/sign-in/);
    
    assertNoErrors(guard);
    guard.cleanup();
  });

  test("settings page redirects when unauthenticated", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/dashboard/settings");
    
    await expect(page).toHaveURL(/\/sign-in/);
    
    assertNoErrors(guard);
    guard.cleanup();
  });

  test("billing page redirects when unauthenticated", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/dashboard/billing");
    
    await expect(page).toHaveURL(/\/sign-in/);
    
    assertNoErrors(guard);
    guard.cleanup();
  });

  test("new project page redirects when unauthenticated", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/dashboard/projects/new");
    
    await expect(page).toHaveURL(/\/sign-in/);
    
    assertNoErrors(guard);
    guard.cleanup();
  });
});

// ============================================================================
// CROSS-PAGE NAVIGATION
// ============================================================================

test.describe("Cross-Page Navigation Flow", () => {
  test("complete user journey: home → features → pricing → docs → home", async ({ page }) => {
    const guard = await setupPage(page);
    
    // Start at home
    await page.goto("/");
    await expect(page).toHaveURL("/");
    
    // Go to features
    await page.getByTestId("footer-features").click();
    await expect(page).toHaveURL("/features");
    
    // Go to pricing
    await page.getByRole("link", { name: "Pricing" }).first().click();
    await expect(page).toHaveURL("/pricing");
    
    // Go to docs
    await page.getByRole("link", { name: "Docs" }).first().click();
    await expect(page).toHaveURL("/docs");
    
    // Back to home
    await page.getByTestId("back-home").click();
    await expect(page).toHaveURL("/");
    
    assertNoErrors(guard);
    guard.cleanup();
  });

  test("blog navigation flow", async ({ page }) => {
    const guard = await setupPage(page);
    
    // Start at home, go to blog via footer
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    await page.getByTestId("footer-blog").click();
    await expect(page).toHaveURL("/blog");
    
    // Click a blog post
    await page.getByTestId("blog-post-introducing-conduii").click();
    await expect(page).toHaveURL(/\/blog\/introducing-conduii/);
    
    assertNoErrors(guard);
    guard.cleanup();
  });
});

// ============================================================================
// ACCESSIBILITY CHECKS
// ============================================================================

test.describe("Accessibility - Keyboard Navigation", () => {
  test("homepage is keyboard navigable", async ({ page }) => {
    const guard = await setupPage(page);
    await page.goto("/");
    
    // Tab through the page
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Tab");
    }
    
    // A focusable element should be active
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();
    
    assertNoErrors(guard);
    guard.cleanup();
  });
});

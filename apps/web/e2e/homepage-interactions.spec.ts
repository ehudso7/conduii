/**
 * Comprehensive Homepage Interaction Tests
 * 
 * Tests every interactive element on the homepage to ensure:
 * - No console errors
 * - Correct navigation/behavior
 * - Elements are clickable and responsive
 */

import { test, expect } from "@playwright/test";
import { setupErrorGuard, COMMON_ALLOWED_ERRORS } from "./helpers/error-guard";

test.describe("Homepage - Navigation Interactions", () => {
  test("logo should link to homepage", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    await page.goto("/about");
    await expect(page).toHaveURL("/about");

    const logo = page.getByTestId("logo-home-link");
    await expect(logo).toBeVisible();
    await logo.click();
    await page.waitForURL("/");
    await expect(page).toHaveURL("/");

    guard.assertNoErrors();
  });

  test("navigation - Features link should scroll to features section", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    await page.goto("/");

    const featuresLink = page.getByTestId("nav-features-link");
    await expect(featuresLink).toBeVisible();
    await featuresLink.click();

    // Should scroll to features section (hash change on same page)
    await page.waitForTimeout(500); // Wait for smooth scroll
    await expect(page).toHaveURL("/#features");

    guard.assertNoErrors();
  });

  test("navigation - Integrations link should scroll to integrations section", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    await page.goto("/");

    const integrationsLink = page.getByTestId("nav-integrations-link");
    await expect(integrationsLink).toBeVisible();
    await integrationsLink.click();

    // Should scroll to integrations section (hash change on same page)
    await page.waitForTimeout(500); // Wait for smooth scroll
    await expect(page).toHaveURL("/#integrations");

    guard.assertNoErrors();
  });

  test("navigation - Pricing link should scroll to pricing section", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    await page.goto("/");

    const pricingLink = page.getByTestId("nav-pricing-link");
    await expect(pricingLink).toBeVisible();
    await pricingLink.click();

    // Should scroll to pricing section (hash change on same page)
    await page.waitForTimeout(500); // Wait for smooth scroll
    await expect(page).toHaveURL("/#pricing");

    guard.assertNoErrors();
  });

  test("navigation - Docs link should navigate to docs page", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    await page.goto("/");

    const docsLink = page.getByTestId("nav-docs-link");
    await expect(docsLink).toBeVisible();
    await docsLink.click();

    await page.waitForURL("/docs");
    await expect(page).toHaveURL("/docs");

    guard.assertNoErrors();
  });

  test("navigation - Sign In button should navigate to sign-in page", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    await page.goto("/");

    const signInBtn = page.getByTestId("nav-sign-in-btn");
    await expect(signInBtn).toBeVisible();
    await signInBtn.click();

    await page.waitForURL("/sign-in");
    await expect(page).toHaveURL("/sign-in");

    guard.assertNoErrors();
  });

  test("navigation - Get Started button should navigate to sign-up page", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    await page.goto("/");

    const getStartedBtn = page.getByTestId("nav-get-started-btn");
    await expect(getStartedBtn).toBeVisible();
    await getStartedBtn.click();

    await page.waitForURL("/sign-up");
    await expect(page).toHaveURL("/sign-up");

    guard.assertNoErrors();
  });

  test("theme toggle should work without errors", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    await page.goto("/");

    const themeToggle = page.getByTestId("theme-toggle");
    await expect(themeToggle).toBeVisible();

    // Click to toggle theme
    await themeToggle.click();
    await page.waitForTimeout(300); // Wait for theme transition

    // Verify no errors occurred
    guard.assertNoErrors();

    // Toggle back
    await themeToggle.click();
    await page.waitForTimeout(300);

    guard.assertNoErrors();
  });
});

test.describe("Homepage - Hero Section Interactions", () => {
  test("hero primary CTA should navigate to sign-up", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    await page.goto("/");

    const heroCTA = page.getByTestId("hero-cta-primary");
    await expect(heroCTA).toBeVisible();
    await expect(heroCTA).toContainText("Start Testing Free");

    await heroCTA.click();
    await page.waitForURL("/sign-up");
    await expect(page).toHaveURL("/sign-up");

    guard.assertNoErrors();
  });

  test("hero docs button should navigate to docs", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    await page.goto("/");

    const docsCTA = page.getByTestId("hero-cta-docs");
    await expect(docsCTA).toBeVisible();
    await expect(docsCTA).toContainText("View Documentation");

    await docsCTA.click();
    await page.waitForURL("/docs");
    await expect(page).toHaveURL("/docs");

    guard.assertNoErrors();
  });
});

test.describe("Homepage - Pricing Section Interactions", () => {
  test("free plan CTA should navigate to sign-up", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    await page.goto("/");

    // Scroll to pricing section
    await page.getByTestId("nav-pricing-link").click();
    await page.waitForTimeout(800); // Wait for smooth scroll to complete

    // Wait for element to be visible and in viewport
    const freeCTA = page.getByTestId("pricing-free-cta");
    await freeCTA.scrollIntoViewIfNeeded();
    await expect(freeCTA).toBeVisible();
    
    await freeCTA.click();
    await page.waitForURL("/sign-up");
    await expect(page).toHaveURL("/sign-up");

    guard.assertNoErrors();
  });

  test("pro plan CTA should navigate to sign-up", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    await page.goto("/");

    // Scroll to pricing section
    await page.getByTestId("nav-pricing-link").click();
    await page.waitForTimeout(800); // Wait for smooth scroll to complete

    // Wait for element to be visible and in viewport
    const proCTA = page.getByTestId("pricing-pro-cta");
    await proCTA.scrollIntoViewIfNeeded();
    await expect(proCTA).toBeVisible();
    
    await proCTA.click();
    await page.waitForURL("/sign-up");
    await expect(page).toHaveURL("/sign-up");

    guard.assertNoErrors();
  });

  test("enterprise plan CTA should open email link", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    await page.goto("/");

    // Scroll to pricing section
    await page.getByTestId("nav-pricing-link").click();
    await page.waitForTimeout(800); // Wait for smooth scroll to complete

    // Wait for element to be visible and in viewport
    const enterpriseCTA = page.getByTestId("pricing-enterprise-cta");
    await enterpriseCTA.scrollIntoViewIfNeeded();
    await expect(enterpriseCTA).toBeVisible();

    // Check that it has correct mailto href
    const href = await enterpriseCTA.getAttribute("href");
    expect(href).toContain("mailto:sales@conduii.com");
    expect(href).toContain("Enterprise");

    guard.assertNoErrors();
  });
});

test.describe("Homepage - CTA Section Interactions", () => {
  test("bottom CTA should navigate to sign-up", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    await page.goto("/");

    // Scroll to bottom CTA
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight - 1000));
    await page.waitForTimeout(500);

    const ctaButton = page.getByTestId("cta-get-started");
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toContainText("Get Started for Free");

    await ctaButton.click();
    await page.waitForURL("/sign-up");
    await expect(page).toHaveURL("/sign-up");

    guard.assertNoErrors();
  });
});

test.describe("Homepage - Footer Interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);
  });

  test("footer - Features link should navigate", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    const link = page.getByTestId("footer-features-link");
    await expect(link).toBeVisible();
    await link.click();
    await page.waitForURL("/features");
    await expect(page).toHaveURL("/features");

    guard.assertNoErrors();
  });

  test("footer - Integrations link should navigate", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    const link = page.getByTestId("footer-integrations-link");
    await expect(link).toBeVisible();
    await link.click();
    await page.waitForURL("/integrations");
    await expect(page).toHaveURL("/integrations");

    guard.assertNoErrors();
  });

  test("footer - Pricing link should navigate", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    const link = page.getByTestId("footer-pricing-link");
    await expect(link).toBeVisible();
    await link.click();
    await page.waitForURL("/pricing");
    await expect(page).toHaveURL("/pricing");

    guard.assertNoErrors();
  });

  test("footer - Changelog link should navigate", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    const link = page.getByTestId("footer-changelog-link");
    await expect(link).toBeVisible();
    await link.click();
    await page.waitForURL("/changelog");
    await expect(page).toHaveURL("/changelog");

    guard.assertNoErrors();
  });

  test("footer - Documentation link should navigate", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    const link = page.getByTestId("footer-docs-link");
    await expect(link).toBeVisible();
    await link.click();
    await page.waitForURL("/docs");
    await expect(page).toHaveURL("/docs");

    guard.assertNoErrors();
  });

  test("footer - CLI Reference link should navigate", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    const link = page.getByTestId("footer-cli-link");
    await expect(link).toBeVisible();
    await link.click();
    await page.waitForURL("/docs#cli-discover");
    
    guard.assertNoErrors();
  });

  test("footer - API link should navigate", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    const link = page.getByTestId("footer-api-link");
    await expect(link).toBeVisible();
    await link.click();
    await page.waitForURL("/docs#api-auth");
    
    guard.assertNoErrors();
  });

  test("footer - Blog link should navigate", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    const link = page.getByTestId("footer-blog-link");
    await expect(link).toBeVisible();
    await link.click();
    await page.waitForURL("/blog");
    await expect(page).toHaveURL("/blog");

    guard.assertNoErrors();
  });

  test("footer - About link should navigate", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    const link = page.getByTestId("footer-about-link");
    await expect(link).toBeVisible();
    await link.click();
    await page.waitForURL("/about");
    await expect(page).toHaveURL("/about");

    guard.assertNoErrors();
  });

  test("footer - Privacy link should navigate", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    const link = page.getByTestId("footer-privacy-link");
    await expect(link).toBeVisible();
    await link.click();
    await page.waitForURL("/privacy");
    await expect(page).toHaveURL("/privacy");

    guard.assertNoErrors();
  });

  test("footer - Terms link should navigate", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    const link = page.getByTestId("footer-terms-link");
    await expect(link).toBeVisible();
    await link.click();
    await page.waitForURL("/terms");
    await expect(page).toHaveURL("/terms");

    guard.assertNoErrors();
  });

  test("footer - GitHub link should open in new tab", async ({ page, context }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    const link = page.getByTestId("footer-github-link");
    await expect(link).toBeVisible();

    // Check it has correct attributes for external link
    const target = await link.getAttribute("target");
    const rel = await link.getAttribute("rel");
    expect(target).toBe("_blank");
    expect(rel).toContain("noopener");

    guard.assertNoErrors();
  });
});

test.describe("Homepage - No Console Errors", () => {
  test("page should load without any console errors", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    await page.goto("/");
    
    // Wait for page to fully load
    await page.waitForLoadState("networkidle");

    // Scroll through entire page to trigger any lazy-loaded errors
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Assert no errors
    guard.assertNoErrors();
  });

  test("interactive elements should not cause errors when clicked rapidly", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    await page.goto("/");

    // Rapid clicking test - theme toggle
    const themeToggle = page.getByTestId("theme-toggle");
    for (let i = 0; i < 5; i++) {
      await themeToggle.click();
      await page.waitForTimeout(50);
    }

    guard.assertNoErrors();
  });
});

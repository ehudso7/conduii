/**
 * Comprehensive Public Pages Interaction Tests
 * 
 * Tests all interactive elements on public pages to ensure:
 * - No console errors
 * - Correct navigation/behavior
 * - Elements are clickable and responsive
 */

import { test, expect } from "@playwright/test";
import { setupErrorGuard, COMMON_ALLOWED_ERRORS } from "./helpers/error-guard";

test.describe("Features Page - Interactions", () => {
  test("should load without errors", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    await page.goto("/features");
    await expect(page).toHaveTitle(/Features/);
    await page.waitForLoadState("networkidle");

    guard.assertNoErrors();
  });

  test("logo should link to homepage", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    await page.goto("/features");
    
    const logo = page.getByTestId("logo-home-link");
    await expect(logo).toBeVisible();
    await logo.click();
    
    await page.waitForURL("/");
    await expect(page).toHaveURL("/");

    guard.assertNoErrors();
  });

  test("back to home link should navigate", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    await page.goto("/features");
    
    const backLink = page.getByTestId("back-to-home-link");
    await expect(backLink).toBeVisible();
    await backLink.click();
    
    await page.waitForURL("/");
    await expect(page).toHaveURL("/");

    guard.assertNoErrors();
  });

  test("Get Started CTA should navigate to sign-up", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    await page.goto("/features");
    
    // Scroll to CTA
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight - 500));
    await page.waitForTimeout(300);

    const cta = page.getByTestId("features-cta-signup");
    await expect(cta).toBeVisible();
    await cta.click();
    
    await page.waitForURL("/sign-up");
    await expect(page).toHaveURL("/sign-up");

    guard.assertNoErrors();
  });

  test("Read the Docs CTA should navigate to docs", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    await page.goto("/features");
    
    // Scroll to CTA
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight - 500));
    await page.waitForTimeout(300);

    const cta = page.getByTestId("features-cta-docs");
    await expect(cta).toBeVisible();
    await cta.click();
    
    await page.waitForURL("/docs");
    await expect(page).toHaveURL("/docs");

    guard.assertNoErrors();
  });
});

test.describe("Integrations Page - Interactions", () => {
  test("should load without errors", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    await page.goto("/integrations");
    await expect(page).toHaveTitle(/Integrations/);
    await page.waitForLoadState("networkidle");

    guard.assertNoErrors();
  });

  test("logo should link to homepage", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    await page.goto("/integrations");
    
    const logo = page.getByTestId("logo-home-link");
    await expect(logo).toBeVisible();
    await logo.click();
    
    await page.waitForURL("/");
    await expect(page).toHaveURL("/");

    guard.assertNoErrors();
  });

  test("back to home link should navigate", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    await page.goto("/integrations");
    
    const backLink = page.getByTestId("back-to-home-link");
    await expect(backLink).toBeVisible();
    await backLink.click();
    
    await page.waitForURL("/");
    await expect(page).toHaveURL("/");

    guard.assertNoErrors();
  });

  test("Request an Integration should have mailto link", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    await page.goto("/integrations");
    
    // Scroll to request section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight - 800));
    await page.waitForTimeout(300);

    const requestLink = page.getByTestId("request-integration-link");
    await expect(requestLink).toBeVisible();
    
    const href = await requestLink.getAttribute("href");
    expect(href).toContain("mailto:support@conduii.com");
    expect(href).toContain("Integration%20Request");

    guard.assertNoErrors();
  });

  test("Get Started CTA should navigate to sign-up", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    await page.goto("/integrations");
    
    // Scroll to CTA
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight - 500));
    await page.waitForTimeout(300);

    const cta = page.getByTestId("integrations-cta-signup");
    await expect(cta).toBeVisible();
    await cta.click();
    
    await page.waitForURL("/sign-up");
    await expect(page).toHaveURL("/sign-up");

    guard.assertNoErrors();
  });
});

test.describe("Pricing Page - Interactions", () => {
  test("should load without errors", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    await page.goto("/pricing");
    await expect(page).toHaveTitle(/Pricing/);
    await page.waitForLoadState("networkidle");

    guard.assertNoErrors();
  });

  test("logo should link to homepage", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    await page.goto("/pricing");
    
    const logo = page.getByTestId("logo-home-link");
    await expect(logo).toBeVisible();
    await logo.click();
    
    await page.waitForURL("/");
    await expect(page).toHaveURL("/");

    guard.assertNoErrors();
  });

  test("back to home link should navigate", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    await page.goto("/pricing");
    
    const backLink = page.getByTestId("back-to-home-link");
    await expect(backLink).toBeVisible();
    await backLink.click();
    
    await page.waitForURL("/");
    await expect(page).toHaveURL("/");

    guard.assertNoErrors();
  });

  test("Free plan CTA should navigate to sign-up", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    await page.goto("/pricing");
    
    const freeCTA = page.getByTestId("pricing-free-cta");
    await freeCTA.scrollIntoViewIfNeeded();
    await expect(freeCTA).toBeVisible();
    await freeCTA.click();
    
    await page.waitForURL("/sign-up");
    await expect(page).toHaveURL("/sign-up");

    guard.assertNoErrors();
  });

  test("Pro plan CTA should navigate to sign-up", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    await page.goto("/pricing");
    
    const proCTA = page.getByTestId("pricing-pro-cta");
    await proCTA.scrollIntoViewIfNeeded();
    await expect(proCTA).toBeVisible();
    await proCTA.click();
    
    await page.waitForURL("/sign-up");
    await expect(page).toHaveURL("/sign-up");

    guard.assertNoErrors();
  });

  test("Enterprise plan CTA should have mailto link", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    await page.goto("/pricing");
    
    const enterpriseCTA = page.getByTestId("pricing-enterprise-cta");
    await enterpriseCTA.scrollIntoViewIfNeeded();
    await expect(enterpriseCTA).toBeVisible();
    
    const href = await enterpriseCTA.getAttribute("href");
    expect(href).toContain("mailto:sales@conduii.com");
    expect(href).toContain("Enterprise");

    guard.assertNoErrors();
  });
});

test.describe("About Page - Interactions", () => {
  test("should load without errors", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    await page.goto("/about");
    await expect(page).toHaveTitle(/About/);
    await page.waitForLoadState("networkidle");

    guard.assertNoErrors();
  });

  test("logo should link to homepage", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    await page.goto("/about");
    
    const logo = page.getByTestId("logo-home-link");
    await expect(logo).toBeVisible();
    await logo.click();
    
    await page.waitForURL("/");
    await expect(page).toHaveURL("/");

    guard.assertNoErrors();
  });

  test("back to home link should navigate", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    await page.goto("/about");
    
    const backLink = page.getByTestId("back-to-home-link");
    await expect(backLink).toBeVisible();
    await backLink.click();
    
    await page.waitForURL("/");
    await expect(page).toHaveURL("/");

    guard.assertNoErrors();
  });

  test("Get Started CTA should navigate to sign-up", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    await page.goto("/about");
    
    // Find and click "Start Testing for Free" button
    const ctaButton = page.getByRole("link", { name: /Start Testing for Free/i });
    await ctaButton.scrollIntoViewIfNeeded();
    await expect(ctaButton).toBeVisible();
    await ctaButton.click();
    
    await page.waitForURL("/sign-up");
    await expect(page).toHaveURL("/sign-up");

    guard.assertNoErrors();
  });
});

test.describe("Privacy & Terms Pages - Interactions", () => {
  test("Privacy page should load without errors", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    await page.goto("/privacy");
    await expect(page).toHaveTitle(/Privacy/);
    await page.waitForLoadState("networkidle");

    guard.assertNoErrors();
  });

  test("Terms page should load without errors", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    await page.goto("/terms");
    await expect(page).toHaveTitle(/Terms/);
    await page.waitForLoadState("networkidle");

    guard.assertNoErrors();
  });
});

test.describe("Changelog Page - Interactions", () => {
  test("should load without errors", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    await page.goto("/changelog");
    await expect(page).toHaveTitle(/Changelog/);
    await page.waitForLoadState("networkidle");

    guard.assertNoErrors();
  });

  test("back to home link should navigate", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    await page.goto("/changelog");
    
    const backLink = page.getByTestId("back-to-home-link");
    await expect(backLink).toBeVisible();
    await backLink.click();
    
    await page.waitForURL("/");
    await expect(page).toHaveURL("/");

    guard.assertNoErrors();
  });
});

test.describe("Blog Page - Interactions", () => {
  test("should load without errors", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    await page.goto("/blog");
    await expect(page).toHaveTitle(/Blog/);
    await page.waitForLoadState("networkidle");

    guard.assertNoErrors();
  });

  test("back to home link should navigate", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    await page.goto("/blog");
    
    const backLink = page.getByTestId("back-to-home-link");
    await expect(backLink).toBeVisible();
    await backLink.click();
    
    await page.waitForURL("/");
    await expect(page).toHaveURL("/");

    guard.assertNoErrors();
  });
});

test.describe("Docs Page - Interactions", () => {
  test("should load without errors", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    await page.goto("/docs");
    // Docs page is client-side, so check for heading instead of title
    await expect(page.getByRole("heading", { name: "Documentation" })).toBeVisible();
    await page.waitForLoadState("networkidle");

    guard.assertNoErrors();
  });

  test("back to home link should navigate", async ({ page }) => {
    const guard = await setupErrorGuard(page, {
      allowedConsoleErrors: COMMON_ALLOWED_ERRORS.clerkAuth,
    });

    await page.goto("/docs");
    
    const backLink = page.getByTestId("back-to-home-link");
    await expect(backLink).toBeVisible();
    await backLink.click();
    
    await page.waitForURL("/");
    await expect(page).toHaveURL("/");

    guard.assertNoErrors();
  });
});

import { test, expect } from "@playwright/test";
import { attachClickIntegrityGuard } from "./utils/click-integrity-guard";

test.describe("Homepage", () => {
  test("theme toggle and hash-nav links work", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");

    await expect(page).toHaveTitle(/Conduii/);
    await expect(page.getByTestId("topnav-logo")).toBeVisible();

    const beforeThemeClass = await page.evaluate(() => document.documentElement.className);
    await page.getByTestId("topnav-theme-toggle").click();
    const afterThemeClass = await page.evaluate(() => document.documentElement.className);
    expect(afterThemeClass).not.toEqual(beforeThemeClass);

    await page.getByTestId("topnav-link-features").click();
    await expect(page).toHaveURL(/#features$/);
    await page.getByTestId("topnav-link-integrations").click();
    await expect(page).toHaveURL(/#integrations$/);
    await page.getByTestId("topnav-link-pricing").click();
    await expect(page).toHaveURL(/#pricing$/);

    await guard.assertNoIntegrityIssues();
  });

  test("top nav: Docs navigates", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");
    await page.getByTestId("topnav-link-docs").click();
    await page.waitForURL("/docs");
    await page.waitForLoadState("domcontentloaded");
    await guard.assertNoIntegrityIssues();
  });

  test("top nav: Sign In navigates", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");
    await page.getByTestId("topnav-auth-sign-in").click();
    await page.waitForURL(/\/sign-in/);
    await page.waitForLoadState("domcontentloaded");
    await guard.assertNoIntegrityIssues();
  });

  test("top nav: Get Started navigates", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");
    await page.getByTestId("topnav-auth-sign-up").click();
    await page.waitForURL(/\/sign-up/);
    await page.waitForLoadState("domcontentloaded");
    await guard.assertNoIntegrityIssues();
  });

  test("hero: Start Testing navigates", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");
    await page.getByTestId("home-cta-start-testing").click();
    await page.waitForURL(/\/(sign-up|dashboard)/);
    await page.waitForLoadState("domcontentloaded");
    await guard.assertNoIntegrityIssues();
  });

  test("hero: View Documentation navigates", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");
    await page.getByTestId("home-cta-view-docs").click();
    await page.waitForURL("/docs");
    await page.waitForLoadState("domcontentloaded");
    await guard.assertNoIntegrityIssues();
  });

  test("pricing CTA: Free navigates", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");
    await page.getByTestId("home-pricing-cta-free").scrollIntoViewIfNeeded();
    await page.getByTestId("home-pricing-cta-free").click();
    await page.waitForURL(/\/sign-up/);
    await page.waitForLoadState("domcontentloaded");
    await guard.assertNoIntegrityIssues();
  });

  test("pricing CTA: Pro navigates", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");
    await page.getByTestId("home-pricing-cta-pro").scrollIntoViewIfNeeded();
    await page.getByTestId("home-pricing-cta-pro").click();
    await page.waitForURL(/\/sign-up/);
    await page.waitForLoadState("domcontentloaded");
    await guard.assertNoIntegrityIssues();
  });

  test("pricing CTA: Enterprise is mailto", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");
    await page.getByTestId("home-pricing-cta-enterprise").scrollIntoViewIfNeeded();
    await expect(page.getByTestId("home-pricing-cta-enterprise")).toHaveAttribute("href", /mailto:/);
    await guard.assertNoIntegrityIssues();
  });

  test("CTA section: Get Started navigates", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");
    await page.getByTestId("home-cta-get-started").scrollIntoViewIfNeeded();
    await page.getByTestId("home-cta-get-started").click();
    await page.waitForURL(/\/(sign-up|dashboard)/);
    await page.waitForLoadState("domcontentloaded");
    await guard.assertNoIntegrityIssues();
  });

  test("footer: Features navigates", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");
    await page.getByTestId("footer-link-features").scrollIntoViewIfNeeded();
    await page.getByTestId("footer-link-features").click();
    await page.waitForURL("/features");
    await page.waitForLoadState("domcontentloaded");
    await guard.assertNoIntegrityIssues();
  });

  test("footer: Integrations navigates", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");
    await page.getByTestId("footer-link-integrations").scrollIntoViewIfNeeded();
    await page.getByTestId("footer-link-integrations").click();
    await page.waitForURL("/integrations");
    await page.waitForLoadState("domcontentloaded");
    await guard.assertNoIntegrityIssues();
  });

  test("footer: Pricing navigates", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");
    await page.getByTestId("footer-link-pricing").scrollIntoViewIfNeeded();
    await page.getByTestId("footer-link-pricing").click();
    await page.waitForURL("/pricing");
    await page.waitForLoadState("domcontentloaded");
    await guard.assertNoIntegrityIssues();
  });

  test("footer: Changelog navigates", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");
    await page.getByTestId("footer-link-changelog").scrollIntoViewIfNeeded();
    await page.getByTestId("footer-link-changelog").click();
    await page.waitForURL("/changelog");
    await page.waitForLoadState("domcontentloaded");
    await guard.assertNoIntegrityIssues();
  });

  test("footer: Documentation navigates", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");
    await page.getByTestId("footer-link-docs").scrollIntoViewIfNeeded();
    await page.getByTestId("footer-link-docs").click();
    await page.waitForURL("/docs");
    await page.waitForLoadState("domcontentloaded");
    await guard.assertNoIntegrityIssues();
  });

  test("footer: CLI Reference navigates", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");
    await page.getByTestId("footer-link-cli-reference").scrollIntoViewIfNeeded();
    await page.getByTestId("footer-link-cli-reference").click();
    await page.waitForURL(/\/docs#cli-discover/);
    await page.waitForLoadState("domcontentloaded");
    await guard.assertNoIntegrityIssues();
  });

  test("footer: API anchor navigates", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");
    await page.getByTestId("footer-link-api").scrollIntoViewIfNeeded();
    await page.getByTestId("footer-link-api").click();
    await page.waitForURL(/\/docs#api-auth/);
    await page.waitForLoadState("domcontentloaded");
    await guard.assertNoIntegrityIssues();
  });

  test("footer: Blog navigates", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");
    await page.getByTestId("footer-link-blog").scrollIntoViewIfNeeded();
    await page.getByTestId("footer-link-blog").click();
    await page.waitForURL("/blog");
    await page.waitForLoadState("domcontentloaded");
    await guard.assertNoIntegrityIssues();
  });

  test("footer: About navigates", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");
    await page.getByTestId("footer-link-about").scrollIntoViewIfNeeded();
    await page.getByTestId("footer-link-about").click();
    await page.waitForURL("/about");
    await page.waitForLoadState("domcontentloaded");
    await guard.assertNoIntegrityIssues();
  });

  test("footer: Privacy navigates", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");
    await page.getByTestId("footer-link-privacy").scrollIntoViewIfNeeded();
    await page.getByTestId("footer-link-privacy").click();
    await page.waitForURL("/privacy");
    await page.waitForLoadState("domcontentloaded");
    await guard.assertNoIntegrityIssues();
  });

  test("footer: Terms navigates", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");
    await page.getByTestId("footer-link-terms").scrollIntoViewIfNeeded();
    await page.getByTestId("footer-link-terms").click();
    await page.waitForURL("/terms");
    await page.waitForLoadState("domcontentloaded");
    await guard.assertNoIntegrityIssues();
  });

  test("footer: GitHub link is external", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");
    await page.getByTestId("footer-link-github").scrollIntoViewIfNeeded();
    await expect(page.getByTestId("footer-link-github")).toHaveAttribute("href", /github\.com/);
    await guard.assertNoIntegrityIssues();
  });
});

test.describe("Public Pages", () => {
  test("about page loads correctly", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/about");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "About Conduii"
    );
    await expect(page.getByText(/AI-powered platform/i)).toBeVisible();
    await guard.assertNoIntegrityIssues();
  });

  test("privacy page loads correctly", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/privacy");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Privacy Policy"
    );
    await guard.assertNoIntegrityIssues();
  });

  test("terms page loads correctly", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/terms");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Terms of Service"
    );
    await guard.assertNoIntegrityIssues();
  });
});

test.describe("Responsive Design", () => {
  test("homepage should be responsive on mobile", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Check that main content is visible
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByTestId("home-cta-start-testing")).toBeVisible();
    await guard.assertNoIntegrityIssues();
  });

  test("homepage should be responsive on tablet", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");

    // Check that main content is visible
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByTestId("topnav-theme-toggle")).toBeVisible();
    await guard.assertNoIntegrityIssues();
  });
});

test.describe("Accessibility", () => {
  test("homepage should have proper heading hierarchy", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");

    // Check h1 exists
    const h1Count = await page.getByRole("heading", { level: 1 }).count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
    await guard.assertNoIntegrityIssues();
  });

  test("buttons should be keyboard accessible", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");

    // Tab to sign in button
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Check that a focusable element is active
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();
    await guard.assertNoIntegrityIssues();
  });

  test("links should have accessible names", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");

    // Check navigation links have text
    const featuresLink = page.getByTestId("topnav-link-features");
    await expect(featuresLink).toHaveAccessibleName("Features");

    const pricingLink = page.getByTestId("topnav-link-pricing");
    await expect(pricingLink).toHaveAccessibleName("Pricing");
    await guard.assertNoIntegrityIssues();
  });
});

test.describe("Performance", () => {
  test("homepage should load within acceptable time", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    const startTime = Date.now();
    await page.goto("/");
    const loadTime = Date.now() - startTime;

    // Should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
    await guard.assertNoIntegrityIssues();
  });
});

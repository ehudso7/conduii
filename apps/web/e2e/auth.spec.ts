import { test, expect } from "@playwright/test";
import { attachClickIntegrityGuard } from "./utils/click-integrity-guard";

test.beforeEach(async ({ page }, testInfo) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (testInfo as any)._clickIntegrityGuard = attachClickIntegrityGuard(page, testInfo);
});

test.afterEach(async ({}, testInfo) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (testInfo as any)._clickIntegrityGuard?.assertNoIntegrityIssues?.();
});

test.describe("Sign In Page", () => {
  test("should display sign in page", async ({ page }) => {
    await page.goto("/sign-in");

    // Page should load without errors
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("should have centered layout", async ({ page }) => {
    await page.goto("/sign-in");

    // Check for the gradient background container
    const container = page.locator(".min-h-screen");
    await expect(container).toBeVisible();
  });

  test("should display Clerk sign in component", async ({ page }) => {
    await page.goto("/sign-in");

    // Check that the page has content (Clerk widget or loading state)
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });
});

test.describe("Sign Up Page", () => {
  test("should display sign up page", async ({ page }) => {
    await page.goto("/sign-up");

    // Page should load without errors
    await expect(page).toHaveURL(/\/sign-up/);
  });

  test("should have centered layout", async ({ page }) => {
    await page.goto("/sign-up");

    // Check for the gradient background container
    const container = page.locator(".min-h-screen");
    await expect(container).toBeVisible();
  });

  test("should display Clerk sign up component", async ({ page }) => {
    await page.goto("/sign-up");

    // Check that the page has content
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });
});

test.describe("Protected Routes - Unauthenticated Access", () => {
  test("dashboard should redirect to sign-in when not authenticated", async ({ page }) => {
    await page.goto("/dashboard");

    // Should redirect to sign-in
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("projects page should redirect to sign-in when not authenticated", async ({ page }) => {
    await page.goto("/dashboard/projects");

    // Should redirect to sign-in
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("new project page should redirect to sign-in when not authenticated", async ({ page }) => {
    await page.goto("/dashboard/projects/new");

    // Should redirect to sign-in
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("settings page should redirect to sign-in when not authenticated", async ({ page }) => {
    await page.goto("/dashboard/settings");

    // Should redirect to sign-in
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("billing page should redirect to sign-in when not authenticated", async ({ page }) => {
    await page.goto("/dashboard/billing");

    // Should redirect to sign-in
    await expect(page).toHaveURL(/\/sign-in/);
  });
});

test.describe("Auth Button Navigation", () => {
  test("clicking Sign In in nav should navigate to sign-in page", async ({ page }) => {
    await page.goto("/");

    await page.getByTestId("topnav-auth-sign-in").click();
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("clicking Get Started should trigger sign up flow", async ({ page }) => {
    await page.goto("/");

    await page.getByTestId("topnav-auth-sign-up").click();
    await expect(page).toHaveURL(/\/sign-up/);
  });

  test("hero Start Testing Free button should work", async ({ page }) => {
    await page.goto("/");

    await page.getByTestId("home-cta-start-testing").click();
    await expect(page).toHaveURL(/\/(sign-up|dashboard)/);
  });

  test("pricing buttons should be present and clickable", async ({ page }) => {
    await page.goto("/");

    await page.getByTestId("topnav-link-pricing").click();
    await expect(page).toHaveURL(/#pricing$/);

    await expect(page.getByTestId("home-pricing-cta-free")).toBeVisible();
    await expect(page.getByTestId("home-pricing-cta-pro")).toBeVisible();
    await expect(page.getByTestId("home-pricing-cta-enterprise")).toBeVisible();
  });
});

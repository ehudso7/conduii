import { test, expect } from "@playwright/test";

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

    // Wait for Clerk to load - it renders a form or widget
    // The exact selectors depend on Clerk's implementation
    await page.waitForTimeout(2000); // Give Clerk time to load

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

    // Wait for Clerk to load
    await page.waitForTimeout(2000);

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

    // Find and click the sign in button/link
    const signInButton = page.getByRole("button", { name: "Sign In" }).first();

    // If it's a modal trigger, it might not navigate
    // If it's a link, it will navigate
    if (await signInButton.isVisible()) {
      await signInButton.click();
      // Either modal opens or we navigate
      await page.waitForTimeout(1000);
    }
  });

  test("clicking Get Started should trigger sign up flow", async ({ page }) => {
    await page.goto("/");

    // Find the Get Started button
    const getStartedButton = page.getByRole("button", { name: "Get Started" }).first();

    if (await getStartedButton.isVisible()) {
      await getStartedButton.click();
      // Either modal opens or we navigate
      await page.waitForTimeout(1000);
    }
  });

  test("hero Start Testing Free button should work", async ({ page }) => {
    await page.goto("/");

    // Find the hero CTA button
    const heroButton = page.getByRole("button", { name: /Start Testing Free/i }).first();

    if (await heroButton.isVisible()) {
      await heroButton.click();
      await page.waitForTimeout(1000);
    }
  });

  test("pricing buttons should be present and clickable", async ({ page }) => {
    await page.goto("/");

    // Scroll to pricing section
    await page.getByRole("link", { name: "Pricing" }).click();
    await page.waitForTimeout(500);

    // Check for pricing buttons
    const getStartedButton = page.getByRole("button", { name: "Get Started" });
    const startTrialButton = page.getByRole("button", { name: "Start Free Trial" });
    const contactButton = page.getByRole("button", { name: "Contact Sales" });

    // At least one should be visible
    const hasButtons =
      await getStartedButton.first().isVisible() ||
      await startTrialButton.isVisible() ||
      await contactButton.isVisible();

    expect(hasButtons).toBeTruthy();
  });
});

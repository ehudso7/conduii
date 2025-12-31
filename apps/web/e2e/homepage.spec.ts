import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("should display the main hero section", async ({ page }) => {
    await page.goto("/");

    // Check that the page loaded
    await expect(page).toHaveTitle(/Conduii/);

    // Check hero section content
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Test Your Deployments"
    );
    await expect(page.getByText("AI-Powered Testing Platform", { exact: true })).toBeVisible();
  });

  test("should display navigation links", async ({ page }) => {
    await page.goto("/");

    // Check navigation is present
    const nav = page.getByRole("navigation");
    await expect(nav.getByRole("link", { name: "Features" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Integrations" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Pricing" })).toBeVisible();
  });

  test("should display features section", async ({ page }) => {
    await page.goto("/");

    // Navigate to features section
    await page.getByRole("navigation").getByRole("link", { name: "Features" }).click();

    // Check features content
    await expect(page.getByText("Auto-Discovery")).toBeVisible();
    await expect(page.getByText("Live Testing")).toBeVisible();
    await expect(page.getByText("AI-Powered Diagnostics")).toBeVisible();
  });

  test("should display pricing section", async ({ page }) => {
    await page.goto("/");

    // Navigate to pricing section
    await page.getByRole("navigation").getByRole("link", { name: "Pricing" }).click();

    // Check pricing tiers
    await expect(page.getByRole("heading", { name: "Free", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Pro", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Enterprise", exact: true })).toBeVisible();
    await expect(page.getByText("$0", { exact: true })).toBeVisible();
    await expect(page.getByText("$29", { exact: true })).toBeVisible();
  });

  test("should display integrations section", async ({ page }) => {
    await page.goto("/");

    // Navigate to integrations section
    await page.getByRole("navigation").getByRole("link", { name: "Integrations" }).click();

    // Check some integrations are listed
    await expect(
      page.getByRole("heading", { name: "50+ Integrations, Zero Configuration" })
    ).toBeVisible();
    await expect(page.getByText("Vercel", { exact: true })).toBeVisible();
    await expect(page.getByText("Stripe", { exact: true })).toBeVisible();
  });

  test("should have sign in and sign up buttons when not authenticated", async ({
    page,
  }) => {
    await page.goto("/");

    // Check auth buttons are present
    const navAuth = page.getByRole("navigation");
    await expect(navAuth.getByRole("button", { name: "Sign In", exact: true })).toBeVisible();
    await expect(navAuth.getByRole("button", { name: "Get Started", exact: true })).toBeVisible();
  });

  test("should display the CLI code example", async ({ page }) => {
    await page.goto("/");

    // Scroll to the CLI section
    const cliSection = page.getByText("npm install -g @conduii/cli");
    await cliSection.scrollIntoViewIfNeeded();

    // Check code preview is visible
    await expect(cliSection).toBeVisible();
    await expect(page.getByText("conduii discover", { exact: true })).toBeVisible();
    await expect(page.getByText("conduii run", { exact: true })).toBeVisible();
  });

  test("should display footer with links", async ({ page }) => {
    await page.goto("/");

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Check footer links
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByRole("link", { name: "About" })).toBeVisible();
    await expect(footer.getByRole("link", { name: "Privacy" })).toBeVisible();
    await expect(footer.getByRole("link", { name: "Terms" })).toBeVisible();
  });
});

test.describe("Public Pages", () => {
  test("about page loads correctly", async ({ page }) => {
    await page.goto("/about");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "About Conduii"
    );
    await expect(page.getByText(/AI-Powered Testing platform/i)).toBeVisible();
  });

  test("privacy page loads correctly", async ({ page }) => {
    await page.goto("/privacy");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Privacy Policy"
    );
  });

  test("terms page loads correctly", async ({ page }) => {
    await page.goto("/terms");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Terms of Service"
    );
  });
});

test.describe("Responsive Design", () => {
  test("homepage should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Check that main content is visible
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Get Started" }).first()
    ).toBeVisible();
  });

  test("homepage should be responsive on tablet", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");

    // Check that main content is visible
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("navigation").getByRole("link", { name: "Features" })).toBeVisible();
  });
});

test.describe("Accessibility", () => {
  test("homepage should have proper heading hierarchy", async ({ page }) => {
    await page.goto("/");

    // Check h1 exists
    const h1Count = await page.getByRole("heading", { level: 1 }).count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });

  test("buttons should be keyboard accessible", async ({ page }) => {
    await page.goto("/");

    // Tab to sign in button
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Check that a focusable element is active
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();
  });

  test("links should have accessible names", async ({ page }) => {
    await page.goto("/");

    // Check navigation links have text
    const featuresLink = page.getByRole("navigation").getByRole("link", { name: "Features" });
    await expect(featuresLink).toHaveAccessibleName("Features");

    const pricingLink = page.getByRole("navigation").getByRole("link", { name: "Pricing" });
    await expect(pricingLink).toHaveAccessibleName("Pricing");
  });
});

test.describe("Performance", () => {
  test("homepage should load within acceptable time", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/");
    const loadTime = Date.now() - startTime;

    // Should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
  });
});

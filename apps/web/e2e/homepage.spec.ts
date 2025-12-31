import { test, expect } from "@playwright/test";
import { installClickIntegrityGuard } from "./utils/guard";

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await installClickIntegrityGuard(page);
    await page.goto("/");
  });

  test("should display the main hero section", async ({ page }) => {
    // Check that the page loaded
    await expect(page).toHaveTitle(/Conduii/);

    // Check hero section content
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Test Your Deployments"
    );
    await expect(page.getByText("AI-Powered Testing Platform", { exact: true })).toBeVisible();
    
    // Check Hero buttons
    await expect(page.getByTestId("hero-start-testing").or(page.getByTestId("hero-dashboard"))).toBeVisible();
    await expect(page.getByTestId("hero-docs")).toBeVisible();
  });

  test("should display navigation links", async ({ page }) => {
    // Check navigation is present
    await expect(page.getByTestId("nav-logo")).toBeVisible();
    await expect(page.getByTestId("nav-features")).toBeVisible();
    await expect(page.getByTestId("nav-integrations")).toBeVisible();
    await expect(page.getByTestId("nav-pricing")).toBeVisible();
    await expect(page.getByTestId("nav-docs")).toBeVisible();
    await expect(page.getByTestId("theme-toggle")).toBeVisible();
  });

  test("should navigate to features section", async ({ page }) => {
    // Click features link
    await page.getByTestId("nav-features").click();

    // Check features content
    await expect(page.getByText("Auto-Discovery")).toBeVisible();
    await expect(page.getByText("Live Testing")).toBeVisible();
    await expect(page.getByText("AI-Powered Diagnostics")).toBeVisible();
  });

  test("should navigate to pricing section", async ({ page }) => {
    // Click pricing link
    await page.getByTestId("nav-pricing").click();

    // Check pricing tiers
    await expect(page.getByRole("heading", { name: "Free", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Pro", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Enterprise", exact: true })).toBeVisible();
    
    // Check pricing buttons
    await expect(page.getByTestId("pricing-get-started")).toBeVisible();
    await expect(page.getByTestId("pricing-start-free-trial")).toBeVisible();
    await expect(page.getByTestId("pricing-contact-sales")).toBeVisible();
  });

  test("should navigate to integrations section", async ({ page }) => {
    // Click integrations link
    await page.getByTestId("nav-integrations").click();

    // Check some integrations are listed
    await expect(
      page.getByRole("heading", { name: "50+ Integrations, Zero Configuration" })
    ).toBeVisible();
    await expect(page.getByText("Vercel", { exact: true })).toBeVisible();
    await expect(page.getByText("Stripe", { exact: true })).toBeVisible();
  });

  test("should have auth buttons", async ({ page }) => {
    // Check nav auth buttons
    // Note: Depends on auth state, but we expect at least one of pair to be visible or the container
    // Since we are unauthenticated in fresh context:
    await expect(page.getByTestId("nav-sign-in")).toBeVisible();
    await expect(page.getByTestId("nav-get-started")).toBeVisible();

    // Check CTA section buttons
    await expect(page.getByTestId("cta-get-started")).toBeVisible();
  });

  test("should display footer with links", async ({ page }) => {
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Check footer links
    await expect(page.getByTestId("footer-about")).toBeVisible();
    await expect(page.getByTestId("footer-privacy")).toBeVisible();
    await expect(page.getByTestId("footer-terms")).toBeVisible();
    await expect(page.getByTestId("footer-github")).toBeVisible();
    
    await expect(page.getByTestId("footer-features")).toBeVisible();
    await expect(page.getByTestId("footer-integrations")).toBeVisible();
    await expect(page.getByTestId("footer-pricing")).toBeVisible();
    await expect(page.getByTestId("footer-changelog")).toBeVisible();
    
    await expect(page.getByTestId("footer-docs")).toBeVisible();
    await expect(page.getByTestId("footer-cli")).toBeVisible();
    await expect(page.getByTestId("footer-api")).toBeVisible();
    await expect(page.getByTestId("footer-blog")).toBeVisible();
  });
  
  test("responsive design check", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    
    // Check that main content is visible
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // Nav menu might be hidden behind hamburger, but hero buttons should be visible
    await expect(page.getByTestId("hero-start-testing").or(page.getByTestId("hero-dashboard"))).toBeVisible();
  });
});

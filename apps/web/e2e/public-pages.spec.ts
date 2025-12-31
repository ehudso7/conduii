import { test, expect } from "@playwright/test";
import { installClickIntegrityGuard } from "./utils/guard";

test.beforeEach(async ({ page }) => {
  await installClickIntegrityGuard(page);
});

test.describe("Features Page", () => {
  test("should load correctly", async ({ page }) => {
    await page.goto("/features");
    
    // Nav
    await expect(page.getByTestId("nav-features")).toBeVisible();
    await expect(page.getByTestId("nav-integrations")).toBeVisible();
    await expect(page.getByTestId("nav-pricing")).toBeVisible();
    await expect(page.getByTestId("nav-docs")).toBeVisible();
    
    // Auth
    await expect(page.getByTestId("nav-sign-in")).toBeVisible();
    await expect(page.getByTestId("nav-get-started")).toBeVisible();
    
    // Back link
    await expect(page.getByTestId("back-to-home")).toBeVisible();
    
    // Content
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Everything You Need");
    
    // CTA
    await expect(page.getByTestId("cta-get-started")).toBeVisible();
    await expect(page.getByTestId("cta-docs")).toBeVisible();
    
    // Footer
    await expect(page.getByTestId("footer-privacy")).toBeVisible();
  });
});

test.describe("Integrations Page", () => {
  test("should load correctly", async ({ page }) => {
    await page.goto("/integrations");
    
    await expect(page.getByTestId("nav-integrations")).toBeVisible();
    await expect(page.getByTestId("back-to-home")).toBeVisible();
    await expect(page.getByTestId("request-integration")).toBeVisible();
    
    await expect(page.getByRole("heading", { level: 1 })).toContainText("50+ Integrations");
    
    await expect(page.getByTestId("cta-get-started")).toBeVisible();
    await expect(page.getByTestId("footer-terms")).toBeVisible();
  });
});

test.describe("Pricing Page", () => {
  test("should load correctly", async ({ page }) => {
    await page.goto("/pricing");
    
    await expect(page.getByTestId("nav-pricing")).toBeVisible();
    await expect(page.getByTestId("back-to-home")).toBeVisible();
    
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Simple, Transparent Pricing");
    
    // Check Plan CTAs
    await expect(page.getByTestId("pricing-cta-free")).toBeVisible();
    await expect(page.getByTestId("pricing-cta-pro")).toBeVisible();
    await expect(page.getByTestId("pricing-contact-sales")).toBeVisible();
    
    await expect(page.getByTestId("cta-start-trial")).toBeVisible();
    await expect(page.getByTestId("cta-docs")).toBeVisible();
  });
});

test.describe("Docs Page", () => {
  test("should load correctly", async ({ page }) => {
    await page.goto("/docs");
    
    await expect(page.getByTestId("back-to-home")).toBeVisible();
    
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Documentation");
    
    // Check Sections
    await expect(page.getByTestId("section-installation")).toBeVisible();
    await expect(page.getByTestId("section-configuration")).toBeVisible();
    await expect(page.getByTestId("section-first-test")).toBeVisible();
    
    await expect(page.getByTestId("cta-get-started")).toBeVisible();
  });
});

test.describe("Changelog Page", () => {
  test("should load correctly", async ({ page }) => {
    await page.goto("/changelog");
    
    await expect(page.getByTestId("back-to-home")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Changelog");
    
    // Check releases (assuming content exists)
    await expect(page.getByText("v1.0.0")).toBeVisible();
  });
});

test.describe("Blog Page", () => {
  test("should load correctly", async ({ page }) => {
    await page.goto("/blog");
    
    await expect(page.getByTestId("back-to-home")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Blog");
    
    // Check post link
    await expect(page.getByTestId("blog-post-introducing-conduii")).toBeVisible();
  });
  
  test("should navigate to blog post", async ({ page }) => {
    await page.goto("/blog");
    await page.getByTestId("blog-post-introducing-conduii").click();
    
    await expect(page).toHaveURL(/\/blog\/introducing-conduii/);
    await expect(page.getByTestId("back-to-blog")).toBeVisible();
    await expect(page.getByTestId("read-more")).toBeVisible();
  });
});

test.describe("About Page", () => {
  test("should load correctly", async ({ page }) => {
    await page.goto("/about");
    
    await expect(page.getByTestId("header-home")).toBeVisible();
    await expect(page.getByTestId("cta-start-testing")).toBeVisible();
    await expect(page.getByTestId("footer-privacy")).toBeVisible();
  });
});

test.describe("Privacy Page", () => {
  test("should load correctly", async ({ page }) => {
    await page.goto("/privacy");
    
    await expect(page.getByTestId("header-home")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Privacy Policy");
  });
});

test.describe("Terms Page", () => {
  test("should load correctly", async ({ page }) => {
    await page.goto("/terms");
    
    await expect(page.getByTestId("header-home")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Terms of Service");
  });
});

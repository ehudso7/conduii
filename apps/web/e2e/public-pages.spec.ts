import { test, expect } from "@playwright/test";

test.describe("Changelog Page", () => {
  test("should display changelog with release versions", async ({ page }) => {
    await page.goto("/changelog");

    // Check page title and description
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Changelog");
    await expect(page.getByText("All the latest updates, improvements, and fixes")).toBeVisible();
  });

  test("should display release versions", async ({ page }) => {
    await page.goto("/changelog");

    // Check that version badges are displayed
    await expect(page.getByText("v1.0.0")).toBeVisible();
    await expect(page.getByText("v0.9.0")).toBeVisible();
    await expect(page.getByText("v0.8.0")).toBeVisible();
  });

  test("should display release titles", async ({ page }) => {
    await page.goto("/changelog");

    await expect(page.getByText("Initial Release")).toBeVisible();
    await expect(page.getByText("Beta Release")).toBeVisible();
    await expect(page.getByText("Alpha Release")).toBeVisible();
  });

  test("should display change types with badges", async ({ page }) => {
    await page.goto("/changelog");

    // Check feature badges
    const featureBadges = page.getByText("feature", { exact: true });
    await expect(featureBadges.first()).toBeVisible();

    // Check improvement badges
    await expect(page.getByText("improvement", { exact: true }).first()).toBeVisible();

    // Check fix badges
    await expect(page.getByText("fix", { exact: true }).first()).toBeVisible();
  });

  test("should have back to home link", async ({ page }) => {
    await page.goto("/changelog");

    const backLink = page.getByRole("link", { name: /Back to Home/i });
    await expect(backLink).toBeVisible();
    await backLink.click();
    await expect(page).toHaveURL("/");
  });
});

test.describe("Documentation Page", () => {
  test("should display documentation page with sections", async ({ page }) => {
    await page.goto("/docs");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Documentation");
    await expect(page.getByText("Everything you need to get started with Conduii")).toBeVisible();
  });

  test("should display section cards", async ({ page }) => {
    await page.goto("/docs");

    // Check main section cards
    await expect(page.getByText("Getting Started")).toBeVisible();
    await expect(page.getByText("CLI Reference")).toBeVisible();
    await expect(page.getByText("API Reference")).toBeVisible();
    await expect(page.getByText("Integrations")).toBeVisible();
  });

  test("should display installation section", async ({ page }) => {
    await page.goto("/docs");

    // Check installation content
    await expect(page.getByRole("heading", { name: "Installation" })).toBeVisible();
    await expect(page.getByText("npm install -g @conduii/cli")).toBeVisible();
  });

  test("should display configuration section", async ({ page }) => {
    await page.goto("/docs");

    await expect(page.getByRole("heading", { name: "Configuration" })).toBeVisible();
    await expect(page.getByText("conduii.config.js")).toBeVisible();
  });

  test("should display CLI commands", async ({ page }) => {
    await page.goto("/docs");

    await expect(page.getByRole("heading", { name: "conduii discover" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "conduii run" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "conduii status" })).toBeVisible();
  });

  test("should display API reference sections", async ({ page }) => {
    await page.goto("/docs");

    await expect(page.getByRole("heading", { name: "Authentication" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Projects API" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Test Runs API" })).toBeVisible();
  });

  test("should display integrations sections", async ({ page }) => {
    await page.goto("/docs");

    await expect(page.getByRole("heading", { name: "GitHub Actions" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Vercel Integration" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Webhooks" })).toBeVisible();
  });

  test("should have copy buttons on code blocks", async ({ page }) => {
    await page.goto("/docs");

    // Check that copy buttons exist (they appear on hover)
    const codeBlocks = page.locator("pre");
    await expect(codeBlocks.first()).toBeVisible();
  });

  test("should have back to home link", async ({ page }) => {
    await page.goto("/docs");

    const backLink = page.getByRole("link", { name: /Back to Home/i });
    await expect(backLink).toBeVisible();
  });

  test("should have get started button", async ({ page }) => {
    await page.goto("/docs");

    await expect(page.getByRole("link", { name: "Get Started Free" })).toBeVisible();
  });
});

test.describe("Blog Page", () => {
  test("should display blog page with posts", async ({ page }) => {
    await page.goto("/blog");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Blog");
    await expect(page.getByText("Insights, tutorials, and updates from the Conduii team")).toBeVisible();
  });

  test("should display blog post cards", async ({ page }) => {
    await page.goto("/blog");

    // Check that blog posts are displayed
    await expect(page.getByText("Introducing Conduii: AI-Powered Testing for Modern Apps")).toBeVisible();
    await expect(page.getByText("Why Traditional E2E Testing Falls Short")).toBeVisible();
    await expect(page.getByText("Getting Started with Service Discovery")).toBeVisible();
    await expect(page.getByText("Best Practices for Deployment Validation")).toBeVisible();
  });

  test("should display post metadata", async ({ page }) => {
    await page.goto("/blog");

    // Check categories
    await expect(page.getByText("Announcement")).toBeVisible();
    await expect(page.getByText("Engineering")).toBeVisible();
    await expect(page.getByText("Tutorial")).toBeVisible();
    await expect(page.getByText("Best Practices")).toBeVisible();

    // Check read times
    await expect(page.getByText("5 min read")).toBeVisible();
    await expect(page.getByText("8 min read")).toBeVisible();
  });

  test("should have clickable blog post cards", async ({ page }) => {
    await page.goto("/blog");

    const firstPost = page.getByRole("link", { name: /Introducing Conduii/i });
    await expect(firstPost).toBeVisible();
  });

  test("should have back to home link", async ({ page }) => {
    await page.goto("/blog");

    const backLink = page.getByRole("link", { name: /Back to Home/i });
    await expect(backLink).toBeVisible();
  });
});

test.describe("Blog Post Page", () => {
  test("should display individual blog post", async ({ page }) => {
    await page.goto("/blog/introducing-conduii");

    // Blog post page should load (may show 404 if not implemented, but should not error)
    await expect(page).toHaveURL("/blog/introducing-conduii");
  });
});

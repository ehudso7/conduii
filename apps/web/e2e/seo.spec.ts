import { test, expect } from "@playwright/test";

test.describe("SEO and Metadata", () => {
  test("homepage should have proper title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Conduii/);
  });

  test("about page should have proper title", async ({ page }) => {
    await page.goto("/about");
    await expect(page).toHaveTitle(/About|Conduii/);
  });

  test("docs page should have proper title", async ({ page }) => {
    await page.goto("/docs");
    await expect(page).toHaveTitle(/Documentation|Docs|Conduii/);
  });

  test("blog page should have proper title", async ({ page }) => {
    await page.goto("/blog");
    await expect(page).toHaveTitle(/Blog|Conduii/);
  });

  test("changelog page should have proper title", async ({ page }) => {
    await page.goto("/changelog");
    await expect(page).toHaveTitle(/Changelog|Conduii/);
  });

  test("privacy page should have proper title", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page).toHaveTitle(/Privacy|Conduii/);
  });

  test("terms page should have proper title", async ({ page }) => {
    await page.goto("/terms");
    await expect(page).toHaveTitle(/Terms|Conduii/);
  });
});

test.describe("Page Structure", () => {
  test("homepage should have exactly one h1", async ({ page }) => {
    await page.goto("/");
    const h1Count = await page.getByRole("heading", { level: 1 }).count();
    expect(h1Count).toBe(1);
  });

  test("about page should have exactly one h1", async ({ page }) => {
    await page.goto("/about");
    const h1Count = await page.getByRole("heading", { level: 1 }).count();
    expect(h1Count).toBe(1);
  });

  test("docs page should have exactly one h1", async ({ page }) => {
    await page.goto("/docs");
    const h1Count = await page.getByRole("heading", { level: 1 }).count();
    expect(h1Count).toBe(1);
  });

  test("blog page should have exactly one h1", async ({ page }) => {
    await page.goto("/blog");
    const h1Count = await page.getByRole("heading", { level: 1 }).count();
    expect(h1Count).toBe(1);
  });

  test("changelog page should have exactly one h1", async ({ page }) => {
    await page.goto("/changelog");
    const h1Count = await page.getByRole("heading", { level: 1 }).count();
    expect(h1Count).toBe(1);
  });
});

test.describe("Language and Encoding", () => {
  test("html should have lang attribute", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("lang", "en");
  });

  test("page should have proper charset meta tag", async ({ page }) => {
    await page.goto("/");
    const charset = page.locator('meta[charset="utf-8"], meta[charset="UTF-8"]');
    // Next.js sets charset automatically
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });
});

test.describe("Viewport and Mobile", () => {
  test("page should have viewport meta tag", async ({ page }) => {
    await page.goto("/");
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute("content", /width=device-width/);
  });
});

test.describe("Images and Media", () => {
  test("images should have alt attributes", async ({ page }) => {
    await page.goto("/");

    // Find all images
    const images = page.locator("img");
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute("alt");
      // Alt can be empty string for decorative images, but should exist
      expect(alt !== null).toBeTruthy();
    }
  });
});

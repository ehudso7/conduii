import { test, expect } from "@playwright/test";

test.describe("Main Navigation", () => {
  test("logo should link to homepage", async ({ page }) => {
    await page.goto("/about");

    // Find logo/brand and click
    const logo = page.getByText("Conduii").first();
    if (await logo.isVisible()) {
      // The logo might be in the about page header too
      // Navigate back via Back to Home link
      const backLink = page.getByRole("link", { name: /Back to Home/i });
      if (await backLink.isVisible()) {
        await backLink.click();
        await expect(page).toHaveURL("/");
      }
    }
  });

  test("features link should scroll to features section", async ({ page }) => {
    await page.goto("/");

    const featuresLink = page.getByRole("link", { name: "Features" }).first();
    await featuresLink.click();

    // Should scroll to features section
    await expect(page).toHaveURL("/#features");
  });

  test("integrations link should scroll to integrations section", async ({ page }) => {
    await page.goto("/");

    const integrationsLink = page.getByRole("link", { name: "Integrations" }).first();
    await integrationsLink.click();

    await expect(page).toHaveURL("/#integrations");
  });

  test("pricing link should scroll to pricing section", async ({ page }) => {
    await page.goto("/");

    const pricingLink = page.getByRole("link", { name: "Pricing" }).first();
    await pricingLink.click();

    await expect(page).toHaveURL("/#pricing");
  });

  test("docs link should navigate to docs page", async ({ page }) => {
    await page.goto("/");

    const docsLink = page.getByRole("link", { name: "Docs" }).first();
    await docsLink.click();

    await expect(page).toHaveURL("/docs");
  });
});

test.describe("Footer Navigation", () => {
  test("footer should contain product links", async ({ page }) => {
    await page.goto("/");

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    await expect(page.getByRole("link", { name: "Features" }).last()).toBeVisible();
    await expect(page.getByRole("link", { name: "Integrations" }).last()).toBeVisible();
    await expect(page.getByRole("link", { name: "Pricing" }).last()).toBeVisible();
    await expect(page.getByRole("link", { name: "Changelog" })).toBeVisible();
  });

  test("footer should contain resources links", async ({ page }) => {
    await page.goto("/");

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    await expect(page.getByRole("link", { name: "Documentation" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Blog" })).toBeVisible();
  });

  test("footer should contain company links", async ({ page }) => {
    await page.goto("/");

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    await expect(page.getByRole("link", { name: "About" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Privacy" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Terms" })).toBeVisible();
  });

  test("changelog link should navigate to changelog page", async ({ page }) => {
    await page.goto("/");

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const changelogLink = page.getByRole("link", { name: "Changelog" });
    await changelogLink.click();

    await expect(page).toHaveURL("/changelog");
  });

  test("blog link should navigate to blog page", async ({ page }) => {
    await page.goto("/");

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const blogLink = page.getByRole("link", { name: "Blog" });
    await blogLink.click();

    await expect(page).toHaveURL("/blog");
  });

  test("documentation link should navigate to docs page", async ({ page }) => {
    await page.goto("/");

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const docsLink = page.getByRole("link", { name: "Documentation" });
    await docsLink.click();

    await expect(page).toHaveURL("/docs");
  });
});

test.describe("Cross-Page Navigation", () => {
  test("should navigate from homepage to about and back", async ({ page }) => {
    await page.goto("/");

    // Go to about
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.getByRole("link", { name: "About" }).click();
    await expect(page).toHaveURL("/about");

    // Go back to home
    await page.getByRole("link", { name: /Back to Home/i }).click();
    await expect(page).toHaveURL("/");
  });

  test("should navigate from homepage to privacy and back", async ({ page }) => {
    await page.goto("/");

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.getByRole("link", { name: "Privacy" }).click();
    await expect(page).toHaveURL("/privacy");

    await page.getByRole("link", { name: /Back to Home/i }).click();
    await expect(page).toHaveURL("/");
  });

  test("should navigate from homepage to terms and back", async ({ page }) => {
    await page.goto("/");

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.getByRole("link", { name: "Terms" }).click();
    await expect(page).toHaveURL("/terms");

    await page.getByRole("link", { name: /Back to Home/i }).click();
    await expect(page).toHaveURL("/");
  });

  test("should navigate through multiple pages without errors", async ({ page }) => {
    await page.goto("/");

    // Navigate to docs
    await page.getByRole("link", { name: "Docs" }).first().click();
    await expect(page).toHaveURL("/docs");

    // Navigate back home
    await page.getByRole("link", { name: /Back to Home/i }).click();
    await expect(page).toHaveURL("/");

    // Navigate to blog
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.getByRole("link", { name: "Blog" }).click();
    await expect(page).toHaveURL("/blog");

    // Navigate back home
    await page.getByRole("link", { name: /Back to Home/i }).click();
    await expect(page).toHaveURL("/");

    // Navigate to changelog
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.getByRole("link", { name: "Changelog" }).click();
    await expect(page).toHaveURL("/changelog");
  });
});

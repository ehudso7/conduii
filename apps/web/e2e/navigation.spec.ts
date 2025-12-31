import { test, expect } from "@playwright/test";
import { attachClickIntegrityGuard } from "./utils/click-integrity-guard";

test.describe("Main Navigation", () => {
  test("logo should link to homepage", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/about");

    // Header brand should return to home
    const brandLink = page.getByRole("banner").getByRole("link", { name: "Conduii" }).first();
    await expect(brandLink).toBeVisible();
    await brandLink.click();
    await expect(page).toHaveURL("/");
    await guard.assertNoIntegrityIssues();
  });

  test("features link should scroll to features section", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");

    await page.getByTestId("topnav-link-features").click();

    // Should scroll to features section
    await expect(page).toHaveURL(/#features$/);
    await guard.assertNoIntegrityIssues();
  });

  test("integrations link should scroll to integrations section", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");

    await page.getByTestId("topnav-link-integrations").click();

    await expect(page).toHaveURL(/#integrations$/);
    await guard.assertNoIntegrityIssues();
  });

  test("pricing link should scroll to pricing section", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");

    await page.getByTestId("topnav-link-pricing").click();

    await expect(page).toHaveURL(/#pricing$/);
    await guard.assertNoIntegrityIssues();
  });

  test("docs link should navigate to docs page", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");

    await page.getByTestId("topnav-link-docs").click();

    await expect(page).toHaveURL("/docs");
    await guard.assertNoIntegrityIssues();
  });
});

test.describe("Footer Navigation", () => {
  test("footer should contain product links", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    await expect(page.getByTestId("footer-link-features")).toBeVisible();
    await expect(page.getByTestId("footer-link-integrations")).toBeVisible();
    await expect(page.getByTestId("footer-link-pricing")).toBeVisible();
    await expect(page.getByTestId("footer-link-changelog")).toBeVisible();
    await guard.assertNoIntegrityIssues();
  });

  test("footer should contain resources links", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    await expect(page.getByTestId("footer-link-docs")).toBeVisible();
    await expect(page.getByTestId("footer-link-blog")).toBeVisible();
    await guard.assertNoIntegrityIssues();
  });

  test("footer should contain company links", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    await expect(page.getByTestId("footer-link-about")).toBeVisible();
    await expect(page.getByTestId("footer-link-privacy")).toBeVisible();
    await expect(page.getByTestId("footer-link-terms")).toBeVisible();
    await guard.assertNoIntegrityIssues();
  });

  test("changelog link should navigate to changelog page", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    await page.getByTestId("footer-link-changelog").click();

    await expect(page).toHaveURL("/changelog");
    await guard.assertNoIntegrityIssues();
  });

  test("blog link should navigate to blog page", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    await page.getByTestId("footer-link-blog").click();

    await expect(page).toHaveURL("/blog");
    await guard.assertNoIntegrityIssues();
  });

  test("documentation link should navigate to docs page", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    await page.getByTestId("footer-link-docs").click();

    await expect(page).toHaveURL("/docs");
    await guard.assertNoIntegrityIssues();
  });
});

test.describe("Cross-Page Navigation", () => {
  test("should navigate from homepage to about and back", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");

    // Go to about
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.getByTestId("footer-link-about").scrollIntoViewIfNeeded();
    await page.getByTestId("footer-link-about").click();
    await page.waitForURL("/about");
    await page.waitForLoadState("domcontentloaded");

    // Go back to home
    await page.getByRole("banner").getByRole("link", { name: "Conduii" }).first().click();
    await expect(page).toHaveURL("/");
    await guard.assertNoIntegrityIssues();
  });

  test("should navigate from homepage to privacy and back", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.getByTestId("footer-link-privacy").scrollIntoViewIfNeeded();
    await page.getByTestId("footer-link-privacy").click();
    await page.waitForURL("/privacy");
    await page.waitForLoadState("domcontentloaded");

    await page.getByRole("banner").getByRole("link", { name: "Conduii" }).first().click();
    await expect(page).toHaveURL("/");
    await guard.assertNoIntegrityIssues();
  });

  test("should navigate from homepage to terms and back", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.getByTestId("footer-link-terms").scrollIntoViewIfNeeded();
    await page.getByTestId("footer-link-terms").click();
    await page.waitForURL("/terms");
    await page.waitForLoadState("domcontentloaded");

    await page.getByRole("banner").getByRole("link", { name: "Conduii" }).first().click();
    await expect(page).toHaveURL("/");
    await guard.assertNoIntegrityIssues();
  });

  test("should navigate through multiple pages without errors", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");

    // Navigate to docs
    await page.getByTestId("topnav-link-docs").click();
    await expect(page).toHaveURL("/docs");

    // Navigate back home
    await page.getByRole("link", { name: /Back to Home/i }).click();
    await expect(page).toHaveURL("/");

    // Navigate to blog
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.getByTestId("footer-link-blog").click();
    await expect(page).toHaveURL("/blog");

    // Navigate back home
    await page.getByRole("link", { name: /Back to Home/i }).click();
    await expect(page).toHaveURL("/");

    // Navigate to changelog
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.getByTestId("footer-link-changelog").click();
    await expect(page).toHaveURL("/changelog");
    await guard.assertNoIntegrityIssues();
  });
});

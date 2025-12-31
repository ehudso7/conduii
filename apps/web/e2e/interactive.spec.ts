import { test, expect } from "@playwright/test";
import { attachClickIntegrityGuard } from "./utils/click-integrity-guard";

test.describe("Interactive Elements - Pricing Cards", () => {
  test("pricing section should display three pricing tiers", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");

    // Scroll to pricing
    await page.getByTestId("topnav-link-pricing").click();
    await expect(page).toHaveURL(/#pricing$/);

    // Check all three tiers are visible
    await expect(page.getByRole("heading", { name: "Free", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Pro", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Enterprise", exact: true })).toBeVisible();
    await guard.assertNoIntegrityIssues();
  });

  test("pricing cards should display prices", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");

    await page.getByTestId("topnav-link-pricing").click();
    await expect(page).toHaveURL(/#pricing$/);

    await expect(page.getByText("$0", { exact: true })).toBeVisible();
    await expect(page.getByText("$29", { exact: true })).toBeVisible();
    await expect(page.getByText("Custom", { exact: true })).toBeVisible();
    await guard.assertNoIntegrityIssues();
  });

  test("pricing cards should display feature lists", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");

    await page.getByTestId("topnav-link-pricing").click();
    await expect(page).toHaveURL(/#pricing$/);

    // Check some features are listed
    await expect(page.getByText("Up to 3 projects")).toBeVisible();
    await expect(page.getByText("Unlimited projects")).toBeVisible();
    await expect(page.getByText("100 test runs/month")).toBeVisible();
    await guard.assertNoIntegrityIssues();
  });

  test("pro plan should have Most Popular badge", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");

    await page.getByTestId("topnav-link-pricing").click();
    await expect(page).toHaveURL(/#pricing$/);

    await expect(page.getByText("Most Popular")).toBeVisible();
    await guard.assertNoIntegrityIssues();
  });
});

test.describe("Interactive Elements - Feature Cards", () => {
  test("features section should display all feature cards", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");

    await page.getByTestId("topnav-link-features").click();
    await expect(page).toHaveURL(/#features$/);

    await expect(page.getByRole("heading", { name: "Auto-Discovery", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Live Testing", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "AI-Powered Diagnostics", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Zero Config", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Multiple Interfaces", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Detailed Reports", exact: true })).toBeVisible();
    await guard.assertNoIntegrityIssues();
  });

  test("feature cards should have descriptions", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");

    await page.getByTestId("topnav-link-features").click();
    await expect(page).toHaveURL(/#features$/);

    await expect(page.getByText(/Automatically detects your stack/)).toBeVisible();
    await expect(page.getByText(/Tests actual deployed infrastructure/)).toBeVisible();
    await guard.assertNoIntegrityIssues();
  });
});

test.describe("Interactive Elements - Integrations", () => {
  test("integrations section should display integration cards", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");

    await page.getByTestId("topnav-link-integrations").click();
    await expect(page).toHaveURL(/#integrations$/);

    await expect(page.getByText("Vercel", { exact: true })).toBeVisible();
    await expect(page.getByText("Stripe", { exact: true })).toBeVisible();
    await expect(page.getByText("Supabase", { exact: true })).toBeVisible();
    await guard.assertNoIntegrityIssues();
  });

  test("integrations section should show 50+ integrations text", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");

    await page.getByTestId("topnav-link-integrations").click();
    await expect(page).toHaveURL(/#integrations$/);

    await expect(page.getByText("50+ Integrations")).toBeVisible();
    await guard.assertNoIntegrityIssues();
  });
});

test.describe("Interactive Elements - Code Preview", () => {
  test("homepage should display CLI code preview", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");

    // Scroll to the CLI section
    const cliSection = page.getByText("npm install -g @conduii/cli");
    await cliSection.scrollIntoViewIfNeeded();

    // Check terminal-like code preview
    await expect(cliSection).toBeVisible();
    await expect(page.getByText("conduii discover", { exact: true })).toBeVisible();
    await expect(page.getByText("conduii run", { exact: true })).toBeVisible();
    await guard.assertNoIntegrityIssues();
  });

  test("code preview should show sample output", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");

    await expect(page.getByText("Found Next.js project")).toBeVisible();
    await expect(page.getByText(/Detected:.*Vercel/)).toBeVisible();
    await expect(page.getByText("All 24 tests passed")).toBeVisible();
    await guard.assertNoIntegrityIssues();
  });
});

test.describe("Interactive Elements - CTA Section", () => {
  test("CTA section should display call to action", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");

    // Scroll to CTA
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight - 1000));

    await expect(page.getByText("Ready to Ship with Confidence?")).toBeVisible();
    await guard.assertNoIntegrityIssues();
  });

  test("CTA section should have action button", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight - 1000));

    const ctaButton = page.getByTestId("home-cta-get-started");
    await expect(ctaButton).toBeVisible();
    await guard.assertNoIntegrityIssues();
  });
});

test.describe("Interactive Elements - Badges", () => {
  test("homepage should display AI-Powered Testing Platform badge", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");

    await expect(page.getByText("AI-Powered Testing Platform", { exact: true })).toBeVisible();
    await guard.assertNoIntegrityIssues();
  });
});

test.describe("Scroll Behavior", () => {
  test("anchor links should scroll smoothly to sections", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");

    // Click features link
    await page.getByTestId("topnav-link-features").click();

    // Check URL has hash
    await expect(page).toHaveURL(/#features$/);
    await guard.assertNoIntegrityIssues();
  });

  test("should be able to scroll through entire page", async ({ page }, testInfo) => {
    const guard = attachClickIntegrityGuard(page, testInfo);
    await page.goto("/");

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Footer should be visible
    await expect(page.getByText("AI-powered testing platform for modern applications.")).toBeVisible();
    await guard.assertNoIntegrityIssues();
  });
});

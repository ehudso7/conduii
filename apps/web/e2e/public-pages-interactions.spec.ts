import { test, expect } from "@playwright/test";
import { withErrorGuard } from "./helpers/error-guard";

test.describe("Features Page Interactions", () => {
  test("should render without errors", async ({ page }) => {
    await withErrorGuard(page, async () => {
      await page.goto("/features");
      await page.waitForLoadState("networkidle");
      
      await expect(page).toHaveTitle(/Features.*Conduii/);
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Everything You Need");
    });
  });

  test("should navigate back to home", async ({ page }) => {
    await withErrorGuard(page, async () => {
      await page.goto("/features");
      await page.waitForLoadState("networkidle");
      
      const backLink = page.getByTestId("back-to-home");
      await expect(backLink).toBeVisible();
      
      await backLink.click();
      await expect(page).toHaveURL("/");
    });
  });

  test("should have navigation links", async ({ page }) => {
    await withErrorGuard(page, async () => {
      await page.goto("/features");
      await page.waitForLoadState("networkidle");
      
      const navLinks = [
        { testId: "nav-features", expectedUrl: "/features" },
        { testId: "nav-integrations", expectedUrl: "/integrations" },
        { testId: "nav-pricing", expectedUrl: "/pricing" },
        { testId: "nav-docs", expectedUrl: "/docs" },
      ];
      
      for (const { testId, expectedUrl } of navLinks) {
        const link = page.getByTestId(testId);
        await expect(link).toBeVisible();
        
        const href = await link.getAttribute("href");
        expect(href).toContain(expectedUrl);
      }
    });
  });

  test("should navigate to sign-in from nav", async ({ page }) => {
    await withErrorGuard(page, async () => {
      await page.goto("/features");
      await page.waitForLoadState("networkidle");
      
      const signInButton = page.getByTestId("nav-sign-in");
      await expect(signInButton).toBeVisible();
      
      await signInButton.click();
      await expect(page).toHaveURL("/sign-in");
    });
  });

  test("should navigate to sign-up from nav", async ({ page }) => {
    await withErrorGuard(page, async () => {
      await page.goto("/features");
      await page.waitForLoadState("networkidle");
      
      const getStartedButton = page.getByTestId("nav-get-started");
      await expect(getStartedButton).toBeVisible();
      
      await getStartedButton.click();
      await expect(page).toHaveURL("/sign-up");
    });
  });

  test("should display feature cards", async ({ page }) => {
    await withErrorGuard(page, async () => {
      await page.goto("/features");
      await page.waitForLoadState("networkidle");
      
      const featureCards = [
        "feature-card-auto-discovery",
        "feature-card-live-infrastructure-testing",
        "feature-card-ai-powered-diagnostics",
        "feature-card-zero-configuration",
        "feature-card-multiple-interfaces",
        "feature-card-comprehensive-reports",
      ];
      
      for (const testId of featureCards) {
        const card = page.getByTestId(testId);
        await expect(card).toBeVisible();
      }
    });
  });

  test("should navigate to sign-up from CTA", async ({ page }) => {
    await withErrorGuard(page, async () => {
      await page.goto("/features");
      await page.waitForLoadState("networkidle");
      
      // Scroll to CTA
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);
      
      const ctaButton = page.getByTestId("features-cta");
      await expect(ctaButton).toBeVisible();
      
      await ctaButton.click();
      await expect(page).toHaveURL("/sign-up");
    });
  });

  test("should navigate to docs from CTA", async ({ page }) => {
    await withErrorGuard(page, async () => {
      await page.goto("/features");
      await page.waitForLoadState("networkidle");
      
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);
      
      const docsButton = page.getByTestId("features-docs-cta");
      await expect(docsButton).toBeVisible();
      
      await docsButton.click();
      await expect(page).toHaveURL("/docs");
    });
  });
});

test.describe("Pricing Page Interactions", () => {
  test("should render without errors", async ({ page }) => {
    await withErrorGuard(page, async () => {
      await page.goto("/pricing");
      await page.waitForLoadState("networkidle");
      
      await expect(page).toHaveTitle(/Pricing.*Conduii/);
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Simple, Transparent Pricing");
    });
  });

  test("should navigate back to home", async ({ page }) => {
    await withErrorGuard(page, async () => {
      await page.goto("/pricing");
      await page.waitForLoadState("networkidle");
      
      const backLink = page.getByTestId("back-to-home");
      await expect(backLink).toBeVisible();
      
      await backLink.click();
      await expect(page).toHaveURL("/");
    });
  });

  test("should have pricing plan CTAs", async ({ page }) => {
    await withErrorGuard(page, async () => {
      await page.goto("/pricing");
      await page.waitForLoadState("networkidle");
      
      const freeCta = page.getByTestId("pricing-free-cta");
      await expect(freeCta).toBeVisible();
      
      const proCta = page.getByTestId("pricing-pro-cta");
      await expect(proCta).toBeVisible();
      
      const enterpriseCta = page.getByTestId("pricing-enterprise-cta");
      await expect(enterpriseCta).toBeVisible();
    });
  });

  test("should navigate to sign-up from free plan", async ({ page }) => {
    await withErrorGuard(page, async () => {
      await page.goto("/pricing");
      await page.waitForLoadState("networkidle");
      
      const freeCta = page.getByTestId("pricing-free-cta");
      await freeCta.click();
      await expect(page).toHaveURL("/sign-up");
    });
  });

  test("should navigate to sign-up from pro plan", async ({ page }) => {
    await withErrorGuard(page, async () => {
      await page.goto("/pricing");
      await page.waitForLoadState("networkidle");
      
      const proCta = page.getByTestId("pricing-pro-cta");
      await proCta.click();
      await expect(page).toHaveURL("/sign-up");
    });
  });

  test("should have mailto link for enterprise plan", async ({ page }) => {
    await withErrorGuard(page, async () => {
      await page.goto("/pricing");
      await page.waitForLoadState("networkidle");
      
      const enterpriseCta = page.getByTestId("pricing-enterprise-cta");
      await expect(enterpriseCta).toBeVisible();
      
      const href = await enterpriseCta.getAttribute("href");
      expect(href).toContain("mailto:");
    });
  });

  test("should navigate to sign-up from bottom CTA", async ({ page }) => {
    await withErrorGuard(page, async () => {
      await page.goto("/pricing");
      await page.waitForLoadState("networkidle");
      
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);
      
      const ctaButton = page.getByTestId("pricing-cta");
      await expect(ctaButton).toBeVisible();
      
      await ctaButton.click();
      await expect(page).toHaveURL("/sign-up");
    });
  });
});

test.describe("Other Public Pages", () => {
  const publicPages = [
    { path: "/about", title: "About" },
    { path: "/privacy", title: "Privacy" },
    { path: "/terms", title: "Terms" },
    { path: "/changelog", title: "Changelog" },
    { path: "/integrations", title: "Integrations" },
    { path: "/docs", title: "Documentation" },
    { path: "/blog", title: "Blog" },
  ];

  for (const { path, title } of publicPages) {
    test(`${path} should render without errors`, async ({ page }) => {
      await withErrorGuard(page, async () => {
        await page.goto(path);
        await page.waitForLoadState("networkidle");
        
        // Page should load without crashing
        await expect(page).toHaveURL(new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
        
        // Should have a heading
        const heading = page.getByRole("heading", { level: 1 });
        await expect(heading).toBeVisible();
      });
    });
  }
});

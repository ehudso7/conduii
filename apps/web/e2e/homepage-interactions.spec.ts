import { test, expect } from "@playwright/test";
import { withErrorGuard } from "./helpers/error-guard";

test.describe("Homepage Interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Wait for page to be fully loaded
    await page.waitForLoadState("networkidle");
  });

  test("should render without errors", async ({ page }) => {
    await withErrorGuard(page, async () => {
      await expect(page).toHaveTitle(/Conduii/);
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Test Your Deployments");
    });
  });

  test("should have logo that navigates to homepage", async ({ page }) => {
    await withErrorGuard(page, async () => {
      const logo = page.getByTestId("logo");
      await expect(logo).toBeVisible();
      
      // Click logo (should stay on homepage or navigate to /)
      await logo.click();
      await expect(page).toHaveURL("/");
    });
  });

  test("should navigate to features section via nav link", async ({ page }) => {
    await withErrorGuard(page, async () => {
      const featuresLink = page.getByTestId("nav-features");
      await expect(featuresLink).toBeVisible();
      
      await featuresLink.click();
      
      // Should scroll to features section or update URL
      await page.waitForTimeout(500); // Allow smooth scroll
      const url = page.url();
      expect(url).toMatch(/#features|features/);
    });
  });

  test("should navigate to integrations section via nav link", async ({ page }) => {
    await withErrorGuard(page, async () => {
      const integrationsLink = page.getByTestId("nav-integrations");
      await expect(integrationsLink).toBeVisible();
      
      await integrationsLink.click();
      await page.waitForTimeout(500);
      
      const url = page.url();
      expect(url).toMatch(/#integrations|integrations/);
    });
  });

  test("should navigate to pricing section via nav link", async ({ page }) => {
    await withErrorGuard(page, async () => {
      const pricingLink = page.getByTestId("nav-pricing");
      await expect(pricingLink).toBeVisible();
      
      await pricingLink.click();
      await page.waitForTimeout(500);
      
      const url = page.url();
      expect(url).toMatch(/#pricing|pricing/);
    });
  });

  test("should navigate to docs page via nav link", async ({ page }) => {
    await withErrorGuard(page, async () => {
      const docsLink = page.getByTestId("nav-docs");
      await expect(docsLink).toBeVisible();
      
      await docsLink.click();
      await expect(page).toHaveURL("/docs");
    });
  });

  test("should toggle theme", async ({ page }) => {
    await withErrorGuard(page, async () => {
      const themeToggle = page.getByTestId("theme-toggle");
      await expect(themeToggle).toBeVisible();
      
      // Get initial theme (check html class or data attribute)
      const initialTheme = await page.evaluate(() => {
        return document.documentElement.classList.contains("dark") ? "dark" : "light";
      });
      
      await themeToggle.click();
      await page.waitForTimeout(300);
      
      // Check theme changed
      const newTheme = await page.evaluate(() => {
        return document.documentElement.classList.contains("dark") ? "dark" : "light";
      });
      
      expect(newTheme).not.toBe(initialTheme);
    });
  });

  test("should have sign in button in nav", async ({ page }) => {
    await withErrorGuard(page, async () => {
      const signInButton = page.getByTestId("nav-sign-in");
      await expect(signInButton).toBeVisible();
      
      await signInButton.click();
      await expect(page).toHaveURL("/sign-in");
    });
  });

  test("should have get started button in nav", async ({ page }) => {
    await withErrorGuard(page, async () => {
      const getStartedButton = page.getByTestId("nav-get-started");
      await expect(getStartedButton).toBeVisible();
      
      await getStartedButton.click();
      await expect(page).toHaveURL("/sign-up");
    });
  });

  test("should have hero start testing button", async ({ page }) => {
    await withErrorGuard(page, async () => {
      const heroButton = page.getByTestId("hero-start-testing");
      await expect(heroButton).toBeVisible();
      
      await heroButton.click();
      await expect(page).toHaveURL("/sign-up");
    });
  });

  test("should have hero view docs button", async ({ page }) => {
    await withErrorGuard(page, async () => {
      const docsButton = page.getByTestId("hero-view-docs");
      await expect(docsButton).toBeVisible();
      
      await docsButton.click();
      await expect(page).toHaveURL("/docs");
    });
  });

  test("should display feature cards", async ({ page }) => {
    await withErrorGuard(page, async () => {
      // Scroll to features section
      await page.getByTestId("nav-features").click();
      await page.waitForTimeout(500);
      
      const featureCards = [
        "feature-card-auto-discovery",
        "feature-card-live-testing",
        "feature-card-ai-powered-diagnostics",
        "feature-card-zero-config",
        "feature-card-multiple-interfaces",
        "feature-card-detailed-reports",
      ];
      
      for (const testId of featureCards) {
        const card = page.getByTestId(testId);
        await expect(card).toBeVisible();
      }
    });
  });

  test("should display integration cards", async ({ page }) => {
    await withErrorGuard(page, async () => {
      // Scroll to integrations section
      await page.getByTestId("nav-integrations").click();
      await page.waitForTimeout(500);
      
      const integrationCards = [
        "integration-card-vercel",
        "integration-card-supabase",
        "integration-card-stripe",
        "integration-card-clerk",
      ];
      
      for (const testId of integrationCards) {
        const card = page.getByTestId(testId);
        await expect(card).toBeVisible();
      }
    });
  });

  test("should have pricing CTAs", async ({ page }) => {
    await withErrorGuard(page, async () => {
      // Scroll to pricing section
      await page.getByTestId("nav-pricing").click();
      await page.waitForTimeout(500);
      
      const freeCta = page.getByTestId("pricing-free-cta");
      await expect(freeCta).toBeVisible();
      
      const proCta = page.getByTestId("pricing-pro-cta");
      await expect(proCta).toBeVisible();
      
      const enterpriseCta = page.getByTestId("pricing-enterprise-cta");
      await expect(enterpriseCta).toBeVisible();
    });
  });

  test("should navigate to sign-up from free plan CTA", async ({ page }) => {
    await withErrorGuard(page, async () => {
      await page.getByTestId("nav-pricing").click();
      await page.waitForTimeout(500);
      
      const freeCta = page.getByTestId("pricing-free-cta");
      await freeCta.click();
      await expect(page).toHaveURL("/sign-up");
    });
  });

  test("should navigate to sign-up from pro plan CTA", async ({ page }) => {
    await withErrorGuard(page, async () => {
      await page.getByTestId("nav-pricing").click();
      await page.waitForTimeout(500);
      
      const proCta = page.getByTestId("pricing-pro-cta");
      await proCta.click();
      await expect(page).toHaveURL("/sign-up");
    });
  });

  test("should open mailto from enterprise plan CTA", async ({ page }) => {
    await withErrorGuard(page, async () => {
      await page.getByTestId("nav-pricing").click();
      await page.waitForTimeout(500);
      
      const enterpriseCta = page.getByTestId("pricing-enterprise-cta");
      await expect(enterpriseCta).toBeVisible();
      
      // Check href attribute
      const href = await enterpriseCta.getAttribute("href");
      expect(href).toContain("mailto:");
    });
  });

  test("should have CTA get started button", async ({ page }) => {
    await withErrorGuard(page, async () => {
      // Scroll to CTA section
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight - 1000));
      await page.waitForTimeout(500);
      
      const ctaButton = page.getByTestId("cta-get-started");
      await expect(ctaButton).toBeVisible();
      
      await ctaButton.click();
      await expect(page).toHaveURL("/sign-up");
    });
  });

  test("should have footer links", async ({ page }) => {
    await withErrorGuard(page, async () => {
      // Scroll to footer
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);
      
      const footerLinks = [
        { testId: "footer-features", expectedUrl: "/features" },
        { testId: "footer-integrations", expectedUrl: "/integrations" },
        { testId: "footer-pricing", expectedUrl: "/pricing" },
        { testId: "footer-changelog", expectedUrl: "/changelog" },
        { testId: "footer-docs", expectedUrl: "/docs" },
        { testId: "footer-blog", expectedUrl: "/blog" },
        { testId: "footer-about", expectedUrl: "/about" },
        { testId: "footer-privacy", expectedUrl: "/privacy" },
        { testId: "footer-terms", expectedUrl: "/terms" },
      ];
      
      for (const { testId, expectedUrl } of footerLinks) {
        const link = page.getByTestId(testId);
        await expect(link).toBeVisible();
        
        // Check href attribute
        const href = await link.getAttribute("href");
        expect(href).toContain(expectedUrl);
      }
    });
  });

  test("should navigate to features from footer", async ({ page }) => {
    await withErrorGuard(page, async () => {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);
      
      const featuresLink = page.getByTestId("footer-features");
      await featuresLink.click();
      await expect(page).toHaveURL("/features");
    });
  });

  test("should navigate to docs from footer", async ({ page }) => {
    await withErrorGuard(page, async () => {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);
      
      const docsLink = page.getByTestId("footer-docs");
      await docsLink.click();
      await expect(page).toHaveURL("/docs");
    });
  });

  test("should have external GitHub link in footer", async ({ page }) => {
    await withErrorGuard(page, async () => {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);
      
      const githubLink = page.getByTestId("footer-github");
      await expect(githubLink).toBeVisible();
      
      const href = await githubLink.getAttribute("href");
      expect(href).toContain("github.com");
    });
  });
});

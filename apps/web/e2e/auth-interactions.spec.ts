import { test, expect } from "@playwright/test";
import { withErrorGuard } from "./helpers/error-guard";

test.describe("Sign In Page Interactions", () => {
  test("should render without errors", async ({ page }) => {
    await withErrorGuard(page, async () => {
      await page.goto("/sign-in");
      await page.waitForLoadState("networkidle");
      
      // Page should load without crashing
      await expect(page).toHaveURL("/sign-in");
    });
  });

  test("should navigate back to home", async ({ page }) => {
    await withErrorGuard(page, async () => {
      await page.goto("/sign-in");
      await page.waitForLoadState("networkidle");
      
      const backLink = page.getByTestId("back-to-home");
      await expect(backLink).toBeVisible();
      
      await backLink.click();
      await expect(page).toHaveURL("/");
    });
  });

  test("should show Clerk sign-in when configured", async ({ page }) => {
    await withErrorGuard(page, async () => {
      await page.goto("/sign-in");
      await page.waitForLoadState("networkidle");
      
      // Check if Clerk component is present or fallback UI
      const clerkSignIn = page.getByTestId("clerk-sign-in");
      const fallback = page.getByTestId("sign-in-fallback");
      
      // One of them should be visible
      const clerkVisible = await clerkSignIn.isVisible().catch(() => false);
      const fallbackVisible = await fallback.isVisible().catch(() => false);
      
      expect(clerkVisible || fallbackVisible).toBe(true);
    });
  });

  test("should navigate to sign-up from fallback", async ({ page }) => {
    await withErrorGuard(page, async () => {
      await page.goto("/sign-in");
      await page.waitForLoadState("networkidle");
      
      const fallback = page.getByTestId("sign-in-fallback");
      const isFallbackVisible = await fallback.isVisible().catch(() => false);
      
      if (isFallbackVisible) {
        const signUpLink = page.getByTestId("sign-in-sign-up-link");
        await expect(signUpLink).toBeVisible();
        
        await signUpLink.click();
        await expect(page).toHaveURL("/sign-up");
      }
    });
  });
});

test.describe("Sign Up Page Interactions", () => {
  test("should render without errors", async ({ page }) => {
    await withErrorGuard(page, async () => {
      await page.goto("/sign-up");
      await page.waitForLoadState("networkidle");
      
      await expect(page).toHaveURL("/sign-up");
    });
  });

  test("should navigate back to home", async ({ page }) => {
    await withErrorGuard(page, async () => {
      await page.goto("/sign-up");
      await page.waitForLoadState("networkidle");
      
      const backLink = page.getByTestId("back-to-home");
      await expect(backLink).toBeVisible();
      
      await backLink.click();
      await expect(page).toHaveURL("/");
    });
  });

  test("should show Clerk sign-up when configured", async ({ page }) => {
    await withErrorGuard(page, async () => {
      await page.goto("/sign-up");
      await page.waitForLoadState("networkidle");
      
      const clerkSignUp = page.getByTestId("clerk-sign-up");
      const fallback = page.getByTestId("sign-up-fallback");
      
      const clerkVisible = await clerkSignUp.isVisible().catch(() => false);
      const fallbackVisible = await fallback.isVisible().catch(() => false);
      
      expect(clerkVisible || fallbackVisible).toBe(true);
    });
  });

  test("should navigate to sign-in from fallback", async ({ page }) => {
    await withErrorGuard(page, async () => {
      await page.goto("/sign-up");
      await page.waitForLoadState("networkidle");
      
      const fallback = page.getByTestId("sign-up-fallback");
      const isFallbackVisible = await fallback.isVisible().catch(() => false);
      
      if (isFallbackVisible) {
        const signInLink = page.getByTestId("sign-up-sign-in-link");
        await expect(signInLink).toBeVisible();
        
        await signInLink.click();
        await expect(page).toHaveURL("/sign-in");
      }
    });
  });
});

test.describe("Forgot Password Page Interactions", () => {
  test("should render without errors", async ({ page }) => {
    await withErrorGuard(page, async () => {
      await page.goto("/forgot-password");
      await page.waitForLoadState("networkidle");
      
      await expect(page).toHaveURL("/forgot-password");
      await expect(page.getByRole("heading", { level: 1 })).toContainText("Forgot your password");
    });
  });

  test("should navigate back to home", async ({ page }) => {
    await withErrorGuard(page, async () => {
      await page.goto("/forgot-password");
      await page.waitForLoadState("networkidle");
      
      const backLink = page.getByTestId("back-to-home");
      await expect(backLink).toBeVisible();
      
      await backLink.click();
      await expect(page).toHaveURL("/");
    });
  });

  test("should have email input", async ({ page }) => {
    await withErrorGuard(page, async () => {
      await page.goto("/forgot-password");
      await page.waitForLoadState("networkidle");
      
      const emailInput = page.getByTestId("forgot-password-email");
      await expect(emailInput).toBeVisible();
      
      await emailInput.fill("test@example.com");
      await expect(emailInput).toHaveValue("test@example.com");
    });
  });

  test("should have submit button", async ({ page }) => {
    await withErrorGuard(page, async () => {
      await page.goto("/forgot-password");
      await page.waitForLoadState("networkidle");
      
      const submitButton = page.getByTestId("forgot-password-submit");
      await expect(submitButton).toBeVisible();
    });
  });

  test("should submit form and show success", async ({ page }) => {
    await withErrorGuard(page, async () => {
      await page.goto("/forgot-password");
      await page.waitForLoadState("networkidle");
      
      const emailInput = page.getByTestId("forgot-password-email");
      await emailInput.fill("test@example.com");
      
      const submitButton = page.getByTestId("forgot-password-submit");
      await submitButton.click();
      
      // Wait for success state
      await page.waitForTimeout(2000);
      
      // Should show success message
      await expect(page.getByText("Check your email")).toBeVisible();
    });
  });

  test("should navigate to sign-in from link", async ({ page }) => {
    await withErrorGuard(page, async () => {
      await page.goto("/forgot-password");
      await page.waitForLoadState("networkidle");
      
      const signInLink = page.getByTestId("forgot-password-back");
      await expect(signInLink).toBeVisible();
      
      await signInLink.click();
      await expect(page).toHaveURL("/sign-in");
    });
  });
});

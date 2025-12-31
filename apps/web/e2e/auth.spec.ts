import { test, expect } from "@playwright/test";
import { installClickIntegrityGuard } from "./utils/guard";

test.beforeEach(async ({ page }) => {
  await installClickIntegrityGuard(page);
});

test.describe("Sign In Page", () => {
  test("should display sign in page", async ({ page }) => {
    await page.goto("/sign-in");
    
    // Header link
    await expect(page.getByTestId("back-to-home")).toBeVisible();
    
    // Check content - either Clerk or fallback
    // We can check for fallback elements since we added test ids to them
    const fallbackLink = page.getByTestId("create-account-link");
    if (await fallbackLink.isVisible()) {
      await expect(page.getByTestId("back-to-home-button")).toBeVisible();
    } else {
      // Assuming Clerk is loaded
      await expect(page.locator(".cl-signIn-start, .cl-rootBox")).toBeVisible({ timeout: 10000 });
    }
  });
});

test.describe("Sign Up Page", () => {
  test("should display sign up page", async ({ page }) => {
    await page.goto("/sign-up");
    
    // Header link
    await expect(page.getByTestId("back-to-home")).toBeVisible();
    
    const fallbackLink = page.getByTestId("go-to-sign-in-link");
    if (await fallbackLink.isVisible()) {
      await expect(page.getByTestId("back-to-home-button")).toBeVisible();
    } else {
      // Assuming Clerk is loaded
      await expect(page.locator(".cl-signUp-start, .cl-rootBox")).toBeVisible({ timeout: 10000 });
    }
  });
});

test.describe("Forgot Password Page", () => {
  test("should load and support interaction", async ({ page }) => {
    await page.goto("/forgot-password");
    
    await expect(page.getByTestId("back-to-home")).toBeVisible();
    await expect(page.getByTestId("email-input")).toBeVisible();
    await expect(page.getByTestId("submit-button")).toBeVisible();
    await expect(page.getByTestId("sign-in-link")).toBeVisible();
    
    // Test form submission simulation
    await page.getByTestId("email-input").fill("test@example.com");
    await page.getByTestId("submit-button").click();
    
    // Should show success state after timeout
    await expect(page.getByText("Check your email")).toBeVisible({ timeout: 5000 });
    
    // Check success state buttons
    await expect(page.getByTestId("return-to-sign-in")).toBeVisible();
    await expect(page.getByTestId("try-different-email")).toBeVisible();
    
    // Click try different email
    await page.getByTestId("try-different-email").click();
    await expect(page.getByTestId("email-input")).toBeVisible();
  });
});

test.describe("Protected Routes Redirection", () => {
  const protectedRoutes = [
    "/dashboard",
    "/dashboard/projects",
    "/dashboard/settings",
    "/dashboard/billing"
  ];

  for (const route of protectedRoutes) {
    test(`should redirect ${route} to sign-in when unauthenticated`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/sign-in/);
    });
  }
});

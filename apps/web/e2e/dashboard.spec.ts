import { test, expect } from '@playwright/test';
import { installClickIntegrityGuard } from './utils/guard';

test.describe('Dashboard (Protected Routes)', () => {
  let guard: { check: () => void };

  test.beforeEach(async ({ page }) => {
    guard = await installClickIntegrityGuard(page);
  });

  test.afterEach(() => {
    guard.check();
  });

  const protectedRoutes = [
    '/dashboard',
    '/dashboard/projects',
    '/dashboard/projects/new',
    '/dashboard/settings',
    '/dashboard/billing',
    // Dynamic routes would also redirect, but we test base routes
  ];

  protectedRoutes.forEach((route) => {
    test(`should redirect unauthenticated user from ${route} to sign-in`, async ({ page }) => {
      await page.goto(route);
      
      // Clerk usually redirects to a sign-in URL
      // Depending on config, it might be /sign-in or a clerk domain
      // We check that we are NOT on the dashboard page anymore
      await expect(page).not.toHaveURL(new RegExp(route + '$'));
      
      // And typically we end up at sign-in
      // Note: This assertion might be loose depending on Clerk config
      const url = page.url();
      expect(url).toContain('sign-in');
    });
  });
});

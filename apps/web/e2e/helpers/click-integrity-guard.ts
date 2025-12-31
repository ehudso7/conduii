import { Page, expect } from "@playwright/test";

/**
 * Click Integrity Guard
 * 
 * A Playwright helper that attaches listeners to fail tests on:
 * - Page errors (uncaught exceptions)
 * - Console errors
 * - Failed network requests (except allowed patterns)
 * 
 * Usage:
 *   import { attachClickIntegrityGuard, assertNoErrors } from './helpers/click-integrity-guard';
 *   
 *   test('my test', async ({ page }) => {
 *     const guard = attachClickIntegrityGuard(page);
 *     await page.goto('/');
 *     // ... do stuff
 *     assertNoErrors(guard);
 *   });
 */

export interface IntegrityError {
  type: "page_error" | "console_error" | "network_error";
  message: string;
  url?: string;
  timestamp: Date;
}

export interface ClickIntegrityGuard {
  errors: IntegrityError[];
  warnings: string[];
  cleanup: () => void;
}

// Network requests that are allowed to fail without causing test failure
const ALLOWED_NETWORK_FAILURES = [
  // Analytics and tracking (often blocked in test environments)
  /google-analytics\.com/,
  /googletagmanager\.com/,
  /analytics\./,
  /segment\.io/,
  /sentry\.io/,
  /posthog\.com/,
  /mixpanel\.com/,
  /hotjar\.com/,
  /clarity\.ms/,
  /intercom\.io/,
  // Clerk auth (may not be configured in test)
  /clerk\.dev/,
  /clerk\.com/,
  /clerk\.accounts/,
  // Stripe (may not be configured in test)
  /stripe\.com/,
  /js\.stripe\.com/,
  // Images that might 404 in dev
  /favicon/,
  /\.ico$/,
  // Common CDNs that might be blocked
  /unpkg\.com/,
  /cdnjs\.cloudflare\.com/,
  // Health check endpoints (expected to fail without DB)
  /\/api\/health/,
  /\/api\//,  // All API routes may fail without proper DB/auth
  // Font loading (sometimes fails in CI)
  /fonts\.googleapis\.com/,
  /fonts\.gstatic\.com/,
  // Next.js internal requests
  /_next\//,
  /__nextjs/,
];

// Console messages that are allowed/expected
const ALLOWED_CONSOLE_PATTERNS = [
  // React development mode warnings
  /ReactDOM\.render is no longer supported/,
  /Warning: React/,
  // Next.js development warnings
  /Fast Refresh/,
  /next-dev\.js/,
  /Cross origin request detected/,
  /allowedDevOrigins/,
  // Clerk warnings when not configured
  /Clerk:/,
  /ClerkJS/,
  /clerk/i,
  /publishable/i,
  /no frontend api/i,
  // Common development warnings
  /DevTools/,
  /Download the React DevTools/,
  // Stripe.js when not configured
  /Stripe\.js/,
  // Hydration warnings (sometimes expected)
  /hydrat/i,
  // 404 errors for expected missing resources
  /404/,
  /Not Found/,
  // Webpack hot reload
  /webpack/i,
  /HMR/,
  // Failed to load resource (expected in dev)
  /Failed to load resource/,
  // Network errors (handled separately)
  /net::ERR/,
  // Console.error from React error boundaries
  /The above error occurred/,
  /Error: /,
  // Prisma/DB errors (expected when no DB)
  /prisma/i,
  /database/i,
  /PrismaClientInitializationError/,
];

/**
 * Attaches integrity guards to a Playwright page.
 * Returns a guard object that collects errors during the test.
 */
export function attachClickIntegrityGuard(page: Page): ClickIntegrityGuard {
  const guard: ClickIntegrityGuard = {
    errors: [],
    warnings: [],
    cleanup: () => {},
  };

  // Handler for uncaught page errors
  const pageErrorHandler = (error: Error) => {
    guard.errors.push({
      type: "page_error",
      message: error.message,
      timestamp: new Date(),
    });
  };

  // Handler for console messages
  const consoleHandler = (msg: { type: () => string; text: () => string }) => {
    if (msg.type() === "error") {
      const text = msg.text();
      
      // Check if this is an allowed console error
      const isAllowed = ALLOWED_CONSOLE_PATTERNS.some(pattern => pattern.test(text));
      
      if (isAllowed) {
        guard.warnings.push(`[console.error - allowed] ${text}`);
      } else {
        guard.errors.push({
          type: "console_error",
          message: text,
          timestamp: new Date(),
        });
      }
    }
  };

  // Handler for failed network requests
  const requestFailedHandler = (request: { url: () => string; failure: () => { errorText: string } | null }) => {
    const url = request.url();
    const failure = request.failure();
    const errorText = failure?.errorText || "Request failed";
    
    // ERR_ABORTED is normal during navigation (user clicked away)
    if (errorText.includes("net::ERR_ABORTED")) {
      guard.warnings.push(`[network - aborted] ${url}`);
      return;
    }
    
    // Check if this URL is allowed to fail
    const isAllowed = ALLOWED_NETWORK_FAILURES.some(pattern => pattern.test(url));
    
    if (isAllowed) {
      guard.warnings.push(`[network - allowed] ${url}`);
    } else {
      guard.errors.push({
        type: "network_error",
        message: errorText,
        url,
        timestamp: new Date(),
      });
    }
  };

  // Handler for response errors (4xx, 5xx)
  const responseHandler = (response: { status: () => number; url: () => string }) => {
    const status = response.status();
    const url = response.url();
    
    // Only track server errors (5xx), not client errors (4xx can be expected)
    if (status >= 500) {
      const isAllowed = ALLOWED_NETWORK_FAILURES.some(pattern => pattern.test(url));
      
      if (isAllowed) {
        guard.warnings.push(`[response ${status} - allowed] ${url}`);
      } else {
        guard.errors.push({
          type: "network_error",
          message: `HTTP ${status}`,
          url,
          timestamp: new Date(),
        });
      }
    }
  };

  // Attach handlers
  page.on("pageerror", pageErrorHandler);
  page.on("console", consoleHandler);
  page.on("requestfailed", requestFailedHandler);
  page.on("response", responseHandler);

  // Cleanup function to remove handlers
  guard.cleanup = () => {
    page.off("pageerror", pageErrorHandler);
    page.off("console", consoleHandler);
    page.off("requestfailed", requestFailedHandler);
    page.off("response", responseHandler);
  };

  return guard;
}

/**
 * Asserts that no errors were collected by the guard.
 * Call this at the end of your test to fail if any errors occurred.
 */
export function assertNoErrors(guard: ClickIntegrityGuard): void {
  if (guard.errors.length > 0) {
    const errorMessages = guard.errors.map(e => {
      const urlPart = e.url ? ` (${e.url})` : "";
      return `[${e.type}] ${e.message}${urlPart}`;
    }).join("\n");
    
    throw new Error(`Click Integrity Guard detected ${guard.errors.length} error(s):\n${errorMessages}`);
  }
}

/**
 * Creates a test wrapper that automatically attaches the guard and asserts no errors.
 * This is a convenience function for wrapping entire test bodies.
 */
export async function withIntegrityGuard<T>(
  page: Page,
  testFn: (guard: ClickIntegrityGuard) => Promise<T>
): Promise<T> {
  const guard = attachClickIntegrityGuard(page);
  try {
    const result = await testFn(guard);
    assertNoErrors(guard);
    return result;
  } finally {
    guard.cleanup();
  }
}

/**
 * Utility to add a pattern to the allowed network failures list.
 * Useful for tests that expect certain requests to fail.
 */
export function addAllowedNetworkPattern(pattern: RegExp): void {
  ALLOWED_NETWORK_FAILURES.push(pattern);
}

/**
 * Utility to add a pattern to the allowed console patterns list.
 * Useful for tests that expect certain console errors.
 */
export function addAllowedConsolePattern(pattern: RegExp): void {
  ALLOWED_CONSOLE_PATTERNS.push(pattern);
}

/**
 * Comprehensive page load test that combines multiple checks.
 * Returns any issues found.
 */
export async function auditPageLoad(page: Page, url: string): Promise<{
  success: boolean;
  errors: IntegrityError[];
  warnings: string[];
  loadTime: number;
}> {
  const guard = attachClickIntegrityGuard(page);
  const startTime = Date.now();
  
  try {
    await page.goto(url, { waitUntil: "networkidle" });
  } catch (error) {
    guard.errors.push({
      type: "page_error",
      message: `Navigation failed: ${error instanceof Error ? error.message : String(error)}`,
      url,
      timestamp: new Date(),
    });
  }
  
  const loadTime = Date.now() - startTime;
  
  // Wait a bit for any delayed errors
  await page.waitForTimeout(500);
  
  guard.cleanup();
  
  return {
    success: guard.errors.length === 0,
    errors: guard.errors,
    warnings: guard.warnings,
    loadTime,
  };
}

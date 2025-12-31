import { Page } from "@playwright/test";

/**
 * Click Integrity Guard
 * 
 * Attaches listeners to detect and fail tests on:
 * - pageerror (uncaught JavaScript errors)
 * - console.error (console errors)
 * - failed network requests (except known allowed ones)
 */
export class ErrorGuard {
  private page: Page;
  private errors: string[] = [];
  private failedRequests: string[] = [];
  private allowedFailedUrls: Set<string> = new Set();

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Add URLs that are allowed to fail (e.g., analytics, external services)
   */
  allowFailedUrl(pattern: string | RegExp) {
    if (typeof pattern === "string") {
      this.allowedFailedUrls.add(pattern);
    } else {
      // For regex patterns, store as string representation
      this.allowedFailedUrls.add(pattern.toString());
    }
  }

  /**
   * Start monitoring for errors
   */
  async start() {
    this.errors = [];
    this.failedRequests = [];

    // Listen for uncaught JavaScript errors
    this.page.on("pageerror", (error) => {
      this.errors.push(`Page Error: ${error.message}`);
    });

    // Listen for console errors
    this.page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text();
        // Ignore known non-critical errors
        if (!this.isIgnoredError(text)) {
          this.errors.push(`Console Error: ${text}`);
        }
      }
    });

    // Listen for failed network requests
    this.page.on("requestfailed", (request) => {
      const url = request.url();
      if (!this.isAllowedFailedUrl(url)) {
        this.failedRequests.push(`Failed Request: ${request.method()} ${url} - ${request.failure()?.errorText || "Unknown error"}`);
      }
    });
  }

  /**
   * Stop monitoring and assert no errors occurred
   */
  async assertNoErrors() {
    const allErrors = [...this.errors, ...this.failedRequests];
    
    if (allErrors.length > 0) {
      const errorMessage = `Found ${allErrors.length} error(s):\n${allErrors.join("\n")}`;
      throw new Error(errorMessage);
    }
  }

  /**
   * Get all collected errors without throwing
   */
  getErrors(): string[] {
    return [...this.errors, ...this.failedRequests];
  }

  /**
   * Clear collected errors
   */
  clear() {
    this.errors = [];
    this.failedRequests = [];
  }

  /**
   * Check if an error should be ignored
   */
  private isIgnoredError(text: string): boolean {
    const ignoredPatterns = [
      // React hydration warnings (common in Next.js)
      /hydration/i,
      // Known third-party warnings
      /favicon/i,
      // Clerk auth warnings when not configured
      /clerk.*not.*configured/i,
      /missing.*clerk.*key/i,
    ];

    return ignoredPatterns.some((pattern) => pattern.test(text));
  }

  /**
   * Check if a failed URL is allowed
   */
  private isAllowedFailedUrl(url: string): boolean {
    // Always allow failed requests to:
    // - Analytics endpoints
    // - External fonts/CDNs
    // - Known third-party services
    const alwaysAllowed = [
      /analytics/i,
      /google-analytics/i,
      /fonts\.googleapis\.com/i,
      /fonts\.gstatic\.com/i,
      /vercel\.com\/analytics/i,
      /clerk\.com/i, // Clerk may fail if not configured
    ];

    if (alwaysAllowed.some((pattern) => pattern.test(url))) {
      return true;
    }

    // Check against explicitly allowed patterns
    for (const pattern of this.allowedFailedUrls) {
      try {
        const regex = new RegExp(pattern);
        if (regex.test(url)) {
          return true;
        }
      } catch {
        // If pattern is not a valid regex, do exact match
        if (url.includes(pattern)) {
          return true;
        }
      }
    }

    return false;
  }
}

/**
 * Helper function to set up error guard for a test
 */
export async function withErrorGuard(page: Page, testFn: (guard: ErrorGuard) => Promise<void>) {
  const guard = new ErrorGuard(page);
  await guard.start();
  
  try {
    await testFn(guard);
    await guard.assertNoErrors();
  } catch (error) {
    // Include collected errors in the error message
    const errors = guard.getErrors();
    if (errors.length > 0) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`${errorMessage}\n\nAdditional errors detected:\n${errors.join("\n")}`);
    }
    throw error;
  }
}

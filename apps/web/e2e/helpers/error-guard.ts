/**
 * Error Guard Helper for Playwright Tests
 * 
 * Monitors pages for errors, console errors, and failed network requests
 * to ensure interactive elements don't cause crashes or issues.
 */

import { Page, expect } from "@playwright/test";

export interface ErrorGuardOptions {
  /** Allow specific console error messages (regex patterns) */
  allowedConsoleErrors?: RegExp[];
  /** Allow specific failed network requests (URL patterns) */
  allowedFailedRequests?: RegExp[];
  /** Monitor console.warn as well */
  monitorWarnings?: boolean;
  /** Fail test immediately on first error (default: false, collects all errors) */
  failFast?: boolean;
}

export interface ErrorGuardReport {
  pageErrors: Array<{ message: string; stack?: string }>;
  consoleErrors: Array<{ type: string; text: string }>;
  failedRequests: Array<{ url: string; status: number; method: string }>;
  hasErrors: boolean;
}

export class ErrorGuard {
  private page: Page;
  private options: ErrorGuardOptions;
  private errors: ErrorGuardReport = {
    pageErrors: [],
    consoleErrors: [],
    failedRequests: [],
    hasErrors: false,
  };

  constructor(page: Page, options: ErrorGuardOptions = {}) {
    this.page = page;
    this.options = {
      allowedConsoleErrors: [],
      allowedFailedRequests: [],
      monitorWarnings: false,
      failFast: false,
      ...options,
    };
  }

  /**
   * Start monitoring the page for errors
   */
  async start(): Promise<void> {
    // Monitor uncaught page errors
    this.page.on("pageerror", (error) => {
      this.errors.pageErrors.push({
        message: error.message,
        stack: error.stack,
      });
      this.errors.hasErrors = true;
      
      if (this.options.failFast) {
        throw new Error(`Page error detected: ${error.message}`);
      }
    });

    // Monitor console errors
    this.page.on("console", (msg) => {
      const type = msg.type();
      
      if (type === "error" || (type === "warning" && this.options.monitorWarnings)) {
        const text = msg.text();
        
        // Check if this error is allowed
        const isAllowed = this.options.allowedConsoleErrors?.some((pattern) =>
          pattern.test(text)
        );
        
        if (!isAllowed) {
          this.errors.consoleErrors.push({ type, text });
          if (type === "error") {
            this.errors.hasErrors = true;
          }
          
          if (this.options.failFast && type === "error") {
            throw new Error(`Console error detected: ${text}`);
          }
        }
      }
    });

    // Monitor failed network requests
    this.page.on("response", async (response) => {
      const status = response.status();
      
      // Consider 4xx and 5xx as failures
      if (status >= 400) {
        const url = response.url();
        
        // Check if this failure is allowed
        const isAllowed = this.options.allowedFailedRequests?.some((pattern) =>
          pattern.test(url)
        );
        
        if (!isAllowed) {
          this.errors.failedRequests.push({
            url,
            status,
            method: response.request().method(),
          });
          this.errors.hasErrors = true;
          
          if (this.options.failFast) {
            throw new Error(`Failed request: ${response.request().method()} ${url} (${status})`);
          }
        }
      }
    });
  }

  /**
   * Get the error report
   */
  getReport(): ErrorGuardReport {
    return { ...this.errors };
  }

  /**
   * Assert that no errors occurred
   */
  assertNoErrors(): void {
    const report = this.getReport();
    
    if (report.pageErrors.length > 0) {
      const errorMessages = report.pageErrors
        .map((e) => `  - ${e.message}`)
        .join("\n");
      throw new Error(`Page errors detected:\n${errorMessages}`);
    }
    
    if (report.consoleErrors.length > 0) {
      const errorMessages = report.consoleErrors
        .map((e) => `  - [${e.type}] ${e.text}`)
        .join("\n");
      throw new Error(`Console errors detected:\n${errorMessages}`);
    }
    
    if (report.failedRequests.length > 0) {
      const errorMessages = report.failedRequests
        .map((r) => `  - ${r.method} ${r.url} (${r.status})`)
        .join("\n");
      throw new Error(`Failed network requests:\n${errorMessages}`);
    }
  }

  /**
   * Reset error tracking (useful for multi-page tests)
   */
  reset(): void {
    this.errors = {
      pageErrors: [],
      consoleErrors: [],
      failedRequests: [],
      hasErrors: false,
    };
  }
}

/**
 * Convenience function to create and start an error guard
 */
export async function setupErrorGuard(
  page: Page,
  options?: ErrorGuardOptions
): Promise<ErrorGuard> {
  const guard = new ErrorGuard(page, options);
  await guard.start();
  return guard;
}

/**
 * Common allowed errors for development/testing
 */
export const COMMON_ALLOWED_ERRORS = {
  // Clerk-related errors that may occur without valid configuration
  clerkAuth: [
    /Clerk:/,
    /clerk/i,
    /Authentication/i,
  ],
  // Hot reload / development errors
  devErrors: [
    /HMR/,
    /Fast Refresh/,
    /webpack/i,
  ],
  // Analytics/tracking that may fail in test environment
  analytics: [
    /analytics/i,
    /gtag/i,
    /ga\(/,
  ],
  // Known API endpoints that may not be available in test
  testApis: [
    /\/api\/.*404/,
    /\/api\/analytics/,
  ],
};

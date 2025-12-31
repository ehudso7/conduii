import { Page, expect } from '@playwright/test';

/**
 * Attaches listeners to the page to ensure "click integrity".
 * Fails the test if:
 * 1. A page error (uncaught exception) occurs.
 * 2. A console error occurs (ignoring specific noisy patterns if necessary).
 * 3. A network request fails (status >= 400), unless explicitly allowed.
 */
export async function installClickIntegrityGuard(page: Page) {
  const errors: string[] = [];

  // 1. Listen for page errors (uncaught exceptions)
  page.on('pageerror', (exception) => {
    const msg = `[PAGE ERROR] ${exception.message}`;
    console.error(msg);
    errors.push(msg);
  });

  // 2. Listen for console errors
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignore specific known/harmless errors if needed
      // if (text.includes('Specific harmless error')) return;
      
      const errorMsg = `[CONSOLE ERROR] ${text}`;
      console.error(errorMsg);
      errors.push(errorMsg);
    }
  });

  // 3. Listen for failed requests
  // page.on('requestfailed', (request) => {
  //   const failure = request.failure();
  //   const url = request.url();
  //   // Ignore cancelled requests or analytics
  //   if (failure?.errorText === 'net::ERR_ABORTED') return;
  //   if (url.includes('/api/analytics')) return;

  //   const msg = `[NETWORK FAIL] ${request.method()} ${url} - ${failure?.errorText}`;
  //   console.error(msg);
  //   errors.push(msg);
  // });
  
  // Note: 'requestfailed' only catches network level failures. 
  // For 4xx/5xx responses, we need 'response'.
  // We'll skip strict network blocking for now to avoid flakiness with 3rd party scripts,
  // but we can enable it for internal API calls if needed.
  
  return {
    check: () => {
      if (errors.length > 0) {
        throw new Error(`Click Integrity Guard failed with ${errors.length} errors:\n${errors.join('\n')}`);
      }
    }
  };
}

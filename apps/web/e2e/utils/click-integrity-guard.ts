import type { Page } from "@playwright/test";
import type { TestInfo } from "@playwright/test";

export type ClickIntegrityOptions = {
  /**
   * Substrings/regexes for request URLs that are allowed to fail.
   * Keep this list tight; prefer fixing the underlying request.
   */
  allowRequestFailures?: Array<string | RegExp>;
  /**
   * Substrings/regexes for console error messages that are allowed.
   * Keep this list tight; prefer fixing the underlying error.
   */
  allowConsoleErrors?: Array<string | RegExp>;
};

function matchesAny(value: string, patterns: Array<string | RegExp> | undefined): boolean {
  if (!patterns || patterns.length === 0) return false;
  return patterns.some((p) => (typeof p === "string" ? value.includes(p) : p.test(value)));
}

/**
 * Attaches listeners that enforce "no broken interactions":
 * - fails test on `pageerror`
 * - fails test on `console.error` (unless allowlisted)
 * - fails test on failed network requests (unless allowlisted)
 *
 * Usage (per test):
 *   const guard = attachClickIntegrityGuard(page, testInfo);
 *   await page.goto("/some-route");
 *   ...
 *   await guard.assertNoIntegrityIssues();
 */
export function attachClickIntegrityGuard(
  page: Page,
  testInfo: TestInfo,
  options: ClickIntegrityOptions = {}
) {
  const failures: string[] = [];

  page.on("pageerror", (err) => {
    failures.push(`pageerror: ${err?.message ?? String(err)}`);
  });

  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (matchesAny(text, options.allowConsoleErrors)) return;
    failures.push(`console.error: ${text}`);
  });

  page.on("requestfailed", (request) => {
    const url = request.url();
    if (matchesAny(url, options.allowRequestFailures)) return;
    const errorText = request.failure()?.errorText ?? "unknown";
    // Next.js dev + RSC navigations commonly abort/cancel in-flight requests during redirects/navigation.
    // This is noisy and not user-visible breakage, so ignore these "expected abort" signals across browsers.
    const expectedAbortSignals = ["net::ERR_ABORTED", "NS_BINDING_ABORTED", "Load request cancelled"];
    if (expectedAbortSignals.some((s) => errorText.includes(s))) return;
    failures.push(`requestfailed: ${request.method()} ${url} (${errorText})`);
  });

  return {
    async assertNoIntegrityIssues() {
      if (failures.length === 0) return;
      // Make it very obvious in CI logs which test + route failed.
      throw new Error(
        [
          `Click Integrity Guard caught ${failures.length} issue(s) in: ${testInfo.titlePath.join(" > ")}`,
          ...failures.map((f) => `- ${f}`),
        ].join("\n")
      );
    },
  };
}


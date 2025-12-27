/**
 * Test Execution Engine
 *
 * This module provides real test execution capabilities for:
 * - Health checks (HTTP endpoint availability)
 * - API endpoint testing
 * - Service integration verification
 */

import { db } from "@/lib/db";

// JSON-compatible type for Prisma Json fields (excluding null at top level)
type JsonValue = string | number | boolean | JsonValue[] | { [key: string]: JsonValue | null };

export interface TestExecutionResult {
  testId: string;
  status: "PASSED" | "FAILED" | "SKIPPED" | "ERROR" | "TIMEOUT";
  duration: number;
  error?: string;
  assertions?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface HealthCheckResult {
  serviceId: string;
  status: "HEALTHY" | "DEGRADED" | "UNHEALTHY";
  latency: number;
  error?: string;
  details?: Record<string, unknown>;
}

interface HttpTestConfig {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  expectedStatus?: number;
  expectedBody?: unknown;
  timeout?: number;
}

/**
 * Execute an HTTP health check
 */
export async function executeHealthCheck(
  url: string,
  timeout: number = 10000
): Promise<{ healthy: boolean; latency: number; error?: string; statusCode?: number }> {
  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "User-Agent": "Conduii-HealthCheck/1.0",
      },
    });

    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;

    return {
      healthy: response.ok,
      latency,
      statusCode: response.status,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;

    if (error instanceof Error && error.name === "AbortError") {
      return {
        healthy: false,
        latency,
        error: "Request timeout",
      };
    }

    return {
      healthy: false,
      latency,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Execute an HTTP API test
 */
export async function executeHttpTest(
  config: HttpTestConfig
): Promise<TestExecutionResult> {
  const startTime = Date.now();
  const testId = `http-${Date.now()}`;
  const timeout = config.timeout || 30000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(config.url, {
      method: config.method || "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Conduii-TestRunner/1.0",
        ...config.headers,
      },
      body: config.body ? JSON.stringify(config.body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;

    const assertions: Record<string, unknown> = {
      statusCode: response.status,
      statusText: response.statusText,
    };

    // Check expected status
    if (config.expectedStatus && response.status !== config.expectedStatus) {
      return {
        testId,
        status: "FAILED",
        duration,
        error: `Expected status ${config.expectedStatus}, got ${response.status}`,
        assertions,
      };
    }

    // Check expected body if specified
    if (config.expectedBody) {
      try {
        const body = await response.json();
        assertions.body = body;

        if (JSON.stringify(body) !== JSON.stringify(config.expectedBody)) {
          return {
            testId,
            status: "FAILED",
            duration,
            error: "Response body does not match expected",
            assertions,
          };
        }
      } catch {
        return {
          testId,
          status: "FAILED",
          duration,
          error: "Failed to parse response body as JSON",
          assertions,
        };
      }
    }

    return {
      testId,
      status: response.ok ? "PASSED" : "FAILED",
      duration,
      assertions,
      metadata: {
        url: config.url,
        method: config.method || "GET",
      },
    };
  } catch (error) {
    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;

    if (error instanceof Error && error.name === "AbortError") {
      return {
        testId,
        status: "TIMEOUT",
        duration,
        error: `Request timed out after ${timeout}ms`,
      };
    }

    return {
      testId,
      status: "ERROR",
      duration,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Execute a test run with all associated tests
 */
export async function executeTestRun(
  testRunId: string,
  projectId: string,
  options: {
    testType?: string;
    testSuiteId?: string;
  } = {}
): Promise<void> {
  const startTime = Date.now();

  try {
    // Update test run status to RUNNING
    await db.testRun.update({
      where: { id: testRunId },
      data: {
        status: "RUNNING",
        startedAt: new Date(),
      },
    });

    // Get project with services and endpoints
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        services: true,
        endpoints: true,
        testSuites: {
          include: {
            tests: {
              where: options.testSuiteId
                ? { testSuiteId: options.testSuiteId }
                : { enabled: true },
            },
          },
        },
      },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    const results: TestExecutionResult[] = [];
    let passed = 0;
    let failed = 0;
    let skipped = 0;

    // Execute health checks for services
    for (const service of project.services) {
      if (service.config && typeof service.config === "object") {
        const config = service.config as Record<string, unknown>;
        const healthUrl = config.healthUrl as string | undefined;

        if (healthUrl) {
          const healthResult = await executeHealthCheck(healthUrl);

          // Update service health status
          await db.service.update({
            where: { id: service.id },
            data: {
              status: healthResult.healthy ? "HEALTHY" : "UNHEALTHY",
              latency: healthResult.latency,
              lastHealthCheck: new Date(),
            },
          });

          // Record health check
          await db.healthCheck.create({
            data: {
              serviceId: service.id,
              status: healthResult.healthy ? "HEALTHY" : "UNHEALTHY",
              latency: healthResult.latency,
              error: healthResult.error,
            },
          });

          if (healthResult.healthy) {
            passed++;
          } else {
            failed++;
          }
        }
      }
    }

    // Execute endpoint tests
    for (const endpoint of project.endpoints) {
      if (!endpoint.path) continue;

      // Build full URL
      const baseUrl = project.productionUrl || `https://${project.slug}.example.com`;
      const url = `${baseUrl}${endpoint.path}`;

      const result = await executeHttpTest({
        url,
        method: endpoint.method,
        expectedStatus: 200,
        timeout: 30000,
      });

      results.push(result);

      if (result.status === "PASSED") {
        passed++;
      } else if (result.status === "SKIPPED") {
        skipped++;
      } else {
        failed++;
      }
    }

    // Execute test suite tests
    for (const suite of project.testSuites) {
      for (const test of suite.tests) {
        if (!test.enabled) {
          skipped++;
          continue;
        }

        let result: TestExecutionResult;
        const testConfig = test.config as Record<string, unknown> | null;

        switch (test.type) {
          case "HEALTH":
            if (testConfig?.url) {
              const healthResult = await executeHealthCheck(
                testConfig.url as string,
                test.timeout
              );
              result = {
                testId: test.id,
                status: healthResult.healthy ? "PASSED" : "FAILED",
                duration: healthResult.latency,
                error: healthResult.error,
              };
            } else {
              result = {
                testId: test.id,
                status: "SKIPPED",
                duration: 0,
                error: "No URL configured for health test",
              };
            }
            break;

          case "API":
          case "INTEGRATION":
            if (testConfig?.url) {
              result = await executeHttpTest({
                url: testConfig.url as string,
                method: (testConfig.method as string) || "GET",
                headers: testConfig.headers as Record<string, string>,
                body: testConfig.body,
                expectedStatus: testConfig.expectedStatus as number,
                timeout: test.timeout,
              });
              result.testId = test.id;
            } else {
              result = {
                testId: test.id,
                status: "SKIPPED",
                duration: 0,
                error: "No URL configured for API test",
              };
            }
            break;

          default:
            result = {
              testId: test.id,
              status: "SKIPPED",
              duration: 0,
              error: `Test type ${test.type} not yet implemented`,
            };
        }

        // Save test result
        await db.testResult.create({
          data: {
            testRunId,
            testId: test.id,
            status: result.status,
            duration: result.duration,
            error: result.error,
            assertions: result.assertions as JsonValue | undefined,
            metadata: result.metadata as JsonValue | undefined,
          },
        });

        if (result.status === "PASSED") {
          passed++;
        } else if (result.status === "SKIPPED") {
          skipped++;
        } else {
          failed++;
        }

        results.push(result);
      }
    }

    // If no tests were run, create a sample health check
    if (results.length === 0 && project.productionUrl) {
      const result = await executeHealthCheck(project.productionUrl);
      results.push({
        testId: "default-health",
        status: result.healthy ? "PASSED" : "FAILED",
        duration: result.latency,
        error: result.error,
      });
      if (result.healthy) passed++;
      else failed++;
    }

    const duration = Date.now() - startTime;

    // Update test run with final status
    await db.testRun.update({
      where: { id: testRunId },
      data: {
        status: failed > 0 ? "FAILED" : "PASSED",
        finishedAt: new Date(),
        duration,
        summary: {
          total: passed + failed + skipped,
          passed,
          failed,
          skipped,
          duration,
        },
      },
    });

    // Generate diagnostics for failures
    if (failed > 0) {
      await db.diagnostic.create({
        data: {
          testRunId,
          severity: failed > passed ? "ERROR" : "WARNING",
          issue: `${failed} test(s) failed`,
          component: "TestRunner",
          description: `Out of ${passed + failed + skipped} tests, ${failed} failed. Review individual test results for details.`,
          suggestions: [
            "Check service health endpoints",
            "Verify API endpoints are accessible",
            "Review network connectivity",
            "Check authentication credentials",
          ],
        },
      });
    }
  } catch (error) {
    console.error("Test execution error:", error);

    // Update test run with error status
    await db.testRun.update({
      where: { id: testRunId },
      data: {
        status: "FAILED",
        finishedAt: new Date(),
        duration: Date.now() - startTime,
        summary: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      },
    });

    // Create error diagnostic
    await db.diagnostic.create({
      data: {
        testRunId,
        severity: "CRITICAL",
        issue: "Test execution failed",
        component: "TestRunner",
        description: error instanceof Error ? error.message : "Unknown error occurred during test execution",
        suggestions: [
          "Check test configuration",
          "Verify project settings",
          "Contact support if issue persists",
        ],
      },
    });
  }
}

/**
 * Execute service discovery for a project
 */
export async function discoverServices(projectId: string): Promise<{
  discovered: number;
  services: Array<{ type: string; name: string; status: string }>;
}> {
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: { environments: true },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  const discovered: Array<{ type: string; name: string; status: string }> = [];

  // Check common service patterns
  const serviceChecks = [
    {
      type: "DATABASE",
      name: "PostgreSQL",
      envVars: ["DATABASE_URL", "POSTGRES_URL", "PG_CONNECTION_STRING"],
    },
    {
      type: "AUTH",
      name: "Clerk",
      envVars: ["CLERK_SECRET_KEY", "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"],
    },
    {
      type: "AUTH",
      name: "Auth0",
      envVars: ["AUTH0_SECRET", "AUTH0_CLIENT_ID"],
    },
    {
      type: "PAYMENT",
      name: "Stripe",
      envVars: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
    },
    {
      type: "EMAIL",
      name: "Resend",
      envVars: ["RESEND_API_KEY"],
    },
    {
      type: "EMAIL",
      name: "SendGrid",
      envVars: ["SENDGRID_API_KEY"],
    },
    {
      type: "STORAGE",
      name: "AWS S3",
      envVars: ["AWS_ACCESS_KEY_ID", "AWS_S3_BUCKET"],
    },
    {
      type: "STORAGE",
      name: "Cloudflare R2",
      envVars: ["R2_ACCESS_KEY_ID", "CLOUDFLARE_R2_BUCKET"],
    },
    {
      type: "ANALYTICS",
      name: "PostHog",
      envVars: ["NEXT_PUBLIC_POSTHOG_KEY", "POSTHOG_API_KEY"],
    },
    {
      type: "MONITORING",
      name: "Sentry",
      envVars: ["SENTRY_DSN", "NEXT_PUBLIC_SENTRY_DSN"],
    },
    {
      type: "REPOSITORY",
      name: "GitHub",
      envVars: ["GITHUB_TOKEN", "GITHUB_CLIENT_SECRET"],
    },
  ];

  // Check which services are configured based on environment variables
  for (const env of project.environments) {
    if (!env.variables || typeof env.variables !== "object") continue;

    const envVars = Object.keys(env.variables as Record<string, unknown>);

    for (const check of serviceChecks) {
      const hasService = check.envVars.some((v) => envVars.includes(v));
      if (hasService) {
        // Check if service already exists
        const existing = await db.service.findFirst({
          where: {
            projectId,
            type: check.type as "DATABASE" | "AUTH" | "PAYMENT" | "EMAIL" | "STORAGE" | "ANALYTICS" | "MONITORING" | "REPOSITORY" | "PLATFORM" | "CUSTOM",
            name: check.name,
          },
        });

        if (!existing) {
          await db.service.create({
            data: {
              projectId,
              type: check.type as "DATABASE" | "AUTH" | "PAYMENT" | "EMAIL" | "STORAGE" | "ANALYTICS" | "MONITORING" | "REPOSITORY" | "PLATFORM" | "CUSTOM",
              name: check.name,
              status: "UNKNOWN",
              config: {
                discoveredFrom: env.name,
                envVars: check.envVars.filter((v) => envVars.includes(v)),
              },
            },
          });

          discovered.push({
            type: check.type,
            name: check.name,
            status: "UNKNOWN",
          });
        }
      }
    }
  }

  return {
    discovered: discovered.length,
    services: discovered,
  };
}

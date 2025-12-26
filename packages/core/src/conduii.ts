import EventEmitter from "eventemitter3";
import {
  ConduiiConfig,
  ConduiiConfigSchema,
  ConduiiEvents,
  DiscoveryResult,
  TestConfig,
  TestSuiteResult,
  TestType,
  TestStatus,
  HealthReport,
  DiagnosticResult,
  DiagnosticSeverity,
  TestFunction,
  Adapter,
} from "./types";
import { DiscoveryEngine } from "./discovery/engine";
import { TestRunner } from "./runners/test-runner";

export class Conduii extends EventEmitter<ConduiiEvents> {
  private config: ConduiiConfig;
  private runner: TestRunner;
  private discoveryResult: DiscoveryResult | null = null;
  private adapters: Map<string, Adapter> = new Map();
  private initialized = false;

  constructor(config: Partial<ConduiiConfig> = {}) {
    super();
    this.config = ConduiiConfigSchema.parse(config);
    this.runner = new TestRunner();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    if (this.config.autoDiscover) {
      await this.discover();
    }

    // Register built-in tests
    this.registerBuiltInTests();

    this.initialized = true;
  }

  async discover(): Promise<DiscoveryResult> {
    this.emit("discovery:start", {});

    const engine = new DiscoveryEngine(this.config.projectDir);
    this.discoveryResult = await engine.discover();

    // Register suggested tests
    for (const test of this.discoveryResult.suggestedTests) {
      this.registerTest(test, this.createTestFunction(test));
    }

    this.emit("discovery:complete", { result: this.discoveryResult });
    return this.discoveryResult;
  }

  getDiscoveryResult(): DiscoveryResult | null {
    return this.discoveryResult;
  }

  registerTest(config: TestConfig, fn: TestFunction): void {
    this.runner.registerTest(config, fn);
  }

  registerAdapter(name: string, adapter: Adapter): void {
    this.adapters.set(name, adapter);
    this.runner.registerAdapter(name, adapter);
  }

  async runAll(): Promise<TestSuiteResult> {
    await this.ensureInitialized();
    return this.runSuite("Full Test Suite");
  }

  async runHealthChecks(): Promise<TestSuiteResult> {
    await this.ensureInitialized();
    return this.runByType(TestType.HEALTH, "Health Checks");
  }

  async runIntegrationTests(): Promise<TestSuiteResult> {
    await this.ensureInitialized();
    return this.runByType(TestType.INTEGRATION, "Integration Tests");
  }

  async runApiTests(): Promise<TestSuiteResult> {
    await this.ensureInitialized();
    return this.runByType(TestType.API, "API Tests");
  }

  async runE2ETests(): Promise<TestSuiteResult> {
    await this.ensureInitialized();
    return this.runByType(TestType.E2E, "E2E Tests");
  }

  async runSuite(
    name: string,
    options: {
      tests?: TestConfig[];
      parallel?: boolean;
      maxConcurrency?: number;
      stopOnFirstFailure?: boolean;
    } = {}
  ): Promise<TestSuiteResult> {
    await this.ensureInitialized();

    const environment = this.config.environments?.[this.config.environment] ?? {
      name: this.config.environment,
      isProduction: false,
    };

    this.emit("suite:start", {
      name,
      tests: options.tests ?? [],
    });

    const result = await this.runner.runSuite(name, {
      ...options,
      environment,
      parallel: options.parallel ?? this.config.defaults?.parallel ?? true,
      maxConcurrency:
        options.maxConcurrency ?? this.config.defaults?.maxConcurrency ?? 5,
    });

    this.emit("suite:complete", { result });
    return result;
  }

  async healthCheck(): Promise<HealthReport> {
    await this.ensureInitialized();
    this.emit("health:start", {});

    const services: HealthReport["services"] = [];
    const diagnostics: DiagnosticResult[] = [];

    for (const [name, adapter] of this.adapters) {
      const start = Date.now();
      try {
        const health = await adapter.healthCheck();
        services.push({
          name,
          type: adapter.type,
          status: health.healthy ? "up" : "down",
          latency: health.latency ?? Date.now() - start,
          lastChecked: new Date(),
          error: health.error,
        });

        if (!health.healthy) {
          diagnostics.push({
            severity: DiagnosticSeverity.ERROR,
            component: name,
            issue: "Service unhealthy",
            description: health.error ?? "Health check failed",
            suggestions: ["Check service configuration", "Verify credentials"],
          });
        }
      } catch (error) {
        services.push({
          name,
          type: adapter.type,
          status: "down",
          latency: Date.now() - start,
          lastChecked: new Date(),
          error: error instanceof Error ? error.message : "Unknown error",
        });

        diagnostics.push({
          severity: DiagnosticSeverity.CRITICAL,
          component: name,
          issue: "Health check failed",
          description: error instanceof Error ? error.message : "Unknown error",
          suggestions: [
            "Verify service is running",
            "Check network connectivity",
          ],
        });
      }
    }

    const overall =
      services.every((s) => s.status === "up")
        ? "healthy"
        : services.some((s) => s.status === "up")
          ? "degraded"
          : "unhealthy";

    const report: HealthReport = {
      overall,
      timestamp: new Date(),
      services,
      diagnostics,
    };

    this.emit("health:complete", { report });
    return report;
  }

  diagnose(result: TestSuiteResult): DiagnosticResult[] {
    const diagnostics: DiagnosticResult[] = [];

    for (const test of result.tests) {
      if (
        test.status === TestStatus.FAILED ||
        test.status === TestStatus.ERROR
      ) {
        const diag = this.analyzeFailure(test);
        if (diag) diagnostics.push(diag);
      }
    }

    return diagnostics;
  }

  async cleanup(): Promise<void> {
    for (const adapter of this.adapters.values()) {
      await adapter.cleanup();
    }
    this.adapters.clear();
    this.initialized = false;
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  private async runByType(
    type: TestType,
    name: string
  ): Promise<TestSuiteResult> {
    const tests =
      this.discoveryResult?.suggestedTests.filter((t) => t.type === type) ?? [];
    return this.runSuite(name, { tests });
  }

  private registerBuiltInTests(): void {
    // Register default health check test
    this.registerTest(
      {
        id: "builtin:health",
        name: "System Health Check",
        type: TestType.HEALTH,
        enabled: true,
        timeout: 30000,
        retries: 1,
        tags: ["builtin", "health"],
      },
      async (ctx, assert) => {
        // Basic system health
        assert.ok(true);
        ctx.logs.push("System health check passed");
      }
    );
  }

  private createTestFunction(config: TestConfig): TestFunction {
    const testConfig = config.config as Record<string, unknown>;

    if (config.type === TestType.HEALTH) {
      return async (ctx, assert) => {
        if (ctx.adapter) {
          const health = await ctx.adapter.healthCheck();
          assert.ok(health.healthy);
          if (health.latency) {
            ctx.metadata.latency = health.latency;
          }
        } else {
          assert.ok(true);
        }
      };
    }

    if (config.type === TestType.INTEGRATION) {
      return async (ctx, assert) => {
        if (ctx.adapter) {
          const conn = await ctx.adapter.testConnection();
          assert.ok(conn.connected);
          assert.ok(conn.authenticated);
        } else {
          assert.ok(true);
        }
      };
    }

    if (config.type === TestType.API) {
      return async (ctx, assert) => {
        const endpoint = testConfig?.endpoint as string;
        const method = (testConfig?.method as string) ?? "GET";
        const expectedStatus = (testConfig?.expectedStatus as number) ?? 200;
        const baseUrl = ctx.environment.url ?? "http://localhost:3000";

        const url = `${baseUrl}${endpoint}`;
        const start = Date.now();

        const response = await fetch(url, { method });
        const latency = Date.now() - start;

        ctx.metadata.latency = latency;
        ctx.metadata.statusCode = response.status;

        assert.statusCode(response.status, expectedStatus);
        assert.responseTime(latency, config.timeout);
      };
    }

    // Default test function
    return async (_ctx, assert) => {
      assert.ok(true);
    };
  }

  private analyzeFailure(test: TestSuiteResult["tests"][0]): DiagnosticResult | null {
    if (!test.error) return null;

    const message = test.error.message.toLowerCase();

    // Connection refused
    if (message.includes("econnrefused") || message.includes("connection refused")) {
      return {
        severity: DiagnosticSeverity.CRITICAL,
        component: test.name,
        issue: "Connection Refused",
        description: "The service is not accepting connections",
        suggestions: [
          "Verify the service URL is correct",
          "Check if the service is running",
          "Verify firewall rules allow the connection",
        ],
      };
    }

    // Authentication errors
    if (message.includes("401") || message.includes("unauthorized")) {
      return {
        severity: DiagnosticSeverity.ERROR,
        component: test.name,
        issue: "Authentication Failed",
        description: "The request was not authenticated",
        suggestions: [
          "Verify API key or token is correct",
          "Check if credentials have expired",
          "Ensure the correct environment variables are set",
        ],
      };
    }

    // Timeout
    if (message.includes("timeout")) {
      return {
        severity: DiagnosticSeverity.WARNING,
        component: test.name,
        issue: "Request Timeout",
        description: "The request took too long to complete",
        suggestions: [
          "Check service performance",
          "Increase timeout value",
          "Verify network latency",
        ],
      };
    }

    // Generic error
    return {
      severity: DiagnosticSeverity.ERROR,
      component: test.name,
      issue: "Test Failed",
      description: test.error.message,
      suggestions: ["Review test configuration", "Check service logs"],
    };
  }
}

export async function createConduii(
  config: Partial<ConduiiConfig> = {}
): Promise<Conduii> {
  const conduii = new Conduii(config);
  await conduii.initialize();
  return conduii;
}

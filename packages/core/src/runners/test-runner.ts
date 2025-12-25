import pLimit from "p-limit";
import {
  TestConfig,
  TestResult,
  TestSuiteResult,
  TestStatus,
  TestContext,
  TestAssertions,
  TestAssertion,
  TestFunction,
  EnvironmentConfig,
  Adapter,
} from "../types";

// =============================================================================
// ASSERTIONS
// =============================================================================

class Assertions implements TestAssertions {
  private assertions: TestAssertion[] = [];

  getAssertions(): TestAssertion[] {
    return this.assertions;
  }

  private addAssertion(
    type: string,
    expected: unknown,
    actual: unknown,
    passed: boolean,
    message?: string
  ): void {
    this.assertions.push({ type, expected, actual, passed, message });
    if (!passed) {
      throw new AssertionError(
        message ?? `Assertion failed: ${type}`,
        expected,
        actual
      );
    }
  }

  equal(actual: unknown, expected: unknown): void {
    const passed = actual === expected;
    this.addAssertion(
      "equal",
      expected,
      actual,
      passed,
      `Expected ${expected}, got ${actual}`
    );
  }

  notEqual(actual: unknown, expected: unknown): void {
    const passed = actual !== expected;
    this.addAssertion(
      "notEqual",
      expected,
      actual,
      passed,
      `Expected not ${expected}, got ${actual}`
    );
  }

  truthy(value: unknown): void {
    const passed = !!value;
    this.addAssertion("truthy", true, value, passed, `Expected truthy value`);
  }

  falsy(value: unknown): void {
    const passed = !value;
    this.addAssertion("falsy", false, value, passed, `Expected falsy value`);
  }

  ok(value: boolean): void {
    this.addAssertion("ok", true, value, value, `Expected true`);
  }

  contains(haystack: unknown[] | string, needle: unknown): void {
    const passed = Array.isArray(haystack)
      ? haystack.includes(needle)
      : typeof haystack === "string" && typeof needle === "string"
        ? haystack.includes(needle)
        : false;
    this.addAssertion(
      "contains",
      needle,
      haystack,
      passed,
      `Expected to contain ${needle}`
    );
  }

  matches(value: string, pattern: RegExp): void {
    const passed = pattern.test(value);
    this.addAssertion(
      "matches",
      pattern.toString(),
      value,
      passed,
      `Expected to match ${pattern}`
    );
  }

  greaterThan(actual: number, expected: number): void {
    const passed = actual > expected;
    this.addAssertion(
      "greaterThan",
      expected,
      actual,
      passed,
      `Expected ${actual} > ${expected}`
    );
  }

  lessThan(actual: number, expected: number): void {
    const passed = actual < expected;
    this.addAssertion(
      "lessThan",
      expected,
      actual,
      passed,
      `Expected ${actual} < ${expected}`
    );
  }

  between(actual: number, min: number, max: number): void {
    const passed = actual >= min && actual <= max;
    this.addAssertion(
      "between",
      [min, max],
      actual,
      passed,
      `Expected ${actual} between ${min} and ${max}`
    );
  }

  statusCode(actual: number, expected: number | number[]): void {
    const expectedCodes = Array.isArray(expected) ? expected : [expected];
    const passed = expectedCodes.includes(actual);
    this.addAssertion(
      "statusCode",
      expected,
      actual,
      passed,
      `Expected status ${expected}, got ${actual}`
    );
  }

  responseTime(actualMs: number, maxMs: number): void {
    const passed = actualMs <= maxMs;
    this.addAssertion(
      "responseTime",
      maxMs,
      actualMs,
      passed,
      `Response time ${actualMs}ms exceeded ${maxMs}ms`
    );
  }

  hasProperty(obj: object, property: string): void {
    const passed = property in obj;
    this.addAssertion(
      "hasProperty",
      property,
      Object.keys(obj),
      passed,
      `Expected property ${property}`
    );
  }
}

class AssertionError extends Error {
  constructor(
    message: string,
    public expected: unknown,
    public actual: unknown
  ) {
    super(message);
    this.name = "AssertionError";
  }
}

// =============================================================================
// TEST RUNNER
// =============================================================================

export class TestRunner {
  private tests: Map<string, { config: TestConfig; fn: TestFunction }> =
    new Map();
  private adapters: Map<string, Adapter> = new Map();

  registerTest(config: TestConfig, fn: TestFunction): void {
    this.tests.set(config.id, { config, fn });
  }

  registerAdapter(name: string, adapter: Adapter): void {
    this.adapters.set(name, adapter);
  }

  async runSuite(
    name: string,
    options: {
      tests?: TestConfig[];
      environment?: EnvironmentConfig;
      parallel?: boolean;
      maxConcurrency?: number;
      stopOnFirstFailure?: boolean;
    } = {}
  ): Promise<TestSuiteResult> {
    const {
      tests = Array.from(this.tests.values()).map((t) => t.config),
      environment = { name: "default" },
      parallel = true,
      maxConcurrency = 5,
      stopOnFirstFailure = false,
    } = options;

    const startedAt = new Date();
    const results: TestResult[] = [];
    let stopped = false;

    const runTest = async (config: TestConfig): Promise<TestResult> => {
      if (stopped) {
        return this.createSkippedResult(config);
      }

      const test = this.tests.get(config.id);
      if (!test) {
        return this.createErrorResult(config, "Test not found");
      }

      const result = await this.executeTest(test.config, test.fn, environment);

      if (
        stopOnFirstFailure &&
        (result.status === TestStatus.FAILED ||
          result.status === TestStatus.ERROR)
      ) {
        stopped = true;
      }

      return result;
    };

    if (parallel) {
      const limit = pLimit(maxConcurrency);
      const promises = tests.map((test) => limit(() => runTest(test)));
      results.push(...(await Promise.all(promises)));
    } else {
      for (const test of tests) {
        results.push(await runTest(test));
      }
    }

    const finishedAt = new Date();
    const summary = this.calculateSummary(results);
    const status =
      summary.failed > 0 || summary.errors > 0
        ? TestStatus.FAILED
        : TestStatus.PASSED;

    return {
      id: `suite-${Date.now()}`,
      name,
      environment: environment.name,
      status,
      duration: finishedAt.getTime() - startedAt.getTime(),
      startedAt,
      finishedAt,
      tests: results,
      summary,
    };
  }

  private async executeTest(
    config: TestConfig,
    fn: TestFunction,
    environment: EnvironmentConfig
  ): Promise<TestResult> {
    const startedAt = new Date();
    const assertions = new Assertions();
    const context: TestContext = {
      testId: config.id,
      environment,
      startTime: startedAt,
      metadata: {},
      logs: [],
    };

    // Get adapter if specified
    const serviceName = (config.config as { service?: string })?.service;
    if (serviceName) {
      context.adapter = this.adapters.get(serviceName);
    }

    let status = TestStatus.PASSED;
    let error: TestResult["error"];

    // Retry logic
    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= config.retries; attempt++) {
      try {
        await Promise.race([
          fn(context, assertions),
          new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error("Test timeout")),
              config.timeout
            )
          ),
        ]);
        lastError = null;
        break;
      } catch (err) {
        lastError = err as Error;
        if (attempt < config.retries) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        }
      }
    }

    if (lastError) {
      if (lastError.message === "Test timeout") {
        status = TestStatus.TIMEOUT;
      } else if (lastError instanceof AssertionError) {
        status = TestStatus.FAILED;
      } else {
        status = TestStatus.ERROR;
      }

      error = {
        message: lastError.message,
        stack: lastError.stack,
      };
    }

    const finishedAt = new Date();

    return {
      id: `result-${config.id}-${Date.now()}`,
      testId: config.id,
      name: config.name,
      type: config.type,
      status,
      duration: finishedAt.getTime() - startedAt.getTime(),
      startedAt,
      finishedAt,
      assertions: assertions.getAssertions(),
      error,
      metadata: context.metadata,
      logs: context.logs,
    };
  }

  private createSkippedResult(config: TestConfig): TestResult {
    const now = new Date();
    return {
      id: `result-${config.id}-${Date.now()}`,
      testId: config.id,
      name: config.name,
      type: config.type,
      status: TestStatus.SKIPPED,
      duration: 0,
      startedAt: now,
      finishedAt: now,
      assertions: [],
    };
  }

  private createErrorResult(config: TestConfig, message: string): TestResult {
    const now = new Date();
    return {
      id: `result-${config.id}-${Date.now()}`,
      testId: config.id,
      name: config.name,
      type: config.type,
      status: TestStatus.ERROR,
      duration: 0,
      startedAt: now,
      finishedAt: now,
      assertions: [],
      error: { message },
    };
  }

  private calculateSummary(results: TestResult[]): TestSuiteResult["summary"] {
    return {
      total: results.length,
      passed: results.filter((r) => r.status === TestStatus.PASSED).length,
      failed: results.filter((r) => r.status === TestStatus.FAILED).length,
      skipped: results.filter((r) => r.status === TestStatus.SKIPPED).length,
      errors: results.filter(
        (r) => r.status === TestStatus.ERROR || r.status === TestStatus.TIMEOUT
      ).length,
    };
  }
}

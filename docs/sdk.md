# Conduii SDK

The `@conduii/core` SDK provides programmatic access to the Conduii testing engine. Build custom testing workflows and integrations.

## Installation

```bash
npm install @conduii/core
```

## Quick Start

```typescript
import { Conduii, createConduii } from "@conduii/core";

// Create and initialize
const conduii = await createConduii({
  projectDir: "./my-project",
  environment: "production",
});

// Run all tests
const results = await conduii.runAll();
console.log(`Tests: ${results.summary.passed}/${results.summary.total} passed`);

// Cleanup
await conduii.cleanup();
```

## Configuration

```typescript
import { Conduii } from "@conduii/core";

const conduii = new Conduii({
  // Project name
  name: "my-project",

  // Project directory (for discovery)
  projectDir: "./",

  // Active environment
  environment: "production",

  // Auto-discover services
  autoDiscover: true,

  // Verbose logging
  verbose: false,

  // Environment configurations
  environments: {
    production: {
      name: "production",
      url: "https://api.example.com",
      isProduction: true,
    },
    staging: {
      name: "staging",
      url: "https://staging.example.com",
    },
  },

  // Pre-configured adapters
  adapters: [
    {
      type: "database",
      name: "supabase",
      enabled: true,
      credentials: {
        url: process.env.SUPABASE_URL,
        key: process.env.SUPABASE_KEY,
      },
    },
  ],

  // Default test settings
  defaults: {
    timeout: 30000,
    retries: 2,
    parallel: true,
    maxConcurrency: 5,
  },
});

await conduii.initialize();
```

## Discovery

Automatically detect services and integrations:

```typescript
const result = await conduii.discover();

console.log("Framework:", result.framework);
console.log("Services:", result.services);
console.log("Endpoints:", result.endpoints);
console.log("Suggested Tests:", result.suggestedTests);
```

### Discovery Result

```typescript
interface DiscoveryResult {
  projectType: string;
  framework?: string;
  services: DiscoveredService[];
  endpoints: DiscoveredEndpoint[];
  environmentVariables: string[];
  suggestedTests: TestConfig[];
}

interface DiscoveredService {
  type: AdapterType;
  name: string;
  configFile?: string;
  envVars?: string[];
  confidence: number; // 0-1
}
```

## Running Tests

### Run All Tests

```typescript
const results = await conduii.runAll();
```

### Run by Type

```typescript
// Health checks
const healthResults = await conduii.runHealthChecks();

// Integration tests
const integrationResults = await conduii.runIntegrationTests();

// API tests
const apiResults = await conduii.runApiTests();

// E2E tests
const e2eResults = await conduii.runE2ETests();
```

### Custom Test Suite

```typescript
const results = await conduii.runSuite("My Custom Suite", {
  tests: [
    { id: "test-1", name: "Test 1", type: TestType.HEALTH, enabled: true },
    { id: "test-2", name: "Test 2", type: TestType.API, enabled: true },
  ],
  parallel: true,
  maxConcurrency: 10,
  stopOnFirstFailure: false,
});
```

## Custom Tests

Register custom test functions:

```typescript
import { TestType, TestContext, TestAssertions } from "@conduii/core";

conduii.registerTest(
  {
    id: "custom:my-test",
    name: "My Custom Test",
    type: TestType.INTEGRATION,
    enabled: true,
    timeout: 60000,
    retries: 3,
    tags: ["custom", "important"],
  },
  async (ctx: TestContext, assert: TestAssertions) => {
    // Access environment
    const baseUrl = ctx.environment.url;

    // Make requests
    const response = await fetch(`${baseUrl}/api/endpoint`);
    const data = await response.json();

    // Assertions
    assert.statusCode(response.status, 200);
    assert.ok(data.success);
    assert.equal(data.status, "active");

    // Logging
    ctx.logs.push("Custom test completed");

    // Metadata
    ctx.metadata.customField = "value";
  }
);
```

### Assertions

```typescript
interface TestAssertions {
  equal(actual: unknown, expected: unknown): void;
  notEqual(actual: unknown, expected: unknown): void;
  truthy(value: unknown): void;
  falsy(value: unknown): void;
  ok(value: boolean): void;
  contains(haystack: unknown[] | string, needle: unknown): void;
  matches(value: string, pattern: RegExp): void;
  greaterThan(actual: number, expected: number): void;
  lessThan(actual: number, expected: number): void;
  between(actual: number, min: number, max: number): void;
  statusCode(actual: number, expected: number | number[]): void;
  responseTime(actualMs: number, maxMs: number): void;
  hasProperty(obj: object, property: string): void;
}
```

## Health Checks

```typescript
const report = await conduii.healthCheck();

console.log("Overall:", report.overall); // healthy, degraded, unhealthy
console.log("Services:", report.services);
console.log("Diagnostics:", report.diagnostics);
```

### Health Report

```typescript
interface HealthReport {
  overall: "healthy" | "degraded" | "unhealthy";
  timestamp: Date;
  services: ServiceHealth[];
  diagnostics: DiagnosticResult[];
}

interface ServiceHealth {
  name: string;
  type: AdapterType;
  status: "up" | "down" | "degraded";
  latency?: number;
  lastChecked: Date;
  error?: string;
}
```

## Adapters

Register custom adapters:

```typescript
import { Adapter, AdapterType, HealthCheckResult } from "@conduii/core";

class MyCustomAdapter implements Adapter {
  readonly type = AdapterType.CUSTOM;
  readonly name = "my-service";
  readonly version = "1.0.0";

  async initialize(config: AdapterConfig): Promise<void> {
    // Initialize connection
  }

  async healthCheck(): Promise<HealthCheckResult> {
    return {
      healthy: true,
      latency: 50,
      version: "1.0.0",
    };
  }

  async testConnection(): Promise<ConnectionTestResult> {
    return {
      connected: true,
      authenticated: true,
      permissions: ["read", "write"],
    };
  }

  async cleanup(): Promise<void> {
    // Cleanup resources
  }
}

conduii.registerAdapter("my-service", new MyCustomAdapter());
```

## Events

Listen to test lifecycle events:

```typescript
conduii.on("discovery:start", () => {
  console.log("Discovery started");
});

conduii.on("discovery:complete", ({ result }) => {
  console.log("Discovered:", result.services.length, "services");
});

conduii.on("test:start", ({ test }) => {
  console.log("Running:", test.name);
});

conduii.on("test:complete", ({ result }) => {
  console.log("Completed:", result.name, result.status);
});

conduii.on("suite:start", ({ name, tests }) => {
  console.log("Suite:", name, "with", tests.length, "tests");
});

conduii.on("suite:complete", ({ result }) => {
  console.log("Suite complete:", result.summary);
});

conduii.on("health:complete", ({ report }) => {
  console.log("Health:", report.overall);
});

conduii.on("error", ({ error, context }) => {
  console.error("Error in", context, error);
});
```

## Diagnostics

Analyze test failures:

```typescript
const results = await conduii.runAll();
const diagnostics = conduii.diagnose(results);

for (const diag of diagnostics) {
  console.log(`[${diag.severity}] ${diag.component}: ${diag.issue}`);
  console.log("Description:", diag.description);
  console.log("Suggestions:", diag.suggestions);
}
```

## Types

```typescript
import {
  // Enums
  AdapterType,
  TestType,
  TestStatus,
  DiagnosticSeverity,

  // Configuration
  ConduiiConfig,
  AdapterConfig,
  TestConfig,
  EnvironmentConfig,

  // Results
  TestResult,
  TestSuiteResult,
  HealthReport,
  DiscoveryResult,
  DiagnosticResult,

  // Interfaces
  Adapter,
  TestContext,
  TestAssertions,
  TestFunction,
} from "@conduii/core";
```

## Examples

### CI/CD Integration

```typescript
import { createConduii } from "@conduii/core";

async function runCITests() {
  const conduii = await createConduii({
    environment: process.env.ENVIRONMENT || "preview",
    verbose: true,
  });

  try {
    const results = await conduii.runAll();

    // Output results
    console.log(JSON.stringify(results, null, 2));

    // Exit with appropriate code
    process.exit(results.summary.failed > 0 ? 1 : 0);
  } finally {
    await conduii.cleanup();
  }
}

runCITests();
```

### Custom Test Reporter

```typescript
conduii.on("test:complete", ({ result }) => {
  const icon = result.status === "passed" ? "✓" : "✗";
  const duration = `${(result.duration / 1000).toFixed(2)}s`;
  console.log(`${icon} ${result.name} (${duration})`);

  if (result.error) {
    console.log(`  Error: ${result.error.message}`);
  }
});
```

import { z } from "zod";

// =============================================================================
// ENUMS
// =============================================================================

export enum AdapterType {
  PLATFORM = "platform",
  DATABASE = "database",
  AUTH = "auth",
  PAYMENT = "payment",
  EMAIL = "email",
  STORAGE = "storage",
  MONITORING = "monitoring",
  REPOSITORY = "repository",
  ANALYTICS = "analytics",
  CUSTOM = "custom",
}

export enum TestType {
  HEALTH = "health",
  INTEGRATION = "integration",
  API = "api",
  E2E = "e2e",
  PERFORMANCE = "performance",
  SECURITY = "security",
  CUSTOM = "custom",
}

export enum TestStatus {
  PENDING = "pending",
  RUNNING = "running",
  PASSED = "passed",
  FAILED = "failed",
  SKIPPED = "skipped",
  TIMEOUT = "timeout",
  ERROR = "error",
}

export enum DiagnosticSeverity {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  CRITICAL = "critical",
}

// =============================================================================
// ZOD SCHEMAS
// =============================================================================

export const AdapterConfigSchema = z.object({
  type: z.nativeEnum(AdapterType),
  name: z.string(),
  enabled: z.boolean().default(true),
  credentials: z.record(z.string()).optional(),
  options: z.record(z.unknown()).optional(),
});

export const TestConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.nativeEnum(TestType),
  enabled: z.boolean().default(true),
  timeout: z.number().default(30000),
  retries: z.number().default(2),
  tags: z.array(z.string()).default([]),
  dependsOn: z.array(z.string()).optional(),
  config: z.record(z.unknown()).optional(),
});

export const EnvironmentConfigSchema = z.object({
  name: z.string(),
  url: z.string().url().optional(),
  isProduction: z.boolean().default(false),
  variables: z.record(z.string()).optional(),
});

export const ConduiiConfigSchema = z.object({
  name: z.string().optional(),
  version: z.string().optional(),
  projectDir: z.string().optional(),
  environment: z.string().default("default"),
  autoDiscover: z.boolean().default(true),
  verbose: z.boolean().default(false),
  environments: z.record(EnvironmentConfigSchema).optional(),
  adapters: z.array(AdapterConfigSchema).optional(),
  defaults: z
    .object({
      timeout: z.number().default(30000),
      retries: z.number().default(2),
      parallel: z.boolean().default(true),
      maxConcurrency: z.number().default(5),
    })
    .optional(),
});

// =============================================================================
// TYPES
// =============================================================================

export type AdapterConfig = z.infer<typeof AdapterConfigSchema>;
export type TestConfig = z.infer<typeof TestConfigSchema>;
export type EnvironmentConfig = z.infer<typeof EnvironmentConfigSchema>;
export type ConduiiConfig = z.infer<typeof ConduiiConfigSchema>;

export interface HealthCheckResult {
  healthy: boolean;
  latency?: number;
  version?: string;
  error?: string;
  details?: Record<string, unknown>;
}

export interface ConnectionTestResult {
  connected: boolean;
  authenticated: boolean;
  permissions?: string[];
  error?: string;
}

export interface DiscoveredService {
  type: AdapterType;
  name: string;
  configFile?: string;
  envVars?: string[];
  confidence: number;
}

export interface DiscoveredEndpoint {
  path: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  description?: string;
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    location: "query" | "body" | "path" | "header";
  }>;
}

export interface DiscoveryResult {
  projectType: string;
  framework?: string;
  services: DiscoveredService[];
  endpoints: DiscoveredEndpoint[];
  environmentVariables: string[];
  suggestedTests: TestConfig[];
}

export interface TestAssertion {
  type: string;
  expected: unknown;
  actual: unknown;
  passed: boolean;
  message?: string;
}

export interface TestResult {
  id: string;
  testId: string;
  name: string;
  type: TestType;
  status: TestStatus;
  duration: number;
  startedAt: Date;
  finishedAt: Date;
  assertions: TestAssertion[];
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
  metadata?: Record<string, unknown>;
  logs?: string[];
}

export interface TestSuiteResult {
  id: string;
  name: string;
  environment: string;
  status: TestStatus;
  duration: number;
  startedAt: Date;
  finishedAt: Date;
  tests: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    errors: number;
  };
}

export interface ServiceHealth {
  name: string;
  type: AdapterType;
  status: "up" | "down" | "degraded";
  latency?: number;
  lastChecked: Date;
  error?: string;
}

export interface HealthReport {
  overall: "healthy" | "degraded" | "unhealthy";
  timestamp: Date;
  services: ServiceHealth[];
  diagnostics: DiagnosticResult[];
}

export interface DiagnosticResult {
  severity: DiagnosticSeverity;
  component: string;
  issue: string;
  description: string;
  suggestions: string[];
}

// =============================================================================
// ADAPTER INTERFACE
// =============================================================================

export interface Adapter {
  readonly type: AdapterType;
  readonly name: string;
  readonly version: string;

  initialize(config: AdapterConfig): Promise<void>;
  healthCheck(): Promise<HealthCheckResult>;
  testConnection(): Promise<ConnectionTestResult>;
  cleanup(): Promise<void>;
}

// =============================================================================
// TEST CONTEXT
// =============================================================================

export interface TestContext {
  testId: string;
  adapter?: Adapter;
  environment: EnvironmentConfig;
  startTime: Date;
  metadata: Record<string, unknown>;
  logs: string[];
}

export interface TestAssertions {
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

export type TestFunction = (
  ctx: TestContext,
  assert: TestAssertions
) => Promise<void>;

// =============================================================================
// EVENTS
// =============================================================================

export interface ConduiiEvents {
  "discovery:start": {};
  "discovery:complete": { result: DiscoveryResult };
  "test:start": { test: TestConfig };
  "test:complete": { result: TestResult };
  "suite:start": { name: string; tests: TestConfig[] };
  "suite:complete": { result: TestSuiteResult };
  "health:start": {};
  "health:complete": { report: HealthReport };
  error: { error: Error; context?: string };
}

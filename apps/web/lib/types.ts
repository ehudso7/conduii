// Application types for Conduii
// These types represent the data structures used throughout the application

// Enum types (matching Prisma schema)
export type Plan = "FREE" | "BASIC" | "PRO" | "ENTERPRISE";
export type OrgRole = "OWNER" | "ADMIN" | "MEMBER";
export type ProjectRole = "OWNER" | "ADMIN" | "DEVELOPER" | "VIEWER";
export type ServiceType = "PLATFORM" | "DATABASE" | "AUTH" | "PAYMENT" | "EMAIL" | "STORAGE" | "ANALYTICS" | "MONITORING" | "REPOSITORY" | "CUSTOM";
export type ServiceStatus = "HEALTHY" | "DEGRADED" | "UNHEALTHY" | "UNKNOWN";
export type TestType = "HEALTH" | "INTEGRATION" | "API" | "E2E" | "PERFORMANCE" | "SECURITY" | "CUSTOM";
export type TestRunStatus = "PENDING" | "RUNNING" | "PASSED" | "FAILED" | "CANCELLED" | "TIMEOUT";
export type TestTrigger = "MANUAL" | "SCHEDULED" | "WEBHOOK" | "GITHUB_ACTION" | "CLI" | "API";
export type TestStatus = "PENDING" | "RUNNING" | "PASSED" | "FAILED" | "SKIPPED" | "TIMEOUT" | "ERROR";
export type DiagnosticSeverity = "INFO" | "WARNING" | "ERROR" | "CRITICAL";
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

// User types
export interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Organization types
export interface Organization {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  plan: Plan;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  stripeCurrentPeriodEnd: Date | null;
  projectLimit: number;
  testRunLimit: number;
  testRunsUsed: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationMember {
  id: string;
  role: OrgRole;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  organizationId: string;
  user?: User;
  organization?: Organization;
}

// Project types
export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  repositoryUrl: string | null;
  productionUrl: string | null;
  framework: string | null;
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;
  organization?: Organization;
  services?: Service[];
  testRuns?: TestRun[];
  endpoints?: Endpoint[];
  environments?: Environment[];
  testSuites?: TestSuite[];
  _count?: {
    services: number;
    endpoints: number;
    testRuns: number;
  };
}

export interface Environment {
  id: string;
  name: string;
  url: string | null;
  isProduction: boolean;
  variables: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
  projectId: string;
}

// Service types
export interface Service {
  id: string;
  type: ServiceType;
  name: string;
  status: ServiceStatus;
  config: Record<string, unknown> | null;
  credentials: Record<string, unknown> | null;
  lastHealthCheck: Date | null;
  latency: number | null;
  createdAt: Date;
  updatedAt: Date;
  projectId: string;
}

// Endpoint types
export interface Endpoint {
  id: string;
  path: string;
  method: HttpMethod;
  description: string | null;
  parameters: Record<string, unknown> | null;
  discovered: boolean;
  createdAt: Date;
  updatedAt: Date;
  projectId: string;
}

// Test types
export interface TestSuite {
  id: string;
  name: string;
  description: string | null;
  config: Record<string, unknown> | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  projectId: string;
  _count?: {
    tests: number;
  };
}

export interface Test {
  id: string;
  name: string;
  type: TestType;
  description: string | null;
  config: Record<string, unknown> | null;
  timeout: number;
  retries: number;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  testSuiteId: string | null;
  serviceId: string | null;
  endpointId: string | null;
}

export interface TestRun {
  id: string;
  status: TestRunStatus;
  trigger: TestTrigger;
  duration: number | null;
  startedAt: Date | null;
  finishedAt: Date | null;
  summary: TestRunSummary | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  projectId: string;
  environmentId: string | null;
  testSuiteId: string | null;
  triggeredById: string | null;
  environment?: Environment | null;
  testSuite?: TestSuite | null;
  results?: TestResult[];
  _count?: {
    results: number;
  };
}

export interface TestRunSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
}

export interface TestResult {
  id: string;
  status: TestStatus;
  duration: number;
  error: string | null;
  assertions: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  testRunId: string;
  testId: string;
}

export interface Diagnostic {
  id: string;
  severity: DiagnosticSeverity;
  issue: string;
  component: string;
  description: string;
  suggestions: string[];
  createdAt: Date;
  testRunId: string;
}

// API Key types
export interface ApiKey {
  id: string;
  name: string;
  key: string;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
  userId: string | null;
  organizationId: string | null;
  user?: User | null;
}

// Usage types
export interface UsageRecord {
  id: string;
  period: Date;
  testRuns: number;
  apiCalls: number;
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;
}

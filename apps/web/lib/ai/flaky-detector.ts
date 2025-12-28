/**
 * Flaky Test Detection Service
 * Identifies unreliable tests and provides remediation strategies
 */

import { db } from "@/lib/db";

// Local type matching Prisma schema
type InputJsonValue = string | number | boolean | null | { [key: string]: InputJsonValue } | InputJsonValue[];

export interface FlakyTestResult {
  testId: string;
  testName: string;
  flakinessScore: number; // 0-100, higher = more flaky
  passRate: number;
  totalRuns: number;
  flakyCriteria: string[];
  category: "TIMING" | "NETWORK" | "STATE" | "EXTERNAL" | "RACE_CONDITION" | "UNKNOWN";
  recommendations: string[];
  shouldQuarantine: boolean;
  lastFlake: Date | null;
  pattern?: {
    description: string;
    frequency: string;
    triggers: string[];
  };
}

export interface FlakyTestAnalysis {
  projectId: string;
  analyzedAt: Date;
  totalTests: number;
  flakyTests: FlakyTestResult[];
  overallHealth: "HEALTHY" | "DEGRADED" | "CRITICAL";
  recommendations: string[];
}

/**
 * Analyze a project for flaky tests
 */
export async function analyzeProjectForFlakyTests(
  projectId: string,
  options: {
    minRuns?: number;
    timeRangeDays?: number;
    flakinessThreshold?: number;
  } = {}
): Promise<FlakyTestAnalysis> {
  const {
    minRuns = 5,
    timeRangeDays = 30,
    flakinessThreshold = 10,
  } = options;

  const since = new Date(Date.now() - timeRangeDays * 24 * 60 * 60 * 1000);

  // Get all test results in the time range
  const testResults = await db.testResult.findMany({
    where: {
      testRun: { projectId },
      createdAt: { gte: since },
    },
    include: {
      test: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Group by test
  const testMap = new Map<string, typeof testResults>();
  for (const result of testResults) {
    const existing = testMap.get(result.testId) || [];
    existing.push(result);
    testMap.set(result.testId, existing);
  }

  const flakyTests: FlakyTestResult[] = [];

  for (const [testId, results] of testMap) {
    if (results.length < minRuns) continue;

    const analysis = analyzeTestFlakiness(testId, results);

    if (analysis.flakinessScore >= flakinessThreshold) {
      flakyTests.push(analysis);
    }
  }

  // Sort by flakiness score
  flakyTests.sort((a, b) => b.flakinessScore - a.flakinessScore);

  // Determine overall health
  let overallHealth: "HEALTHY" | "DEGRADED" | "CRITICAL";
  const flakyPercentage = (flakyTests.length / testMap.size) * 100;

  if (flakyPercentage < 5) {
    overallHealth = "HEALTHY";
  } else if (flakyPercentage < 15) {
    overallHealth = "DEGRADED";
  } else {
    overallHealth = "CRITICAL";
  }

  return {
    projectId,
    analyzedAt: new Date(),
    totalTests: testMap.size,
    flakyTests,
    overallHealth,
    recommendations: generateProjectRecommendations(flakyTests, overallHealth),
  };
}

/**
 * Analyze individual test flakiness
 */
function analyzeTestFlakiness(
  testId: string,
  results: Array<{
    id: string;
    status: string;
    error: string | null;
    duration: number | null;
    createdAt: Date;
    test: { name: string; type: string };
  }>
): FlakyTestResult {
  const testName = results[0].test.name;
  const totalRuns = results.length;

  // Calculate pass rate
  const passed = results.filter((r) => r.status === "PASSED").length;
  const passRate = (passed / totalRuns) * 100;

  // Detect flakiness patterns
  const flakyCriteria: string[] = [];
  let flakinessScore = 0;

  // Check for pass/fail alternation
  let alternations = 0;
  for (let i = 1; i < results.length; i++) {
    if (results[i].status !== results[i - 1].status) {
      alternations++;
    }
  }
  const alternationRate = alternations / (results.length - 1);
  if (alternationRate > 0.3) {
    flakyCriteria.push("High pass/fail alternation");
    flakinessScore += alternationRate * 40;
  }

  // Check for inconsistent pass rate (not 0% or 100%)
  if (passRate > 5 && passRate < 95) {
    flakyCriteria.push("Inconsistent pass rate");
    flakinessScore += 30 - Math.abs(passRate - 50) * 0.4;
  }

  // Check for duration variance
  const durations = results.filter((r) => r.duration).map((r) => r.duration!);
  if (durations.length > 2) {
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const variance = durations.reduce((sum, d) => sum + Math.pow(d - avgDuration, 2), 0) / durations.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / avgDuration; // Coefficient of variation

    if (cv > 0.5) {
      flakyCriteria.push("High duration variance");
      flakinessScore += cv * 20;
    }
  }

  // Check for similar errors with different outcomes
  const errorMessages = results
    .filter((r) => r.error)
    .map((r) => r.error!);
  const uniqueErrors = new Set(errorMessages);
  if (uniqueErrors.size > 1 && uniqueErrors.size < errorMessages.length * 0.5) {
    flakyCriteria.push("Inconsistent error messages");
    flakinessScore += 15;
  }

  // Cap the score at 100
  flakinessScore = Math.min(100, flakinessScore);

  // Determine category
  const category = categorizeFlakiness(results, flakyCriteria);

  // Get last flake (last failure that was followed by a pass)
  let lastFlake: Date | null = null;
  for (let i = 0; i < results.length - 1; i++) {
    if (results[i].status === "FAILED" && results[i + 1].status === "PASSED") {
      lastFlake = results[i].createdAt;
      break;
    }
  }

  return {
    testId,
    testName,
    flakinessScore: Math.round(flakinessScore),
    passRate: Math.round(passRate * 10) / 10,
    totalRuns,
    flakyCriteria,
    category,
    recommendations: generateTestRecommendations(category, flakyCriteria),
    shouldQuarantine: flakinessScore > 50,
    lastFlake,
  };
}

/**
 * Categorize the type of flakiness
 */
function categorizeFlakiness(
  results: Array<{ error: string | null; duration: number | null }>,
  criteria: string[]
): "TIMING" | "NETWORK" | "STATE" | "EXTERNAL" | "RACE_CONDITION" | "UNKNOWN" {
  const errors = results.map((r) => r.error || "").join(" ").toLowerCase();

  if (errors.includes("timeout") || errors.includes("timed out") || criteria.includes("High duration variance")) {
    return "TIMING";
  }

  if (errors.includes("network") || errors.includes("connection") || errors.includes("econnrefused") || errors.includes("socket")) {
    return "NETWORK";
  }

  if (errors.includes("state") || errors.includes("expected") || errors.includes("not found")) {
    return "STATE";
  }

  if (errors.includes("external") || errors.includes("api") || errors.includes("service")) {
    return "EXTERNAL";
  }

  if (errors.includes("race") || errors.includes("concurrent") || criteria.includes("High pass/fail alternation")) {
    return "RACE_CONDITION";
  }

  return "UNKNOWN";
}

/**
 * Generate recommendations for a flaky test
 */
function generateTestRecommendations(
  category: string,
  criteria: string[]
): string[] {
  const recommendations: string[] = [];

  switch (category) {
    case "TIMING":
      recommendations.push("Increase test timeouts");
      recommendations.push("Add explicit waits for async operations");
      recommendations.push("Use polling instead of fixed delays");
      break;
    case "NETWORK":
      recommendations.push("Add retry logic for network calls");
      recommendations.push("Mock external network dependencies");
      recommendations.push("Implement circuit breaker pattern");
      break;
    case "STATE":
      recommendations.push("Ensure proper test isolation");
      recommendations.push("Reset database state before each test");
      recommendations.push("Avoid shared mutable state between tests");
      break;
    case "EXTERNAL":
      recommendations.push("Mock external service calls");
      recommendations.push("Use service virtualization");
      recommendations.push("Implement fallback test data");
      break;
    case "RACE_CONDITION":
      recommendations.push("Add synchronization primitives");
      recommendations.push("Use atomic operations");
      recommendations.push("Review concurrent code paths");
      break;
    default:
      recommendations.push("Review test implementation for non-deterministic behavior");
      recommendations.push("Add more specific assertions");
      recommendations.push("Increase test logging for debugging");
  }

  if (criteria.includes("High pass/fail alternation")) {
    recommendations.push("Consider test quarantine until fixed");
  }

  return recommendations;
}

/**
 * Generate project-level recommendations
 */
function generateProjectRecommendations(
  flakyTests: FlakyTestResult[],
  health: string
): string[] {
  const recommendations: string[] = [];

  if (flakyTests.length > 0) {
    // Group by category
    const categories = flakyTests.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
    if (topCategory) {
      recommendations.push(
        `Most common flakiness cause: ${topCategory[0]} (${topCategory[1]} tests). Focus remediation efforts here.`
      );
    }
  }

  if (health === "CRITICAL") {
    recommendations.push("Consider implementing a flaky test quarantine strategy");
    recommendations.push("Set up automated flaky test detection in CI/CD");
    recommendations.push("Prioritize fixing tests with highest flakiness scores");
  } else if (health === "DEGRADED") {
    recommendations.push("Schedule regular flaky test triage sessions");
    recommendations.push("Add test stability metrics to team dashboards");
  }

  recommendations.push("Enable automatic retries for known flaky tests");
  recommendations.push("Consider parallel test execution with proper isolation");

  return recommendations;
}

/**
 * Quarantine a flaky test
 */
export async function quarantineTest(testId: string): Promise<void> {
  await db.test.update({
    where: { id: testId },
    data: {
      enabled: false,
      config: {
        quarantined: true,
        quarantinedAt: new Date().toISOString(),
      } as InputJsonValue,
    },
  });
}

/**
 * Unquarantine a test after it's been fixed
 */
export async function unquarantineTest(testId: string): Promise<void> {
  const test = await db.test.findUnique({ where: { id: testId } });
  if (!test) throw new Error("Test not found");

  const config = (test.config as Record<string, unknown>) || {};
  delete config.quarantined;
  delete config.quarantinedAt;

  await db.test.update({
    where: { id: testId },
    data: {
      enabled: true,
      config: config as InputJsonValue,
    },
  });
}

/**
 * Test Impact Analysis Service
 * Maps code changes to affected tests and calculates risk scores
 */

import { db } from "@/lib/db";

export interface ImpactAnalysis {
  affectedTests: Array<{
    testId: string;
    testName: string;
    testType: string;
    impactScore: number; // 0-100
    reason: string;
  }>;
  riskScore: number; // 0-100
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  recommendations: string[];
  estimatedRunTime: number; // seconds
  suggestedTestOrder: string[]; // test IDs in suggested execution order
}

export interface CodeChange {
  file: string;
  additions: number;
  deletions: number;
  diff?: string;
}

export interface DeploymentRisk {
  overall: number;
  breakdown: {
    testCoverage: number;
    historicalFailures: number;
    codeComplexity: number;
    changeSize: number;
  };
  confidence: number;
  factors: string[];
}

/**
 * Analyze the impact of code changes on tests
 */
export async function analyzeImpact(
  projectId: string,
  changes: CodeChange[]
): Promise<ImpactAnalysis> {
  // Get all tests for the project
  const tests = await db.test.findMany({
    where: {
      testSuite: { projectId },
      enabled: true,
    },
    include: {
      results: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  // Get endpoints for mapping
  const endpoints = await db.endpoint.findMany({
    where: { projectId },
  });

  const affectedTests: ImpactAnalysis["affectedTests"] = [];

  for (const test of tests) {
    const impact = calculateTestImpact(test, changes, endpoints);
    if (impact.score > 0) {
      affectedTests.push({
        testId: test.id,
        testName: test.name,
        testType: test.type,
        impactScore: impact.score,
        reason: impact.reason,
      });
    }
  }

  // Sort by impact score
  affectedTests.sort((a, b) => b.impactScore - a.impactScore);

  // Calculate overall risk
  const riskScore = calculateRiskScore(affectedTests, changes);
  const riskLevel = getRiskLevel(riskScore);

  // Estimate run time based on historical data
  const estimatedRunTime = estimateRunTime(affectedTests, tests);

  // Suggest optimal test order
  const suggestedTestOrder = suggestTestOrder(affectedTests);

  return {
    affectedTests,
    riskScore,
    riskLevel,
    recommendations: generateImpactRecommendations(affectedTests, riskLevel),
    estimatedRunTime,
    suggestedTestOrder,
  };
}

/**
 * Calculate impact score for a single test
 */
function calculateTestImpact(
  test: {
    id: string;
    name: string;
    type: string;
    config: unknown;
    results: Array<{ status: string; duration: number | null }>;
  },
  changes: CodeChange[],
  _endpoints: Array<{ path: string; method: string }>
): { score: number; reason: string } {
  let score = 0;
  const reasons: string[] = [];

  const config = (test.config as Record<string, unknown>) || {};
  const testCode = (config.code as string) || "";
  const testName = test.name.toLowerCase();

  for (const change of changes) {
    const fileName = change.file.toLowerCase();
    const fileBase = fileName.split("/").pop()?.replace(/\.[^.]+$/, "") || "";

    // Direct file reference in test
    if (testCode.toLowerCase().includes(fileBase) || testName.includes(fileBase)) {
      score += 50;
      reasons.push(`Test references changed file: ${change.file}`);
    }

    // API endpoint changes
    if (fileName.includes("api") || fileName.includes("route")) {
      // Extract potential endpoint path from file
      const pathMatch = fileName.match(/api\/(.+?)(?:\/route)?/);
      if (pathMatch) {
        const apiPath = `/${pathMatch[1].replace(/\[([^\]]+)\]/g, ":$1")}`;
        if (testCode.includes(apiPath) || testName.includes(apiPath.replace(/\//g, " "))) {
          score += 40;
          reasons.push(`Test may cover API endpoint: ${apiPath}`);
        }
      }
    }

    // Component/module changes
    if (fileName.includes("component") || fileName.includes("lib")) {
      score += 20;
      reasons.push("Changes to shared components/libraries");
    }

    // Configuration changes have high impact
    if (fileName.includes("config") || fileName.includes(".env")) {
      score += 30;
      reasons.push("Configuration changes may affect multiple tests");
    }

    // Large changes are higher risk
    if (change.additions + change.deletions > 100) {
      score += 15;
      reasons.push("Large change size increases risk");
    }
  }

  // Consider test history
  if (test.results.length > 0) {
    const recentFailures = test.results.filter((r) => r.status === "FAILED").length;
    if (recentFailures > test.results.length * 0.3) {
      score += 25;
      reasons.push("Test has recent failures (higher priority)");
    }
  }

  // Consider test type
  if (test.type === "E2E") {
    score *= 1.2; // E2E tests are more likely to be affected by any change
    reasons.push("E2E test (broad coverage)");
  }

  return {
    score: Math.min(100, Math.round(score)),
    reason: reasons.join("; ") || "Low confidence match",
  };
}

/**
 * Calculate overall risk score
 */
function calculateRiskScore(
  affectedTests: ImpactAnalysis["affectedTests"],
  changes: CodeChange[]
): number {
  if (affectedTests.length === 0) return 10; // Base risk

  // Average impact of affected tests
  const avgImpact = affectedTests.reduce((sum, t) => sum + t.impactScore, 0) / affectedTests.length;

  // Factor in change size
  const totalChanges = changes.reduce((sum, c) => sum + c.additions + c.deletions, 0);
  const changeSizeFactor = Math.min(30, totalChanges / 10);

  // Factor in number of affected tests
  const affectedFactor = Math.min(30, affectedTests.length * 5);

  return Math.min(100, Math.round(avgImpact * 0.4 + changeSizeFactor + affectedFactor));
}

/**
 * Get risk level from score
 */
function getRiskLevel(score: number): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
  if (score < 25) return "LOW";
  if (score < 50) return "MEDIUM";
  if (score < 75) return "HIGH";
  return "CRITICAL";
}

/**
 * Estimate total run time for affected tests
 */
function estimateRunTime(
  affectedTests: ImpactAnalysis["affectedTests"],
  allTests: Array<{ id: string; results: Array<{ duration: number | null }> }>
): number {
  let totalMs = 0;

  for (const affected of affectedTests) {
    const test = allTests.find((t) => t.id === affected.testId);
    if (test && test.results.length > 0) {
      const durations = test.results
        .map((r) => r.duration)
        .filter((d): d is number => d !== null);
      if (durations.length > 0) {
        const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
        totalMs += avgDuration;
      } else {
        totalMs += 5000; // Default 5s
      }
    } else {
      totalMs += 5000;
    }
  }

  return Math.round(totalMs / 1000); // Return seconds
}

/**
 * Suggest optimal test execution order
 */
function suggestTestOrder(affectedTests: ImpactAnalysis["affectedTests"]): string[] {
  // Order by:
  // 1. Highest impact first
  // 2. Unit tests before integration before E2E
  const typeOrder = { UNIT: 1, API: 2, INTEGRATION: 3, HEALTH: 4, E2E: 5 };

  return [...affectedTests]
    .sort((a, b) => {
      // First by type
      const typeA = typeOrder[a.testType as keyof typeof typeOrder] || 3;
      const typeB = typeOrder[b.testType as keyof typeof typeOrder] || 3;
      if (typeA !== typeB) return typeA - typeB;

      // Then by impact
      return b.impactScore - a.impactScore;
    })
    .map((t) => t.testId);
}

/**
 * Generate recommendations based on impact analysis
 */
function generateImpactRecommendations(
  affectedTests: ImpactAnalysis["affectedTests"],
  riskLevel: string
): string[] {
  const recommendations: string[] = [];

  if (affectedTests.length === 0) {
    recommendations.push("No tests directly affected - consider adding test coverage for changed code");
    return recommendations;
  }

  if (riskLevel === "CRITICAL" || riskLevel === "HIGH") {
    recommendations.push("Run full test suite before merging");
    recommendations.push("Consider code review by a second engineer");
    recommendations.push("Deploy to staging environment first");
  }

  if (riskLevel === "MEDIUM") {
    recommendations.push("Run affected tests and any smoke tests");
    recommendations.push("Monitor deployment closely");
  }

  // High impact tests
  const highImpact = affectedTests.filter((t) => t.impactScore > 70);
  if (highImpact.length > 0) {
    recommendations.push(
      `${highImpact.length} high-impact test(s) identified - ensure these pass before deployment`
    );
  }

  // E2E tests
  const e2eTests = affectedTests.filter((t) => t.testType === "E2E");
  if (e2eTests.length > 0) {
    recommendations.push(`${e2eTests.length} E2E test(s) affected - verify user flows work correctly`);
  }

  return recommendations;
}

/**
 * Calculate deployment risk score
 */
export async function calculateDeploymentRisk(
  projectId: string,
  changes: CodeChange[]
): Promise<DeploymentRisk> {
  // Get recent test runs
  const recentRuns = await db.testRun.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      results: true,
    },
  });

  // Calculate test coverage score (based on recent pass rate)
  let testCoverage = 100;
  if (recentRuns.length > 0) {
    const totalTests = recentRuns.reduce((sum, r) => sum + r.results.length, 0);
    const passedTests = recentRuns.reduce(
      (sum, r) => sum + r.results.filter((t) => t.status === "PASSED").length,
      0
    );
    testCoverage = totalTests > 0 ? (passedTests / totalTests) * 100 : 50;
  }

  // Calculate historical failures score
  let historicalFailures = 0;
  if (recentRuns.length > 0) {
    const failedRuns = recentRuns.filter((r) => r.status === "FAILED").length;
    historicalFailures = (failedRuns / recentRuns.length) * 100;
  }

  // Calculate change size score
  const totalChanges = changes.reduce((sum, c) => sum + c.additions + c.deletions, 0);
  const changeSize = Math.min(100, totalChanges / 5);

  // Code complexity (simplified - based on file count)
  const codeComplexity = Math.min(100, changes.length * 10);

  // Calculate overall risk
  const overall = Math.round(
    testCoverage * -0.3 + // Higher coverage = lower risk
    historicalFailures * 0.3 +
    changeSize * 0.2 +
    codeComplexity * 0.2 +
    50 // Base
  );

  const factors: string[] = [];
  if (testCoverage < 80) factors.push("Low test pass rate");
  if (historicalFailures > 20) factors.push("Recent test failures");
  if (changeSize > 50) factors.push("Large change size");
  if (codeComplexity > 50) factors.push("Multiple files changed");

  return {
    overall: Math.max(0, Math.min(100, overall)),
    breakdown: {
      testCoverage: Math.round(100 - testCoverage),
      historicalFailures: Math.round(historicalFailures),
      codeComplexity: Math.round(codeComplexity),
      changeSize: Math.round(changeSize),
    },
    confidence: recentRuns.length >= 10 ? 90 : recentRuns.length * 9,
    factors,
  };
}

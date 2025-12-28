/**
 * Analytics Service
 * Provides comprehensive analytics and metrics for the dashboard
 */

import { db } from "@/lib/db";

export interface DashboardMetrics {
  overview: {
    totalTests: number;
    totalRuns: number;
    passRate: number;
    avgDuration: number;
    activeProjects: number;
  };
  trends: {
    passRateHistory: Array<{ date: string; rate: number }>;
    runCountHistory: Array<{ date: string; count: number }>;
    durationHistory: Array<{ date: string; avgDuration: number }>;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: Date;
    status: string;
  }>;
  topFailingTests: Array<{
    testId: string;
    testName: string;
    failureCount: number;
    lastFailure: Date;
  }>;
  healthScore: number;
}

export interface ProjectMetrics {
  projectId: string;
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    skippedTests: number;
    passRate: number;
    avgDuration: number;
    lastRun: Date | null;
  };
  coverage: {
    apiCoverage: number;
    e2eCoverage: number;
    integrationCoverage: number;
    healthCoverage: number;
  };
  performance: {
    p50Duration: number;
    p95Duration: number;
    p99Duration: number;
    slowestTests: Array<{ testName: string; avgDuration: number }>;
  };
  reliability: {
    flakyTestCount: number;
    mttr: number; // Mean time to repair
    mtbf: number; // Mean time between failures
  };
  trends: {
    passRateTrend: "IMPROVING" | "STABLE" | "DECLINING";
    durationTrend: "IMPROVING" | "STABLE" | "DECLINING";
  };
}

export interface TestPerformanceMetrics {
  testId: string;
  name: string;
  type: string;
  metrics: {
    totalRuns: number;
    passRate: number;
    avgDuration: number;
    minDuration: number;
    maxDuration: number;
    p50Duration: number;
    p95Duration: number;
    p99Duration: number;
    flakinessScore: number;
  };
  history: Array<{
    date: string;
    duration: number;
    status: string;
  }>;
}

/**
 * Get dashboard metrics for an organization
 */
export async function getDashboardMetrics(
  organizationId: string,
  timeRangeDays: number = 30
): Promise<DashboardMetrics> {
  const since = new Date(Date.now() - timeRangeDays * 24 * 60 * 60 * 1000);

  // Get projects in organization
  const projects = await db.project.findMany({
    where: { organizationId },
    select: { id: true },
  });

  const projectIds = projects.map((p) => p.id);

  // Get test runs in time range
  const testRuns = await db.testRun.findMany({
    where: {
      projectId: { in: projectIds },
      createdAt: { gte: since },
    },
    include: {
      results: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate overview metrics
  const totalRuns = testRuns.length;
  const totalTests = testRuns.reduce((sum, r) => sum + r.results.length, 0);
  const passedTests = testRuns.reduce(
    (sum, r) => sum + r.results.filter((t) => t.status === "PASSED").length,
    0
  );
  const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
  const avgDuration = calculateAvgDuration(testRuns);

  // Calculate trends
  const trends = calculateTrends(testRuns, timeRangeDays);

  // Get recent activity
  const recentActivity = testRuns.slice(0, 10).map((run) => ({
    id: run.id,
    type: "TEST_RUN",
    description: `${run.trigger} test run`,
    timestamp: run.createdAt,
    status: run.status,
  }));

  // Get top failing tests
  const topFailingTests = await getTopFailingTests(projectIds, since);

  // Calculate health score
  const healthScore = calculateHealthScore(passRate, avgDuration, topFailingTests.length);

  return {
    overview: {
      totalTests,
      totalRuns,
      passRate: Math.round(passRate * 10) / 10,
      avgDuration: Math.round(avgDuration),
      activeProjects: projectIds.length,
    },
    trends,
    recentActivity,
    topFailingTests,
    healthScore,
  };
}

/**
 * Get metrics for a specific project
 */
export async function getProjectMetrics(
  projectId: string,
  timeRangeDays: number = 30
): Promise<ProjectMetrics> {
  const since = new Date(Date.now() - timeRangeDays * 24 * 60 * 60 * 1000);

  // Get test runs
  const testRuns = await db.testRun.findMany({
    where: {
      projectId,
      createdAt: { gte: since },
    },
    include: {
      results: {
        include: { test: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Get all tests
  const tests = await db.test.findMany({
    where: { testSuite: { projectId } },
    include: {
      results: {
        where: { createdAt: { gte: since } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  // Calculate summary
  const allResults = testRuns.flatMap((r) => r.results);
  const summary = {
    totalTests: tests.length,
    passedTests: allResults.filter((r) => r.status === "PASSED").length,
    failedTests: allResults.filter((r) => r.status === "FAILED").length,
    skippedTests: allResults.filter((r) => r.status === "SKIPPED").length,
    passRate: 0,
    avgDuration: 0,
    lastRun: testRuns[0]?.createdAt || null,
  };
  summary.passRate = summary.totalTests > 0
    ? Math.round((summary.passedTests / allResults.length) * 1000) / 10
    : 0;
  summary.avgDuration = calculateAvgDuration(testRuns);

  // Calculate coverage by type
  const testsByType = tests.reduce((acc, t) => {
    acc[t.type] = (acc[t.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalTestCount = tests.length || 1;
  const coverage = {
    apiCoverage: Math.round(((testsByType.API || 0) / totalTestCount) * 100),
    e2eCoverage: Math.round(((testsByType.E2E || 0) / totalTestCount) * 100),
    integrationCoverage: Math.round(((testsByType.INTEGRATION || 0) / totalTestCount) * 100),
    healthCoverage: Math.round(((testsByType.HEALTH || 0) / totalTestCount) * 100),
  };

  // Calculate performance metrics
  const durations = allResults
    .map((r) => r.duration)
    .filter((d): d is number => d !== null)
    .sort((a, b) => a - b);

  const performance = {
    p50Duration: calculatePercentile(durations, 50),
    p95Duration: calculatePercentile(durations, 95),
    p99Duration: calculatePercentile(durations, 99),
    slowestTests: await getSlowestTests(projectId, since),
  };

  // Calculate reliability metrics
  const flakyTests = tests.filter((t) => {
    if (t.results.length < 3) return false;
    const statuses = t.results.map((r) => r.status);
    const hasPass = statuses.includes("PASSED");
    const hasFail = statuses.includes("FAILED");
    return hasPass && hasFail;
  });

  const reliability = {
    flakyTestCount: flakyTests.length,
    mttr: calculateMTTR(testRuns),
    mtbf: calculateMTBF(testRuns),
  };

  // Calculate trends
  const previousPeriod = await getPreviousPeriodMetrics(projectId, timeRangeDays);
  const trends = {
    passRateTrend: getTrend(summary.passRate, previousPeriod.passRate),
    durationTrend: getTrend(previousPeriod.avgDuration, summary.avgDuration), // Lower is better
  };

  return {
    projectId,
    summary,
    coverage,
    performance,
    reliability,
    trends,
  };
}

/**
 * Get performance metrics for a specific test
 */
export async function getTestPerformanceMetrics(
  testId: string,
  timeRangeDays: number = 30
): Promise<TestPerformanceMetrics> {
  const since = new Date(Date.now() - timeRangeDays * 24 * 60 * 60 * 1000);

  const test = await db.test.findUnique({
    where: { id: testId },
    include: {
      results: {
        where: { createdAt: { gte: since } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!test) {
    throw new Error("Test not found");
  }

  const results = test.results;
  const durations = results
    .map((r) => r.duration)
    .filter((d): d is number => d !== null)
    .sort((a, b) => a - b);

  const passedCount = results.filter((r) => r.status === "PASSED").length;

  // Calculate flakiness
  let alternations = 0;
  for (let i = 1; i < results.length; i++) {
    if (results[i].status !== results[i - 1].status) {
      alternations++;
    }
  }
  const flakinessScore = results.length > 1
    ? Math.round((alternations / (results.length - 1)) * 100)
    : 0;

  return {
    testId,
    name: test.name,
    type: test.type,
    metrics: {
      totalRuns: results.length,
      passRate: results.length > 0 ? Math.round((passedCount / results.length) * 1000) / 10 : 0,
      avgDuration: durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : 0,
      minDuration: durations[0] || 0,
      maxDuration: durations[durations.length - 1] || 0,
      p50Duration: calculatePercentile(durations, 50),
      p95Duration: calculatePercentile(durations, 95),
      p99Duration: calculatePercentile(durations, 99),
      flakinessScore,
    },
    history: results.slice(0, 100).map((r) => ({
      date: r.createdAt.toISOString(),
      duration: r.duration || 0,
      status: r.status,
    })),
  };
}

// Helper functions

function calculateAvgDuration(testRuns: Array<{ duration: number | null }>): number {
  const durations = testRuns
    .map((r) => r.duration)
    .filter((d): d is number => d !== null);
  if (durations.length === 0) return 0;
  return Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
}

function calculatePercentile(sortedValues: number[], percentile: number): number {
  if (sortedValues.length === 0) return 0;
  const index = Math.ceil((percentile / 100) * sortedValues.length) - 1;
  return sortedValues[Math.max(0, index)];
}

function calculateTrends(
  testRuns: Array<{ createdAt: Date; results: Array<{ status: string }> }>,
  days: number
): DashboardMetrics["trends"] {
  const dailyData = new Map<string, { passed: number; total: number; duration: number; count: number }>();

  for (const run of testRuns) {
    const date = run.createdAt.toISOString().split("T")[0];
    const existing = dailyData.get(date) || { passed: 0, total: 0, duration: 0, count: 0 };

    existing.total += run.results.length;
    existing.passed += run.results.filter((r) => r.status === "PASSED").length;
    existing.count += 1;
    dailyData.set(date, existing);
  }

  const passRateHistory: Array<{ date: string; rate: number }> = [];
  const runCountHistory: Array<{ date: string; count: number }> = [];
  const durationHistory: Array<{ date: string; avgDuration: number }> = [];

  // Fill in missing days
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const data = dailyData.get(date);

    passRateHistory.push({
      date,
      rate: data ? Math.round((data.passed / data.total) * 100) : 0,
    });
    runCountHistory.push({
      date,
      count: data?.count || 0,
    });
    durationHistory.push({
      date,
      avgDuration: data?.duration ? Math.round(data.duration / data.count) : 0,
    });
  }

  return { passRateHistory, runCountHistory, durationHistory };
}

async function getTopFailingTests(
  projectIds: string[],
  since: Date
): Promise<DashboardMetrics["topFailingTests"]> {
  const failedResults = await db.testResult.groupBy({
    by: ["testId"],
    where: {
      testRun: { projectId: { in: projectIds } },
      status: "FAILED",
      createdAt: { gte: since },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 10,
  });

  const tests = await db.test.findMany({
    where: { id: { in: failedResults.map((r) => r.testId) } },
    include: {
      results: {
        where: { status: "FAILED" },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  return failedResults.map((r) => {
    const test = tests.find((t) => t.id === r.testId);
    return {
      testId: r.testId,
      testName: test?.name || "Unknown",
      failureCount: r._count.id,
      lastFailure: test?.results[0]?.createdAt || new Date(),
    };
  });
}

async function getSlowestTests(
  projectId: string,
  since: Date
): Promise<Array<{ testName: string; avgDuration: number }>> {
  const results = await db.testResult.groupBy({
    by: ["testId"],
    where: {
      testRun: { projectId },
      createdAt: { gte: since },
      duration: { not: null },
    },
    _avg: { duration: true },
    orderBy: { _avg: { duration: "desc" } },
    take: 5,
  });

  const tests = await db.test.findMany({
    where: { id: { in: results.map((r) => r.testId) } },
  });

  return results.map((r) => ({
    testName: tests.find((t) => t.id === r.testId)?.name || "Unknown",
    avgDuration: Math.round(r._avg?.duration || 0),
  }));
}

function calculateHealthScore(
  passRate: number,
  avgDuration: number,
  failingTestCount: number
): number {
  let score = 100;

  // Deduct for low pass rate
  score -= (100 - passRate) * 0.5;

  // Deduct for slow tests (assume >30s average is concerning)
  if (avgDuration > 30000) {
    score -= Math.min(20, (avgDuration - 30000) / 5000);
  }

  // Deduct for failing tests
  score -= Math.min(20, failingTestCount * 2);

  return Math.max(0, Math.round(score));
}

function calculateMTTR(testRuns: Array<{ status: string; createdAt: Date }>): number {
  // Mean Time To Repair - average time from failure to next success
  let totalRepairTime = 0;
  let repairCount = 0;
  let lastFailure: Date | null = null;

  for (const run of testRuns) {
    if (run.status === "FAILED") {
      lastFailure = run.createdAt;
    } else if (run.status === "PASSED" && lastFailure) {
      totalRepairTime += run.createdAt.getTime() - lastFailure.getTime();
      repairCount++;
      lastFailure = null;
    }
  }

  return repairCount > 0 ? Math.round(totalRepairTime / repairCount / 1000 / 60) : 0; // Minutes
}

function calculateMTBF(testRuns: Array<{ status: string; createdAt: Date }>): number {
  // Mean Time Between Failures
  const failures = testRuns.filter((r) => r.status === "FAILED");
  if (failures.length < 2) return 0;

  let totalTime = 0;
  for (let i = 1; i < failures.length; i++) {
    totalTime += failures[i - 1].createdAt.getTime() - failures[i].createdAt.getTime();
  }

  return Math.round(totalTime / (failures.length - 1) / 1000 / 60); // Minutes
}

async function getPreviousPeriodMetrics(
  projectId: string,
  days: number
): Promise<{ passRate: number; avgDuration: number }> {
  const periodEnd = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const periodStart = new Date(periodEnd.getTime() - days * 24 * 60 * 60 * 1000);

  const testRuns = await db.testRun.findMany({
    where: {
      projectId,
      createdAt: { gte: periodStart, lte: periodEnd },
    },
    include: { results: true },
  });

  const allResults = testRuns.flatMap((r) => r.results);
  const passRate = allResults.length > 0
    ? (allResults.filter((r) => r.status === "PASSED").length / allResults.length) * 100
    : 0;

  return {
    passRate,
    avgDuration: calculateAvgDuration(testRuns),
  };
}

function getTrend(current: number, previous: number): "IMPROVING" | "STABLE" | "DECLINING" {
  const diff = current - previous;
  if (Math.abs(diff) < 5) return "STABLE";
  return diff > 0 ? "IMPROVING" : "DECLINING";
}

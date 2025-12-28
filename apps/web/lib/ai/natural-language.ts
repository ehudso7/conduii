/**
 * Natural Language Query Service
 * Enables users to query their test data using natural language
 */

import { chat, generateJSON, isAIConfigured } from "./index";
import { db } from "@/lib/db";
import type { TestType, TestRunStatus } from "@prisma/client";

export interface QueryResult {
  type: "DATA" | "INSIGHT" | "ACTION" | "ERROR";
  answer: string;
  data?: unknown;
  suggestedActions?: Array<{
    label: string;
    action: string;
    params?: Record<string, unknown>;
  }>;
  relatedQueries?: string[];
}

interface ParsedQuery {
  intent:
    | "LIST_TESTS"
    | "LIST_RUNS"
    | "GET_FAILURES"
    | "GET_FLAKY"
    | "GET_METRICS"
    | "EXPLAIN_FAILURE"
    | "COMPARE"
    | "TREND"
    | "UNKNOWN";
  entities: {
    testName?: string;
    projectName?: string;
    timeRange?: string;
    status?: string;
    testType?: string;
    limit?: number;
  };
  filters: Record<string, unknown>;
}

const QUERY_PARSE_SCHEMA = `{
  "intent": "LIST_TESTS | LIST_RUNS | GET_FAILURES | GET_FLAKY | GET_METRICS | EXPLAIN_FAILURE | COMPARE | TREND | UNKNOWN",
  "entities": {
    "testName": "string or null",
    "projectName": "string or null",
    "timeRange": "string like '24h', '7d', '30d' or null",
    "status": "PASSED | FAILED | RUNNING or null",
    "testType": "API | E2E | INTEGRATION | HEALTH or null",
    "limit": "number or null"
  },
  "filters": {}
}`;

/**
 * Process a natural language query
 */
export async function processQuery(
  query: string,
  context: {
    organizationId: string;
    projectId?: string;
    userId: string;
  }
): Promise<QueryResult> {
  if (!isAIConfigured()) {
    return {
      type: "ERROR",
      answer: "AI is not configured. Natural language queries require an AI provider.",
    };
  }

  // Parse the query intent
  const parsedQuery = await parseQuery(query);

  // Execute the query based on intent
  switch (parsedQuery.intent) {
    case "LIST_TESTS":
      return await handleListTests(context, parsedQuery);
    case "LIST_RUNS":
      return await handleListRuns(context, parsedQuery);
    case "GET_FAILURES":
      return await handleGetFailures(context, parsedQuery);
    case "GET_FLAKY":
      return await handleGetFlaky(context, parsedQuery);
    case "GET_METRICS":
      return await handleGetMetrics(context, parsedQuery);
    case "EXPLAIN_FAILURE":
      return await handleExplainFailure(context, parsedQuery, query);
    case "COMPARE":
      return await handleCompare(context, parsedQuery);
    case "TREND":
      return await handleTrend(context, parsedQuery);
    default:
      return await handleGeneralQuery(query, context);
  }
}

/**
 * Parse the user's query to extract intent and entities
 */
async function parseQuery(query: string): Promise<ParsedQuery> {
  const prompt = `Parse this natural language query about test results and extract the intent and entities:

Query: "${query}"

Common intents:
- LIST_TESTS: User wants to see a list of tests (e.g., "show me all tests", "what tests do I have")
- LIST_RUNS: User wants to see test runs (e.g., "show recent runs", "last 10 test runs")
- GET_FAILURES: User wants failed tests (e.g., "show me failures", "what tests failed today")
- GET_FLAKY: User wants flaky tests (e.g., "which tests are flaky", "unreliable tests")
- GET_METRICS: User wants statistics (e.g., "what's my pass rate", "how long do tests take")
- EXPLAIN_FAILURE: User wants to understand a failure (e.g., "why did X fail", "explain this error")
- COMPARE: User wants to compare periods (e.g., "compare this week to last week")
- TREND: User wants trend data (e.g., "how is pass rate trending", "performance over time")
- UNKNOWN: Can't determine intent`;

  try {
    return await generateJSON<ParsedQuery>(prompt, QUERY_PARSE_SCHEMA);
  } catch {
    return {
      intent: "UNKNOWN",
      entities: {},
      filters: {},
    };
  }
}

/**
 * Convert time range string to milliseconds
 */
function parseTimeRange(timeRange?: string): number {
  if (!timeRange) return 7 * 24 * 60 * 60 * 1000; // Default 7 days

  const match = timeRange.match(/(\d+)([hdwm])/i);
  if (!match) return 7 * 24 * 60 * 60 * 1000;

  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();

  switch (unit) {
    case "h":
      return value * 60 * 60 * 1000;
    case "d":
      return value * 24 * 60 * 60 * 1000;
    case "w":
      return value * 7 * 24 * 60 * 60 * 1000;
    case "m":
      return value * 30 * 24 * 60 * 60 * 1000;
    default:
      return 7 * 24 * 60 * 60 * 1000;
  }
}

async function handleListTests(
  context: { organizationId: string; projectId?: string },
  query: ParsedQuery
): Promise<QueryResult> {
  const projects = await db.project.findMany({
    where: context.projectId
      ? { id: context.projectId }
      : { organizationId: context.organizationId },
    select: { id: true },
  });

  const tests = await db.test.findMany({
    where: {
      testSuite: { projectId: { in: projects.map((p) => p.id) } },
      ...(query.entities.testType && { type: query.entities.testType as TestType }),
    },
    take: query.entities.limit || 20,
    include: {
      testSuite: { select: { name: true, project: { select: { name: true } } } },
      _count: { select: { results: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const testList = tests.map((t) => ({
    name: t.name,
    type: t.type,
    suite: t.testSuite?.name,
    project: t.testSuite?.project?.name,
    runs: t._count.results,
  }));

  return {
    type: "DATA",
    answer: `Found ${tests.length} test${tests.length === 1 ? "" : "s"}${query.entities.testType ? ` of type ${query.entities.testType}` : ""}.`,
    data: testList,
    suggestedActions: [
      { label: "Run all tests", action: "RUN_TESTS", params: {} },
      { label: "Show failures only", action: "QUERY", params: { query: "show failed tests" } },
    ],
    relatedQueries: [
      "Show me failed tests",
      "Which tests are flaky?",
      "What's my overall pass rate?",
    ],
  };
}

async function handleListRuns(
  context: { organizationId: string; projectId?: string },
  query: ParsedQuery
): Promise<QueryResult> {
  const since = new Date(Date.now() - parseTimeRange(query.entities.timeRange));

  const projects = await db.project.findMany({
    where: context.projectId
      ? { id: context.projectId }
      : { organizationId: context.organizationId },
    select: { id: true },
  });

  const runs = await db.testRun.findMany({
    where: {
      projectId: { in: projects.map((p) => p.id) },
      createdAt: { gte: since },
      ...(query.entities.status && { status: query.entities.status as TestRunStatus }),
    },
    take: query.entities.limit || 10,
    include: {
      project: { select: { name: true } },
      _count: { select: { results: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const runList = runs.map((r) => ({
    id: r.id,
    project: r.project?.name,
    status: r.status,
    trigger: r.trigger,
    tests: r._count.results,
    duration: r.duration ? `${(r.duration / 1000).toFixed(1)}s` : "N/A",
    date: r.createdAt.toLocaleString(),
  }));

  return {
    type: "DATA",
    answer: `Found ${runs.length} test run${runs.length === 1 ? "" : "s"} in the last ${query.entities.timeRange || "7 days"}.`,
    data: runList,
    suggestedActions: [
      { label: "Start new run", action: "RUN_TESTS", params: {} },
      { label: "View details", action: "VIEW_RUN", params: { runId: runs[0]?.id } },
    ],
    relatedQueries: [
      "Show me failed runs",
      "What's the average run duration?",
      "Compare to last week",
    ],
  };
}

async function handleGetFailures(
  context: { organizationId: string; projectId?: string },
  query: ParsedQuery
): Promise<QueryResult> {
  const since = new Date(Date.now() - parseTimeRange(query.entities.timeRange));

  const projects = await db.project.findMany({
    where: context.projectId
      ? { id: context.projectId }
      : { organizationId: context.organizationId },
    select: { id: true },
  });

  const failures = await db.testResult.findMany({
    where: {
      testRun: { projectId: { in: projects.map((p) => p.id) } },
      status: "FAILED",
      createdAt: { gte: since },
    },
    take: query.entities.limit || 20,
    include: {
      test: { select: { name: true, type: true } },
      testRun: { select: { createdAt: true, project: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const failureList = failures.map((f) => ({
    testName: f.test.name,
    testType: f.test.type,
    project: f.testRun.project?.name,
    error: f.error?.slice(0, 100) || "No error message",
    date: f.createdAt.toLocaleString(),
  }));

  return {
    type: "DATA",
    answer: `Found ${failures.length} failed test${failures.length === 1 ? "" : "s"} in the last ${query.entities.timeRange || "7 days"}.`,
    data: failureList,
    suggestedActions: failures.length > 0
      ? [
          { label: "Analyze failures", action: "ANALYZE_FAILURES", params: {} },
          { label: "View details", action: "VIEW_FAILURE", params: { resultId: failures[0]?.id } },
        ]
      : [],
    relatedQueries: [
      "Why did these tests fail?",
      "Which tests are flaky?",
      "Show failure trends",
    ],
  };
}

async function handleGetFlaky(
  context: { organizationId: string; projectId?: string },
  _query: ParsedQuery
): Promise<QueryResult> {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days

  const projects = await db.project.findMany({
    where: context.projectId
      ? { id: context.projectId }
      : { organizationId: context.organizationId },
    select: { id: true },
  });

  // Get all tests with their recent results
  const tests = await db.test.findMany({
    where: {
      testSuite: { projectId: { in: projects.map((p) => p.id) } },
    },
    include: {
      results: {
        where: { createdAt: { gte: since } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      testSuite: { select: { project: { select: { name: true } } } },
    },
  });

  // Identify flaky tests
  const flakyTests = tests
    .map((t) => {
      if (t.results.length < 5) return null;

      const statuses = t.results.map((r) => r.status);
      const hasPass = statuses.includes("PASSED");
      const hasFail = statuses.includes("FAILED");

      if (!hasPass || !hasFail) return null;

      // Calculate alternation rate
      let alternations = 0;
      for (let i = 1; i < statuses.length; i++) {
        if (statuses[i] !== statuses[i - 1]) alternations++;
      }
      const flakinessScore = (alternations / (statuses.length - 1)) * 100;

      if (flakinessScore < 20) return null;

      return {
        name: t.name,
        type: t.type,
        project: t.testSuite?.project?.name,
        flakinessScore: Math.round(flakinessScore),
        passRate: Math.round(
          (statuses.filter((s) => s === "PASSED").length / statuses.length) * 100
        ),
        runs: statuses.length,
      };
    })
    .filter((t): t is NonNullable<typeof t> => t !== null)
    .sort((a, b) => b.flakinessScore - a.flakinessScore);

  return {
    type: "DATA",
    answer: flakyTests.length > 0
      ? `Found ${flakyTests.length} flaky test${flakyTests.length === 1 ? "" : "s"} with inconsistent results.`
      : "No flaky tests detected in the last 30 days. Great job!",
    data: flakyTests,
    suggestedActions: flakyTests.length > 0
      ? [
          { label: "Quarantine flaky tests", action: "QUARANTINE", params: { testIds: flakyTests.slice(0, 5).map(() => "id") } },
          { label: "Get remediation tips", action: "QUERY", params: { query: "how to fix flaky tests" } },
        ]
      : [],
    relatedQueries: [
      "What causes test flakiness?",
      "Show me test reliability trends",
      "Which tests have timing issues?",
    ],
  };
}

async function handleGetMetrics(
  context: { organizationId: string; projectId?: string },
  query: ParsedQuery
): Promise<QueryResult> {
  const since = new Date(Date.now() - parseTimeRange(query.entities.timeRange));

  const projects = await db.project.findMany({
    where: context.projectId
      ? { id: context.projectId }
      : { organizationId: context.organizationId },
    select: { id: true },
  });

  const runs = await db.testRun.findMany({
    where: {
      projectId: { in: projects.map((p) => p.id) },
      createdAt: { gte: since },
    },
    include: { results: true },
  });

  const allResults = runs.flatMap((r) => r.results);
  const totalTests = allResults.length;
  const passedTests = allResults.filter((r) => r.status === "PASSED").length;
  const failedTests = allResults.filter((r) => r.status === "FAILED").length;
  const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

  const durations = runs.map((r) => r.duration).filter((d): d is number => d !== null);
  const avgDuration = durations.length > 0
    ? durations.reduce((a, b) => a + b, 0) / durations.length
    : 0;

  const metrics = {
    totalRuns: runs.length,
    totalTests,
    passedTests,
    failedTests,
    passRate: Math.round(passRate * 10) / 10,
    avgDuration: `${(avgDuration / 1000).toFixed(1)}s`,
    timeRange: query.entities.timeRange || "7d",
  };

  return {
    type: "INSIGHT",
    answer: `In the last ${query.entities.timeRange || "7 days"}: ${runs.length} test runs, ${passRate.toFixed(1)}% pass rate, average duration ${(avgDuration / 1000).toFixed(1)}s.`,
    data: metrics,
    suggestedActions: [
      { label: "View trends", action: "QUERY", params: { query: "show pass rate trend" } },
      { label: "See failures", action: "QUERY", params: { query: "show failures" } },
    ],
    relatedQueries: [
      "Show pass rate trend over time",
      "Which tests are slowest?",
      "Compare to last month",
    ],
  };
}

async function handleExplainFailure(
  context: { organizationId: string; projectId?: string },
  _query: ParsedQuery,
  originalQuery: string
): Promise<QueryResult> {
  // Get recent failures for context
  const projects = await db.project.findMany({
    where: context.projectId
      ? { id: context.projectId }
      : { organizationId: context.organizationId },
    select: { id: true },
  });

  const recentFailures = await db.testResult.findMany({
    where: {
      testRun: { projectId: { in: projects.map((p) => p.id) } },
      status: "FAILED",
    },
    take: 5,
    include: {
      test: true,
    },
    orderBy: { createdAt: "desc" },
  });

  if (recentFailures.length === 0) {
    return {
      type: "INSIGHT",
      answer: "No recent failures found to explain. Your tests are passing!",
      relatedQueries: ["Show me all tests", "What's my pass rate?"],
    };
  }

  // Use AI to explain
  const response = await chat([
    {
      role: "system",
      content: "You are a test failure analyst. Explain test failures in a clear, actionable way.",
    },
    {
      role: "user",
      content: `User asked: "${originalQuery}"

Recent failures:
${recentFailures
  .map(
    (f) => `- ${f.test.name}: ${f.error || "No error message"}`
  )
  .join("\n")}

Provide a clear explanation of what's likely causing these failures and suggest fixes.`,
    },
  ]);

  return {
    type: "INSIGHT",
    answer: response.content,
    data: recentFailures.map((f) => ({
      test: f.test.name,
      error: f.error?.slice(0, 200),
    })),
    suggestedActions: [
      { label: "View failure details", action: "VIEW_FAILURES", params: {} },
      { label: "Run failed tests", action: "RERUN_FAILED", params: {} },
    ],
    relatedQueries: [
      "How do I fix flaky tests?",
      "Show me test trends",
      "Which tests fail most often?",
    ],
  };
}

async function handleCompare(
  context: { organizationId: string; projectId?: string },
  _query: ParsedQuery
): Promise<QueryResult> {
  const thisWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const lastWeek = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const projects = await db.project.findMany({
    where: context.projectId
      ? { id: context.projectId }
      : { organizationId: context.organizationId },
    select: { id: true },
  });

  const [currentRuns, previousRuns] = await Promise.all([
    db.testRun.findMany({
      where: {
        projectId: { in: projects.map((p) => p.id) },
        createdAt: { gte: thisWeek },
      },
      include: { results: true },
    }),
    db.testRun.findMany({
      where: {
        projectId: { in: projects.map((p) => p.id) },
        createdAt: { gte: lastWeek, lt: thisWeek },
      },
      include: { results: true },
    }),
  ]);

  const currentResults = currentRuns.flatMap((r) => r.results);
  const previousResults = previousRuns.flatMap((r) => r.results);

  const currentPassRate =
    currentResults.length > 0
      ? (currentResults.filter((r) => r.status === "PASSED").length / currentResults.length) * 100
      : 0;
  const previousPassRate =
    previousResults.length > 0
      ? (previousResults.filter((r) => r.status === "PASSED").length / previousResults.length) * 100
      : 0;

  const passRateDiff = currentPassRate - previousPassRate;
  const trend = passRateDiff > 1 ? "improving" : passRateDiff < -1 ? "declining" : "stable";

  const comparison = {
    thisWeek: {
      runs: currentRuns.length,
      tests: currentResults.length,
      passRate: Math.round(currentPassRate * 10) / 10,
    },
    lastWeek: {
      runs: previousRuns.length,
      tests: previousResults.length,
      passRate: Math.round(previousPassRate * 10) / 10,
    },
    change: {
      runs: currentRuns.length - previousRuns.length,
      tests: currentResults.length - previousResults.length,
      passRate: Math.round(passRateDiff * 10) / 10,
    },
    trend,
  };

  return {
    type: "INSIGHT",
    answer: `Comparing this week to last week: Pass rate is ${trend} (${currentPassRate.toFixed(1)}% vs ${previousPassRate.toFixed(1)}%). Test runs: ${currentRuns.length} (${passRateDiff >= 0 ? "+" : ""}${currentRuns.length - previousRuns.length}).`,
    data: comparison,
    relatedQueries: [
      "Show pass rate trend",
      "What tests failed this week?",
      "Show me flaky tests",
    ],
  };
}

async function handleTrend(
  context: { organizationId: string; projectId?: string },
  query: ParsedQuery
): Promise<QueryResult> {
  const days = parseTimeRange(query.entities.timeRange) / (24 * 60 * 60 * 1000);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const projects = await db.project.findMany({
    where: context.projectId
      ? { id: context.projectId }
      : { organizationId: context.organizationId },
    select: { id: true },
  });

  const runs = await db.testRun.findMany({
    where: {
      projectId: { in: projects.map((p) => p.id) },
      createdAt: { gte: since },
    },
    include: { results: true },
    orderBy: { createdAt: "asc" },
  });

  // Group by day
  const dailyData = new Map<string, { passed: number; total: number }>();

  for (const run of runs) {
    const date = run.createdAt.toISOString().split("T")[0];
    const existing = dailyData.get(date) || { passed: 0, total: 0 };
    existing.total += run.results.length;
    existing.passed += run.results.filter((r) => r.status === "PASSED").length;
    dailyData.set(date, existing);
  }

  const trendData = Array.from(dailyData.entries()).map(([date, data]) => ({
    date,
    passRate: data.total > 0 ? Math.round((data.passed / data.total) * 100) : 0,
    tests: data.total,
  }));

  // Calculate trend direction
  let trendDirection = "stable";
  if (trendData.length >= 2) {
    const firstHalf = trendData.slice(0, Math.floor(trendData.length / 2));
    const secondHalf = trendData.slice(Math.floor(trendData.length / 2));
    const firstAvg = firstHalf.reduce((sum, d) => sum + d.passRate, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, d) => sum + d.passRate, 0) / secondHalf.length;
    trendDirection = secondAvg > firstAvg + 2 ? "improving" : secondAvg < firstAvg - 2 ? "declining" : "stable";
  }

  return {
    type: "DATA",
    answer: `Pass rate trend over ${days} days is ${trendDirection}. Average: ${(trendData.reduce((sum, d) => sum + d.passRate, 0) / trendData.length || 0).toFixed(1)}%`,
    data: {
      trend: trendDirection,
      history: trendData,
    },
    relatedQueries: [
      "Compare to last period",
      "Show me failures",
      "Which tests are flaky?",
    ],
  };
}

async function handleGeneralQuery(
  query: string,
  context: { organizationId: string; projectId?: string }
): Promise<QueryResult> {
  // Get some context to help AI answer
  const projects = await db.project.findMany({
    where: context.projectId
      ? { id: context.projectId }
      : { organizationId: context.organizationId },
    select: { id: true, name: true },
  });

  const recentRuns = await db.testRun.findMany({
    where: { projectId: { in: projects.map((p) => p.id) } },
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { results: true },
  });

  const response = await chat([
    {
      role: "system",
      content: `You are a helpful assistant for a test automation platform called Conduii. Help users understand their test results and provide actionable insights.

Context:
- Projects: ${projects.map((p) => p.name).join(", ")}
- Recent runs: ${recentRuns.length}
- Recent status: ${recentRuns.map((r) => r.status).join(", ")}`,
    },
    {
      role: "user",
      content: query,
    },
  ]);

  return {
    type: "INSIGHT",
    answer: response.content,
    relatedQueries: [
      "Show me recent test runs",
      "What's my pass rate?",
      "Show me failed tests",
    ],
  };
}

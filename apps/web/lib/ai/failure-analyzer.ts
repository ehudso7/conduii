/**
 * AI-Powered Failure Analysis Service
 * Provides intelligent root cause analysis and fix suggestions
 */

import { generateJSON, isAIConfigured } from "./index";
import { db } from "@/lib/db";

export interface FailureAnalysis {
  rootCause: string;
  category: "CODE_BUG" | "CONFIGURATION" | "INFRASTRUCTURE" | "FLAKY" | "DATA" | "EXTERNAL_DEPENDENCY" | "UNKNOWN";
  confidence: number;
  explanation: string;
  suggestedFixes: Array<{
    description: string;
    code?: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
    effort: "QUICK" | "MODERATE" | "SIGNIFICANT";
  }>;
  relatedFailures: string[];
  preventionStrategies: string[];
  affectedAreas: string[];
}

export interface FailurePattern {
  pattern: string;
  occurrences: number;
  firstSeen: Date;
  lastSeen: Date;
  commonCauses: string[];
  resolution?: string;
}

const ANALYSIS_SCHEMA = `{
  "rootCause": "string - primary cause of the failure",
  "category": "CODE_BUG | CONFIGURATION | INFRASTRUCTURE | FLAKY | DATA | EXTERNAL_DEPENDENCY | UNKNOWN",
  "confidence": "number 0-100 - confidence in the analysis",
  "explanation": "string - detailed explanation of what went wrong",
  "suggestedFixes": [
    {
      "description": "string - what to do",
      "code": "string - optional code snippet",
      "priority": "HIGH | MEDIUM | LOW",
      "effort": "QUICK | MODERATE | SIGNIFICANT"
    }
  ],
  "relatedFailures": ["array of potentially related failure patterns"],
  "preventionStrategies": ["array of ways to prevent this in the future"],
  "affectedAreas": ["array of affected code areas or services"]
}`;

/**
 * Analyze a test failure and provide root cause analysis
 */
export async function analyzeFailure(
  testRunId: string,
  testResultId: string
): Promise<FailureAnalysis> {
  if (!isAIConfigured()) {
    throw new Error("AI is not configured");
  }

  // Get test result with context
  const result = await db.testResult.findUnique({
    where: { id: testResultId },
    include: {
      test: true,
      testRun: {
        include: {
          project: {
            include: {
              services: true,
            },
          },
        },
      },
    },
  });

  if (!result) {
    throw new Error("Test result not found");
  }

  // Get historical failures for context
  const historicalFailures = await db.testResult.findMany({
    where: {
      testId: result.testId,
      status: "FAILED",
      id: { not: testResultId },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      error: true,
      createdAt: true,
      metadata: true,
    },
  });

  // Get recent diagnostics
  const recentDiagnostics = await db.diagnostic.findMany({
    where: {
      testRun: {
        projectId: result.testRun.projectId,
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const prompt = `Analyze this test failure and provide detailed root cause analysis:

Test Name: ${result.test.name}
Test Type: ${result.test.type}
Error Message: ${result.error || "No error message"}
Duration: ${result.duration}ms

Test Configuration:
${JSON.stringify(result.test.config, null, 2)}

Result Metadata:
${JSON.stringify(result.metadata, null, 2)}

Historical Failures (same test):
${historicalFailures.map((f: { createdAt: Date; error: string | null }) => `- ${f.createdAt}: ${f.error}`).join("\n") || "None"}

Recent Diagnostics in Project:
${recentDiagnostics.map((d: { severity: string; issue: string }) => `- ${d.severity}: ${d.issue}`).join("\n") || "None"}

Project Services:
${result.testRun.project.services.map((s: { name: string; type: string; status: string }) => `- ${s.name} (${s.type}): ${s.status}`).join("\n") || "None"}

Analyze this failure considering:
1. Is this a recurring issue or new?
2. What is the most likely root cause?
3. Are there patterns with other failures?
4. What's the quickest path to resolution?
5. How can we prevent this in the future?`;

  const analysis = await generateJSON<FailureAnalysis>(prompt, ANALYSIS_SCHEMA);

  // Store the analysis as a diagnostic
  await db.diagnostic.create({
    data: {
      testRunId,
      severity: analysis.confidence > 80 ? "ERROR" : analysis.confidence > 50 ? "WARNING" : "INFO",
      issue: analysis.rootCause,
      component: result.test.name,
      description: analysis.explanation,
      suggestions: analysis.suggestedFixes.map((f) => f.description),
    },
  });

  return analysis;
}

/**
 * Detect patterns across multiple failures
 */
export async function detectFailurePatterns(
  projectId: string,
  timeRangeHours: number = 168 // 1 week
): Promise<FailurePattern[]> {
  const since = new Date(Date.now() - timeRangeHours * 60 * 60 * 1000);

  const failures = await db.testResult.findMany({
    where: {
      testRun: { projectId },
      status: "FAILED",
      createdAt: { gte: since },
    },
    include: {
      test: true,
    },
    orderBy: { createdAt: "desc" },
  });

  if (failures.length === 0) {
    return [];
  }

  // Group failures by error similarity
  const errorGroups = new Map<string, typeof failures>();

  for (const failure of failures) {
    // Normalize error message for grouping
    const normalizedError = normalizeError(failure.error || "Unknown error");
    const existing = errorGroups.get(normalizedError) || [];
    existing.push(failure);
    errorGroups.set(normalizedError, existing);
  }

  // Convert to patterns
  const patterns: FailurePattern[] = [];

  for (const [pattern, group] of errorGroups) {
    if (group.length >= 2) {
      // Only include patterns with multiple occurrences
      patterns.push({
        pattern,
        occurrences: group.length,
        firstSeen: group[group.length - 1].createdAt,
        lastSeen: group[0].createdAt,
        commonCauses: await inferCausesForPattern(pattern, group),
        resolution: undefined,
      });
    }
  }

  return patterns.sort((a, b) => b.occurrences - a.occurrences);
}

/**
 * Normalize error messages for pattern detection
 */
function normalizeError(error: string): string {
  return error
    .replace(/\d+/g, "N") // Replace numbers
    .replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, "UUID") // Replace UUIDs
    .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g, "TIMESTAMP") // Replace timestamps
    .replace(/https?:\/\/[^\s]+/g, "URL") // Replace URLs
    .slice(0, 200); // Limit length
}

/**
 * Infer common causes for a failure pattern
 */
async function inferCausesForPattern(
  pattern: string,
  _failures: Array<{ error: string | null; test: { name: string; type: string } }>
): Promise<string[]> {
  // Use heuristics for common patterns
  const causes: string[] = [];

  if (pattern.includes("timeout") || pattern.includes("ETIMEDOUT")) {
    causes.push("Network latency or connectivity issues");
    causes.push("Service under heavy load");
    causes.push("Database connection pool exhaustion");
  }

  if (pattern.includes("connection refused") || pattern.includes("ECONNREFUSED")) {
    causes.push("Service not running or crashed");
    causes.push("Incorrect service URL or port");
    causes.push("Firewall or network policy blocking");
  }

  if (pattern.includes("401") || pattern.includes("unauthorized")) {
    causes.push("Invalid or expired authentication token");
    causes.push("Missing authentication credentials");
    causes.push("Permission changes");
  }

  if (pattern.includes("500") || pattern.includes("internal server error")) {
    causes.push("Unhandled exception in server code");
    causes.push("Database query failure");
    causes.push("External dependency failure");
  }

  if (pattern.includes("assert") || pattern.includes("expect")) {
    causes.push("Business logic change");
    causes.push("Data format change");
    causes.push("API response structure change");
  }

  if (causes.length === 0) {
    causes.push("Unknown - requires manual investigation");
  }

  return causes;
}

/**
 * Get correlated failures that might have the same root cause
 */
export async function getCorrelatedFailures(
  testResultId: string
): Promise<Array<{ testId: string; testName: string; correlation: number }>> {
  const result = await db.testResult.findUnique({
    where: { id: testResultId },
    include: { test: true, testRun: true },
  });

  if (!result) return [];

  // Find failures that occurred around the same time
  const timeWindow = 5 * 60 * 1000; // 5 minutes
  const correlatedResults = await db.testResult.findMany({
    where: {
      testRun: { projectId: result.testRun.projectId },
      status: "FAILED",
      createdAt: {
        gte: new Date(result.createdAt.getTime() - timeWindow),
        lte: new Date(result.createdAt.getTime() + timeWindow),
      },
      id: { not: testResultId },
    },
    include: { test: true },
  });

  // Calculate correlation score based on:
  // - Same error pattern
  // - Same time window
  // - Related test types
  type CorrelatedResult = { createdAt: Date; error: string | null; testId: string; test: { name: string; type: string } };
  return correlatedResults
    .map((r: CorrelatedResult) => {
      let correlation = 0;

      // Time proximity
      const timeDiff = Math.abs(r.createdAt.getTime() - result.createdAt.getTime());
      correlation += (1 - timeDiff / timeWindow) * 30;

      // Error similarity
      if (r.error && result.error) {
        const similarity = calculateStringSimilarity(r.error, result.error);
        correlation += similarity * 50;
      }

      // Same test type
      if (r.test.type === result.test.type) {
        correlation += 20;
      }

      return {
        testId: r.testId,
        testName: r.test.name,
        correlation: Math.min(100, Math.round(correlation)),
      };
    })
    .filter((r: { correlation: number }) => r.correlation > 30)
    .sort((a: { correlation: number }, b: { correlation: number }) => b.correlation - a.correlation);
}

/**
 * Simple string similarity calculation
 */
function calculateStringSimilarity(a: string, b: string): number {
  const setA = new Set(a.toLowerCase().split(/\s+/));
  const setB = new Set(b.toLowerCase().split(/\s+/));
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, requireProjectAccess, handleApiError } from "@/lib/auth";
import { z } from "zod";

const createTestRunSchema = z.object({
  projectId: z.string(),
  environmentId: z.string().optional(),
  testSuiteId: z.string().optional(),
  testType: z.enum(["all", "health", "integration", "api", "e2e"]).default("all"),
});

// GET /api/test-runs - List test runs
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const projectId = req.nextUrl.searchParams.get("projectId");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "20");

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      );
    }

    await requireProjectAccess(projectId, user.id);

    const testRuns = await db.testRun.findMany({
      where: { projectId },
      include: {
        environment: {
          select: { id: true, name: true },
        },
        testSuite: {
          select: { id: true, name: true },
        },
        triggeredBy: {
          select: { id: true, name: true, imageUrl: true },
        },
        _count: {
          select: { results: true, diagnostics: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ testRuns });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/test-runs - Create a new test run
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { projectId, environmentId, testSuiteId, testType } =
      createTestRunSchema.parse(body);

    await requireProjectAccess(projectId, user.id);

    // Create the test run
    const testRun = await db.testRun.create({
      data: {
        projectId,
        environmentId,
        testSuiteId,
        triggeredById: user.id,
        trigger: "MANUAL",
        status: "PENDING",
        metadata: { testType },
      },
      include: {
        environment: true,
        testSuite: true,
      },
    });

    // In a real implementation, this would trigger the actual test execution
    // For now, we'll simulate starting the test run
    await simulateTestRun(testRun.id, projectId, testType);

    return NextResponse.json({ testRun }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    return handleApiError(error);
  }
}

// Simulate test execution (in production, this would be a background job)
async function simulateTestRun(
  testRunId: string,
  projectId: string,
  testType: string
) {
  // Update status to running
  await db.testRun.update({
    where: { id: testRunId },
    data: {
      status: "RUNNING",
      startedAt: new Date(),
    },
  });

  // Get project services
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      services: true,
      endpoints: true,
    },
  });

  if (!project) return;

  const results: Array<{
    testId: string;
    status: "PASSED" | "FAILED" | "SKIPPED";
    duration: number;
    error?: string;
  }> = [];

  // Create tests and results based on services
  for (const service of project.services) {
    // Health check test
    if (testType === "all" || testType === "health") {
      const test = await db.test.create({
        data: {
          name: `Health Check: ${service.name}`,
          type: "HEALTH",
          serviceId: service.id,
        },
      });

      results.push({
        testId: test.id,
        status: Math.random() > 0.1 ? "PASSED" : "FAILED",
        duration: Math.floor(Math.random() * 500) + 50,
      });
    }

    // Integration test
    if (testType === "all" || testType === "integration") {
      const test = await db.test.create({
        data: {
          name: `Integration: ${service.name} Connection`,
          type: "INTEGRATION",
          serviceId: service.id,
        },
      });

      results.push({
        testId: test.id,
        status: Math.random() > 0.15 ? "PASSED" : "FAILED",
        duration: Math.floor(Math.random() * 1000) + 100,
      });
    }
  }

  // API tests
  if (testType === "all" || testType === "api") {
    for (const endpoint of project.endpoints.slice(0, 5)) {
      const test = await db.test.create({
        data: {
          name: `API: ${endpoint.method} ${endpoint.path}`,
          type: "API",
          endpointId: endpoint.id,
        },
      });

      results.push({
        testId: test.id,
        status: Math.random() > 0.1 ? "PASSED" : "FAILED",
        duration: Math.floor(Math.random() * 500) + 50,
      });
    }
  }

  // Create test results
  for (const result of results) {
    await db.testResult.create({
      data: {
        testRunId,
        testId: result.testId,
        status: result.status,
        duration: result.duration,
        error: result.status === "FAILED" ? "Simulated failure" : null,
      },
    });
  }

  // Calculate summary
  const passed = results.filter((r) => r.status === "PASSED").length;
  const failed = results.filter((r) => r.status === "FAILED").length;
  const skipped = results.filter((r) => r.status === "SKIPPED").length;
  const duration = results.reduce((acc, r) => acc + r.duration, 0);

  // Update test run with results
  await db.testRun.update({
    where: { id: testRunId },
    data: {
      status: failed === 0 ? "PASSED" : "FAILED",
      finishedAt: new Date(),
      duration,
      summary: {
        total: results.length,
        passed,
        failed,
        skipped,
      },
    },
  });

  // Create diagnostics for failures
  if (failed > 0) {
    await db.diagnostic.create({
      data: {
        testRunId,
        severity: "ERROR",
        issue: "Test failures detected",
        component: "test-runner",
        description: `${failed} test(s) failed during execution`,
        suggestions: [
          "Check service credentials are configured correctly",
          "Verify the deployment URL is accessible",
          "Review the error messages for each failed test",
        ],
      },
    });
  }
}

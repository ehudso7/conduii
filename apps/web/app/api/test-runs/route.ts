import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, requireProjectAccess, handleApiError } from "@/lib/auth";
import { executeTestRun } from "@/lib/test-runner";
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

    // Check usage limits
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: { organization: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const org = project.organization;
    if (org.testRunLimit !== -1 && org.testRunsUsed >= org.testRunLimit) {
      return NextResponse.json(
        { error: "Test run limit reached. Please upgrade your plan." },
        { status: 403 }
      );
    }

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

    // Increment usage counter
    await db.organization.update({
      where: { id: org.id },
      data: { testRunsUsed: { increment: 1 } },
    });

    // Execute tests in background (non-blocking)
    executeTestRun(testRun.id, projectId, { testType, testSuiteId }).catch(
      (error) => console.error("Test execution error:", error)
    );

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

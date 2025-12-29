import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { requireAuth, requireProjectAccess, handleApiError } from "@/lib/auth";
import { executeTestRun } from "@/lib/test-runner";
import { rateLimit, RATE_LIMITS, getRateLimitHeaders } from "@/lib/rate-limit";
import { z } from "zod";

export const dynamic = "force-dynamic";

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
    const limitParam = req.nextUrl.searchParams.get("limit");
    const parsedLimit = limitParam ? parseInt(limitParam, 10) : 20;
    const limit = Number.isNaN(parsedLimit) ? 20 : Math.min(Math.max(parsedLimit, 1), 100);

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

    // Rate limit by user ID
    const rateLimitResult = rateLimit(`test-run:${user.id}`, RATE_LIMITS.testRuns);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait before running more tests." },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

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

    // Create test run and increment usage in a transaction
    const testRun = await db.$transaction(async (tx: Prisma.TransactionClient) => {
      const run = await tx.testRun.create({
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

      await tx.organization.update({
        where: { id: org.id },
        data: { testRunsUsed: { increment: 1 } },
      });

      return run;
    });

    // Execute tests in background (non-blocking)
    executeTestRun(testRun.id, projectId, { testType, testSuiteId }).catch(
      async (error) => {
        console.error("Test execution error:", error);
        // Update test run status to FAILED on error
        await db.testRun.update({
          where: { id: testRun.id },
          data: { status: "FAILED", finishedAt: new Date() },
        }).catch((e: unknown) => console.error("Failed to update test run status:", e));
      }
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

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, requireProjectAccess, handleApiError } from "@/lib/auth";
import { canRunTests } from "@/lib/stripe";
import { notifyTestRunStatus } from "@/lib/notifications";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

// GET /api/projects/[projectId]/runs - List test runs
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { projectId } = await context.params;
    await requireProjectAccess(projectId, user.id);

    const { searchParams } = req.nextUrl;
    const limitParam = searchParams.get("limit");
    const parsedLimit = limitParam ? parseInt(limitParam, 10) : 20;
    const limit = Number.isNaN(parsedLimit) ? 20 : Math.min(Math.max(parsedLimit, 1), 100);
    const cursor = searchParams.get("cursor");

    const runs = await db.testRun.findMany({
      where: { projectId },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        environment: {
          select: { name: true },
        },
        triggeredBy: {
          select: { name: true, imageUrl: true },
        },
        _count: {
          select: { results: true },
        },
      },
    });

    let nextCursor: string | undefined = undefined;
    if (runs.length > limit) {
      const nextItem = runs.pop();
      nextCursor = nextItem?.id;
    }

    return NextResponse.json({
      testRuns: runs,
      nextCursor,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/projects/[projectId]/runs - Start a new test run
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { projectId } = await context.params;
    const project = await requireProjectAccess(projectId, user.id);

    const body = await req.json();
    const { testSuiteId, environmentId, testType } = body;

    // Check usage limits
    const org = await db.organization.findUnique({
      where: { id: project.organizationId },
    });

    if (!org || !canRunTests(org.testRunsUsed, org.plan)) {
      return NextResponse.json(
        { error: "Test run limit reached. Upgrade your plan." },
        { status: 403 }
      );
    }

    // Get test suite
    let suiteId = testSuiteId;
    if (!suiteId) {
      const defaultSuite = await db.testSuite.findFirst({
        where: { projectId, isDefault: true },
      });
      suiteId = defaultSuite?.id;
    }

    // Create test run
    const testRun = await db.testRun.create({
      data: {
        projectId,
        testSuiteId: suiteId,
        environmentId,
        triggeredById: user.id,
        trigger: "MANUAL",
        status: "PENDING",
        metadata: { testType: testType ?? "all" },
      },
    });

    // Increment usage
    await db.organization.update({
      where: { id: project.organizationId },
      data: { testRunsUsed: { increment: 1 } },
    });

    // In a real app, you would trigger the actual test execution here
    // For now, we'll simulate starting the run
    await db.testRun.update({
      where: { id: testRun.id },
      data: {
        status: "RUNNING",
        startedAt: new Date(),
      },
    });

    // Create notification for test run started
    await notifyTestRunStatus(
      testRun.id,
      "RUNNING",
      project.name,
      project.id,
      user.id
    );

    return NextResponse.json({ testRun }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

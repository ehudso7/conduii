import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, handleApiError } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateTestRunSchema = z.object({
  status: z.enum(["CANCELLED"]),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/test-runs/[id] - Get test run details
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { id: testRunId } = await context.params;

    const testRun = await db.testRun.findUnique({
      where: { id: testRunId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            organizationId: true,
          },
        },
        environment: {
          select: {
            id: true,
            name: true,
            url: true,
          },
        },
        testSuite: {
          select: {
            id: true,
            name: true,
          },
        },
        triggeredBy: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
        results: {
          orderBy: { createdAt: "asc" },
        },
        diagnostics: {
          orderBy: { severity: "asc" },
        },
      },
    });

    if (!testRun) {
      return NextResponse.json(
        { error: "Test run not found" },
        { status: 404 }
      );
    }

    // Verify user has access to this project
    const membership = await db.organizationMember.findFirst({
      where: {
        userId: user.id,
        organizationId: testRun.project.organizationId,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    return NextResponse.json({ testRun });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/test-runs/[id] - Update test run (cancel, etc.)
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { id: testRunId } = await context.params;
    const body = await req.json();

    // Validate that only allowed status values can be set
    const { status } = updateTestRunSchema.parse(body);

    const testRun = await db.testRun.findUnique({
      where: { id: testRunId },
      include: {
        project: {
          select: {
            organizationId: true,
          },
        },
      },
    });

    if (!testRun) {
      return NextResponse.json(
        { error: "Test run not found" },
        { status: 404 }
      );
    }

    // Verify user has access
    const membership = await db.organizationMember.findFirst({
      where: {
        userId: user.id,
        organizationId: testRun.project.organizationId,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Only allow cancellation of running/pending tests
    if (status === "CANCELLED") {
      if (testRun.status !== "RUNNING" && testRun.status !== "PENDING") {
        return NextResponse.json(
          { error: "Can only cancel running or pending tests" },
          { status: 400 }
        );
      }
    }

    const updatedTestRun = await db.testRun.update({
      where: { id: testRunId },
      data: {
        status,
        finishedAt: status === "CANCELLED" ? new Date() : undefined,
      },
    });

    return NextResponse.json({ testRun: updatedTestRun });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid status value. Only 'CANCELLED' is allowed." },
        { status: 400 }
      );
    }
    return handleApiError(error);
  }
}

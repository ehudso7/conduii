import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, handleApiError } from "@/lib/auth";

// GET /api/test-runs/[id] - Get test run details
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const testRunId = params.id;

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
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const testRunId = params.id;
    const body = await req.json();
    const { status } = body;

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
        completedAt: status === "CANCELLED" ? new Date() : undefined,
      },
    });

    return NextResponse.json({ testRun: updatedTestRun });
  } catch (error) {
    return handleApiError(error);
  }
}

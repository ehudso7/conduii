import { NextRequest, NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const notificationsSchema = z.object({
  testFailures: z.boolean().optional(),
  serviceHealth: z.boolean().optional(),
  weeklyDigest: z.boolean().optional(),
  securityAlerts: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
});

// GET /api/user/notifications - Get user notifications
export async function GET() {
  try {
    const user = await requireAuth();

    // Fetch recent test runs for this user's organizations to generate notifications
    const recentTestRuns = await db.testRun.findMany({
      where: {
        project: {
          organization: {
            members: {
              some: { userId: user.id },
            },
          },
        },
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      include: {
        project: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Transform test runs into notifications
    const notifications = recentTestRuns.map((run: typeof recentTestRuns[0]) => ({
      id: run.id,
      type: run.status === "PASSED" ? "success" : run.status === "FAILED" ? "error" : "info",
      title:
        run.status === "PASSED"
          ? "Test run completed"
          : run.status === "FAILED"
          ? "Test run failed"
          : "Test run in progress",
      description:
        run.status === "PASSED"
          ? `All tests passed for ${run.project.name}`
          : run.status === "FAILED"
          ? `Some tests failed for ${run.project.name}`
          : `Running tests for ${run.project.name}`,
      timestamp: run.createdAt,
      read: false,
      link: `/dashboard/projects/${run.projectId}/runs/${run.id}`,
    }));

    return NextResponse.json({ notifications });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/user/notifications - Update notification preferences
export async function PATCH(req: NextRequest) {
  try {
    await requireAuth();
    const body = await req.json();
    const data = notificationsSchema.parse(body);

    // For now, we just acknowledge the update
    // In a production app, you would store these preferences in the database

    return NextResponse.json({
      success: true,
      message: "Notification preferences updated",
      preferences: data,
    });
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

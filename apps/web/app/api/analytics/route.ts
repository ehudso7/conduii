import { NextRequest, NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  getDashboardMetrics,
  getProjectMetrics,
  getTestPerformanceMetrics,
} from "@/lib/analytics/index";
import { z } from "zod";

export const dynamic = "force-dynamic";

const dashboardSchema = z.object({
  type: z.literal("dashboard"),
  organizationId: z.string().optional(),
  timeRangeDays: z.number().min(1).max(365).optional(),
});

const projectSchema = z.object({
  type: z.literal("project"),
  projectId: z.string(),
  timeRangeDays: z.number().min(1).max(365).optional(),
});

const testSchema = z.object({
  type: z.literal("test"),
  testId: z.string(),
  timeRangeDays: z.number().min(1).max(365).optional(),
});

const requestSchema = z.union([dashboardSchema, projectSchema, testSchema]);

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const data = requestSchema.parse(body);

    switch (data.type) {
      case "dashboard": {
        // Get user's organization if not specified
        let organizationId: string;

        if (data.organizationId) {
          // Verify access
          const membership = await db.organizationMember.findFirst({
            where: {
              userId: user.id,
              organizationId: data.organizationId,
            },
          });

          if (!membership) {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
          }
          organizationId = data.organizationId;
        } else {
          const membership = await db.organizationMember.findFirst({
            where: { userId: user.id },
            select: { organizationId: true },
          });

          if (!membership) {
            return NextResponse.json(
              { error: "No organization found" },
              { status: 400 }
            );
          }

          organizationId = membership.organizationId;
        }

        const metrics = await getDashboardMetrics(
          organizationId,
          data.timeRangeDays
        );
        return NextResponse.json({ metrics });
      }

      case "project": {
        // Verify project access
        const project = await db.project.findUnique({
          where: { id: data.projectId },
          select: { organizationId: true },
        });

        if (!project) {
          return NextResponse.json(
            { error: "Project not found" },
            { status: 404 }
          );
        }

        const membership = await db.organizationMember.findFirst({
          where: {
            userId: user.id,
            organizationId: project.organizationId,
          },
        });

        if (!membership) {
          return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        const metrics = await getProjectMetrics(
          data.projectId,
          data.timeRangeDays
        );
        return NextResponse.json({ metrics });
      }

      case "test": {
        // Verify test access
        const test = await db.test.findUnique({
          where: { id: data.testId },
          include: {
            testSuite: {
              include: {
                project: { select: { organizationId: true } },
              },
            },
          },
        });

        if (!test || !test.testSuite) {
          return NextResponse.json(
            { error: "Test not found" },
            { status: 404 }
          );
        }

        const membership = await db.organizationMember.findFirst({
          where: {
            userId: user.id,
            organizationId: test.testSuite.project.organizationId,
          },
        });

        if (!membership) {
          return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        const metrics = await getTestPerformanceMetrics(
          data.testId,
          data.timeRangeDays
        );
        return NextResponse.json({ metrics });
      }
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      );
    }
    return handleApiError(error);
  }
}

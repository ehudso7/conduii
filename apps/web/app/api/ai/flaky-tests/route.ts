import { NextRequest, NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  analyzeProjectForFlakyTests,
  quarantineTest,
  unquarantineTest,
} from "@/lib/ai/flaky-detector";
import { z } from "zod";

export const dynamic = "force-dynamic";

const analyzeSchema = z.object({
  action: z.literal("analyze"),
  projectId: z.string(),
  minRuns: z.number().optional(),
  timeRangeDays: z.number().optional(),
  flakinessThreshold: z.number().min(0).max(100).optional(),
});

const quarantineSchema = z.object({
  action: z.literal("quarantine"),
  testId: z.string(),
});

const unquarantineSchema = z.object({
  action: z.literal("unquarantine"),
  testId: z.string(),
});

const requestSchema = z.union([analyzeSchema, quarantineSchema, unquarantineSchema]);

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const data = requestSchema.parse(body);

    switch (data.action) {
      case "analyze": {
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

        const analysis = await analyzeProjectForFlakyTests(data.projectId, {
          minRuns: data.minRuns,
          timeRangeDays: data.timeRangeDays,
          flakinessThreshold: data.flakinessThreshold,
        });

        return NextResponse.json({ analysis });
      }

      case "quarantine": {
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

        await quarantineTest(data.testId);

        return NextResponse.json({
          success: true,
          message: "Test quarantined successfully",
        });
      }

      case "unquarantine": {
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

        await unquarantineTest(data.testId);

        return NextResponse.json({
          success: true,
          message: "Test unquarantined successfully",
        });
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

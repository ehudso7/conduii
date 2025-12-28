import { NextRequest, NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  analyzeFailure,
  detectFailurePatterns,
  getCorrelatedFailures,
} from "@/lib/ai/failure-analyzer";
import { z } from "zod";

export const dynamic = "force-dynamic";

const analyzeFailureSchema = z.object({
  type: z.literal("analyze"),
  testRunId: z.string(),
  testResultId: z.string(),
});

const detectPatternsSchema = z.object({
  type: z.literal("patterns"),
  projectId: z.string(),
  timeRangeHours: z.number().optional(),
});

const correlatedFailuresSchema = z.object({
  type: z.literal("correlated"),
  testResultId: z.string(),
});

const requestSchema = z.union([
  analyzeFailureSchema,
  detectPatternsSchema,
  correlatedFailuresSchema,
]);

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const data = requestSchema.parse(body);

    switch (data.type) {
      case "analyze": {
        // Verify access
        const testRun = await db.testRun.findUnique({
          where: { id: data.testRunId },
          include: { project: { select: { organizationId: true } } },
        });

        if (!testRun) {
          return NextResponse.json(
            { error: "Test run not found" },
            { status: 404 }
          );
        }

        const membership = await db.organizationMember.findFirst({
          where: {
            userId: user.id,
            organizationId: testRun.project.organizationId,
          },
        });

        if (!membership) {
          return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        const analysis = await analyzeFailure(data.testRunId, data.testResultId);
        return NextResponse.json({ analysis });
      }

      case "patterns": {
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

        const patterns = await detectFailurePatterns(
          data.projectId,
          data.timeRangeHours
        );
        return NextResponse.json({ patterns });
      }

      case "correlated": {
        // Verify access via test result
        const testResult = await db.testResult.findUnique({
          where: { id: data.testResultId },
          include: {
            testRun: { include: { project: { select: { organizationId: true } } } },
          },
        });

        if (!testResult) {
          return NextResponse.json(
            { error: "Test result not found" },
            { status: 404 }
          );
        }

        const membership = await db.organizationMember.findFirst({
          where: {
            userId: user.id,
            organizationId: testResult.testRun.project.organizationId,
          },
        });

        if (!membership) {
          return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        const correlated = await getCorrelatedFailures(data.testResultId);
        return NextResponse.json({ correlated });
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

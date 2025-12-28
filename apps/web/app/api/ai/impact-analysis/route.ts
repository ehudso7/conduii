import { NextRequest, NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/auth";
import { db } from "@/lib/db";
import { analyzeImpact, calculateDeploymentRisk } from "@/lib/ai/impact-analyzer";
import { z } from "zod";

export const dynamic = "force-dynamic";

const codeChangeSchema = z.object({
  file: z.string(),
  additions: z.number(),
  deletions: z.number(),
  diff: z.string().optional(),
});

const analyzeImpactSchema = z.object({
  action: z.literal("analyze"),
  projectId: z.string(),
  changes: z.array(codeChangeSchema),
});

const deploymentRiskSchema = z.object({
  action: z.literal("risk"),
  projectId: z.string(),
  changes: z.array(codeChangeSchema),
});

const requestSchema = z.union([analyzeImpactSchema, deploymentRiskSchema]);

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const data = requestSchema.parse(body);

    // Verify project access
    const project = await db.project.findUnique({
      where: { id: data.projectId },
      select: { organizationId: true, name: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
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

    switch (data.action) {
      case "analyze": {
        const impact = await analyzeImpact(data.projectId, data.changes);
        return NextResponse.json({ impact });
      }

      case "risk": {
        const risk = await calculateDeploymentRisk(data.projectId, data.changes);
        return NextResponse.json({ risk });
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

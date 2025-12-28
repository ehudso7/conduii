import { NextRequest, NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/auth";
import { db } from "@/lib/db";
import { processQuery } from "@/lib/ai/natural-language";
import { z } from "zod";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  query: z.string().min(1).max(1000),
  projectId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { query, projectId } = querySchema.parse(body);

    // Get user's organization
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

    // If projectId provided, verify access
    if (projectId) {
      const project = await db.project.findUnique({
        where: { id: projectId },
        select: { organizationId: true },
      });

      if (!project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }

      if (project.organizationId !== membership.organizationId) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    const result = await processQuery(query, {
      organizationId: membership.organizationId,
      projectId,
      userId: user.id,
    });

    return NextResponse.json({ result });
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

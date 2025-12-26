import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, requireProjectAccess, handleApiError } from "@/lib/auth";
import { z } from "zod";

const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  repoUrl: z.string().url().optional().nullable(),
  config: z.record(z.unknown()).optional(),
});

// GET /api/projects/[projectId]
export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const user = await requireAuth();
    await requireProjectAccess(params.projectId, user.id);

    const project = await db.project.findUnique({
      where: { id: params.projectId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            plan: true,
          },
        },
        services: {
          orderBy: { name: "asc" },
        },
        endpoints: {
          orderBy: { path: "asc" },
          take: 20,
        },
        environments: {
          orderBy: { name: "asc" },
        },
        testSuites: {
          include: {
            _count: {
              select: { tests: true },
            },
          },
        },
        testRuns: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            status: true,
            trigger: true,
            duration: true,
            summary: true,
            createdAt: true,
            environment: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            services: true,
            endpoints: true,
            testRuns: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/projects/[projectId]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const user = await requireAuth();
    await requireProjectAccess(params.projectId, user.id);

    const body = await req.json();
    const data = updateProjectSchema.parse(body);

    const project = await db.project.update({
      where: { id: params.projectId },
      data,
    });

    return NextResponse.json({ project });
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

// DELETE /api/projects/[projectId]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const user = await requireAuth();
    await requireProjectAccess(params.projectId, user.id);

    await db.project.delete({
      where: { id: params.projectId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

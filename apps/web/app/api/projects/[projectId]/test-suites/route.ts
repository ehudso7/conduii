import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireProjectAccess, handleApiError } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const createTestSuiteSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

// GET /api/projects/[projectId]/test-suites - List test suites
export async function GET(
  _req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const user = await requireAuth();
    await requireProjectAccess(params.projectId, user.id);

    const testSuites = await db.testSuite.findMany({
      where: { projectId: params.projectId },
      include: {
        _count: {
          select: { tests: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ testSuites });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/projects/[projectId]/test-suites - Create test suite
export async function POST(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const user = await requireAuth();
    await requireProjectAccess(params.projectId, user.id);

    const body = await req.json();
    const data = createTestSuiteSchema.parse(body);

    const testSuite = await db.testSuite.create({
      data: {
        name: data.name,
        description: data.description,
        projectId: params.projectId,
        isDefault: false,
      },
    });

    return NextResponse.json({ testSuite }, { status: 201 });
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

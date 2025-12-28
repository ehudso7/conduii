import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, requireProjectAccess, handleApiError } from "@/lib/auth";
import { z } from "zod";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const createEnvironmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  url: z.string().url().optional().or(z.literal("")),
  isProduction: z.boolean().default(false),
});

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

// GET /api/projects/[projectId]/environments - List environments
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { projectId } = await context.params;
    await requireProjectAccess(projectId, user.id);

    const environments = await db.environment.findMany({
      where: { projectId },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ environments });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/projects/[projectId]/environments - Create environment
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { projectId } = await context.params;
    await requireProjectAccess(projectId, user.id);

    const body = await req.json();
    const data = createEnvironmentSchema.parse(body);

    // Create environment in a transaction to prevent race conditions
    const environment = await db.$transaction(async (tx: Prisma.TransactionClient) => {
      // If this is marked as production, unmark other production environments
      if (data.isProduction) {
        await tx.environment.updateMany({
          where: { projectId, isProduction: true },
          data: { isProduction: false },
        });
      }

      return tx.environment.create({
        data: {
          projectId,
          name: data.name,
          url: data.url || null,
          isProduction: data.isProduction,
        },
      });
    });

    return NextResponse.json({ environment }, { status: 201 });
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

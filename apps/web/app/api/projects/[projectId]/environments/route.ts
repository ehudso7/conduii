import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, requireProjectAccess, handleApiError } from "@/lib/auth";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const createEnvironmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  url: z.string().url().optional().or(z.literal("")),
  isProduction: z.boolean().default(false),
});

// GET /api/projects/[projectId]/environments - List environments
export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const user = await requireAuth();
    await requireProjectAccess(params.projectId, user.id);

    const environments = await db.environment.findMany({
      where: { projectId: params.projectId },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ environments });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/projects/[projectId]/environments - Create environment
export async function POST(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const user = await requireAuth();
    await requireProjectAccess(params.projectId, user.id);

    const body = await req.json();
    const data = createEnvironmentSchema.parse(body);

    // Create environment in a transaction to prevent race conditions
    const environment = await db.$transaction(async (tx: Prisma.TransactionClient) => {
      // If this is marked as production, unmark other production environments
      if (data.isProduction) {
        await tx.environment.updateMany({
          where: { projectId: params.projectId, isProduction: true },
          data: { isProduction: false },
        });
      }

      return tx.environment.create({
        data: {
          projectId: params.projectId,
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

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, handleApiError } from "@/lib/auth";
import { z } from "zod";

const updateOrgSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  imageUrl: z.string().url().optional().nullable(),
});

// GET /api/organizations - Get current organization
export async function GET(_req: NextRequest) {
  try {
    const user = await requireAuth();

    const membership = await db.organizationMember.findFirst({
      where: { userId: user.id },
      include: {
        organization: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    imageUrl: true,
                  },
                },
              },
            },
            _count: {
              select: {
                projects: true,
                apiKeys: true,
              },
            },
          },
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 });
    }

    return NextResponse.json({ organization: membership.organization });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/organizations - Update organization
export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await req.json();
    const data = updateOrgSchema.parse(body);

    // Verify user is an admin or owner
    const membership = await db.organizationMember.findFirst({
      where: {
        userId: user.id,
        role: { in: ["OWNER", "ADMIN"] },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Only admins can update organization settings" },
        { status: 403 }
      );
    }

    // Only include defined values in the update
    const updateData: { name?: string; imageUrl?: string | null } = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;

    const organization = await db.organization.update({
      where: { id: membership.organizationId },
      data: updateData,
    });

    return NextResponse.json({ organization });
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

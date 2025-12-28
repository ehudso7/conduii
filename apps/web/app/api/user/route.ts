import { NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/auth";
import { db } from "@/lib/db";
import { clerkClient } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

// GET /api/user - Get current user
export async function GET() {
  try {
    const user = await requireAuth();

    const fullUser = await db.user.findUnique({
      where: { id: user.id },
      include: {
        organizations: {
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
                plan: true,
              },
            },
          },
        },
      },
    });

    if (!fullUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user: fullUser });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/user - Delete user account
export async function DELETE() {
  try {
    const user = await requireAuth();

    // Check if user is the sole owner of any organization
    const ownedOrgs = await db.organizationMember.findMany({
      where: {
        userId: user.id,
        role: "OWNER",
      },
      include: {
        organization: {
          include: {
            members: {
              where: {
                role: "OWNER",
              },
            },
          },
        },
      },
    });

    // Check for orgs where user is the only owner
    const soleOwnerOrgs = ownedOrgs.filter(
      (m: typeof ownedOrgs[0]) => m.organization.members.length === 1
    );

    if (soleOwnerOrgs.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete account while being the sole owner of organizations. Please transfer ownership or delete these organizations first.",
          organizations: soleOwnerOrgs.map((m: typeof soleOwnerOrgs[0]) => ({
            id: m.organization.id,
            name: m.organization.name,
          })),
        },
        { status: 400 }
      );
    }

    // Delete user and related data in a transaction
    await db.$transaction([
      db.organizationMember.deleteMany({ where: { userId: user.id } }),
      db.projectMember.deleteMany({ where: { userId: user.id } }),
      db.apiKey.deleteMany({ where: { userId: user.id } }),
      db.user.delete({ where: { id: user.id } }),
    ]);

    // Delete from Clerk
    try {
      await clerkClient.users.deleteUser(user.clerkId);
    } catch (clerkError) {
      console.error("Failed to delete Clerk user:", clerkError);
      // Continue even if Clerk deletion fails
    }

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

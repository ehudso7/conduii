import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, handleApiError } from "@/lib/auth";
import { sendInvitationEmail } from "@/lib/email";
import { z } from "zod";

const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});

const updateMemberSchema = z.object({
  memberId: z.string(),
  role: z.enum(["ADMIN", "MEMBER"]),
});

// GET /api/organizations/members - List organization members
export async function GET(_req: NextRequest) {
  try {
    const user = await requireAuth();

    const membership = await db.organizationMember.findFirst({
      where: { userId: user.id },
    });

    if (!membership) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 });
    }

    const members = await db.organizationMember.findMany({
      where: { organizationId: membership.organizationId },
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
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ members });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/organizations/members - Invite a member
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await req.json();
    const data = inviteMemberSchema.parse(body);

    // Verify user is an admin or owner
    const membership = await db.organizationMember.findFirst({
      where: {
        userId: user.id,
        role: { in: ["OWNER", "ADMIN"] },
      },
      include: { organization: true },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Only admins can invite members" },
        { status: 403 }
      );
    }

    // Check if user exists
    const invitedUser = await db.user.findUnique({
      where: { email: data.email },
    });

    if (!invitedUser) {
      // Send invitation email to non-existent user
      const inviterName = user.name || user.email;
      const orgName = membership.organization.name;

      await sendInvitationEmail(
        data.email,
        orgName,
        inviterName,
        data.role
      );

      return NextResponse.json(
        { message: "Invitation email sent. User will be added when they sign up." },
        { status: 200 }
      );
    }

    // Check if already a member
    const existingMembership = await db.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: invitedUser.id,
          organizationId: membership.organizationId,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "User is already a member of this organization" },
        { status: 400 }
      );
    }

    // Add member
    const newMember = await db.organizationMember.create({
      data: {
        userId: invitedUser.id,
        organizationId: membership.organizationId,
        role: data.role,
      },
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
    });

    return NextResponse.json({ member: newMember }, { status: 201 });
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

// PATCH /api/organizations/members - Update member role
export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await req.json();
    const data = updateMemberSchema.parse(body);

    // Verify user is an admin or owner
    const membership = await db.organizationMember.findFirst({
      where: {
        userId: user.id,
        role: { in: ["OWNER", "ADMIN"] },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Only admins can update member roles" },
        { status: 403 }
      );
    }

    // Can't change owner's role
    const targetMember = await db.organizationMember.findUnique({
      where: { id: data.memberId },
    });

    if (targetMember?.role === "OWNER") {
      return NextResponse.json(
        { error: "Cannot change the owner's role" },
        { status: 403 }
      );
    }

    const updatedMember = await db.organizationMember.update({
      where: { id: data.memberId },
      data: { role: data.role },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ member: updatedMember });
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

// DELETE /api/organizations/members - Remove member
export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth();

    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("id");

    if (!memberId) {
      return NextResponse.json({ error: "Member ID required" }, { status: 400 });
    }

    // Verify user is an admin or owner
    const membership = await db.organizationMember.findFirst({
      where: {
        userId: user.id,
        role: { in: ["OWNER", "ADMIN"] },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Only admins can remove members" },
        { status: 403 }
      );
    }

    // Can't remove owner
    const targetMember = await db.organizationMember.findUnique({
      where: { id: memberId },
    });

    if (targetMember?.role === "OWNER") {
      return NextResponse.json(
        { error: "Cannot remove the organization owner" },
        { status: 403 }
      );
    }

    await db.organizationMember.delete({
      where: { id: memberId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

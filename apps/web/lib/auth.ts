import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function getAuthUser() {
  const { userId } = auth();

  if (!userId) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      organizations: {
        include: {
          organization: true,
        },
      },
    },
  });

  return user;
}

export async function requireAuth() {
  const user = await getAuthUser();

  if (!user) {
    throw new NextResponse("Unauthorized", { status: 401 });
  }

  return user;
}

export async function getDefaultOrg(userId: string) {
  const membership = await db.organizationMember.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: { organization: true },
  });

  return membership?.organization;
}

export async function requireOrgAccess(orgId: string, userId: string) {
  const membership = await db.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId: orgId,
      },
    },
    include: { organization: true },
  });

  if (!membership) {
    throw new NextResponse("Forbidden", { status: 403 });
  }

  return membership;
}

export async function requireProjectAccess(projectId: string, userId: string) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      organization: {
        include: {
          members: {
            where: { userId },
          },
        },
      },
    },
  });

  if (!project || project.organization.members.length === 0) {
    throw new NextResponse("Forbidden", { status: 403 });
  }

  return project;
}

export function handleApiError(error: unknown) {
  console.error("API Error:", error);

  if (error instanceof NextResponse) {
    return error;
  }

  if (error instanceof Error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}

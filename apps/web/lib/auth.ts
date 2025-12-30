import { auth, currentUser } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

function isClerkConfigured() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secretKey = process.env.CLERK_SECRET_KEY;
  const hasValidPublishable =
    !!publishableKey && /^pk_(test|live)_[a-zA-Z0-9_-]+$/.test(publishableKey);
  const hasValidSecret = !!secretKey && /^sk_(test|live)_[a-zA-Z0-9_-]+$/.test(secretKey);
  return hasValidPublishable && hasValidSecret;
}

/**
 * Standard API error with HTTP status + machine code
 */
export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function jsonError(status: number, code: string, message: string, details?: unknown) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details !== undefined ? { details } : {}),
      },
    },
    { status }
  );
}

export async function getAuthUser() {
  // In local/dev environments Clerk is often not configured.
  // Avoid calling Clerk helpers in that case so routes fail as unauthenticated
  // instead of throwing and breaking the app.
  if (!isClerkConfigured()) return null;

  let userId: string | null = null;
  try {
    userId = auth().userId ?? null;
  } catch {
    return null;
  }

  if (!userId) return null;

  let user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      organizations: {
        include: {
          organization: true,
        },
      },
    },
  });

  // Auto-create user if they don't exist (handles case where webhook didn't fire)
  if (!user) {
    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    const email = clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) return null;

    const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ");

    // Create user and default organization
    const slug = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "-");

    try {
      user = await db.user.create({
        data: {
          clerkId: userId,
          email,
          name: name || null,
          imageUrl: clerkUser.imageUrl || null,
          organizations: {
            create: {
              role: "OWNER",
              organization: {
                create: {
                  name: `${name || email}'s Workspace`,
                  slug: `${slug}-${Date.now().toString(36)}`,
                },
              },
            },
          },
        },
        include: {
          organizations: {
            include: {
              organization: true,
            },
          },
        },
      });
    } catch (error: unknown) {
      // Handle race condition - user may have been created by webhook
      const prismaError = error as { code?: string };
      if (prismaError?.code === "P2002") {
        user = await db.user.findUnique({
          where: { clerkId: userId },
          include: {
            organizations: {
              include: {
                organization: true,
              },
            },
          },
        });
      } else {
        throw error;
      }
    }
  }

  return user;
}

export async function requireAuth() {
  const user = await getAuthUser();

  if (!user) {
    throw new ApiError(401, "UNAUTHORIZED", "Unauthorized");
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
    throw new ApiError(403, "FORBIDDEN", "Forbidden");
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
    throw new ApiError(403, "FORBIDDEN", "Forbidden");
  }

  return project;
}

export function handleApiError(error: unknown) {
  console.error("API Error:", error);

  // If a route intentionally returns a NextResponse, preserve it
  if (error instanceof NextResponse) {
    return error;
  }

  // Our standardized error type
  if (error instanceof ApiError) {
    return jsonError(error.status, error.code, error.message, error.details);
  }

  // Generic errors
  if (error instanceof Error) {
    return jsonError(500, "INTERNAL_ERROR", error.message);
  }

  return jsonError(500, "INTERNAL_ERROR", "Internal server error");
}

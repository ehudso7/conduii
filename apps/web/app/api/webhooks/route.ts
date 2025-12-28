import { NextRequest, NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createWebhookSchema = z.object({
  name: z.string().min(1).max(100),
  url: z.string().url(),
  provider: z.enum(["SLACK", "DISCORD", "CUSTOM"]).default("CUSTOM"),
  secret: z.string().optional(),
  events: z.array(z.string()).min(1),
});

// GET /api/webhooks - List all webhooks for user's organization
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    // Get organization from query or user's first org
    const url = new URL(req.url);
    let organizationId = url.searchParams.get("organizationId");

    if (!organizationId) {
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

      organizationId = membership.organizationId;
    } else {
      // Verify access
      const membership = await db.organizationMember.findFirst({
        where: {
          userId: user.id,
          organizationId,
        },
      });

      if (!membership) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    const webhooks = await db.webhook.findMany({
      where: { organizationId },
      include: {
        _count: { select: { deliveries: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ webhooks });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/webhooks - Create a new webhook
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const data = createWebhookSchema.parse(body);

    // Get user's organization
    const url = new URL(req.url);
    let organizationId = url.searchParams.get("organizationId");

    if (!organizationId) {
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

      organizationId = membership.organizationId;
    } else {
      // Verify access (need admin role for webhooks)
      const membership = await db.organizationMember.findFirst({
        where: {
          userId: user.id,
          organizationId,
          role: { in: ["OWNER", "ADMIN"] },
        },
      });

      if (!membership) {
        return NextResponse.json(
          { error: "Admin access required" },
          { status: 403 }
        );
      }
    }

    const webhook = await db.webhook.create({
      data: {
        ...data,
        organizationId,
      },
    });

    return NextResponse.json({ webhook }, { status: 201 });
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

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const updateWebhookSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  url: z.string().url().optional(),
  provider: z.enum(["SLACK", "DISCORD", "CUSTOM"]).optional(),
  secret: z.string().optional().nullable(),
  events: z.array(z.string()).optional(),
  enabled: z.boolean().optional(),
});

// GET /api/webhooks/[id] - Get webhook details
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { id: webhookId } = await context.params;

    const webhook = await db.webhook.findUnique({
      where: { id: webhookId },
      include: {
        deliveries: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!webhook) {
      return NextResponse.json(
        { error: "Webhook not found" },
        { status: 404 }
      );
    }

    // Verify access
    const membership = await db.organizationMember.findFirst({
      where: {
        userId: user.id,
        organizationId: webhook.organizationId,
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ webhook });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/webhooks/[id] - Update webhook
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { id: webhookId } = await context.params;
    const body = await req.json();
    const data = updateWebhookSchema.parse(body);

    const webhook = await db.webhook.findUnique({
      where: { id: webhookId },
      select: { organizationId: true },
    });

    if (!webhook) {
      return NextResponse.json(
        { error: "Webhook not found" },
        { status: 404 }
      );
    }

    // Verify admin access
    const membership = await db.organizationMember.findFirst({
      where: {
        userId: user.id,
        organizationId: webhook.organizationId,
        role: { in: ["OWNER", "ADMIN"] },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const updatedWebhook = await db.webhook.update({
      where: { id: webhookId },
      data,
    });

    return NextResponse.json({ webhook: updatedWebhook });
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

// DELETE /api/webhooks/[id] - Delete webhook
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { id: webhookId } = await context.params;

    const webhook = await db.webhook.findUnique({
      where: { id: webhookId },
      select: { organizationId: true },
    });

    if (!webhook) {
      return NextResponse.json(
        { error: "Webhook not found" },
        { status: 404 }
      );
    }

    // Verify admin access
    const membership = await db.organizationMember.findFirst({
      where: {
        userId: user.id,
        organizationId: webhook.organizationId,
        role: { in: ["OWNER", "ADMIN"] },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    await db.webhook.delete({
      where: { id: webhookId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const notificationsSchema = z.object({
  testFailures: z.boolean().optional(),
  serviceHealth: z.boolean().optional(),
  weeklyDigest: z.boolean().optional(),
  securityAlerts: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
});

// Type for notification from database (before Prisma client regeneration)
interface DbNotification {
  id: string;
  type: string;
  title: string;
  description: string;
  read: boolean;
  link: string | null;
  metadata: unknown;
  createdAt: Date;
  userId: string;
}

// Map database notification types to UI types
function mapNotificationType(type: string): "success" | "error" | "warning" | "info" {
  switch (type) {
    case "TEST_PASSED":
      return "success";
    case "TEST_FAILED":
      return "error";
    case "USAGE_WARNING":
      return "warning";
    default:
      return "info";
  }
}

// GET /api/user/notifications - Get user notifications
export async function GET() {
  try {
    const user = await requireAuth();

    // Fetch stored notifications from database
    const storedNotifications = await db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Transform to UI format
    const notifications = (storedNotifications as DbNotification[]).map((n) => ({
      id: n.id,
      type: mapNotificationType(n.type),
      title: n.title,
      description: n.description,
      timestamp: n.createdAt,
      read: n.read,
      link: n.link,
    }));

    return NextResponse.json({ notifications });
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/user/notifications - Update notification preferences
export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const data = notificationsSchema.parse(body);

    // Store preferences in user's notificationPreferences JSON field
    await db.user.update({
      where: { id: user.id },
      data: {
        notificationPreferences: data,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Notification preferences updated",
      preferences: data,
    });
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

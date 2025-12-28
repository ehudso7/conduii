import { NextRequest, NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// PATCH /api/user/notifications/[id] - Mark a single notification as read
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;

    // Verify the notification belongs to this user and update it
    const notification = await db.notification.updateMany({
      where: {
        id,
        userId: user.id,
      },
      data: {
        read: true,
      },
    });

    if (notification.count === 0) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/user/notifications/[id] - Delete a notification
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;

    // Only delete if it belongs to this user
    const notification = await db.notification.deleteMany({
      where: {
        id,
        userId: user.id,
      },
    });

    if (notification.count === 0) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

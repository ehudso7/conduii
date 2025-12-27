import { NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/auth";
import { db } from "@/lib/db";

// POST /api/user/notifications/read-all - Mark all notifications as read
export async function POST() {
  try {
    const user = await requireAuth();

    // Mark all unread notifications as read
    const result = await db.notification.updateMany({
      where: {
        userId: user.id,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "All notifications marked as read",
      count: result.count,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

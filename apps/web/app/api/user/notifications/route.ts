import { NextRequest, NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/auth";
import { z } from "zod";

const notificationsSchema = z.object({
  testFailures: z.boolean().optional(),
  serviceHealth: z.boolean().optional(),
  weeklyDigest: z.boolean().optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    // Verify user is authenticated (user data not needed for this endpoint)
    await requireAuth();
    const body = await req.json();
    const data = notificationsSchema.parse(body);

    // For now, we just acknowledge the update since we don't have a notifications table
    // In a production app, you would store these preferences in the database

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

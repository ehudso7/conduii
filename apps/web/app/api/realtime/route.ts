import { NextRequest, NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/auth";
import { db } from "@/lib/db";
import { createSSEConnection, closeConnection, pingClient, verifyClientOwnership } from "@/lib/realtime/index";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET /api/realtime - Establish SSE connection
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    // Get organization and optionally project from query params
    const url = new URL(req.url);
    const queryOrganizationId = url.searchParams.get("organizationId");
    const projectId = url.searchParams.get("projectId") || undefined;
    let organizationId: string;

    if (queryOrganizationId) {
      // Verify access
      const membership = await db.organizationMember.findFirst({
        where: {
          userId: user.id,
          organizationId: queryOrganizationId,
        },
      });

      if (!membership) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
      organizationId = queryOrganizationId;
    } else {
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
    }

    // If projectId provided, verify it belongs to the organization
    if (projectId) {
      const project = await db.project.findFirst({
        where: {
          id: projectId,
          organizationId,
        },
      });

      if (!project) {
        return NextResponse.json(
          { error: "Project not found or access denied" },
          { status: 404 }
        );
      }
    }

    // Create SSE connection
    const { stream, clientId } = createSSEConnection(
      user.id,
      organizationId,
      projectId
    );

    // Set up ping interval to keep connection alive
    const pingInterval = setInterval(() => {
      if (!pingClient(clientId)) {
        clearInterval(pingInterval);
      }
    }, 30000); // Ping every 30 seconds

    // Clean up on connection close
    req.signal.addEventListener("abort", () => {
      clearInterval(pingInterval);
      closeConnection(clientId);
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no", // Disable buffering in nginx
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/realtime - Close SSE connection
export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth();

    const url = new URL(req.url);
    const clientId = url.searchParams.get("clientId");

    if (!clientId) {
      return NextResponse.json(
        { error: "clientId is required" },
        { status: 400 }
      );
    }

    // Verify the user owns this connection
    if (!verifyClientOwnership(clientId, user.id)) {
      return NextResponse.json(
        { error: "Connection not found or access denied" },
        { status: 403 }
      );
    }

    closeConnection(clientId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

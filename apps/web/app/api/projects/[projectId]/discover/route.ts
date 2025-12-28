import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireProjectAccess, handleApiError } from "@/lib/auth";
import { discoverServices } from "@/lib/test-runner";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { projectId } = await context.params;

    await requireProjectAccess(projectId, user.id);

    const result = await discoverServices(projectId);

    return NextResponse.json({
      message: `Discovered ${result.discovered} new service(s)`,
      discovered: result.discovered,
      services: result.services,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

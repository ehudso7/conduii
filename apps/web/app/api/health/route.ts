import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Helper to run query with timeout
async function queryWithTimeout<T>(
  query: Promise<T>,
  timeoutMs: number
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Database query timeout")), timeoutMs)
  );
  return Promise.race([query, timeoutPromise]);
}

export async function GET() {
  const checks: Record<string, { status: string; latency?: number; error?: string }> = {};

  // In CI/test environments, we don't want health to depend on a live database.
  // Treat DB as optional unless explicitly running in a real environment.
  const hasDbUrl = !!process.env.POSTGRES_PRISMA_URL || !!process.env.DATABASE_URL;
  const shouldCheckDb = process.env.NODE_ENV !== "test" && hasDbUrl;

  // Check database connection with 5 second timeout
  if (shouldCheckDb) {
    const dbStart = Date.now();
    try {
      await queryWithTimeout(db.$queryRaw`SELECT 1`, 5000);
      checks.database = { status: "healthy", latency: Date.now() - dbStart };
    } catch (error) {
      checks.database = {
        status: "unhealthy",
        latency: Date.now() - dbStart,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  } else {
    checks.database = { status: "skipped" };
  }

  // Overall health status
  const isHealthy = Object.values(checks).every(
    (check) => check.status === "healthy" || check.status === "skipped"
  );

  return NextResponse.json(
    {
      status: isHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0",
      checks,
    },
    { status: isHealthy ? 200 : 503 }
  );
}

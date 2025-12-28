import { NextRequest, NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateTestsFromPrompt, generateTestsFromOpenAPI, suggestTestsForCodeChanges } from "@/lib/ai/test-generator";
import { z } from "zod";

export const dynamic = "force-dynamic";

const generateFromPromptSchema = z.object({
  type: z.literal("prompt"),
  projectId: z.string(),
  prompt: z.string().min(1),
  testType: z.enum(["API", "E2E", "INTEGRATION", "HEALTH"]).optional(),
  framework: z.enum(["jest", "vitest", "playwright", "cypress"]).optional(),
  additionalContext: z.string().optional(),
});

const generateFromOpenAPISchema = z.object({
  type: z.literal("openapi"),
  projectId: z.string(),
  spec: z.record(z.unknown()),
});

const suggestFromChangesSchema = z.object({
  type: z.literal("changes"),
  projectId: z.string(),
  diff: z.string(),
  changedFiles: z.array(z.string()),
});

const requestSchema = z.union([
  generateFromPromptSchema,
  generateFromOpenAPISchema,
  suggestFromChangesSchema,
]);

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const data = requestSchema.parse(body);

    // Verify project access
    const project = await db.project.findUnique({
      where: { id: data.projectId },
      include: { organization: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const membership = await db.organizationMember.findFirst({
      where: {
        userId: user.id,
        organizationId: project.organizationId,
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    let tests;

    switch (data.type) {
      case "prompt":
        tests = await generateTestsFromPrompt({
          projectId: data.projectId,
          prompt: data.prompt,
          testType: data.testType,
          framework: data.framework,
          additionalContext: data.additionalContext,
        });
        break;

      case "openapi":
        tests = await generateTestsFromOpenAPI(data.projectId, data.spec);
        break;

      case "changes":
        tests = await suggestTestsForCodeChanges(
          data.projectId,
          data.diff,
          data.changedFiles
        );
        break;
    }

    return NextResponse.json({ tests });
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

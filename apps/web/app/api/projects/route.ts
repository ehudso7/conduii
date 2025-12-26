import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, getDefaultOrg, handleApiError } from "@/lib/auth";
import { canCreateProject } from "@/lib/stripe";
import { z } from "zod";

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  repositoryUrl: z.string().url().optional(),
});

// GET /api/projects - List all projects
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const orgId = req.nextUrl.searchParams.get("orgId");

    let organizationId = orgId;

    if (!organizationId) {
      const defaultOrg = await getDefaultOrg(user.id);
      organizationId = defaultOrg?.id ?? null;
    }

    if (!organizationId) {
      return NextResponse.json({ projects: [] });
    }

    const projects = await db.project.findMany({
      where: { organizationId },
      include: {
        _count: {
          select: {
            services: true,
            testRuns: true,
          },
        },
        testRuns: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/projects - Create a new project
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { name, description, repositoryUrl } = createProjectSchema.parse(body);

    const orgId = body.organizationId;
    let organizationId = orgId;

    if (!organizationId) {
      const defaultOrg = await getDefaultOrg(user.id);
      organizationId = defaultOrg?.id ?? null;
    }

    if (!organizationId) {
      return NextResponse.json(
        { error: "No organization found" },
        { status: 400 }
      );
    }

    // Check org membership
    const membership = await db.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId,
        },
      },
      include: { organization: true },
    });

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check project limit
    const projectCount = await db.project.count({
      where: { organizationId },
    });

    if (!canCreateProject(projectCount, membership.organization.plan)) {
      return NextResponse.json(
        { error: "Project limit reached. Upgrade to create more projects." },
        { status: 403 }
      );
    }

    // Generate slug
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const existingProject = await db.project.findUnique({
      where: {
        organizationId_slug: {
          organizationId,
          slug: baseSlug,
        },
      },
    });

    const slug = existingProject
      ? `${baseSlug}-${Date.now().toString(36)}`
      : baseSlug;

    // Create project
    const project = await db.project.create({
      data: {
        name,
        slug,
        description: description ?? null,
        repositoryUrl: repositoryUrl ?? null,
        organizationId,
        members: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
        environments: {
          create: {
            name: "default",
            isProduction: false,
          },
        },
        testSuites: {
          create: {
            name: "Default Suite",
            description: "Auto-generated test suite",
            isDefault: true,
          },
        },
      },
      include: {
        environments: true,
        testSuites: true,
      },
    });

    return NextResponse.json({ project }, { status: 201 });
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

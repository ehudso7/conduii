import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, handleApiError } from "@/lib/auth";
import { z } from "zod";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

const createKeySchema = z.object({
  name: z.string().min(1).max(100),
  expiresIn: z.enum(["30d", "90d", "365d", "never"]).optional(),
});

function generateApiKey(): string {
  return `ck_${randomBytes(32).toString("hex")}`;
}

// GET /api/api-keys - List API keys
export async function GET(_req: NextRequest) {
  try {
    const user = await requireAuth();

    // Get user's organization
    const membership = await db.organizationMember.findFirst({
      where: { userId: user.id },
      include: { organization: true },
    });

    if (!membership) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 });
    }

    const apiKeys = await db.apiKey.findMany({
      where: {
        organizationId: membership.organizationId,
        revokedAt: null,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      select: {
        id: true,
        name: true,
        key: true,
        lastUsedAt: true,
        expiresAt: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Mask the keys for security (ensure key has enough characters)
    const maskedKeys = apiKeys.map((key: { id: string; name: string; key: string; lastUsedAt: Date | null; expiresAt: Date | null; createdAt: Date; user: { id: string; name: string | null; email: string } | null }) => ({
      ...key,
      key: key.key.length >= 12
        ? `${key.key.slice(0, 8)}...${key.key.slice(-4)}`
        : "****",
    }));

    return NextResponse.json({ apiKeys: maskedKeys });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/api-keys - Create new API key
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await req.json();
    const data = createKeySchema.parse(body);

    // Get user's organization
    const membership = await db.organizationMember.findFirst({
      where: { userId: user.id },
      include: { organization: true },
    });

    if (!membership) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 });
    }

    // Calculate expiration date
    let expiresAt: Date | null = null;
    if (data.expiresIn && data.expiresIn !== "never") {
      const days = parseInt(data.expiresIn.replace("d", ""));
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);
    }

    // Generate and store API key
    const key = generateApiKey();

    const apiKey = await db.apiKey.create({
      data: {
        name: data.name,
        key,
        expiresAt,
        userId: user.id,
        organizationId: membership.organizationId,
      },
    });

    // Return the full key only on creation (never shown again)
    return NextResponse.json({
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        key: apiKey.key, // Full key, shown only once
        expiresAt: apiKey.expiresAt,
        createdAt: apiKey.createdAt,
      },
    }, { status: 201 });
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

// DELETE /api/api-keys - Revoke API key
export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth();

    const { searchParams } = new URL(req.url);
    const keyId = searchParams.get("id");

    if (!keyId) {
      return NextResponse.json({ error: "Key ID required" }, { status: 400 });
    }

    // Verify the key belongs to the user's organization
    const membership = await db.organizationMember.findFirst({
      where: { userId: user.id },
    });

    if (!membership) {
      return NextResponse.json({ error: "No organization found" }, { status: 404 });
    }

    const apiKey = await db.apiKey.findFirst({
      where: {
        id: keyId,
        organizationId: membership.organizationId,
      },
    });

    if (!apiKey) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    // Revoke the key (soft delete)
    await db.apiKey.update({
      where: { id: keyId },
      data: { revokedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

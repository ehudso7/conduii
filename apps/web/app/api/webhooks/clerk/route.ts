import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET to .env");
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse("Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new NextResponse("Error verifying webhook", { status: 400 });
  }

  const eventType = evt.type;

  try {
    if (eventType === "user.created") {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;

      const email = email_addresses[0]?.email_address;
      if (!email) {
        console.error("No email address found for user.created event");
        return new NextResponse("Missing email address", { status: 400 });
      }

      const name = [first_name, last_name].filter(Boolean).join(" ");

      // Check if user already exists (idempotency)
      const existingUser = await db.user.findUnique({
        where: { clerkId: id },
      });

      if (!existingUser) {
        // Create user
        const user = await db.user.create({
          data: {
            clerkId: id,
            email,
            name: name || null,
            imageUrl: image_url || null,
          },
        });

        // Create personal organization
        const slug = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "-");
        await db.organization.create({
          data: {
            name: `${name || email}'s Workspace`,
            slug: `${slug}-${Date.now().toString(36)}`,
            members: {
              create: {
                userId: user.id,
                role: "OWNER",
              },
            },
          },
        });
      }
    }

    if (eventType === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;

      const email = email_addresses[0]?.email_address;
      if (!email) {
        console.error("No email address found for user.updated event");
        return new NextResponse("Missing email address", { status: 400 });
      }

      const name = [first_name, last_name].filter(Boolean).join(" ");

      await db.user.upsert({
        where: { clerkId: id },
        update: {
          email,
          name: name || null,
          imageUrl: image_url || null,
        },
        create: {
          clerkId: id,
          email,
          name: name || null,
          imageUrl: image_url || null,
        },
      });
    }

    if (eventType === "user.deleted") {
      const { id } = evt.data;

      await db.user.deleteMany({
        where: { clerkId: id },
      });
    }
  } catch (error) {
    console.error("Database error in Clerk webhook:", error);
    return new NextResponse("Database error", { status: 500 });
  }

  return new NextResponse("OK", { status: 200 });
}

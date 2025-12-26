import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { stripe, PLANS, PlanType, BillingInterval } from "@/lib/stripe";
import { db } from "@/lib/db";
import { z } from "zod";

const checkoutSchema = z.object({
  planId: z.enum(["BASIC", "PRO", "ENTERPRISE"]),
  interval: z.enum(["monthly", "yearly"]),
  organizationId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { planId, interval, organizationId } = checkoutSchema.parse(body);

    // Get user's organization
    let org;
    if (organizationId) {
      org = await db.organization.findFirst({
        where: {
          id: organizationId,
          members: { some: { userId: user.id, role: { in: ["OWNER", "ADMIN"] } } },
        },
      });
    } else {
      // Get first org where user is owner/admin
      const membership = await db.organizationMember.findFirst({
        where: {
          userId: user.id,
          role: { in: ["OWNER", "ADMIN"] },
        },
        include: { organization: true },
      });
      org = membership?.organization;
    }

    if (!org) {
      return NextResponse.json(
        { error: "Organization not found or insufficient permissions" },
        { status: 404 }
      );
    }

    // Check if already subscribed
    if (org.stripeSubscriptionId) {
      return NextResponse.json(
        { error: "Organization already has an active subscription. Please manage it from the billing portal." },
        { status: 400 }
      );
    }

    const plan = PLANS[planId as PlanType];
    const priceId = plan.priceIds[interval as BillingInterval];

    if (!priceId) {
      return NextResponse.json(
        { error: "Price not configured for this plan. Please contact support." },
        { status: 400 }
      );
    }

    // Create or get Stripe customer
    let stripeCustomerId = org.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: org.name,
        metadata: {
          organizationId: org.id,
          userId: user.id,
        },
      });
      stripeCustomerId = customer.id;

      // Save customer ID
      await db.organization.update({
        where: { id: org.id },
        data: { stripeCustomerId },
      });
    }

    // Create checkout session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/dashboard/billing?canceled=true`,
      subscription_data: {
        metadata: {
          organizationId: org.id,
          planId,
          interval,
        },
      },
      metadata: {
        organizationId: org.id,
        planId,
        interval,
      },
      allow_promotion_codes: true,
      billing_address_collection: "required",
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

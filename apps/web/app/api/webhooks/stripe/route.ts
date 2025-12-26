import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature");

  if (!signature) {
    return new NextResponse("Missing Stripe signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook signature verification failed: ${message}`);
    return new NextResponse(`Webhook Error: ${message}`, { status: 400 });
  }

  // Handle checkout completion
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (!session.subscription || !session.customer) {
      console.error("Missing subscription or customer in checkout session");
      return new NextResponse("Invalid session data", { status: 400 });
    }

    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    await db.organization.update({
      where: {
        stripeCustomerId: session.customer as string,
      },
      data: {
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000
        ),
        plan: "PRO",
        projectLimit: -1,
        testRunLimit: 5000,
      },
    });
  }

  // Handle subscription updates (invoice payment)
  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice;

    if (!invoice.subscription) {
      // One-time payment, not a subscription invoice
      return new NextResponse(null, { status: 200 });
    }

    const subscription = await stripe.subscriptions.retrieve(
      invoice.subscription as string
    );

    // Find organization by stripeSubscriptionId (not unique, so use findFirst)
    const org = await db.organization.findFirst({
      where: {
        stripeSubscriptionId: subscription.id,
      },
    });

    if (org) {
      await db.organization.update({
        where: { id: org.id },
        data: {
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000
          ),
          // Reset usage at the start of new billing period
          testRunsUsed: 0,
        },
      });
    }
  }

  // Handle subscription cancellation
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;

    // Find organization by stripeSubscriptionId (not unique, so use findFirst)
    const org = await db.organization.findFirst({
      where: {
        stripeSubscriptionId: subscription.id,
      },
    });

    if (org) {
      await db.organization.update({
        where: { id: org.id },
        data: {
          stripeSubscriptionId: null,
          stripePriceId: null,
          stripeCurrentPeriodEnd: null,
          plan: "FREE",
          projectLimit: 3,
          testRunLimit: 100,
        },
      });
    }
  }

  return new NextResponse(null, { status: 200 });
}

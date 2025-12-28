import { NextRequest, NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();

    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId");

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
      const membership = await db.organizationMember.findFirst({
        where: { userId: user.id, role: { in: ["OWNER", "ADMIN"] } },
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

    if (!org.stripeCustomerId) {
      return NextResponse.json({ invoices: [] });
    }

    // Fetch invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: org.stripeCustomerId,
      limit: 10,
    });

    const formattedInvoices = invoices.data.map((invoice) => ({
      id: invoice.id,
      date: new Date(invoice.created * 1000).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      amount: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: invoice.currency.toUpperCase(),
      }).format((invoice.amount_paid || 0) / 100),
      status: invoice.status === "paid" ? "Paid" : invoice.status,
      invoiceUrl: invoice.hosted_invoice_url,
      pdfUrl: invoice.invoice_pdf,
    }));

    return NextResponse.json({ invoices: formattedInvoices });
  } catch (error) {
    return handleApiError(error);
  }
}

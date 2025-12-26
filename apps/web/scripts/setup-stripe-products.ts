/**
 * Stripe Products Setup Script
 *
 * This script creates all subscription plans in Stripe:
 * - Basic Plan ($9.99/month, $99.99/year)
 * - Pro Plan ($29.99/month, $299.99/year)
 * - Enterprise Plan ($99.99/month, $999.99/year)
 *
 * Usage:
 *   npx ts-node scripts/setup-stripe-products.ts
 *
 * Required environment variable:
 *   STRIPE_SECRET_KEY=sk_test_xxx
 */

import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.error("Error: STRIPE_SECRET_KEY environment variable is required");
  console.error("Usage: STRIPE_SECRET_KEY=sk_test_xxx npx ts-node scripts/setup-stripe-products.ts");
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia",
});

interface PlanConfig {
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  metadata: {
    projectLimit: string;
    testRunLimit: string;
    plan: string;
  };
}

const plans: PlanConfig[] = [
  {
    name: "Basic",
    description: "Perfect for individuals and small projects",
    monthlyPrice: 999, // $9.99 in cents
    yearlyPrice: 9999, // $99.99 in cents (2 months free)
    features: [
      "Up to 5 projects",
      "500 test runs/month",
      "Email support",
      "Basic analytics",
    ],
    metadata: {
      projectLimit: "5",
      testRunLimit: "500",
      plan: "BASIC",
    },
  },
  {
    name: "Pro",
    description: "For growing teams and businesses",
    monthlyPrice: 2999, // $29.99 in cents
    yearlyPrice: 29999, // $299.99 in cents (2 months free)
    features: [
      "Unlimited projects",
      "5,000 test runs/month",
      "Priority support",
      "Advanced analytics",
      "Team collaboration",
      "Custom integrations",
    ],
    metadata: {
      projectLimit: "-1",
      testRunLimit: "5000",
      plan: "PRO",
    },
  },
  {
    name: "Enterprise",
    description: "For large organizations with advanced needs",
    monthlyPrice: 9999, // $99.99 in cents
    yearlyPrice: 99999, // $999.99 in cents (2 months free)
    features: [
      "Unlimited projects",
      "Unlimited test runs",
      "24/7 dedicated support",
      "Custom SLA",
      "SSO/SAML",
      "Audit logs",
      "Custom contracts",
      "On-premise deployment option",
    ],
    metadata: {
      projectLimit: "-1",
      testRunLimit: "-1",
      plan: "ENTERPRISE",
    },
  },
];

async function createProducts() {
  console.log("🚀 Setting up Stripe products and prices...\n");

  const results: {
    plan: string;
    productId: string;
    monthlyPriceId: string;
    yearlyPriceId: string;
  }[] = [];

  for (const plan of plans) {
    console.log(`📦 Creating ${plan.name} plan...`);

    // Create the product
    const product = await stripe.products.create({
      name: `${plan.name} Plan`,
      description: plan.description,
      metadata: {
        ...plan.metadata,
        features: JSON.stringify(plan.features),
      },
    });

    console.log(`   ✓ Product created: ${product.id}`);

    // Create monthly price
    const monthlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: plan.monthlyPrice,
      currency: "usd",
      recurring: {
        interval: "month",
      },
      metadata: {
        plan: plan.metadata.plan,
        interval: "monthly",
      },
    });

    console.log(`   ✓ Monthly price created: ${monthlyPrice.id} ($${(plan.monthlyPrice / 100).toFixed(2)}/month)`);

    // Create yearly price
    const yearlyPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: plan.yearlyPrice,
      currency: "usd",
      recurring: {
        interval: "year",
      },
      metadata: {
        plan: plan.metadata.plan,
        interval: "yearly",
      },
    });

    console.log(`   ✓ Yearly price created: ${yearlyPrice.id} ($${(plan.yearlyPrice / 100).toFixed(2)}/year)`);

    results.push({
      plan: plan.name,
      productId: product.id,
      monthlyPriceId: monthlyPrice.id,
      yearlyPriceId: yearlyPrice.id,
    });

    console.log("");
  }

  // Print summary
  console.log("═".repeat(60));
  console.log("✅ All products and prices created successfully!\n");
  console.log("Add these to your environment variables:\n");

  console.log("# Stripe Price IDs");
  for (const result of results) {
    const planUpper = result.plan.toUpperCase();
    console.log(`STRIPE_${planUpper}_MONTHLY_PRICE_ID=${result.monthlyPriceId}`);
    console.log(`STRIPE_${planUpper}_YEARLY_PRICE_ID=${result.yearlyPriceId}`);
  }

  console.log("\n# Or as a JSON config:");
  console.log(JSON.stringify({
    basic: {
      productId: results[0].productId,
      monthly: results[0].monthlyPriceId,
      yearly: results[0].yearlyPriceId,
    },
    pro: {
      productId: results[1].productId,
      monthly: results[1].monthlyPriceId,
      yearly: results[1].yearlyPriceId,
    },
    enterprise: {
      productId: results[2].productId,
      monthly: results[2].monthlyPriceId,
      yearly: results[2].yearlyPriceId,
    },
  }, null, 2));

  console.log("\n═".repeat(60));
  console.log("🔗 View in Stripe Dashboard: https://dashboard.stripe.com/products");
}

// Run the script
createProducts().catch((error) => {
  console.error("❌ Error creating products:", error.message);
  process.exit(1);
});

/**
 * Pricing Configuration for Conduii
 *
 * This file contains all pricing plans and their features.
 * Update the price IDs after running: yarn stripe:setup
 */

export type PlanTier = "FREE" | "BASIC" | "PRO" | "ENTERPRISE";
export type BillingInterval = "monthly" | "yearly";

export interface PricingPlan {
  id: PlanTier;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  priceIds: {
    monthly: string | null;
    yearly: string | null;
  };
  features: string[];
  limits: {
    projects: number; // -1 = unlimited
    testRuns: number; // -1 = unlimited
  };
  highlighted?: boolean;
  cta: string;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "FREE",
    name: "Free",
    description: "Get started with basic testing",
    price: {
      monthly: 0,
      yearly: 0,
    },
    priceIds: {
      monthly: null,
      yearly: null,
    },
    features: [
      "Up to 3 projects",
      "100 test runs/month",
      "Community support",
      "Basic test reports",
    ],
    limits: {
      projects: 3,
      testRuns: 100,
    },
    cta: "Get Started",
  },
  {
    id: "BASIC",
    name: "Basic",
    description: "Perfect for individuals and small projects",
    price: {
      monthly: 9.99,
      yearly: 99.99,
    },
    priceIds: {
      // Update these after running yarn stripe:setup
      monthly: process.env.NEXT_PUBLIC_STRIPE_BASIC_MONTHLY_PRICE_ID || null,
      yearly: process.env.NEXT_PUBLIC_STRIPE_BASIC_YEARLY_PRICE_ID || null,
    },
    features: [
      "Up to 5 projects",
      "500 test runs/month",
      "Email support",
      "Basic analytics",
      "API access",
      "Webhook integrations",
    ],
    limits: {
      projects: 5,
      testRuns: 500,
    },
    cta: "Start Basic",
  },
  {
    id: "PRO",
    name: "Pro",
    description: "For growing teams and businesses",
    price: {
      monthly: 29.99,
      yearly: 299.99,
    },
    priceIds: {
      // Update these after running yarn stripe:setup
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID || null,
      yearly: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID || null,
    },
    features: [
      "Unlimited projects",
      "5,000 test runs/month",
      "Priority support",
      "Advanced analytics",
      "Team collaboration",
      "Custom integrations",
      "CI/CD integrations",
      "Slack notifications",
    ],
    limits: {
      projects: -1,
      testRuns: 5000,
    },
    highlighted: true,
    cta: "Start Pro",
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    description: "For large organizations with advanced needs",
    price: {
      monthly: 99.99,
      yearly: 999.99,
    },
    priceIds: {
      // Update these after running yarn stripe:setup
      monthly: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || null,
      yearly: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_YEARLY_PRICE_ID || null,
    },
    features: [
      "Unlimited projects",
      "Unlimited test runs",
      "24/7 dedicated support",
      "Custom SLA",
      "SSO/SAML authentication",
      "Audit logs",
      "Custom contracts",
      "On-premise deployment option",
      "Dedicated account manager",
      "Custom training",
    ],
    limits: {
      projects: -1,
      testRuns: -1,
    },
    cta: "Contact Sales",
  },
];

/**
 * Get a plan by its ID
 */
export function getPlanById(planId: PlanTier): PricingPlan | undefined {
  return PRICING_PLANS.find((plan) => plan.id === planId);
}

/**
 * Get the price ID for a plan and interval
 */
export function getPriceId(planId: PlanTier, interval: BillingInterval): string | null {
  const plan = getPlanById(planId);
  if (!plan) return null;
  return plan.priceIds[interval];
}

/**
 * Calculate yearly savings percentage
 */
export function getYearlySavings(plan: PricingPlan): number {
  if (plan.price.monthly === 0) return 0;
  const monthlyTotal = plan.price.monthly * 12;
  const savings = ((monthlyTotal - plan.price.yearly) / monthlyTotal) * 100;
  return Math.round(savings);
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: price % 1 === 0 ? 0 : 2,
  }).format(price);
}

/**
 * Check if a feature is available for a plan
 */
export function canUsePlan(
  currentPlan: PlanTier,
  requiredPlan: PlanTier
): boolean {
  const planOrder: PlanTier[] = ["FREE", "BASIC", "PRO", "ENTERPRISE"];
  return planOrder.indexOf(currentPlan) >= planOrder.indexOf(requiredPlan);
}

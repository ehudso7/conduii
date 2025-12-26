import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
  typescript: true,
});

export const PLANS = {
  FREE: {
    name: "Free",
    description: "For hobby projects",
    price: { monthly: 0, yearly: 0 },
    priceIds: { monthly: null, yearly: null },
    projectLimit: 3,
    testRunLimit: 100,
    features: [
      "Up to 3 projects",
      "100 test runs/month",
      "Basic diagnostics",
      "Community support",
      "CLI access",
    ],
  },
  BASIC: {
    name: "Basic",
    description: "For individuals and small projects",
    price: { monthly: 9.99, yearly: 99.99 },
    priceIds: {
      monthly: process.env.STRIPE_BASIC_MONTHLY_PRICE_ID || null,
      yearly: process.env.STRIPE_BASIC_YEARLY_PRICE_ID || null,
    },
    projectLimit: 5,
    testRunLimit: 500,
    features: [
      "Up to 5 projects",
      "500 test runs/month",
      "Email support",
      "Basic analytics",
      "API access",
      "Webhook integrations",
    ],
  },
  PRO: {
    name: "Pro",
    description: "For growing teams and businesses",
    price: { monthly: 29.99, yearly: 299.99 },
    priceIds: {
      monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || null,
      yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || null,
    },
    projectLimit: -1, // unlimited
    testRunLimit: 5000,
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
  },
  ENTERPRISE: {
    name: "Enterprise",
    description: "For large organizations",
    price: { monthly: 99.99, yearly: 999.99 },
    priceIds: {
      monthly: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || null,
      yearly: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID || null,
    },
    projectLimit: -1,
    testRunLimit: -1,
    features: [
      "Unlimited projects",
      "Unlimited test runs",
      "24/7 dedicated support",
      "Custom SLA",
      "SSO/SAML authentication",
      "Audit logs",
      "Custom contracts",
      "On-premise deployment option",
    ],
  },
} as const;

export type PlanType = keyof typeof PLANS;

export function getPlan(plan: PlanType) {
  return PLANS[plan];
}

export function canCreateProject(
  currentCount: number,
  plan: PlanType
): boolean {
  const limit = PLANS[plan].projectLimit;
  return limit === -1 || currentCount < limit;
}

export function canRunTests(usedRuns: number, plan: PlanType): boolean {
  const limit = PLANS[plan].testRunLimit;
  return limit === -1 || usedRuns < limit;
}

export function getPlanLimits(plan: PlanType) {
  const planData = PLANS[plan];
  return {
    projects: planData.projectLimit,
    testRunsPerMonth: planData.testRunLimit,
  };
}

export type BillingInterval = "monthly" | "yearly";

export function getPriceId(plan: PlanType, interval: BillingInterval): string | null {
  return PLANS[plan].priceIds[interval];
}

export function getPlanFromPriceId(priceId: string): { plan: PlanType; interval: BillingInterval } | null {
  for (const [planKey, planData] of Object.entries(PLANS)) {
    if (planData.priceIds.monthly === priceId) {
      return { plan: planKey as PlanType, interval: "monthly" };
    }
    if (planData.priceIds.yearly === priceId) {
      return { plan: planKey as PlanType, interval: "yearly" };
    }
  }
  return null;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: price % 1 === 0 ? 0 : 2,
  }).format(price);
}

export function getYearlySavingsPercent(plan: PlanType): number {
  const planData = PLANS[plan];
  if (planData.price.monthly === 0) return 0;
  const monthlyTotal = planData.price.monthly * 12;
  return Math.round(((monthlyTotal - planData.price.yearly) / monthlyTotal) * 100);
}

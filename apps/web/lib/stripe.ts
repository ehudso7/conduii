import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
  typescript: true,
});

export const PLANS = {
  FREE: {
    name: "Free",
    description: "For hobby projects",
    price: 0,
    priceId: null,
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
  PRO: {
    name: "Pro",
    description: "For professional developers",
    price: 29,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    projectLimit: -1, // unlimited
    testRunLimit: 5000,
    features: [
      "Unlimited projects",
      "5,000 test runs/month",
      "AI-powered diagnostics",
      "Priority support",
      "GitHub Action",
      "Web Dashboard",
      "Team collaboration",
      "Custom test suites",
    ],
  },
  ENTERPRISE: {
    name: "Enterprise",
    description: "For large teams",
    price: null, // custom
    priceId: null,
    projectLimit: -1,
    testRunLimit: -1,
    features: [
      "Everything in Pro",
      "Unlimited test runs",
      "SSO/SAML",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
      "On-premise option",
      "Advanced analytics",
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

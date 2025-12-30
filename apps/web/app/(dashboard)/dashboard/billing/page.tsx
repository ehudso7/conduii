import { redirect } from "next/navigation";
import {
  CreditCard,
  Check,
  Zap,
  Download,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { getPlanLimits } from "@/lib/stripe";
import { getAuthUser } from "@/lib/auth";
import {
  UpgradeButton,
  ManageBillingButton,
  ContactSalesButton,
  UpgradePromptCard,
  InvoiceList,
} from "@/components/billing";

async function getBillingData(userId: string) {
  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      organizations: {
        include: {
          organization: {
            include: {
              usage: {
                orderBy: { period: "desc" },
                take: 6,
              },
              _count: {
                select: {
                  projects: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return user;
}

export default async function BillingPage() {
  const authUser = await getAuthUser();
  if (!authUser) redirect("/sign-in");

  const user = await getBillingData(authUser.clerkId);

  if (!user) {
    redirect("/sign-in");
  }

  const organization = user.organizations[0]?.organization;
  const currentPlan = organization?.plan || "FREE";
  const limits = getPlanLimits(currentPlan);
  const organizationId = organization?.id || "";

  // Calculate usage percentage
  const testRunsUsed = organization?.testRunsUsed || 0;
  const projectCount = organization?._count.projects || 0;
  const testRunsPercentage = limits.testRunsPerMonth === -1
    ? 0
    : Math.min((testRunsUsed / limits.testRunsPerMonth) * 100, 100);
  const projectsPercentage = limits.projects === -1
    ? 0
    : Math.min((projectCount / limits.projects) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1">
          <p className="text-sm font-medium text-primary uppercase tracking-wider">Subscription</p>
          <h1 className="text-4xl font-bold tracking-tight">Billing</h1>
          <p className="text-muted-foreground">
            Manage your subscription and billing information
          </p>
        </div>
        {currentPlan !== "FREE" && organization && (
          <ManageBillingButton organizationId={organizationId} />
        )}
      </div>

      <div className="grid gap-6">
        {/* Current Plan */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                <CardTitle>Current Plan</CardTitle>
              </div>
              <Badge
                variant={currentPlan === "FREE" ? "secondary" : "default"}
                className="text-lg px-4 py-1"
              >
                {currentPlan}
              </Badge>
            </div>
            <CardDescription>
              Your current subscription and usage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Usage Stats */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Test Runs</span>
                  <span className="text-muted-foreground">
                    {testRunsUsed} / {limits.testRunsPerMonth === -1 ? "Unlimited" : limits.testRunsPerMonth}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      testRunsPercentage > 80
                        ? "bg-red-500"
                        : testRunsPercentage > 60
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${testRunsPercentage}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Projects</span>
                  <span className="text-muted-foreground">
                    {projectCount} / {limits.projects === -1 ? "Unlimited" : limits.projects}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      projectsPercentage > 80
                        ? "bg-red-500"
                        : projectsPercentage > 60
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${projectsPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Billing Period */}
            {currentPlan !== "FREE" && organization?.stripeCurrentPeriodEnd && (
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Current Billing Period</p>
                  <p className="text-sm text-muted-foreground">
                    Renews on{" "}
                    {new Date(
                      organization.stripeCurrentPeriodEnd
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            {currentPlan === "FREE" && organization && (
              <UpgradePromptCard organizationId={organizationId} />
            )}
          </CardContent>
        </Card>

        {/* Plan Comparison */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Free Plan */}
          <Card className={currentPlan === "FREE" ? "border-primary" : ""}>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>For individual developers</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>3 projects</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>100 test runs/month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Service discovery</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>API access</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Community support</span>
                </li>
              </ul>
              {currentPlan === "FREE" ? (
                <Button className="w-full mt-6" variant="outline" disabled>
                  Current Plan
                </Button>
              ) : organization ? (
                <ManageBillingButton organizationId={organizationId} />
              ) : null}
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card
            className={`${
              currentPlan === "PRO" ? "border-primary" : ""
            } relative`}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600">
                Popular
              </Badge>
            </div>
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <CardDescription>For growing teams</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$29</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Unlimited projects</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>5,000 test runs/month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Team collaboration</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Custom integrations</span>
                </li>
              </ul>
              {currentPlan === "PRO" ? (
                <Button className="w-full mt-6" variant="outline" disabled>
                  Current Plan
                </Button>
              ) : organization ? (
                <UpgradeButton
                  planId="PRO"
                  organizationId={organizationId}
                  className="w-full mt-6"
                >
                  Upgrade to Pro
                </UpgradeButton>
              ) : null}
            </CardContent>
          </Card>

          {/* Enterprise Plan */}
          <Card className={currentPlan === "ENTERPRISE" ? "border-primary" : ""}>
            <CardHeader>
              <CardTitle>Enterprise</CardTitle>
              <CardDescription>For large organizations</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">Custom</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Everything in Pro</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Unlimited test runs</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>SSO/SAML</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Dedicated support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Custom SLA</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>On-premise option</span>
                </li>
              </ul>
              {currentPlan === "ENTERPRISE" ? (
                <Button className="w-full mt-6" variant="outline" disabled>
                  Current Plan
                </Button>
              ) : (
                <ContactSalesButton />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment Method - Only show for paid plans, link to Stripe portal */}
        {currentPlan !== "FREE" && organization && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                <CardTitle>Payment Method</CardTitle>
              </div>
              <CardDescription>Manage your payment information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center text-white text-xs font-bold">
                    CARD
                  </div>
                  <div>
                    <p className="font-medium">Payment method on file</p>
                    <p className="text-sm text-muted-foreground">
                      Managed through Stripe billing portal
                    </p>
                  </div>
                </div>
                <ManageBillingButton organizationId={organizationId} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Billing History */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              <CardTitle>Billing History</CardTitle>
            </div>
            <CardDescription>Your recent invoices and receipts</CardDescription>
          </CardHeader>
          <CardContent>
            <InvoiceList
              organizationId={organizationId}
              currentPlan={currentPlan}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

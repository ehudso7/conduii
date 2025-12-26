import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import {
  CreditCard,
  Check,
  Zap,
  Building2,
  ArrowRight,
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
import { PLANS, getPlanLimits } from "@/lib/stripe";

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
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await getBillingData(userId);

  if (!user) {
    redirect("/sign-in");
  }

  const organization = user.organizations[0]?.organization;
  const currentPlan = organization?.plan || "FREE";
  const limits = getPlanLimits(currentPlan);

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
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing information
        </p>
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

            {currentPlan === "FREE" && (
              <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
                <p className="font-medium text-blue-900">Upgrade to Pro</p>
                <p className="text-sm text-blue-700 mt-1">
                  Get unlimited projects, 5,000 test runs/month, and priority support.
                </p>
                <Button className="mt-3">
                  Upgrade Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
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
              ) : (
                <Button className="w-full mt-6" variant="outline">
                  Downgrade
                </Button>
              )}
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
              ) : (
                <Button className="w-full mt-6">Upgrade to Pro</Button>
              )}
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
                <Button className="w-full mt-6" variant="outline">
                  Contact Sales
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment Method */}
        {currentPlan !== "FREE" && (
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
                    VISA
                  </div>
                  <div>
                    <p className="font-medium">**** **** **** 4242</p>
                    <p className="text-sm text-muted-foreground">
                      Expires 12/2025
                    </p>
                  </div>
                </div>
                <Button variant="outline">Update</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Billing History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                <CardTitle>Billing History</CardTitle>
              </div>
              <Button variant="outline" size="sm">
                Download All
              </Button>
            </div>
            <CardDescription>Your recent invoices and receipts</CardDescription>
          </CardHeader>
          <CardContent>
            {currentPlan === "FREE" ? (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No billing history.</p>
                <p className="text-sm">
                  Upgrade to a paid plan to see invoices here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { date: "Dec 1, 2024", amount: "$29.00", status: "Paid" },
                  { date: "Nov 1, 2024", amount: "$29.00", status: "Paid" },
                  { date: "Oct 1, 2024", amount: "$29.00", status: "Paid" },
                ].map((invoice, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{invoice.date}</p>
                      <p className="text-sm text-muted-foreground">
                        Monthly subscription
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-medium">{invoice.amount}</span>
                      <Badge variant="success">{invoice.status}</Badge>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

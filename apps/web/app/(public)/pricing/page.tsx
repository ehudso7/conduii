import Link from "next/link";
import { Check, ArrowLeft, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export const metadata = {
  title: "Pricing - Conduii",
  description: "Simple, transparent pricing for deployment testing. Start free, scale as you grow.",
};

const pricing = [
  {
    name: "Free",
    price: "$0",
    description: "For hobby projects and experimentation",
    features: [
      "Up to 3 projects",
      "100 test runs/month",
      "Basic diagnostics",
      "Community support",
      "CLI access",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For professional developers and small teams",
    features: [
      "Unlimited projects",
      "5,000 test runs/month",
      "Smart diagnostics",
      "Priority support",
      "GitHub Action",
      "Web Dashboard",
      "Team collaboration",
      "Custom test suites",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large teams with custom requirements",
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
    cta: "Contact Sales",
    popular: false,
  },
];

const faqs = [
  {
    question: "What counts as a test run?",
    answer: "A test run is a single execution of your test suite against your deployment. Each time you run `conduii run` or trigger tests via GitHub Actions, that counts as one test run.",
  },
  {
    question: "Can I change plans at any time?",
    answer: "Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll get immediate access to new features. When downgrading, the change takes effect at the end of your billing period.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express) and can arrange invoice billing for Enterprise customers.",
  },
  {
    question: "Is there a free trial for Pro?",
    answer: "Yes! The Pro plan comes with a 14-day free trial. No credit card required to start. You can cancel anytime during the trial.",
  },
  {
    question: "What happens if I exceed my test run limit?",
    answer: "On the Free plan, additional test runs are blocked until the next month. On Pro, you can purchase additional test runs at $0.01 per run, or upgrade to Enterprise for unlimited runs.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo size="md" />
            <div className="hidden md:flex items-center gap-8">
              <Link href="/features" className="text-sm text-muted-foreground hover:text-foreground transition">
                Features
              </Link>
              <Link href="/integrations" className="text-sm text-muted-foreground hover:text-foreground transition">
                Integrations
              </Link>
              <Link href="/pricing" className="text-sm font-medium">
                Pricing
              </Link>
              <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition">
                Docs
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button asChild variant="ghost" size="sm">
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/sign-up">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
          data-testid="back-home"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Zap className="w-3 h-3 mr-1" />
            Pricing
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free, scale as you grow. No hidden fees, no surprises.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-24">
          {pricing.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.popular ? "border-primary shadow-lg scale-105" : ""
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground">{plan.period}</span>
                  )}
                </div>
                <CardDescription className="mt-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                {plan.cta === "Contact Sales" ? (
                  <Button asChild className="w-full" variant="outline">
                    <Link href="mailto:sales@conduii.com?subject=Enterprise%20Inquiry">
                      {plan.cta}
                    </Link>
                  </Button>
                ) : (
                  <Button asChild className="w-full" variant={plan.popular ? "default" : "outline"}>
                    <Link href="/sign-up">
                      {plan.cta}
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-24 py-12 border-t">
          <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-muted-foreground mb-6">
            Start testing your deployments today. No credit card required.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/sign-up">Start Free Trial</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/docs">Read the Docs</Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Conduii. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                Privacy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                Terms
              </Link>
              <Link href="/docs" className="text-muted-foreground hover:text-foreground">
                Documentation
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

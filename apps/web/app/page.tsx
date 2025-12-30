import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NavAuthButtons, HeroAuthButtons, CTAAuthButtons } from "@/components/auth-buttons";
import { PricingButton } from "@/components/pricing-buttons";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Logo } from "@/components/brand/logo";
import { SmoothScrollLink } from "@/components/smooth-scroll-link";
import {
  Globe,
  Check,
  Terminal,
  Sparkles,
  Clock,
  BarChart3,
  Bot,
  Rocket,
  Shield,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Auto-Discovery",
    description:
      "Automatically detects your stack — frameworks, databases, auth, payments, and 50+ services.",
  },
  {
    icon: Globe,
    title: "Live Testing",
    description:
      "Tests actual deployed infrastructure, not mocks. Validates real connections between services.",
  },
  {
    icon: Bot,
    title: "AI-Powered Diagnostics",
    description:
      "Get intelligent root cause analysis and fix suggestions when tests fail.",
  },
  {
    icon: Clock,
    title: "Zero Config",
    description:
      "Works out of the box. Just point it at your project and start testing.",
  },
  {
    icon: Terminal,
    title: "Multiple Interfaces",
    description:
      "CLI, Web Dashboard, GitHub Action, or conversational through Claude MCP.",
  },
  {
    icon: BarChart3,
    title: "Detailed Reports",
    description:
      "Comprehensive test reports with performance metrics, trends, and actionable insights.",
  },
];

const integrations = [
  { name: "Vercel", icon: "/images/integrations/vercel.svg", category: "Platform" },
  { name: "Supabase", icon: "/images/integrations/supabase.svg", category: "Database" },
  { name: "Stripe", icon: "/images/integrations/stripe.svg", category: "Payments" },
  { name: "Clerk", icon: "/images/integrations/clerk.svg", category: "Auth" },
  { name: "GitHub", icon: "/images/integrations/github.svg", category: "Repository" },
  { name: "Resend", icon: "/images/integrations/resend.svg", category: "Email" },
  { name: "PlanetScale", icon: "/images/integrations/planetscale.svg", category: "Database" },
  { name: "Netlify", icon: "/images/integrations/netlify.svg", category: "Platform" },
];

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

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo size="md" />

            <div className="hidden md:flex items-center gap-8">
              <SmoothScrollLink href="#features" className="nav-link">
                Features
              </SmoothScrollLink>
              <SmoothScrollLink href="#integrations" className="nav-link">
                Integrations
              </SmoothScrollLink>
              <SmoothScrollLink href="#pricing" className="nav-link">
                Pricing
              </SmoothScrollLink>
              <Link href="/docs" className="nav-link">
                Docs
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <NavAuthButtons />
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-4xl mx-auto">
              <Badge variant="secondary" className="mb-6 badge-brand">
                <Zap className="w-3 h-3 mr-1" />
                AI-Powered Testing Platform
              </Badge>

              <h1 className="hero-title mb-6">
                Test Your Deployments,{" "}
                <span className="gradient-text">Automatically</span>
              </h1>

              <p className="hero-subtitle mb-8 mx-auto">
                Conduii discovers your services, validates connections, and runs comprehensive
                tests against your live infrastructure. Zero configuration required.
              </p>

              <HeroAuthButtons />

              {/* Code Preview */}
              <div className="max-w-2xl mx-auto mt-12">
                <div className="code-block shadow-2xl">
                  <div className="code-block-header">
                    <div className="terminal-dot terminal-dot-red" />
                    <div className="terminal-dot terminal-dot-yellow" />
                    <div className="terminal-dot terminal-dot-green" />
                    <span className="ml-2 text-xs text-slate-400 font-mono">Terminal</span>
                  </div>
                  <div className="code-block-content">
                    <p className="text-slate-500"># Install Conduii CLI</p>
                    <p className="text-teal-400">$ npm install -g @conduii/cli</p>
                    <br />
                    <p className="text-slate-500"># Discover your project</p>
                    <p className="text-teal-400">$ conduii discover</p>
                    <p className="text-slate-300">
                      <span className="text-green-400">&#10003;</span> Found Next.js project<br />
                      <span className="text-green-400">&#10003;</span> Detected: Vercel, Supabase, Stripe, Clerk<br />
                      <span className="text-green-400">&#10003;</span> Generated 24 tests
                    </p>
                    <br />
                    <p className="text-slate-500"># Run tests</p>
                    <p className="text-teal-400">$ conduii run</p>
                    <p className="text-green-400">
                      &#10003; All 24 tests passed in 12.4s
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 border-y bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">SOC 2 Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Check className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">99.9% Uptime SLA</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Globe className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Global Edge Network</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Zap className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Sub-second Tests</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="section-heading mb-4">
                Everything You Need to Test with Confidence
              </h2>
              <p className="section-subheading mx-auto">
                Conduii handles the complexity so you can ship faster.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <Card key={feature.title} className="border hover:border-primary/50 transition-all duration-200 hover:shadow-md">
                  <CardHeader>
                    <div className="feature-icon-bg mb-4">
                      <feature.icon className="feature-icon" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Integrations Section */}
        <section id="integrations" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="section-heading mb-4">
                50+ Integrations, Zero Configuration
              </h2>
              <p className="section-subheading mx-auto">
                Conduii automatically detects and tests all your services.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {integrations.map((integration) => (
                <Card key={integration.name} className="integration-card">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 relative">
                      <Image
                        src={integration.icon}
                        alt={`${integration.name} logo`}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <p className="font-semibold">{integration.name}</p>
                    <p className="text-sm text-muted-foreground">{integration.category}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <p className="text-center mt-8 text-muted-foreground">
              And many more: Neon, Auth0, Railway, Fly.io, SendGrid, Postmark, AWS S3, Cloudflare R2...
            </p>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="section-heading mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="section-subheading mx-auto">
                Start free, scale as you grow.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {pricing.map((plan) => (
                <Card
                  key={plan.name}
                  className={`pricing-card ${
                    plan.popular ? "pricing-card-popular" : ""
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
                    <PricingButton cta={plan.cta} popular={plan.popular} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="gradient-bg rounded-3xl p-12 border">
              <Rocket className="w-16 h-16 mx-auto mb-6 text-primary" />
              <h2 className="section-heading mb-4">
                Ready to Ship with Confidence?
              </h2>
              <p className="section-subheading mb-8 mx-auto">
                Join thousands of developers who trust Conduii to validate their deployments.
              </p>
              <CTAAuthButtons />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Logo size="md" linkToHome={false} className="mb-4" />
              <p className="text-sm text-muted-foreground">
                AI-powered testing platform for modern applications.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-base">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/features" className="hover:text-foreground transition">Features</Link></li>
                <li><Link href="/integrations" className="hover:text-foreground transition">Integrations</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground transition">Pricing</Link></li>
                <li><Link href="/changelog" className="hover:text-foreground transition">Changelog</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-base">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/docs" className="hover:text-foreground transition">Documentation</Link></li>
                <li><Link href="/docs#cli-discover" className="hover:text-foreground transition">CLI Reference</Link></li>
                <li><Link href="/docs#api-auth" className="hover:text-foreground transition">API</Link></li>
                <li><Link href="/blog" className="hover:text-foreground transition">Blog</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-base">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground transition">About</Link></li>
                <li><Link href="/privacy" className="hover:text-foreground transition">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground transition">Terms</Link></li>
                <li><Link href="https://github.com/ehudso7/conduii" className="hover:text-foreground transition">GitHub</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Conduii. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

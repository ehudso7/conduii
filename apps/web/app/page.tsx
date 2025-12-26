import Link from "next/link";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Zap,
  Globe,
  ArrowRight,
  Check,
  Terminal,
  Sparkles,
  Clock,
  BarChart3,
  Bot,
  Rocket,
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
  { name: "Vercel", icon: "▲", category: "Platform" },
  { name: "Supabase", icon: "⚡", category: "Database" },
  { name: "Stripe", icon: "💳", category: "Payments" },
  { name: "Clerk", icon: "🔐", category: "Auth" },
  { name: "GitHub", icon: "🐙", category: "Repository" },
  { name: "Resend", icon: "📧", category: "Email" },
  { name: "PlanetScale", icon: "🪐", category: "Database" },
  { name: "Netlify", icon: "◆", category: "Platform" },
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
      "AI-powered diagnostics",
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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">Conduii</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition">
                Features
              </Link>
              <Link href="#integrations" className="text-sm text-muted-foreground hover:text-foreground transition">
                Integrations
              </Link>
              <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition">
                Pricing
              </Link>
              <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition">
                Docs
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button size="sm">
                    Get Started
                  </Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard">
                  <Button size="sm">Dashboard</Button>
                </Link>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered Testing Platform
            </Badge>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Test Your Deployments,{" "}
              <span className="gradient-text">Automatically</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Conduii discovers your services, validates connections, and runs comprehensive
              tests against your live infrastructure. No local server required.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <SignedOut>
                <SignUpButton mode="modal">
                  <Button size="xl" variant="gradient" className="group">
                    Start Testing Free
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
                  </Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard">
                  <Button size="xl" variant="gradient" className="group">
                    Go to Dashboard
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
                  </Button>
                </Link>
              </SignedIn>
              <Button size="xl" variant="outline" asChild>
                <Link href="/docs">
                  View Documentation
                </Link>
              </Button>
            </div>

            {/* Code Preview */}
            <div className="max-w-2xl mx-auto">
              <div className="rounded-xl border bg-zinc-950 text-zinc-100 overflow-hidden shadow-2xl">
                <div className="flex items-center gap-2 px-4 py-3 bg-zinc-900 border-b border-zinc-800">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-2 text-xs text-zinc-500 font-mono">Terminal</span>
                </div>
                <div className="p-4 font-mono text-sm">
                  <p className="text-zinc-500"># Install Conduii CLI</p>
                  <p className="text-green-400">$ npm install -g @conduii/cli</p>
                  <br />
                  <p className="text-zinc-500"># Discover your project</p>
                  <p className="text-green-400">$ conduii discover</p>
                  <p className="text-zinc-400">
                    ✓ Found Next.js project<br />
                    ✓ Detected: Vercel, Supabase, Stripe, Clerk<br />
                    ✓ Generated 24 tests
                  </p>
                  <br />
                  <p className="text-zinc-500"># Run tests</p>
                  <p className="text-green-400">$ conduii run</p>
                  <p className="text-zinc-400">
                    ✓ All 24 tests passed in 12.4s
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to Test with Confidence
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Conduii handles the complexity so you can ship faster.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="border-2 hover:border-primary/50 transition">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
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
      <section id="integrations" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              50+ Integrations, Zero Configuration
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Conduii automatically detects and tests all your services.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {integrations.map((integration) => (
              <Card key={integration.name} className="hover:shadow-lg transition">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-2">{integration.icon}</div>
                  <p className="font-semibold">{integration.name}</p>
                  <p className="text-sm text-muted-foreground">{integration.category}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center mt-8 text-muted-foreground">
            And many more: PlanetScale, Neon, Auth0, Railway, Fly.io, SendGrid, Postmark, S3, R2...
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free, scale as you grow.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricing.map((plan) => (
              <Card
                key={plan.name}
                className={`relative ${
                  plan.popular ? "border-primary shadow-lg scale-105" : ""
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
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
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "gradient" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="gradient-bg rounded-3xl p-12 border">
            <Rocket className="w-16 h-16 mx-auto mb-6 text-primary" />
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Ship with Confidence?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of developers who trust Conduii to validate their deployments.
            </p>
            <SignedOut>
              <SignUpButton mode="modal">
                <Button size="xl" variant="gradient" className="group">
                  Get Started for Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button size="xl" variant="gradient" className="group">
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
                </Button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl">Conduii</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered testing platform for modern applications.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground transition">Features</Link></li>
                <li><Link href="#integrations" className="hover:text-foreground transition">Integrations</Link></li>
                <li><Link href="#pricing" className="hover:text-foreground transition">Pricing</Link></li>
                <li><Link href="/changelog" className="hover:text-foreground transition">Changelog</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/docs" className="hover:text-foreground transition">Documentation</Link></li>
                <li><Link href="/docs/cli" className="hover:text-foreground transition">CLI Reference</Link></li>
                <li><Link href="/docs/api" className="hover:text-foreground transition">API</Link></li>
                <li><Link href="/blog" className="hover:text-foreground transition">Blog</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground transition">About</Link></li>
                <li><Link href="/privacy" className="hover:text-foreground transition">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground transition">Terms</Link></li>
                <li><Link href="https://github.com/ehudso7/conduii" className="hover:text-foreground transition">GitHub</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Conduii. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

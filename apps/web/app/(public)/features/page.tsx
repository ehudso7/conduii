import Link from "next/link";
import { ArrowLeft, ArrowRight, Sparkles, Globe, Bot, Clock, Terminal, BarChart3, Shield, Zap, GitBranch, Bell, Lock, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export const metadata = {
  title: "Features - Conduii",
  description: "Discover all the powerful features that make Conduii the best deployment testing platform.",
};

const coreFeatures = [
  {
    icon: Sparkles,
    title: "Auto-Discovery",
    description: "Automatically detects your tech stack — frameworks, databases, auth providers, payment processors, and 50+ services. No manual configuration needed.",
    highlights: ["Zero configuration", "50+ integrations", "Framework detection"],
  },
  {
    icon: Globe,
    title: "Live Infrastructure Testing",
    description: "Tests your actual deployed infrastructure, not mocks. Validates real connections between all your services in production or staging.",
    highlights: ["Real connections", "Production testing", "Multi-environment"],
  },
  {
    icon: Bot,
    title: "AI-Powered Diagnostics",
    description: "Get intelligent root cause analysis when tests fail. Our AI understands your stack and provides actionable fix suggestions.",
    highlights: ["Root cause analysis", "Fix suggestions", "Context-aware"],
  },
  {
    icon: Clock,
    title: "Zero Configuration",
    description: "Works out of the box. Just point it at your project and start testing. Conduii figures out everything else.",
    highlights: ["Instant setup", "Smart defaults", "Convention over config"],
  },
  {
    icon: Terminal,
    title: "Multiple Interfaces",
    description: "Use the CLI for local development, Web Dashboard for team visibility, GitHub Actions for CI/CD, or Claude MCP for conversational testing.",
    highlights: ["CLI tool", "Web dashboard", "GitHub Action"],
  },
  {
    icon: BarChart3,
    title: "Comprehensive Reports",
    description: "Detailed test reports with performance metrics, historical trends, and actionable insights to improve your deployment health.",
    highlights: ["Performance metrics", "Trend analysis", "Export options"],
  },
];

const additionalFeatures = [
  {
    icon: Shield,
    title: "Security First",
    description: "SOC 2 compliant. Your credentials never leave your infrastructure. We only test, never store sensitive data.",
  },
  {
    icon: GitBranch,
    title: "Branch Deployments",
    description: "Automatically test preview deployments and branch environments. Perfect for PR reviews and staging validation.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Get notified when tests fail via Slack, Discord, email, or webhooks. Configure alert thresholds and schedules.",
  },
  {
    icon: Lock,
    title: "Team Management",
    description: "Invite team members, set permissions, and collaborate on test results. Built for teams of all sizes.",
  },
  {
    icon: Layers,
    title: "Custom Test Suites",
    description: "Create custom test suites for different scenarios — smoke tests, integration tests, or full regression suites.",
  },
  {
    icon: Zap,
    title: "Parallel Execution",
    description: "Run tests in parallel across multiple services for faster feedback. Get results in seconds, not minutes.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo size="md" />
            <div className="hidden md:flex items-center gap-8">
              <Link href="/features" className="text-sm font-medium" data-testid="nav-features">
                Features
              </Link>
              <Link href="/integrations" className="text-sm text-muted-foreground hover:text-foreground transition" data-testid="nav-integrations">
                Integrations
              </Link>
              <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition" data-testid="nav-pricing">
                Pricing
              </Link>
              <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition" data-testid="nav-docs">
                Docs
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button asChild variant="ghost" size="sm" data-testid="nav-sign-in">
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild size="sm" data-testid="nav-get-started">
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
          data-testid="back-to-home"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            Features
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to Test with Confidence
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Conduii handles the complexity so you can ship faster. Discover all the features that make deployment testing effortless.
          </p>
        </div>

        {/* Core Features */}
        <section className="mb-24">
          <h2 className="text-2xl font-bold mb-8 text-center">Core Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreFeatures.map((feature) => (
              <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base mb-4">
                    {feature.description}
                  </CardDescription>
                  <div className="flex flex-wrap gap-2">
                    {feature.highlights.map((highlight) => (
                      <Badge key={highlight} variant="outline" className="text-xs">
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Additional Features */}
        <section className="mb-24">
          <h2 className="text-2xl font-bold mb-8 text-center">More Powerful Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature) => (
              <Card key={feature.title} className="bg-muted/30">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CLI Demo */}
        <section className="mb-24">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-center">See It in Action</h2>
            <p className="text-center text-muted-foreground mb-8">
              Get started in seconds with our powerful CLI
            </p>
            <div className="bg-zinc-950 rounded-xl p-6 font-mono text-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-2 text-zinc-500">Terminal</span>
              </div>
              <div className="space-y-2 text-zinc-300">
                <p className="text-zinc-500"># Install Conduii CLI</p>
                <p className="text-teal-400">$ npm install -g @conduii/cli</p>
                <br />
                <p className="text-zinc-500"># Discover your project</p>
                <p className="text-teal-400">$ conduii discover</p>
                <p><span className="text-green-400">✓</span> Found Next.js 14 project</p>
                <p><span className="text-green-400">✓</span> Detected: Vercel, Supabase, Stripe, Clerk</p>
                <p><span className="text-green-400">✓</span> Generated 24 tests</p>
                <br />
                <p className="text-zinc-500"># Run tests</p>
                <p className="text-teal-400">$ conduii run</p>
                <p><span className="text-green-400">✓</span> All 24 tests passed in 12.4s</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <div className="text-center py-12 border-t">
          <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-muted-foreground mb-6">
            Start testing your deployments in minutes.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" data-testid="cta-get-started">
              <Link href="/sign-up">
                Get Started Free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" data-testid="cta-docs">
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
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground" data-testid="footer-privacy">
                Privacy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground" data-testid="footer-terms">
                Terms
              </Link>
              <Link href="/docs" className="text-muted-foreground hover:text-foreground" data-testid="footer-docs">
                Documentation
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

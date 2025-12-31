import Link from "next/link";
import { ArrowRight, Zap, Users, Globe, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

export const metadata = {
  title: "About - Conduii",
  description: "Learn about Conduii, the AI-powered testing platform for modern deployments.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo size="md" />
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-muted-foreground hover:text-foreground" data-testid="back-to-home-link">
              Back to Home
            </Link>
            <Link href="/docs" className="text-muted-foreground hover:text-foreground">
              Docs
            </Link>
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-5xl font-bold mb-6">
          About Conduii
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          We're building the future of deployment testing. Our AI-powered platform
          helps developers ensure their applications work perfectly, every time.
        </p>
      </section>

      {/* Mission */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Mission</h2>
          <div className="prose prose-lg mx-auto">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Modern applications rely on dozens of third-party services - databases,
              authentication providers, payment processors, email services, and more.
              Testing these integrations has always been complex and time-consuming.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mt-6">
              Conduii was built to solve this problem. We automatically discover your
              integrations, generate comprehensive tests, and provide AI-powered
              diagnostics when things go wrong. Our goal is to give every developer
              confidence that their deployment works.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="container mx-auto px-4 py-16 bg-muted/30">
        <h2 className="text-3xl font-bold mb-12 text-center">Our Values</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Speed</h3>
            <p className="text-sm text-muted-foreground">
              We believe testing should be fast. Our platform runs tests in parallel
              and provides instant feedback.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Developer First</h3>
            <p className="text-sm text-muted-foreground">
              Built by developers, for developers. We understand your workflow
              and integrate seamlessly with your tools.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Universal</h3>
            <p className="text-sm text-muted-foreground">
              Works with any stack. Next.js, Nuxt, SvelteKit, and more.
              We support 30+ integrations out of the box.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Reliable</h3>
            <p className="text-sm text-muted-foreground">
              We take reliability seriously. Our platform is built to be
              always available when you need it.
            </p>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center">Built for the Future</h2>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-lg text-muted-foreground mb-8">
            Conduii is built by a team passionate about developer experience and
            reliability engineering. We're backed by leading investors and trusted
            by developers worldwide.
          </p>
          <Link href="/sign-up">
            <Button size="lg">
              Start Testing for Free
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Conduii. All rights reserved.
            </div>
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

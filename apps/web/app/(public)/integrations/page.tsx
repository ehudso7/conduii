import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export const metadata = {
  title: "Integrations - Conduii",
  description: "Conduii integrates with 50+ services including Vercel, Supabase, Stripe, Clerk, and more.",
};

const featuredIntegrations = [
  {
    name: "Vercel",
    icon: "/images/integrations/vercel.svg",
    category: "Platform",
    description: "Automatic deployment detection and preview URL testing for all your Vercel projects.",
    features: ["Preview deployments", "Production monitoring", "Edge function testing"],
  },
  {
    name: "Supabase",
    icon: "/images/integrations/supabase.svg",
    category: "Database",
    description: "Test database connections, RLS policies, and real-time subscriptions.",
    features: ["Connection testing", "RLS validation", "Real-time checks"],
  },
  {
    name: "Stripe",
    icon: "/images/integrations/stripe.svg",
    category: "Payments",
    description: "Validate webhook configurations, API keys, and payment flow endpoints.",
    features: ["Webhook validation", "API health", "Checkout testing"],
  },
  {
    name: "Clerk",
    icon: "/images/integrations/clerk.svg",
    category: "Auth",
    description: "Test authentication flows, session management, and user endpoints.",
    features: ["Auth flow testing", "Session validation", "JWT verification"],
  },
  {
    name: "GitHub",
    icon: "/images/integrations/github.svg",
    category: "CI/CD",
    description: "Run tests automatically on every push with our GitHub Action.",
    features: ["PR comments", "Status checks", "Automated runs"],
  },
  {
    name: "Resend",
    icon: "/images/integrations/resend.svg",
    category: "Email",
    description: "Validate email sending configuration and API connectivity.",
    features: ["API validation", "Domain verification", "Template testing"],
  },
  {
    name: "PlanetScale",
    icon: "/images/integrations/planetscale.svg",
    category: "Database",
    description: "Test database branches, connection strings, and query performance.",
    features: ["Branch testing", "Connection health", "Query validation"],
  },
  {
    name: "Netlify",
    icon: "/images/integrations/netlify.svg",
    category: "Platform",
    description: "Test Netlify deployments, functions, and form submissions.",
    features: ["Deploy previews", "Function testing", "Form validation"],
  },
];

const categories = [
  {
    name: "Platforms",
    services: ["Vercel", "Netlify", "Railway", "Fly.io", "Render", "AWS Amplify", "Cloudflare Pages", "DigitalOcean App Platform"],
  },
  {
    name: "Databases",
    services: ["Supabase", "PlanetScale", "Neon", "MongoDB Atlas", "CockroachDB", "Upstash Redis", "Turso", "Xata"],
  },
  {
    name: "Authentication",
    services: ["Clerk", "Auth0", "NextAuth.js", "Supabase Auth", "Firebase Auth", "WorkOS", "Stytch", "Kinde"],
  },
  {
    name: "Payments",
    services: ["Stripe", "PayPal", "Paddle", "LemonSqueezy", "Chargebee", "Recurly"],
  },
  {
    name: "Email",
    services: ["Resend", "SendGrid", "Postmark", "AWS SES", "Mailgun", "Mailchimp Transactional"],
  },
  {
    name: "Storage",
    services: ["AWS S3", "Cloudflare R2", "Vercel Blob", "Supabase Storage", "Uploadthing", "Cloudinary"],
  },
  {
    name: "Monitoring",
    services: ["Sentry", "LogRocket", "Datadog", "New Relic", "Axiom", "BetterStack"],
  },
  {
    name: "CMS",
    services: ["Sanity", "Contentful", "Strapi", "Prismic", "Hygraph", "Payload CMS"],
  },
];

export default function IntegrationsPage() {
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
              <Link href="/integrations" className="text-sm font-medium">
                Integrations
              </Link>
              <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition">
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
          data-testid="back-to-home-link"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Layers className="w-3 h-3 mr-1" />
            Integrations
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            50+ Integrations, Zero Configuration
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Conduii automatically detects and tests all your services. Just point it at your project.
          </p>
        </div>

        {/* Featured Integrations */}
        <section className="mb-24">
          <h2 className="text-2xl font-bold mb-8">Featured Integrations</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {featuredIntegrations.map((integration) => (
              <Card key={integration.name} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 relative flex-shrink-0">
                      <Image
                        src={integration.icon}
                        alt={`${integration.name} logo`}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {integration.category}
                        </Badge>
                      </div>
                      <CardDescription>
                        {integration.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="flex flex-wrap gap-2">
                    {integration.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* All Integrations by Category */}
        <section className="mb-24">
          <h2 className="text-2xl font-bold mb-8">All Integrations</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Card key={category.name}>
                <CardHeader>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.services.map((service) => (
                      <li key={service} className="text-sm text-muted-foreground flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        {service}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Request Integration */}
        <section className="mb-24 bg-muted/30 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Don't See Your Stack?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            We're constantly adding new integrations. Let us know what services you use and we'll prioritize adding support.
          </p>
          <Button asChild variant="outline" data-testid="request-integration-link">
            <Link href="mailto:support@conduii.com?subject=Integration%20Request">
              Request an Integration
            </Link>
          </Button>
        </section>

        {/* CTA Section */}
        <div className="text-center py-12 border-t">
          <h2 className="text-2xl font-bold mb-4">Ready to test your integrations?</h2>
          <p className="text-muted-foreground mb-6">
            Conduii discovers your services automatically. No configuration required.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" data-testid="integrations-cta-signup">
              <Link href="/sign-up">
                Get Started Free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
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

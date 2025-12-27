import Link from "next/link";
import { ArrowLeft, Book, Terminal, Code, Zap, FileCode, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  {
    title: "Getting Started",
    icon: Zap,
    description: "Quick start guide to set up Conduii",
    links: [
      { title: "Installation", href: "#installation" },
      { title: "Configuration", href: "#configuration" },
      { title: "First Test Run", href: "#first-test" },
    ],
  },
  {
    title: "CLI Reference",
    icon: Terminal,
    description: "Complete CLI command documentation",
    links: [
      { title: "conduii discover", href: "#discover" },
      { title: "conduii run", href: "#run" },
      { title: "conduii status", href: "#status" },
    ],
  },
  {
    title: "API Reference",
    icon: Code,
    description: "REST API documentation",
    links: [
      { title: "Authentication", href: "#auth" },
      { title: "Projects", href: "#projects" },
      { title: "Test Runs", href: "#test-runs" },
    ],
  },
  {
    title: "Integrations",
    icon: Settings,
    description: "Connect your services",
    links: [
      { title: "GitHub Actions", href: "#github-actions" },
      { title: "Vercel", href: "#vercel" },
      { title: "Webhooks", href: "#webhooks" },
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <Book className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold">Documentation</h1>
        </div>
        <p className="text-xl text-muted-foreground mb-12">
          Everything you need to get started with Conduii
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {sections.map((section) => (
            <Card key={section.title} className="hover:shadow-lg transition">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <section.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.title}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition flex items-center gap-2"
                      >
                        <FileCode className="w-4 h-4" />
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Start Section */}
        <Card className="mt-12" id="installation">
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>Get up and running in minutes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">1. Install the CLI</h3>
              <div className="bg-zinc-950 text-zinc-100 rounded-lg p-4 font-mono text-sm">
                <p className="text-green-400">$ npm install -g @conduii/cli</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">2. Authenticate</h3>
              <div className="bg-zinc-950 text-zinc-100 rounded-lg p-4 font-mono text-sm">
                <p className="text-green-400">$ conduii login</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">3. Discover your project</h3>
              <div className="bg-zinc-950 text-zinc-100 rounded-lg p-4 font-mono text-sm">
                <p className="text-green-400">$ conduii discover</p>
                <p className="text-zinc-400 mt-2">
                  ✓ Found Next.js project{"\n"}
                  ✓ Detected: Vercel, Supabase, Stripe{"\n"}
                  ✓ Generated 24 tests
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">4. Run tests</h3>
              <div className="bg-zinc-950 text-zinc-100 rounded-lg p-4 font-mono text-sm">
                <p className="text-green-400">$ conduii run</p>
                <p className="text-zinc-400 mt-2">✓ All 24 tests passed in 12.4s</p>
              </div>
            </div>

            <div className="pt-4">
              <Link href="/sign-up">
                <Button>
                  Get Started Free
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

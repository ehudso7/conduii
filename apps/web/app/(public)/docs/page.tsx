"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Book, Terminal, Code, Zap, Settings, Copy, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const sections = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: Zap,
    description: "Quick start guide to set up Conduii",
    links: [
      { title: "Installation", href: "installation" },
      { title: "Configuration", href: "configuration" },
      { title: "First Test Run", href: "first-test" },
    ],
  },
  {
    id: "cli-reference",
    title: "CLI Reference",
    icon: Terminal,
    description: "Complete CLI command documentation",
    links: [
      { title: "conduii discover", href: "cli-discover" },
      { title: "conduii run", href: "cli-run" },
      { title: "conduii status", href: "cli-status" },
    ],
  },
  {
    id: "api-reference",
    title: "API Reference",
    icon: Code,
    description: "REST API documentation",
    links: [
      { title: "Authentication", href: "api-auth" },
      { title: "Projects", href: "api-projects" },
      { title: "Test Runs", href: "api-test-runs" },
    ],
  },
  {
    id: "integrations",
    title: "Integrations",
    icon: Settings,
    description: "Connect your services",
    links: [
      { title: "GitHub Actions", href: "github-actions" },
      { title: "Vercel", href: "vercel" },
      { title: "Webhooks", href: "webhooks" },
    ],
  },
];

function CodeBlock({ code, language = "bash" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      // Silently fail if clipboard is not available
    }
  };

  // Reset copied state after 2 seconds
  if (copied) {
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative group">
      <pre className="bg-zinc-950 text-zinc-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
        <code className={`language-${language}`}>{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        aria-label={copied ? "Copied" : "Copy code"}
        className="absolute top-2 right-2 p-2 rounded bg-zinc-800 text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}

export default function DocsPage() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth",
      });
    }
  };

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

        {/* Section Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
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
                      <button
                        onClick={() => scrollToSection(link.href)}
                        className="text-sm text-muted-foreground hover:text-primary transition flex items-center gap-2 w-full text-left"
                      >
                        <ChevronRight className="w-4 h-4" />
                        {link.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Installation Section */}
        <section id="installation" data-section="installation" className="scroll-mt-20 mb-16">
          <div className="flex items-center gap-2 mb-6">
            <Badge>Getting Started</Badge>
            <h2 className="text-3xl font-bold">Installation</h2>
          </div>
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-2">1. Install the CLI</h3>
                <p className="text-muted-foreground mb-3">
                  Install the Conduii CLI globally using npm, yarn, or pnpm:
                </p>
                <CodeBlock code="npm install -g @conduii/cli" />
                <p className="text-sm text-muted-foreground mt-2">Or with yarn:</p>
                <CodeBlock code="yarn global add @conduii/cli" />
              </div>

              <div>
                <h3 className="font-semibold mb-2">2. Authenticate</h3>
                <p className="text-muted-foreground mb-3">
                  Log in to your Conduii account to connect the CLI:
                </p>
                <CodeBlock code="conduii login" />
              </div>

              <div>
                <h3 className="font-semibold mb-2">3. Verify installation</h3>
                <p className="text-muted-foreground mb-3">
                  Check that everything is working:
                </p>
                <CodeBlock code="conduii --version" />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Configuration Section */}
        <section id="configuration" data-section="configuration" className="scroll-mt-20 mb-16">
          <div className="flex items-center gap-2 mb-6">
            <Badge>Getting Started</Badge>
            <h2 className="text-3xl font-bold">Configuration</h2>
          </div>
          <Card>
            <CardContent className="p-6 space-y-6">
              <p className="text-muted-foreground">
                Conduii can be configured using a <code className="bg-muted px-1 rounded">conduii.config.js</code> file in your project root:
              </p>
              <CodeBlock
                language="javascript"
                code={`// conduii.config.js
module.exports = {
  // Project configuration
  project: {
    name: 'My Project',
    environment: 'production',
  },

  // Service discovery options
  discovery: {
    exclude: ['node_modules', '.git', 'dist'],
  },

  // Test configuration
  tests: {
    timeout: 30000,
    retries: 2,
    parallel: true,
  },
};`}
              />
            </CardContent>
          </Card>
        </section>

        {/* First Test Section */}
        <section id="first-test" data-section="first-test" className="scroll-mt-20 mb-16">
          <div className="flex items-center gap-2 mb-6">
            <Badge>Getting Started</Badge>
            <h2 className="text-3xl font-bold">First Test Run</h2>
          </div>
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-2">1. Discover your project</h3>
                <p className="text-muted-foreground mb-3">
                  Run discovery to automatically detect your services:
                </p>
                <CodeBlock code={`conduii discover

# Output:
# ✓ Found Next.js project
# ✓ Detected: Vercel, Supabase, Stripe
# ✓ Generated 24 tests`} />
              </div>

              <div>
                <h3 className="font-semibold mb-2">2. Run tests</h3>
                <p className="text-muted-foreground mb-3">
                  Execute the discovered tests:
                </p>
                <CodeBlock code={`conduii run

# Output:
# Running 24 tests...
# ✓ All 24 tests passed in 12.4s`} />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CLI Discover Section */}
        <section id="cli-discover" data-section="cli-discover" className="scroll-mt-20 mb-16">
          <div className="flex items-center gap-2 mb-6">
            <Badge variant="secondary">CLI Reference</Badge>
            <h2 className="text-3xl font-bold">conduii discover</h2>
          </div>
          <Card>
            <CardContent className="p-6 space-y-6">
              <p className="text-muted-foreground">
                Automatically discover services and integrations in your project.
              </p>
              <CodeBlock code={`conduii discover [options]

Options:
  -p, --path <path>    Path to project (default: current directory)
  -e, --env <file>     Environment file to use (default: .env)
  --no-cache          Disable caching
  -v, --verbose       Verbose output`} />
            </CardContent>
          </Card>
        </section>

        {/* CLI Run Section */}
        <section id="cli-run" data-section="cli-run" className="scroll-mt-20 mb-16">
          <div className="flex items-center gap-2 mb-6">
            <Badge variant="secondary">CLI Reference</Badge>
            <h2 className="text-3xl font-bold">conduii run</h2>
          </div>
          <Card>
            <CardContent className="p-6 space-y-6">
              <p className="text-muted-foreground">
                Execute tests against your deployed infrastructure.
              </p>
              <CodeBlock code={`conduii run [options]

Options:
  -t, --type <type>    Test type: all, health, integration, api, e2e
  -e, --env <name>     Environment to test (staging, production)
  --suite <id>        Run specific test suite
  --parallel          Run tests in parallel`} />
            </CardContent>
          </Card>
        </section>

        {/* CLI Status Section */}
        <section id="cli-status" data-section="cli-status" className="scroll-mt-20 mb-16">
          <div className="flex items-center gap-2 mb-6">
            <Badge variant="secondary">CLI Reference</Badge>
            <h2 className="text-3xl font-bold">conduii status</h2>
          </div>
          <Card>
            <CardContent className="p-6 space-y-6">
              <p className="text-muted-foreground">
                Check the status of services and test runs.
              </p>
              <CodeBlock code={`conduii status [options]

Options:
  --last              Show last test run results
  --services          Show service health status
  --watch             Watch for updates`} />
            </CardContent>
          </Card>
        </section>

        {/* API Auth Section */}
        <section id="api-auth" data-section="api-auth" className="scroll-mt-20 mb-16">
          <div className="flex items-center gap-2 mb-6">
            <Badge variant="outline">API Reference</Badge>
            <h2 className="text-3xl font-bold">Authentication</h2>
          </div>
          <Card>
            <CardContent className="p-6 space-y-6">
              <p className="text-muted-foreground">
                All API requests require authentication using an API key.
              </p>
              <CodeBlock code={`curl -X GET "https://api.conduii.com/v1/projects" \\
  -H "Authorization: Bearer YOUR_API_KEY"`} />
            </CardContent>
          </Card>
        </section>

        {/* API Projects Section */}
        <section id="api-projects" data-section="api-projects" className="scroll-mt-20 mb-16">
          <div className="flex items-center gap-2 mb-6">
            <Badge variant="outline">API Reference</Badge>
            <h2 className="text-3xl font-bold">Projects API</h2>
          </div>
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <h4 className="font-semibold mb-2">List Projects</h4>
                <CodeBlock code={`GET /v1/projects`} />
              </div>
              <div>
                <h4 className="font-semibold mb-2">Create Project</h4>
                <CodeBlock code={`POST /v1/projects
{ "name": "My Project", "productionUrl": "https://myapp.com" }`} />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* API Test Runs Section */}
        <section id="api-test-runs" data-section="api-test-runs" className="scroll-mt-20 mb-16">
          <div className="flex items-center gap-2 mb-6">
            <Badge variant="outline">API Reference</Badge>
            <h2 className="text-3xl font-bold">Test Runs API</h2>
          </div>
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Start Test Run</h4>
                <CodeBlock code={`POST /v1/projects/:projectId/runs
{ "testType": "all", "environment": "production" }`} />
              </div>
              <div>
                <h4 className="font-semibold mb-2">Get Test Run Status</h4>
                <CodeBlock code={`GET /v1/test-runs/:runId`} />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* GitHub Actions Section */}
        <section id="github-actions" data-section="github-actions" className="scroll-mt-20 mb-16">
          <div className="flex items-center gap-2 mb-6">
            <Badge variant="secondary">Integrations</Badge>
            <h2 className="text-3xl font-bold">GitHub Actions</h2>
          </div>
          <Card>
            <CardContent className="p-6 space-y-6">
              <p className="text-muted-foreground">
                Run Conduii tests as part of your CI/CD pipeline.
              </p>
              <CodeBlock language="yaml" code={`# .github/workflows/test.yml
name: Deployment Tests
on:
  deployment_status:
    states: [success]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: ehudso7/conduii-action@v1
        with:
          api-key: \${{ secrets.CONDUII_API_KEY }}
          project-id: proj_123`} />
            </CardContent>
          </Card>
        </section>

        {/* Vercel Section */}
        <section id="vercel" data-section="vercel" className="scroll-mt-20 mb-16">
          <div className="flex items-center gap-2 mb-6">
            <Badge variant="secondary">Integrations</Badge>
            <h2 className="text-3xl font-bold">Vercel Integration</h2>
          </div>
          <Card>
            <CardContent className="p-6 space-y-4">
              <p className="text-muted-foreground">
                Conduii automatically detects and tests Vercel deployments.
              </p>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Add your Vercel token to your Conduii project settings</li>
                <li>Conduii will automatically discover your Vercel projects</li>
                <li>Tests run automatically after each deployment</li>
              </ol>
            </CardContent>
          </Card>
        </section>

        {/* Webhooks Section */}
        <section id="webhooks" data-section="webhooks" className="scroll-mt-20 mb-16">
          <div className="flex items-center gap-2 mb-6">
            <Badge variant="secondary">Integrations</Badge>
            <h2 className="text-3xl font-bold">Webhooks</h2>
          </div>
          <Card>
            <CardContent className="p-6 space-y-6">
              <p className="text-muted-foreground">
                Receive notifications when test runs complete.
              </p>
              <CodeBlock code={`POST https://your-server.com/webhook
{
  "event": "test_run.completed",
  "testRun": {
    "id": "run_789",
    "status": "PASSED"
  }
}`} />
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <div className="text-center pt-8 border-t">
          <p className="text-muted-foreground mb-4">Ready to get started?</p>
          <Link href="/sign-up">
            <Button size="lg">Get Started Free</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

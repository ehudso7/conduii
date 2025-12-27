import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, User, Share2, Twitter, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Blog post data - in a real app this would come from a CMS or database
const posts: Record<string, {
  title: string;
  description: string;
  date: string;
  readTime: string;
  category: string;
  author: { name: string; role: string; avatar: string };
  content: string;
}> = {
  "introducing-conduii": {
    title: "Introducing Conduii: AI-Powered Testing for Modern Apps",
    description: "Learn how Conduii automatically discovers your services and generates comprehensive tests for your deployed infrastructure.",
    date: "Dec 20, 2024",
    readTime: "5 min read",
    category: "Announcement",
    author: {
      name: "Conduii Team",
      role: "Engineering",
      avatar: "/team/default.png",
    },
    content: `
Modern applications are complex. They rely on dozens of third-party services — databases, authentication providers, payment processors, email services, storage solutions, and more. Testing these integrations has always been challenging.

## The Problem with Traditional Testing

Traditional testing approaches fall short in several ways:

1. **Mock-heavy testing** - Tests that mock external services don't catch real integration issues
2. **Environment parity** - Local environments rarely match production
3. **Manual discovery** - Developers must manually identify and test each integration
4. **Reactive debugging** - Issues are often discovered in production, not during development

## Enter Conduii

Conduii is built from the ground up to solve these problems. Here's how:

### Auto-Discovery

Point Conduii at your project and it automatically detects your entire stack:
- Frameworks (Next.js, Nuxt, SvelteKit, etc.)
- Databases (PostgreSQL, MySQL, MongoDB, etc.)
- Auth providers (Clerk, Auth0, Supabase Auth, etc.)
- Payment processors (Stripe, PayPal, etc.)
- And 50+ more service types

### Live Testing

Unlike traditional E2E tests that run against mocks, Conduii tests your actual deployed infrastructure. This means you catch real issues before your users do.

### AI-Powered Diagnostics

When tests fail, Conduii doesn't just tell you what broke — it tells you why and how to fix it. Our AI analyzes failure patterns and provides actionable suggestions.

## Getting Started

Getting started with Conduii takes just a few minutes:

\`\`\`bash
# Install the CLI
npm install -g @conduii/cli

# Authenticate
conduii login

# Discover your project
conduii discover

# Run tests
conduii run
\`\`\`

That's it! Conduii handles the complexity so you can focus on building.

## What's Next

We're just getting started. Here's what's coming:

- **More integrations** - We're adding support for 20+ new services
- **GitHub Action** - Run Conduii as part of your CI/CD pipeline
- **Team features** - Collaborate on testing with your entire team
- **Custom tests** - Define custom tests for your specific use cases

## Join the Beta

We're currently in public beta and we'd love your feedback. Sign up for free and start testing your deployments with confidence.
    `,
  },
  "traditional-testing-limitations": {
    title: "Why Traditional E2E Testing Falls Short",
    description: "Explore the limitations of traditional testing approaches and how testing deployed infrastructure changes the game.",
    date: "Dec 15, 2024",
    readTime: "8 min read",
    category: "Engineering",
    author: {
      name: "Conduii Team",
      role: "Engineering",
      avatar: "/team/default.png",
    },
    content: `
End-to-end testing has been a cornerstone of software quality for decades. But as applications have evolved, traditional E2E testing approaches have struggled to keep up.

## The Evolution of Modern Applications

Today's applications are fundamentally different from those of even five years ago:

- **Microservices architecture** - Applications are distributed across many services
- **Third-party dependencies** - Core functionality often relies on external APIs
- **Multi-cloud deployments** - Infrastructure spans multiple providers
- **Continuous deployment** - Changes ship multiple times per day

## Where Traditional E2E Falls Short

### 1. Mock Dependency

Traditional E2E tests often mock external services to ensure test reliability. But mocks have significant drawbacks:

- **Drift** - Mocks quickly become outdated as APIs change
- **False positives** - Tests pass even when real integrations are broken
- **Incomplete coverage** - Edge cases in external services aren't tested

### 2. Environment Parity

Local development environments rarely match production:

- Different database versions
- Missing environment variables
- Network configuration differences
- Service discovery issues

### 3. Flaky Tests

E2E tests are notorious for being flaky. Common causes include:

- Timing issues with asynchronous operations
- Race conditions in parallel test execution
- External service rate limiting
- Network latency variations

## A Better Approach

What if instead of testing a simulation of your application, you tested the real thing?

That's the core insight behind Conduii. By testing your actual deployed infrastructure, you get:

- **Real integration testing** - No more mock drift
- **Production parity** - You're testing what your users experience
- **Reliable results** - Tests against stable deployed infrastructure

## Making the Switch

Transitioning from traditional E2E to deployed infrastructure testing doesn't mean throwing away everything you've built. Here's how to get started:

1. **Start with health checks** - Verify all services are reachable
2. **Add integration tests** - Test key user flows across services
3. **Implement monitors** - Continuous testing in production
4. **Set up alerts** - Know immediately when something breaks

## Conclusion

Traditional E2E testing served us well, but modern applications require modern testing approaches. Testing deployed infrastructure provides the confidence you need to ship fast without breaking things.
    `,
  },
  "service-discovery-guide": {
    title: "Getting Started with Service Discovery",
    description: "A deep dive into how Conduii automatically detects your tech stack and integrations.",
    date: "Dec 10, 2024",
    readTime: "6 min read",
    category: "Tutorial",
    author: {
      name: "Conduii Team",
      role: "Engineering",
      avatar: "/team/default.png",
    },
    content: `
One of Conduii's most powerful features is automatic service discovery. In this guide, we'll explore how it works and how to get the most out of it.

## What is Service Discovery?

Service discovery is the process of automatically identifying all the external services and integrations your application depends on. This includes:

- **Platforms** - Vercel, Netlify, AWS, etc.
- **Databases** - PostgreSQL, MySQL, MongoDB, Redis, etc.
- **Authentication** - Clerk, Auth0, Firebase Auth, etc.
- **Payments** - Stripe, PayPal, Square, etc.
- **Email** - Resend, SendGrid, Postmark, etc.
- **Storage** - S3, R2, Cloudinary, etc.

## How It Works

Conduii uses multiple signals to detect your services:

### 1. Environment Variable Analysis

We analyze your environment variable patterns to identify services. For example:
- \`DATABASE_URL\` → Database connection
- \`STRIPE_SECRET_KEY\` → Stripe integration
- \`CLERK_SECRET_KEY\` → Clerk authentication

### 2. Dependency Scanning

We scan your package.json and other dependency files:
- \`@prisma/client\` → Prisma ORM
- \`@supabase/supabase-js\` → Supabase
- \`stripe\` → Stripe SDK

### 3. Code Analysis

We analyze your codebase for integration patterns:
- API endpoint calls
- SDK initialization
- Configuration files

## Running Discovery

Run discovery with a single command:

\`\`\`bash
conduii discover
\`\`\`

You'll see output like:

\`\`\`
Analyzing project...

✓ Framework: Next.js 14
✓ Platform: Vercel
✓ Database: PostgreSQL (via Prisma)
✓ Auth: Clerk
✓ Payments: Stripe
✓ Email: Resend

Discovered 6 services
Generated 24 tests
\`\`\`

## Customizing Discovery

You can customize discovery with a \`conduii.config.js\` file:

\`\`\`javascript
module.exports = {
  discovery: {
    // Exclude certain directories
    exclude: ['node_modules', '.git', 'dist'],

    // Add custom service detection
    customServices: [
      {
        name: 'Custom API',
        type: 'api',
        endpoint: process.env.CUSTOM_API_URL,
      },
    ],
  },
};
\`\`\`

## Best Practices

1. **Run discovery regularly** - As your app evolves, new services may be added
2. **Review detected services** - Ensure all critical services are detected
3. **Add custom services** - For internal APIs or custom integrations
4. **Use environment-specific configs** - Different services may be used in different environments

## Troubleshooting

### Service Not Detected

If a service isn't detected:
- Ensure environment variables are properly set
- Check if the SDK is installed
- Try adding it as a custom service

### False Positives

If non-existent services are detected:
- Check for unused dependencies
- Review environment variable patterns
- Use the exclude configuration

## Conclusion

Service discovery is just the first step. Once Conduii knows your stack, it can generate comprehensive tests, monitor health, and provide intelligent diagnostics when things go wrong.
    `,
  },
  "deployment-validation": {
    title: "Best Practices for Deployment Validation",
    description: "Learn the industry best practices for validating your deployments before they reach production.",
    date: "Dec 5, 2024",
    readTime: "7 min read",
    category: "Best Practices",
    author: {
      name: "Conduii Team",
      role: "Engineering",
      avatar: "/team/default.png",
    },
    content: `
Deployment validation is critical for maintaining application reliability. In this post, we'll cover best practices for ensuring your deployments work correctly.

## The Deployment Validation Pyramid

Like the testing pyramid, deployment validation has multiple layers:

### 1. Health Checks (Base)

The foundation of deployment validation is health checks:
- **Liveness** - Is the application running?
- **Readiness** - Is the application ready to serve traffic?
- **Dependencies** - Are all required services reachable?

### 2. Smoke Tests

Quick tests that verify core functionality:
- Can users log in?
- Can they perform key actions?
- Are critical pages loading?

### 3. Integration Tests

Deeper tests that verify service integrations:
- Database queries work correctly
- External APIs are responding
- Webhooks are functional

### 4. Synthetic Monitoring (Top)

Continuous testing in production:
- Regular health checks
- User journey simulations
- Performance monitoring

## Pre-Deployment Checklist

Before deploying, ensure:

1. ✅ All tests pass in CI
2. ✅ Environment variables are configured
3. ✅ Database migrations are applied
4. ✅ Feature flags are set correctly
5. ✅ Rollback plan is documented

## Post-Deployment Validation

After deploying, verify:

1. ✅ Health endpoints return 200
2. ✅ Key user flows work
3. ✅ No error spike in monitoring
4. ✅ Performance metrics are normal
5. ✅ All integrations are functional

## Automating Validation with Conduii

Conduii automates much of this process:

\`\`\`bash
# Run post-deployment validation
conduii run --environment production

# Output:
# ✓ Health Check: All services healthy
# ✓ Auth: Login flow working
# ✓ Database: Queries executing correctly
# ✓ Payments: Stripe integration verified
# ✓ Email: Resend API responding
#
# All 24 tests passed in 12.4s
\`\`\`

## Handling Failures

When validation fails:

1. **Don't panic** - Automated rollback should trigger
2. **Investigate** - Check logs and error messages
3. **Fix forward or rollback** - Decide based on severity
4. **Post-mortem** - Document what went wrong

## Continuous Improvement

Deployment validation should evolve:

- Add tests for new features
- Remove tests for deprecated features
- Tune thresholds based on experience
- Automate more of the process

## Conclusion

Good deployment validation gives you confidence to ship fast. Start with the basics and build up your validation pyramid over time.
    `,
  },
};

export async function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = posts[params.slug];
  if (!post) {
    return { title: "Post Not Found - Conduii" };
  }
  return {
    title: `${post.title} - Conduii Blog`,
    description: post.description,
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = posts[params.slug];

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <article className="max-w-3xl mx-auto px-4 py-12">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        {/* Header */}
        <header className="mb-12">
          <Badge variant="secondary" className="mb-4">
            {post.category}
          </Badge>
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <p className="text-xl text-muted-foreground mb-6">{post.description}</p>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {post.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </span>
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {post.author.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Linkedin className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          {post.content.split('\n\n').map((paragraph, index) => {
            if (paragraph.startsWith('## ')) {
              return (
                <h2 key={index} className="text-2xl font-bold mt-8 mb-4">
                  {paragraph.replace('## ', '')}
                </h2>
              );
            }
            if (paragraph.startsWith('### ')) {
              return (
                <h3 key={index} className="text-xl font-semibold mt-6 mb-3">
                  {paragraph.replace('### ', '')}
                </h3>
              );
            }
            if (paragraph.startsWith('```')) {
              const lines = paragraph.split('\n');
              const language = lines[0].replace('```', '');
              const code = lines.slice(1, -1).join('\n');
              return (
                <pre key={index} className="bg-zinc-950 text-zinc-100 rounded-lg p-4 overflow-x-auto my-4">
                  <code className={`language-${language}`}>{code}</code>
                </pre>
              );
            }
            if (paragraph.startsWith('- ')) {
              const items = paragraph.split('\n').filter(line => line.startsWith('- '));
              return (
                <ul key={index} className="list-disc pl-6 my-4 space-y-2">
                  {items.map((item, i) => (
                    <li key={i} className="text-muted-foreground">
                      {item.replace('- ', '')}
                    </li>
                  ))}
                </ul>
              );
            }
            if (paragraph.startsWith('1. ')) {
              const items = paragraph.split('\n').filter(line => /^\d+\.\s/.test(line));
              return (
                <ol key={index} className="list-decimal pl-6 my-4 space-y-2">
                  {items.map((item, i) => (
                    <li key={i} className="text-muted-foreground">
                      {item.replace(/^\d+\.\s/, '')}
                    </li>
                  ))}
                </ol>
              );
            }
            if (paragraph.trim()) {
              return (
                <p key={index} className="text-muted-foreground leading-relaxed my-4">
                  {paragraph}
                </p>
              );
            }
            return null;
          })}
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">{post.author.name}</p>
                <p className="text-sm text-muted-foreground">{post.author.role}</p>
              </div>
            </div>
            <Link href="/blog">
              <Button variant="outline">
                Read More Posts
              </Button>
            </Link>
          </div>
        </footer>
      </article>
    </div>
  );
}

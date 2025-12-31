import Link from "next/link";

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
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              Conduii
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8" aria-label="Primary">
              <a href="#features" className="nav-link hover:opacity-80 transition">
                Features
              </a>
              <a href="#integrations" className="nav-link hover:opacity-80 transition">
                Integrations
              </a>
              <a href="#pricing" className="nav-link hover:opacity-80 transition">
                Pricing
              </a>
              <Link href="/docs" className="nav-link hover:opacity-80 transition">
                Docs
              </Link>
            </nav>
          </div>

          {/* Right side auth buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted transition"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
            >
              Get Started
            </Link>
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
                    <p className="text-teal-400">
                      npm install -g @conduii/cli
                    </p>
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
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            Testing, monitoring, and release confidence — in one place.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Conduii helps you validate deployments, discover services, track runs, and catch failures
            before your users do.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/sign-up"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
            >
              Start Free
            </Link>
            <Link
              href="/docs"
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted transition"
            >
              Read Docs
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-semibold">Features</h2>
        <p className="mt-2 text-muted-foreground">
          Fast setup, real signals, and workflows that match how teams actually ship.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border p-5">
            <h3 className="font-medium">Test Runs</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Trigger, track, and review run results with clean summaries and diagnostics.
            </p>
          </div>
          <div className="rounded-lg border p-5">
            <h3 className="font-medium">Service Discovery</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Automatically detect services and endpoints so coverage grows with the system.
            </p>
          </div>
          <div className="rounded-lg border p-5">
            <h3 className="font-medium">Health & Alerts</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Monitor status and get notified when things degrade or fail.
            </p>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section id="integrations" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-semibold">Integrations</h2>
        <p className="mt-2 text-muted-foreground">
          Hook into the tools you already use.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border p-5">
            <h3 className="font-medium">GitHub</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Validate builds and deployments with CI visibility.
            </p>
          </div>
          <div className="rounded-lg border p-5">
            <h3 className="font-medium">Slack / Discord</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Route alerts to the right channel automatically.
            </p>
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
                Deployment testing platform for modern applications.
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
          <div className="rounded-lg border p-5">
            <h3 className="font-medium">Custom Webhooks</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Send events wherever you want with delivery tracking.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-semibold">Pricing</h2>
        <p className="mt-2 text-muted-foreground">
          Start free and scale up when you need more projects and runs.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border p-5">
            <h3 className="font-medium">Free</h3>
            <p className="mt-2 text-sm text-muted-foreground">For early projects.</p>
          </div>
          <div className="rounded-lg border p-5">
            <h3 className="font-medium">Pro</h3>
            <p className="mt-2 text-sm text-muted-foreground">For teams shipping often.</p>
          </div>
          <div className="rounded-lg border p-5">
            <h3 className="font-medium">Enterprise</h3>
            <p className="mt-2 text-sm text-muted-foreground">For serious scale & controls.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Conduii
          </p>
          <nav className="flex items-center gap-6" aria-label="Footer">
            <Link href="/privacy" className="text-sm hover:opacity-80 transition">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm hover:opacity-80 transition">
              Terms
            </Link>
            <Link href="/docs" className="text-sm hover:opacity-80 transition">
              Docs
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}

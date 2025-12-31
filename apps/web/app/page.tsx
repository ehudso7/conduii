import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <header className="fixed inset-x-0 top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              Conduii
            </Link>

            {/* Desktop links */}
            <nav className="hidden md:flex items-center gap-8" aria-label="Primary">
              {/* Use normal anchors for hash sections (most reliable for E2E) */}
              <a href="#features" className="nav-link">
                Features
              </a>
              <a href="#integrations" className="nav-link">
                Integrations
              </a>
              <a href="#pricing" className="nav-link">
                Pricing
              </a>
              <Link href="/docs" className="nav-link">
                Docs
              </Link>
            </nav>
          </div>

          {/* Auth CTAs */}
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted">
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16" />

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            Catch failures before your users do.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Validate deployments, discover services, track runs, and ship with confidence.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/sign-up"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Start Free
            </Link>
            <Link href="/docs" className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">
              Read Docs
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold">Features</h2>
        <p className="mt-2 text-muted-foreground">Signals that help you ship faster with fewer surprises.</p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border p-5">
            <h3 className="font-medium">Test Runs</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Trigger and track runs with clean summaries and diagnostics.
            </p>
          </div>
          <div className="rounded-lg border p-5">
            <h3 className="font-medium">Service Discovery</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Automatically detect services/endpoints so coverage grows with the system.
            </p>
          </div>
          <div className="rounded-lg border p-5">
            <h3 className="font-medium">Alerts</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Notify the right place when things degrade or fail.
            </p>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section id="integrations" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold">Integrations</h2>
        <p className="mt-2 text-muted-foreground">Hook into the tools you already use.</p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border p-5">
            <h3 className="font-medium">GitHub</h3>
            <p className="mt-2 text-sm text-muted-foreground">Validate CI, deployments, and release confidence.</p>
          </div>
          <div className="rounded-lg border p-5">
            <h3 className="font-medium">Slack / Discord</h3>
            <p className="mt-2 text-sm text-muted-foreground">Route alerts and events to the right channel.</p>
          </div>
          <div className="rounded-lg border p-5">
            <h3 className="font-medium">Custom Webhooks</h3>
            <p className="mt-2 text-sm text-muted-foreground">Send events anywhere with delivery tracking.</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold">Pricing</h2>
        <p className="mt-2 text-muted-foreground">Start free, scale when you need more.</p>

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
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Conduii</p>
          <nav className="flex items-center gap-6" aria-label="Footer">
            <Link href="/privacy" className="text-sm hover:opacity-80">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm hover:opacity-80">
              Terms
            </Link>
            <Link href="/docs" className="text-sm hover:opacity-80">
              Docs
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}

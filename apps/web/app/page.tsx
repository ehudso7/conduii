import Link from "next/link";

export default function HomePage() {
  return (
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
              {/* Use plain anchors for hash scroll — avoids Next Link quirks + prevents malformed JSX */}
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

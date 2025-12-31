import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function isClerkConfigured() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  return !!publishableKey && /^pk_(test|live)_[a-zA-Z0-9_-]+$/.test(publishableKey);
}

export default function SignUpPage() {
  const clerkConfigured = isClerkConfigured();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="p-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          data-testid="back-to-home"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
        {clerkConfigured ? (
          <div data-testid="clerk-sign-up">
            <SignUp
              routing="path"
              path="/sign-up"
              signInUrl="/sign-in"
              afterSignUpUrl="/dashboard"
              appearance={{
                elements: {
                  rootBox: "mx-auto",
                  card: "shadow-xl border",
                  headerTitle: "text-2xl font-bold",
                  headerSubtitle: "text-muted-foreground",
                  socialButtonsBlockButton: "border",
                  formButtonPrimary: "bg-primary hover:bg-primary/90",
                  footerActionLink: "text-primary hover:text-primary/90",
                },
              }}
            />
          </div>
        ) : (
          <div className="max-w-md mx-auto text-center p-8 rounded-xl border bg-background shadow-sm" data-testid="sign-up-fallback">
            <h1 className="text-2xl font-bold mb-2">Create your account</h1>
            <p className="text-muted-foreground mb-6">
              Authentication isn’t configured for this environment yet.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                data-testid="sign-up-back-home"
              >
                Back to home
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center rounded-md border px-4 py-2 hover:bg-muted/50"
                data-testid="sign-up-sign-in-link"
              >
                Go to sign in
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

// Check if Clerk is available
let clerkAvailable = false;
let SignInButton: React.ComponentType<{ mode?: string; children: React.ReactNode }> | null = null;
let SignUpButton: React.ComponentType<{ mode?: string; children: React.ReactNode }> | null = null;
let UserButton: React.ComponentType<{ afterSignOutUrl?: string }> | null = null;
let useAuth: (() => { isLoaded: boolean; isSignedIn: boolean }) | null = null;

try {
  const clerk = require("@clerk/nextjs");
  SignInButton = clerk.SignInButton;
  SignUpButton = clerk.SignUpButton;
  UserButton = clerk.UserButton;
  useAuth = clerk.useAuth;
  clerkAvailable = !!(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== "pk_test_placeholder"
  );
} catch {
  clerkAvailable = false;
}

// Simple link-based buttons that always work
function SimpleAuthButtons() {
  return (
    <div className="flex items-center gap-4">
      <Button asChild variant="ghost" size="sm">
        <Link href="/sign-in">Sign In</Link>
      </Button>
      <Button asChild size="sm">
        <Link href="/sign-up">Get Started</Link>
      </Button>
    </div>
  );
}

// Inner component that uses auth hooks - only rendered if Clerk is available
function NavAuthButtonsInner() {
  const auth = useAuth?.();
  const isLoaded = auth?.isLoaded ?? false;
  const isSignedIn = auth?.isSignedIn ?? false;

  if (!isLoaded) {
    return <SimpleAuthButtons />;
  }

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-4">
        <Button asChild size="sm">
          <Link href="/dashboard">Dashboard</Link>
        </Button>
        {UserButton && <UserButton afterSignOutUrl="/" />}
      </div>
    );
  }

  if (SignInButton && SignUpButton) {
    return (
      <div className="flex items-center gap-4">
        <SignInButton mode="modal">
          <Button variant="ghost" size="sm">
            Sign In
          </Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <Button size="sm">
            Get Started
          </Button>
        </SignUpButton>
      </div>
    );
  }

  return <SimpleAuthButtons />;
}

export function NavAuthButtons() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // SSR: Always show working links
  if (!mounted) {
    return <SimpleAuthButtons />;
  }

  // If Clerk isn't available, use simple links
  if (!clerkAvailable || !useAuth) {
    return <SimpleAuthButtons />;
  }

  // Client: Use auth-aware component
  return <NavAuthButtonsInner />;
}

// Simple hero button that always works
function SimpleHeroButton() {
  return (
    <Button asChild size="xl" variant="gradient" className="group">
      <Link href="/sign-up">
        Start Testing Free
        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
      </Link>
    </Button>
  );
}

// Inner component for hero auth buttons
function HeroAuthButtonsInner() {
  const auth = useAuth?.();
  const isLoaded = auth?.isLoaded ?? false;
  const isSignedIn = auth?.isSignedIn ?? false;

  if (!isLoaded) {
    return <SimpleHeroButton />;
  }

  if (isSignedIn) {
    return (
      <Button asChild size="xl" variant="gradient" className="group">
        <Link href="/dashboard">
          Go to Dashboard
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
        </Link>
      </Button>
    );
  }

  if (SignUpButton) {
    return (
      <SignUpButton mode="modal">
        <Button size="xl" variant="gradient" className="group">
          Start Testing Free
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
        </Button>
      </SignUpButton>
    );
  }

  return <SimpleHeroButton />;
}

export function HeroAuthButtons() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
      {!mounted || !clerkAvailable ? (
        <SimpleHeroButton />
      ) : (
        <HeroAuthButtonsInner />
      )}
      <Button size="xl" variant="outline" asChild>
        <Link href="/docs">
          View Documentation
        </Link>
      </Button>
    </div>
  );
}

// Simple CTA button that always works
function SimpleCTAButton() {
  return (
    <Button asChild size="xl" variant="gradient" className="group">
      <Link href="/sign-up">
        Get Started for Free
        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
      </Link>
    </Button>
  );
}

// Inner component for CTA auth buttons
function CTAAuthButtonsInner() {
  const auth = useAuth?.();
  const isLoaded = auth?.isLoaded ?? false;
  const isSignedIn = auth?.isSignedIn ?? false;

  if (!isLoaded) {
    return <SimpleCTAButton />;
  }

  if (isSignedIn) {
    return (
      <Button asChild size="xl" variant="gradient" className="group">
        <Link href="/dashboard">
          Go to Dashboard
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
        </Link>
      </Button>
    );
  }

  if (SignUpButton) {
    return (
      <SignUpButton mode="modal">
        <Button size="xl" variant="gradient" className="group">
          Get Started for Free
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
        </Button>
      </SignUpButton>
    );
  }

  return <SimpleCTAButton />;
}

export function CTAAuthButtons() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // SSR: Always show a working link
  if (!mounted || !clerkAvailable) {
    return <SimpleCTAButton />;
  }

  return <CTAAuthButtonsInner />;
}

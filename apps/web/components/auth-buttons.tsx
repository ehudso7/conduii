"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { UserButton, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";

// Check if Clerk is configured via environment variable
// Valid Clerk keys start with "pk_test_" or "pk_live_" followed by alphanumeric chars
const isClerkConfigured = !!(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  /^pk_(test|live)_[a-zA-Z0-9]+$/.test(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)
);

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

// Inner component that uses auth hooks - only rendered if Clerk is configured
function NavAuthButtonsInner() {
  const { isLoaded, isSignedIn } = useAuth();
  const [showLoadingState, setShowLoadingState] = useState(false);

  // Timeout for loading state - if Clerk doesn't load in 3 seconds, show simple buttons
  useEffect(() => {
    if (!isLoaded) {
      const timeout = setTimeout(() => {
        setShowLoadingState(true);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [isLoaded]);

  if (!isLoaded) {
    if (showLoadingState) {
      // Fallback to simple buttons if loading takes too long
      return <SimpleAuthButtons />;
    }
    return (
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" disabled>
          <Loader2 className="w-4 h-4 animate-spin" />
        </Button>
      </div>
    );
  }

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-4">
        <Button asChild size="sm">
          <Link href="/dashboard">Dashboard</Link>
        </Button>
        <UserButton afterSignOutUrl="/" />
      </div>
    );
  }

  // Use redirect mode instead of modal to avoid stuck loading states
  return (
    <div className="flex items-center gap-4">
      <Button asChild variant="ghost" size="sm">
        <Link href="/sign-in">Sign In</Link>
      </Button>
      <Button asChild size="sm">
        <Link href="/sign-up">Get Started</Link>
      </Button>
      <SignInButton mode="redirect" redirectUrl="/dashboard">
        <Button variant="ghost" size="sm">
          Sign In
        </Button>
      </SignInButton>
      <SignUpButton mode="redirect" redirectUrl="/dashboard">
        <Button size="sm">
          Get Started
        </Button>
      </SignUpButton>
    </div>
  );
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

  // If Clerk isn't configured, use simple links
  if (!isClerkConfigured) {
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
  const { isLoaded, isSignedIn } = useAuth();
  const [showLoadingState, setShowLoadingState] = useState(false);

  useEffect(() => {
    if (!isLoaded) {
      const timeout = setTimeout(() => {
        setShowLoadingState(true);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [isLoaded]);

  if (!isLoaded) {
    if (showLoadingState) {
      return <SimpleHeroButton />;
    }
    return (
      <Button size="xl" variant="gradient" disabled>
        <Loader2 className="w-5 h-5 animate-spin" />
      </Button>
    );
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

  // Use link instead of modal to avoid stuck states
  return <SimpleHeroButton />;
  return (
    <SignUpButton mode="redirect" redirectUrl="/dashboard">
      <Button size="xl" variant="gradient" className="group">
        Start Testing Free
        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
      </Button>
    </SignUpButton>
  );
}

export function HeroAuthButtons() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
      {!mounted || !isClerkConfigured ? (
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
  const { isLoaded, isSignedIn } = useAuth();
  const [showLoadingState, setShowLoadingState] = useState(false);

  useEffect(() => {
    if (!isLoaded) {
      const timeout = setTimeout(() => {
        setShowLoadingState(true);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [isLoaded]);

  if (!isLoaded) {
    if (showLoadingState) {
      return <SimpleCTAButton />;
    }
    return (
      <Button size="xl" variant="gradient" disabled>
        <Loader2 className="w-5 h-5 animate-spin" />
      </Button>
    );
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

  // Use link instead of modal to avoid stuck states
  return <SimpleCTAButton />;
  return (
    <SignUpButton mode="redirect" redirectUrl="/dashboard">
      <Button size="xl" variant="gradient" className="group">
        Get Started for Free
        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
      </Button>
    </SignUpButton>
  );
}

export function CTAAuthButtons() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // SSR: Always show a working link
  if (!mounted || !isClerkConfigured) {
    return <SimpleCTAButton />;
  }

  return <CTAAuthButtonsInner />;
}

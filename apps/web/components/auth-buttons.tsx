"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserButton, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";

// Check if Clerk is configured via environment variable
// Valid Clerk keys start with "pk_test_" or "pk_live_" followed by alphanumeric chars
const isClerkConfigured = !!(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  // Clerk keys are base64url-ish, typically including '-' and '_'
  /^pk_(test|live)_[a-zA-Z0-9_-]+$/.test(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)
);

function useAuthNav() {
  const router = useRouter();
  return {
    goToSignIn: () => router.push("/sign-in"),
    goToSignUp: () => router.push("/sign-up"),
    goToDashboard: () => router.push("/dashboard"),
  };
}

// Simple button-based navigation that always works (role=button)
function SimpleAuthButtons({ testIdPrefix }: { testIdPrefix: string }) {
  const nav = useAuthNav();
  return (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={nav.goToSignIn}
        data-testid={`${testIdPrefix}-auth-sign-in`}
      >
        Sign In
      </Button>
      <Button size="sm" onClick={nav.goToSignUp} data-testid={`${testIdPrefix}-auth-sign-up`}>
        Get Started
      </Button>
    </div>
  );
}

// Inner component that uses auth hooks - only rendered if Clerk is configured
function NavAuthButtonsInner({ testIdPrefix }: { testIdPrefix: string }) {
  const { isLoaded, isSignedIn } = useAuth();
  const nav = useAuthNav();
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
      return <SimpleAuthButtons testIdPrefix={testIdPrefix} />;
    }
    return (
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" disabled data-testid={`${testIdPrefix}-auth-loading`}>
          <Loader2 className="w-4 h-4 animate-spin" />
        </Button>
      </div>
    );
  }

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-4">
        <Button
          size="sm"
          onClick={nav.goToDashboard}
          data-testid={`${testIdPrefix}-auth-dashboard`}
        >
          Dashboard
        </Button>
        <div data-testid={`${testIdPrefix}-auth-user`}>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    );
  }

  return <SimpleAuthButtons testIdPrefix={testIdPrefix} />;
}

export function NavAuthButtons({ testIdPrefix = "topnav" }: { testIdPrefix?: string }) {
  // If Clerk isn't configured, avoid calling Clerk hooks
  if (!isClerkConfigured) {
    return <SimpleAuthButtons testIdPrefix={testIdPrefix} />;
  }

  // Client: Use auth-aware component
  return <NavAuthButtonsInner testIdPrefix={testIdPrefix} />;
}

// Simple hero button that always works (role=button)
function SimpleHeroButton() {
  const router = useRouter();
  return (
    <Button
      size="xl"
      variant="gradient"
      className="group"
      onClick={() => router.push("/sign-up")}
      data-testid="home-cta-start-testing"
    >
      Start Testing Free
      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
    </Button>
  );
}

// Inner component for hero auth buttons
function HeroAuthButtonsInner() {
  const { isLoaded, isSignedIn } = useAuth();
  const nav = useAuthNav();
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
      <Button size="xl" variant="gradient" disabled data-testid="home-cta-start-testing">
        <Loader2 className="w-5 h-5 animate-spin" />
      </Button>
    );
  }

  if (isSignedIn) {
    return (
      <Button
        size="xl"
        variant="gradient"
        className="group"
        onClick={nav.goToDashboard}
        data-testid="home-cta-start-testing"
      >
        Go to Dashboard
        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
      </Button>
    );
  }

  return <SimpleHeroButton />;
}

export function HeroAuthButtons() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
      {!isClerkConfigured ? <SimpleHeroButton /> : <HeroAuthButtonsInner />}
      <Button size="xl" variant="outline" asChild>
        <Link href="/docs" data-testid="home-cta-view-docs">
          View Documentation
        </Link>
      </Button>
    </div>
  );
}

// Simple CTA button that always works (role=button)
function SimpleCTAButton() {
  const router = useRouter();
  return (
    <Button
      size="xl"
      variant="gradient"
      className="group"
      onClick={() => router.push("/sign-up")}
      data-testid="home-cta-get-started"
    >
      Get Started for Free
      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
    </Button>
  );
}

// Inner component for CTA auth buttons
function CTAAuthButtonsInner() {
  const { isLoaded, isSignedIn } = useAuth();
  const nav = useAuthNav();
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
      <Button size="xl" variant="gradient" disabled data-testid="home-cta-get-started">
        <Loader2 className="w-5 h-5 animate-spin" />
      </Button>
    );
  }

  if (isSignedIn) {
    return (
      <Button
        size="xl"
        variant="gradient"
        className="group"
        onClick={nav.goToDashboard}
        data-testid="home-cta-get-started"
      >
        Go to Dashboard
        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
      </Button>
    );
  }

  return <SimpleCTAButton />;
}

export function CTAAuthButtons() {
  // If Clerk isn't configured, avoid calling Clerk hooks
  if (!isClerkConfigured) {
    return <SimpleCTAButton />;
  }

  return <CTAAuthButtonsInner />;
}

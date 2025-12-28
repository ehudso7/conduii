"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

// Inner component that uses auth hooks - only rendered after mount
function NavAuthButtonsInner() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
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

export function NavAuthButtons() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // SSR: Always show working links
  if (!mounted) {
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

  // Client: Use auth-aware component
  return <NavAuthButtonsInner />;
}

// Inner component for hero auth buttons
function HeroAuthButtonsInner() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <Button asChild size="xl" variant="gradient" className="group">
        <Link href="/sign-up">
          Start Testing Free
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
        </Link>
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

  return (
    <SignUpButton mode="modal">
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
      {!mounted ? (
        <Button asChild size="xl" variant="gradient" className="group">
          <Link href="/sign-up">
            Start Testing Free
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
          </Link>
        </Button>
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

// Inner component for CTA auth buttons
function CTAAuthButtonsInner() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <Button asChild size="xl" variant="gradient" className="group">
        <Link href="/sign-up">
          Get Started for Free
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
        </Link>
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

  return (
    <SignUpButton mode="modal">
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
  if (!mounted) {
    return (
      <Button asChild size="xl" variant="gradient" className="group">
        <Link href="/sign-up">
          Get Started for Free
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
        </Link>
      </Button>
    );
  }

  return <CTAAuthButtonsInner />;
}

// PricingButton has been moved to components/pricing-buttons.tsx
// as a simple server-rendered component for better reliability

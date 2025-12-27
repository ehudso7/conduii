"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function NavAuthButtons() {
  const { isLoaded, isSignedIn } = useAuth();

  // Show placeholder while Clerk loads
  if (!isLoaded) {
    return (
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm">
          Sign In
        </Button>
        <Button size="sm">
          Get Started
        </Button>
      </div>
    );
  }

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button size="sm">Dashboard</Button>
        </Link>
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

export function HeroAuthButtons() {
  const { isLoaded, isSignedIn } = useAuth();

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
      {!isLoaded ? (
        // Show button while loading - clicking will work once hydrated
        <Button size="xl" variant="gradient" className="group">
          Start Testing Free
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      ) : isSignedIn ? (
        <Link href="/dashboard">
          <Button size="xl" variant="gradient" className="group">
            Go to Dashboard
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
          </Button>
        </Link>
      ) : (
        <SignUpButton mode="modal">
          <Button size="xl" variant="gradient" className="group">
            Start Testing Free
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
          </Button>
        </SignUpButton>
      )}
      <Button size="xl" variant="outline" asChild>
        <Link href="/docs">
          View Documentation
        </Link>
      </Button>
    </div>
  );
}

export function CTAAuthButtons() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <Button size="xl" variant="gradient" className="group">
        Get Started for Free
        <ArrowRight className="ml-2 w-5 h-5" />
      </Button>
    );
  }

  if (isSignedIn) {
    return (
      <Link href="/dashboard">
        <Button size="xl" variant="gradient" className="group">
          Go to Dashboard
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
        </Button>
      </Link>
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

interface PricingButtonProps {
  cta: string;
  popular?: boolean;
}

export function PricingButton({ cta, popular }: PricingButtonProps) {
  const { isLoaded, isSignedIn } = useAuth();

  // Contact Sales links to mailto
  if (cta === "Contact Sales") {
    return (
      <Button className="w-full" variant="outline" asChild>
        <Link href="mailto:sales@conduii.com?subject=Enterprise%20Inquiry">
          {cta}
        </Link>
      </Button>
    );
  }

  // Show placeholder while loading
  if (!isLoaded) {
    return (
      <Button className="w-full" variant={popular ? "gradient" : "outline"}>
        {cta}
      </Button>
    );
  }

  // Signed in users go to dashboard
  if (isSignedIn) {
    return (
      <Button className="w-full" variant={popular ? "gradient" : "outline"} asChild>
        <Link href="/dashboard">
          Go to Dashboard
        </Link>
      </Button>
    );
  }

  // Get Started / Start Free Trial buttons trigger sign up
  return (
    <SignUpButton mode="modal">
      <Button className="w-full" variant={popular ? "gradient" : "outline"}>
        {cta}
      </Button>
    </SignUpButton>
  );
}

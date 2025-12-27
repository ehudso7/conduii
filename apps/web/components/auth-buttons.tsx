"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function NavAuthButtons() {
  return (
    <div className="flex items-center gap-4">
      <SignedOut>
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
      </SignedOut>
      <SignedIn>
        <Link href="/dashboard">
          <Button size="sm">Dashboard</Button>
        </Link>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
    </div>
  );
}

export function HeroAuthButtons() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
      <SignedOut>
        <SignUpButton mode="modal">
          <Button size="xl" variant="gradient" className="group">
            Start Testing Free
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
          </Button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <Link href="/dashboard">
          <Button size="xl" variant="gradient" className="group">
            Go to Dashboard
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
          </Button>
        </Link>
      </SignedIn>
      <Button size="xl" variant="outline" asChild>
        <Link href="/docs">
          View Documentation
        </Link>
      </Button>
    </div>
  );
}

export function CTAAuthButtons() {
  return (
    <>
      <SignedOut>
        <SignUpButton mode="modal">
          <Button size="xl" variant="gradient" className="group">
            Get Started for Free
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
          </Button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <Link href="/dashboard">
          <Button size="xl" variant="gradient" className="group">
            Go to Dashboard
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
          </Button>
        </Link>
      </SignedIn>
    </>
  );
}

interface PricingButtonProps {
  cta: string;
  popular?: boolean;
}

export function PricingButton({ cta, popular }: PricingButtonProps) {
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

  // Get Started / Start Free Trial buttons trigger sign up
  return (
    <>
      <SignedOut>
        <SignUpButton mode="modal">
          <Button className="w-full" variant={popular ? "gradient" : "outline"}>
            {cta}
          </Button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <Button className="w-full" variant={popular ? "gradient" : "outline"} asChild>
          <Link href="/dashboard">
            Go to Dashboard
          </Link>
        </Button>
      </SignedIn>
    </>
  );
}

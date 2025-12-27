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
        <Link href="/sign-in">
          <Button variant="ghost" size="sm">
            Sign In
          </Button>
        </Link>
        <Link href="/sign-up">
          <Button size="sm">
            Get Started
          </Button>
        </Link>
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

export function NavAuthButtons() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // SSR: Always show working links
  if (!mounted) {
    return (
      <div className="flex items-center gap-4">
        <Link href="/sign-in">
          <Button variant="ghost" size="sm">
            Sign In
          </Button>
        </Link>
        <Link href="/sign-up">
          <Button size="sm">
            Get Started
          </Button>
        </Link>
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
      <Link href="/sign-up">
        <Button size="xl" variant="gradient" className="group">
          Start Testing Free
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
        </Button>
      </Link>
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
        <Link href="/sign-up">
          <Button size="xl" variant="gradient" className="group">
            Start Testing Free
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
          </Button>
        </Link>
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
      <Link href="/sign-up">
        <Button size="xl" variant="gradient" className="group">
          Get Started for Free
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
        </Button>
      </Link>
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

export function CTAAuthButtons() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // SSR: Always show a working link
  if (!mounted) {
    return (
      <Link href="/sign-up">
        <Button size="xl" variant="gradient" className="group">
          Get Started for Free
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
        </Button>
      </Link>
    );
  }

  return <CTAAuthButtonsInner />;
}

interface PricingButtonProps {
  cta: string;
  popular?: boolean;
}

// Inner component for pricing button auth logic
function PricingButtonInner({ cta, popular }: PricingButtonProps) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <Button className="w-full" variant={popular ? "gradient" : "outline"} asChild>
        <Link href="/sign-up">
          {cta}
        </Link>
      </Button>
    );
  }

  if (isSignedIn) {
    return (
      <Button className="w-full" variant={popular ? "gradient" : "outline"} asChild>
        <Link href="/dashboard">
          Go to Dashboard
        </Link>
      </Button>
    );
  }

  return (
    <SignUpButton mode="modal">
      <Button className="w-full" variant={popular ? "gradient" : "outline"}>
        {cta}
      </Button>
    </SignUpButton>
  );
}

export function PricingButton({ cta, popular }: PricingButtonProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Contact Sales links to mailto - always works
  if (cta === "Contact Sales") {
    return (
      <Button className="w-full" variant="outline" asChild>
        <Link href="mailto:sales@conduii.com?subject=Enterprise%20Inquiry">
          {cta}
        </Link>
      </Button>
    );
  }

  // SSR: Always show a working link
  if (!mounted) {
    return (
      <Button className="w-full" variant={popular ? "gradient" : "outline"} asChild>
        <Link href="/sign-up">
          {cta}
        </Link>
      </Button>
    );
  }

  return <PricingButtonInner cta={cta} popular={popular} />;
}

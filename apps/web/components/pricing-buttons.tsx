import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PricingButtonProps {
  cta: string;
  popular?: boolean;
}

// Simple server-rendered pricing button using proper asChild pattern
// This creates valid HTML (no button inside anchor) and guarantees rendering
export function PricingButton({ cta, popular }: PricingButtonProps) {
  // Map CTA text to testid
  const testIdMap: Record<string, string> = {
    "Get Started": "pricing-free-cta",
    "Start Free Trial": "pricing-pro-cta",
    "Contact Sales": "pricing-enterprise-cta",
  };
  const testId = testIdMap[cta] || "pricing-cta";

  // Contact Sales links to mailto
  if (cta === "Contact Sales") {
    return (
      <Button asChild className="w-full" variant="outline" data-testid={testId}>
        <Link href="mailto:sales@conduii.com?subject=Enterprise%20Inquiry">
          {cta}
        </Link>
      </Button>
    );
  }

  // All other CTAs link to sign-up
  return (
    <Button asChild className="w-full" variant={popular ? "gradient" : "outline"} data-testid={testId}>
      <Link href="/sign-up">
        {cta}
      </Link>
    </Button>
  );
}

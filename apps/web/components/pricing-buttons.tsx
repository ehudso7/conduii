import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PricingButtonProps {
  cta: string;
  popular?: boolean;
}

// Simple server-rendered pricing button using proper asChild pattern
// This creates valid HTML (no button inside anchor) and guarantees rendering
export function PricingButton({ cta, popular }: PricingButtonProps) {
  // Contact Sales links to mailto
  if (cta === "Contact Sales") {
    return (
      <Button asChild className="w-full" variant="outline" data-testid="pricing-enterprise-cta">
        <Link href="mailto:sales@conduii.com?subject=Enterprise%20Inquiry">
          {cta}
        </Link>
      </Button>
    );
  }

  // Determine test ID based on CTA text
  const testId = cta === "Start Free Trial" ? "pricing-pro-cta" : "pricing-free-cta";

  // All other CTAs link to sign-up
  return (
    <Button asChild className="w-full" variant={popular ? "gradient" : "outline"} data-testid={testId}>
      <Link href="/sign-up">
        {cta}
      </Link>
    </Button>
  );
}

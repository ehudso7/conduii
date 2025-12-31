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
      <Button asChild className="w-full" variant="outline" data-testid="pricing-contact-sales">
        <Link href="mailto:sales@conduii.com?subject=Enterprise%20Inquiry">
          {cta}
        </Link>
      </Button>
    );
  }

  // All other CTAs link to sign-up
  return (
    <Button asChild className="w-full" variant={popular ? "gradient" : "outline"} data-testid={`pricing-${cta.replace(/\s+/g, '-').toLowerCase()}`}>
      <Link href="/sign-up">
        {cta}
      </Link>
    </Button>
  );
}

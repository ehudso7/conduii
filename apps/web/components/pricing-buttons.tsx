import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PricingButtonProps {
  cta: string;
  popular?: boolean;
  testId?: string;
}

// Simple server-rendered pricing button using proper asChild pattern
// This creates valid HTML (no button inside anchor) and guarantees rendering
export function PricingButton({ cta, popular, testId }: PricingButtonProps) {
  // Contact Sales links to mailto
  if (cta === "Contact Sales") {
    return (
      <Button asChild className="w-full" variant="outline">
        <Link href="mailto:sales@conduii.com?subject=Enterprise%20Inquiry" data-testid={testId}>
          {cta}
        </Link>
      </Button>
    );
  }

  // All other CTAs link to sign-up
  return (
    <Button asChild className="w-full" variant={popular ? "gradient" : "outline"}>
      <Link href="/sign-up" data-testid={testId}>
        {cta}
      </Link>
    </Button>
  );
}

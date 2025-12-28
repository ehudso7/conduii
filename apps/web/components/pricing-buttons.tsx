import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PricingButtonProps {
  cta: string;
  popular?: boolean;
}

// Simple server-rendered pricing button - no client-side JavaScript needed
// This guarantees the button will always render
export function PricingButton({ cta, popular }: PricingButtonProps) {
  // Contact Sales links to mailto
  if (cta === "Contact Sales") {
    return (
      <Link href="mailto:sales@conduii.com?subject=Enterprise%20Inquiry" className="w-full">
        <Button className="w-full" variant="outline">
          {cta}
        </Button>
      </Link>
    );
  }

  // All other CTAs link to sign-up
  return (
    <Link href="/sign-up" className="w-full">
      <Button className="w-full" variant={popular ? "gradient" : "outline"}>
        {cta}
      </Button>
    </Link>
  );
}

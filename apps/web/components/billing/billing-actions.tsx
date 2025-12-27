"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface BillingActionsProps {
  currentPlan: string;
  organizationId: string;
}

export function UpgradeButton({
  planId,
  organizationId,
  variant = "default",
  children,
  className,
}: {
  planId: string;
  organizationId: string;
  variant?: "default" | "outline";
  children: React.ReactNode;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          interval: "monthly",
          organizationId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create checkout session");
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start checkout",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleUpgrade}
      disabled={loading}
      variant={variant}
      className={className}
    >
      {loading ? "Loading..." : children}
    </Button>
  );
}

export function ManageBillingButton({ organizationId }: { organizationId: string }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleManageBilling = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to open billing portal");
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to open billing portal",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleManageBilling} disabled={loading} variant="outline">
      {loading ? "Loading..." : "Manage Billing"}
    </Button>
  );
}

export function ContactSalesButton() {
  const handleContact = () => {
    window.location.href = "mailto:sales@conduii.com?subject=Enterprise%20Plan%20Inquiry";
  };

  return (
    <Button onClick={handleContact} variant="outline" className="w-full mt-6">
      Contact Sales
    </Button>
  );
}

export function UpgradePromptCard({ organizationId }: { organizationId: string }) {
  return (
    <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
      <p className="font-medium text-blue-900">Upgrade to Pro</p>
      <p className="text-sm text-blue-700 mt-1">
        Get unlimited projects, 5,000 test runs/month, and priority support.
      </p>
      <UpgradeButton planId="PRO" organizationId={organizationId} className="mt-3">
        Upgrade Now
        <ArrowRight className="w-4 h-4 ml-2" />
      </UpgradeButton>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Download, CreditCard, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: string;
  invoiceUrl: string | null;
  pdfUrl: string | null;
}

interface InvoiceListProps {
  organizationId: string;
  currentPlan: string;
}

export function InvoiceList({ organizationId, currentPlan }: InvoiceListProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      if (currentPlan === "FREE") {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/stripe/invoices?organizationId=${organizationId}`);
        if (res.ok) {
          const data = await res.json();
          setInvoices(data.invoices || []);
        }
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [organizationId, currentPlan]);

  if (currentPlan === "FREE") {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No billing history.</p>
        <p className="text-sm">
          Upgrade to a paid plan to see invoices here.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-lg bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No invoices yet.</p>
        <p className="text-sm">
          Your invoices will appear here after your first billing cycle.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {invoices.map((invoice) => (
        <div
          key={invoice.id}
          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
        >
          <div>
            <p className="font-medium">{invoice.date}</p>
            <p className="text-sm text-muted-foreground">
              Monthly subscription
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-medium">{invoice.amount}</span>
            <Badge variant={invoice.status === "Paid" ? "default" : "secondary"}>
              {invoice.status}
            </Badge>
            <div className="flex gap-1">
              {invoice.invoiceUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(invoice.invoiceUrl!, "_blank")}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}
              {invoice.pdfUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(invoice.pdfUrl!, "_blank")}
                >
                  <Download className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

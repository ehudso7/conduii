"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ServiceMap } from "@/components/dashboard/service-map";

export default function DiscoverPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Service Discovery</h1>
          <p className="text-muted-foreground">
            Automatically discover and visualize your application services
          </p>
        </div>
      </div>

      {/* Service Map */}
      <ServiceMap />
    </div>
  );
}

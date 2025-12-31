"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AIInsights } from "@/components/dashboard/ai-insights";
import { ProjectHealthCards } from "@/components/dashboard/project-health";
import { ActivityFeed } from "@/components/dashboard/activity-feed";

export default function InsightsPage() {
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
          <h1 className="text-3xl font-bold">AI Insights</h1>
          <p className="text-muted-foreground">
            AI-powered analytics and predictions for your testing workflow
          </p>
        </div>
      </div>

      {/* AI Insights */}
      <AIInsights />

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Project Health */}
        <ProjectHealthCards />

        {/* Activity Feed */}
        <ActivityFeed />
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  Sparkles,
  Check,
  ChevronRight,
  Shield,
  Zap,
  Clock,
  Lightbulb,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ConfigRecommendation {
  id: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  category: "performance" | "security" | "reliability" | "cost";
  currentValue?: string;
  recommendedValue?: string;
  applied: boolean;
}

export function SmartConfigRecommendations() {
  const [recommendations, setRecommendations] = useState<ConfigRecommendation[]>([
    {
      id: "1",
      title: "Enable Parallel Test Execution",
      description: "Run independent tests in parallel to reduce total execution time by up to 60%",
      impact: "high",
      category: "performance",
      currentValue: "Sequential",
      recommendedValue: "Parallel (4 workers)",
      applied: false,
    },
    {
      id: "2",
      title: "Add API Key Rotation",
      description: "Rotate API keys every 90 days to improve security posture",
      impact: "high",
      category: "security",
      currentValue: "No rotation",
      recommendedValue: "90-day rotation",
      applied: false,
    },
    {
      id: "3",
      title: "Enable Smart Retry",
      description: "Automatically retry failed tests up to 3 times to handle flaky tests",
      impact: "medium",
      category: "reliability",
      currentValue: "Disabled",
      recommendedValue: "3 retries",
      applied: true,
    },
    {
      id: "4",
      title: "Optimize Test Scheduling",
      description: "Schedule heavy tests during off-peak hours to reduce costs",
      impact: "medium",
      category: "cost",
      currentValue: "On-demand",
      recommendedValue: "Scheduled (2 AM UTC)",
      applied: false,
    },
    {
      id: "5",
      title: "Enable Test Result Caching",
      description: "Cache test results for unchanged code to save execution time",
      impact: "medium",
      category: "performance",
      currentValue: "Disabled",
      recommendedValue: "24-hour cache",
      applied: false,
    },
  ]);

  function applyRecommendation(id: string) {
    setRecommendations(prev => prev.map(r =>
      r.id === id ? { ...r, applied: true } : r
    ));
  }

  function getCategoryIcon(category: ConfigRecommendation["category"]) {
    switch (category) {
      case "performance":
        return <Zap className="w-4 h-4 text-yellow-500" />;
      case "security":
        return <Shield className="w-4 h-4 text-red-500" />;
      case "reliability":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "cost":
        return <Sparkles className="w-4 h-4 text-green-500" />;
    }
  }

  function getCategoryColor(category: ConfigRecommendation["category"]) {
    switch (category) {
      case "performance":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300";
      case "security":
        return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300";
      case "reliability":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
      case "cost":
        return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300";
    }
  }

  const pendingCount = recommendations.filter(r => !r.applied).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <CardTitle>Smart Configuration</CardTitle>
          </div>
          {pendingCount > 0 && (
            <Badge variant="secondary">
              {pendingCount} recommendations
            </Badge>
          )}
        </div>
        <CardDescription>
          AI-powered configuration recommendations to optimize your testing workflow
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className={cn(
              "p-4 rounded-lg border transition-all",
              rec.applied
                ? "bg-muted/30 border-muted"
                : "hover:shadow-md hover:border-primary/30"
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                {getCategoryIcon(rec.category)}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className={cn(
                      "font-medium",
                      rec.applied && "text-muted-foreground"
                    )}>
                      {rec.title}
                    </h4>
                    {rec.applied && (
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        <Check className="w-3 h-3 mr-1" />
                        Applied
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {rec.description}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <Badge className={getCategoryColor(rec.category)}>
                      {rec.category}
                    </Badge>
                    <Badge variant={
                      rec.impact === "high" ? "destructive" :
                      rec.impact === "medium" ? "secondary" : "outline"
                    }>
                      {rec.impact} impact
                    </Badge>
                  </div>

                  {!rec.applied && rec.currentValue && rec.recommendedValue && (
                    <div className="flex items-center gap-3 mt-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Current:</span>
                        <code className="bg-muted px-2 py-0.5 rounded text-xs">
                          {rec.currentValue}
                        </code>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Recommended:</span>
                        <code className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
                          {rec.recommendedValue}
                        </code>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {!rec.applied && (
                <Button
                  size="sm"
                  onClick={() => applyRecommendation(rec.id)}
                >
                  Apply
                </Button>
              )}
            </div>
          </div>
        ))}

        {pendingCount === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Check className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="font-medium">All recommendations applied!</p>
            <p className="text-sm">Your configuration is optimized</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Sparkles,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProjectHealth {
  id: string;
  name: string;
  healthScore: number;
  trend: "up" | "down" | "stable";
  trendValue: number;
  status: "healthy" | "warning" | "critical";
  lastRun: Date;
  metrics: {
    passRate: number;
    avgDuration: number;
    coverage: number;
    reliability: number;
  };
  issues: number;
  recommendations: string[];
}

interface ProjectHealthCardProps {
  projects?: ProjectHealth[];
}

export function ProjectHealthCards({ projects: initialProjects }: ProjectHealthCardProps) {
  const [projects] = useState<ProjectHealth[]>(
    initialProjects || [
      {
        id: "1",
        name: "Web Application",
        healthScore: 92,
        trend: "up",
        trendValue: 4,
        status: "healthy",
        lastRun: new Date(Date.now() - 1000 * 60 * 15),
        metrics: { passRate: 98, avgDuration: 12.4, coverage: 87, reliability: 95 },
        issues: 2,
        recommendations: ["Increase coverage on auth module", "Add retry logic for flaky API tests"],
      },
      {
        id: "2",
        name: "API Gateway",
        healthScore: 78,
        trend: "down",
        trendValue: 3,
        status: "warning",
        lastRun: new Date(Date.now() - 1000 * 60 * 45),
        metrics: { passRate: 89, avgDuration: 8.2, coverage: 72, reliability: 81 },
        issues: 5,
        recommendations: ["Fix rate limiting tests", "Update mocked responses", "Add timeout handling"],
      },
      {
        id: "3",
        name: "Payment Service",
        healthScore: 56,
        trend: "down",
        trendValue: 12,
        status: "critical",
        lastRun: new Date(Date.now() - 1000 * 60 * 120),
        metrics: { passRate: 72, avgDuration: 24.1, coverage: 65, reliability: 58 },
        issues: 8,
        recommendations: ["Fix Stripe webhook tests", "Add idempotency tests", "Improve error handling coverage"],
      },
    ]
  );

  function getStatusColor(status: ProjectHealth["status"]) {
    switch (status) {
      case "healthy":
        return "text-green-600 bg-green-100 dark:bg-green-950";
      case "warning":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-950";
      case "critical":
        return "text-red-600 bg-red-100 dark:bg-red-950";
    }
  }

  function getHealthColor(score: number) {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  }

  function formatTimeAgo(date: Date) {
    const minutes = Math.floor((Date.now() - date.getTime()) / 1000 / 60);
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return `${Math.floor(minutes / 1440)}d ago`;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Project Health
          </CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/projects">
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="p-4 rounded-lg border bg-card hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left: Name & Score */}
                <div className="flex items-center gap-4">
                  {/* Health Score Circle */}
                  <div className="relative">
                    <svg className="w-16 h-16 -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="text-muted"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeDasharray={`${(project.healthScore / 100) * 176} 176`}
                        className={getHealthColor(project.healthScore)}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={cn("text-lg font-bold", getHealthColor(project.healthScore))}>
                        {project.healthScore}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{project.name}</h4>
                      <Badge className={cn("text-xs", getStatusColor(project.status))}>
                        {project.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(project.lastRun)}
                      </span>
                      <span className={cn(
                        "flex items-center gap-1",
                        project.trend === "up" ? "text-green-600" : 
                        project.trend === "down" ? "text-red-600" : "text-gray-600"
                      )}>
                        {project.trend === "up" ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : project.trend === "down" ? (
                          <TrendingDown className="w-3 h-3" />
                        ) : null}
                        {project.trendValue > 0 ? "+" : ""}{project.trendValue}%
                      </span>
                      {project.issues > 0 && (
                        <span className="flex items-center gap-1 text-yellow-600">
                          <AlertTriangle className="w-3 h-3" />
                          {project.issues} issues
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Metrics */}
                <div className="hidden lg:grid grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-muted-foreground text-xs mb-1">Pass Rate</div>
                    <div className="flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="font-medium">{project.metrics.passRate}%</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-muted-foreground text-xs mb-1">Duration</div>
                    <div className="font-medium">{project.metrics.avgDuration}s</div>
                  </div>
                  <div className="text-center">
                    <div className="text-muted-foreground text-xs mb-1">Coverage</div>
                    <div className="font-medium">{project.metrics.coverage}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-muted-foreground text-xs mb-1">Reliability</div>
                    <div className="font-medium">{project.metrics.reliability}%</div>
                  </div>
                </div>
              </div>

              {/* AI Recommendations */}
              {project.recommendations.length > 0 && project.status !== "healthy" && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    AI Recommendations
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.recommendations.slice(0, 2).map((rec, i) => (
                      <Badge key={i} variant="outline" className="text-xs font-normal">
                        {rec}
                      </Badge>
                    ))}
                    {project.recommendations.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{project.recommendations.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

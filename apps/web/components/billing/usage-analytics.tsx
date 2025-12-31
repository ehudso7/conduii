"use client";

import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Zap,
  Target,
  AlertTriangle,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface UsageMetric {
  label: string;
  current: number;
  limit: number;
  unit: string;
  trend: number;
  trendDirection: "up" | "down";
  projected: number;
}

interface CostOptimization {
  id: string;
  title: string;
  savings: string;
  description: string;
  applied: boolean;
}

export function UsageAnalytics() {
  const [usage] = useState<UsageMetric[]>([
    {
      label: "Test Runs",
      current: 847,
      limit: 1000,
      unit: "runs",
      trend: 12,
      trendDirection: "up",
      projected: 920,
    },
    {
      label: "Execution Minutes",
      current: 2340,
      limit: 5000,
      unit: "min",
      trend: 8,
      trendDirection: "up",
      projected: 2800,
    },
    {
      label: "AI Analysis",
      current: 156,
      limit: 500,
      unit: "requests",
      trend: -5,
      trendDirection: "down",
      projected: 145,
    },
    {
      label: "Storage",
      current: 2.4,
      limit: 10,
      unit: "GB",
      trend: 3,
      trendDirection: "up",
      projected: 2.8,
    },
  ]);

  const [optimizations] = useState<CostOptimization[]>([
    {
      id: "1",
      title: "Enable Test Caching",
      savings: "$24/month",
      description: "Cache unchanged test results to reduce redundant executions",
      applied: false,
    },
    {
      id: "2",
      title: "Schedule Off-Peak Tests",
      savings: "$18/month",
      description: "Run non-critical tests during off-peak hours for lower rates",
      applied: false,
    },
    {
      id: "3",
      title: "Optimize Parallel Workers",
      savings: "$12/month",
      description: "Reduce worker count based on actual usage patterns",
      applied: true,
    },
  ]);

  const totalSavings = optimizations
    .filter(o => !o.applied)
    .reduce((acc, o) => acc + parseInt(o.savings.replace(/\D/g, "")), 0);

  return (
    <div className="space-y-6">
      {/* Usage Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Usage This Month
          </CardTitle>
          <CardDescription>
            Track your resource consumption and projected usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {usage.map((metric, i) => {
              const usagePercent = (metric.current / metric.limit) * 100;
              const projectedPercent = (metric.projected / metric.limit) * 100;
              const isNearLimit = usagePercent > 80;

              return (
                <div key={i} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{metric.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {metric.current.toLocaleString()} / {metric.limit.toLocaleString()} {metric.unit}
                      </p>
                    </div>
                    <div className={cn(
                      "flex items-center gap-1 text-sm",
                      metric.trendDirection === "up" ? "text-green-600" : "text-red-600"
                    )}>
                      {metric.trendDirection === "up" ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {metric.trend}%
                    </div>
                  </div>

                  <div className="relative">
                    <Progress
                      value={usagePercent}
                      className={cn(
                        "h-3",
                        isNearLimit && "[&>div]:bg-yellow-500"
                      )}
                    />
                    {/* Projected marker */}
                    <div
                      className="absolute top-0 w-0.5 h-3 bg-primary/50"
                      style={{ left: `${Math.min(projectedPercent, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{usagePercent.toFixed(0)}% used</span>
                    <span className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      Projected: {metric.projected.toLocaleString()} {metric.unit}
                    </span>
                  </div>

                  {isNearLimit && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-300 text-sm">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span>Approaching limit - consider upgrading</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Cost Predictions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <CardTitle>Cost Optimization</CardTitle>
            </div>
            {totalSavings > 0 && (
              <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300">
                <Sparkles className="w-3 h-3 mr-1" />
                Save ${totalSavings}/month
              </Badge>
            )}
          </div>
          <CardDescription>
            AI-powered recommendations to reduce your testing costs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {optimizations.map((opt) => (
            <div
              key={opt.id}
              className={cn(
                "flex items-center justify-between p-4 rounded-lg border",
                opt.applied
                  ? "bg-muted/30"
                  : "hover:border-primary/30 hover:shadow-sm transition-all"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  opt.applied
                    ? "bg-green-100 dark:bg-green-950"
                    : "bg-primary/10"
                )}>
                  {opt.applied ? (
                    <Zap className="w-5 h-5 text-green-600" />
                  ) : (
                    <Zap className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{opt.title}</p>
                    {!opt.applied && (
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        {opt.savings}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {opt.description}
                  </p>
                </div>
              </div>

              {opt.applied ? (
                <Badge variant="secondary">Applied</Badge>
              ) : (
                <Button size="sm">
                  Apply
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Billing Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Bill</p>
                <p className="text-2xl font-bold">$47.20</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Projected</p>
                <p className="text-2xl font-bold">$52.80</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-950 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Potential Savings</p>
                <p className="text-2xl font-bold text-green-600">${totalSavings}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

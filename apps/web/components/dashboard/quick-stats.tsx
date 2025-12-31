"use client";

import {
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Target,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Stat {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  trend?: "up" | "down" | "neutral";
  icon: React.ReactNode;
  color: string;
}

interface QuickStatsProps {
  stats?: Stat[];
}

export function QuickStats({ stats: customStats }: QuickStatsProps) {
  const defaultStats: Stat[] = [
    {
      label: "Tests Passed",
      value: "1,247",
      change: 12.5,
      changeLabel: "vs last week",
      trend: "up",
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: "text-green-500 bg-green-100 dark:bg-green-950",
    },
    {
      label: "Tests Failed",
      value: "23",
      change: -8.3,
      changeLabel: "vs last week",
      trend: "down",
      icon: <XCircle className="w-5 h-5" />,
      color: "text-red-500 bg-red-100 dark:bg-red-950",
    },
    {
      label: "Avg Duration",
      value: "12.4s",
      change: -15.2,
      changeLabel: "faster",
      trend: "down",
      icon: <Clock className="w-5 h-5" />,
      color: "text-blue-500 bg-blue-100 dark:bg-blue-950",
    },
    {
      label: "Pass Rate",
      value: "98.2%",
      change: 2.1,
      changeLabel: "improvement",
      trend: "up",
      icon: <Target className="w-5 h-5" />,
      color: "text-purple-500 bg-purple-100 dark:bg-purple-950",
    },
  ];

  const stats = customStats || defaultStats;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <Card key={i} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
                {stat.change !== undefined && (
                  <div className="flex items-center gap-1 mt-2 text-sm">
                    {stat.trend === "up" ? (
                      <TrendingUp className={cn(
                        "w-4 h-4",
                        stat.label.includes("Failed") ? "text-red-500" : "text-green-500"
                      )} />
                    ) : stat.trend === "down" ? (
                      <TrendingDown className={cn(
                        "w-4 h-4",
                        stat.label.includes("Failed") || stat.label.includes("Duration")
                          ? "text-green-500"
                          : "text-red-500"
                      )} />
                    ) : null}
                    <span className={cn(
                      stat.trend === "up" && !stat.label.includes("Failed") && "text-green-600",
                      stat.trend === "down" && (stat.label.includes("Failed") || stat.label.includes("Duration")) && "text-green-600",
                      stat.trend === "up" && stat.label.includes("Failed") && "text-red-600",
                      stat.trend === "down" && !stat.label.includes("Failed") && !stat.label.includes("Duration") && "text-red-600"
                    )}>
                      {stat.change > 0 ? "+" : ""}{stat.change}%
                    </span>
                    <span className="text-muted-foreground">
                      {stat.changeLabel}
                    </span>
                  </div>
                )}
              </div>
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center",
                stat.color
              )}>
                {stat.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

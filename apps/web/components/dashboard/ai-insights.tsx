"use client";

import { useState, useEffect } from "react";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Lightbulb,
  Target,
  Zap,
  Shield,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Insight {
  id: string;
  type: "improvement" | "warning" | "success" | "prediction";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  actionLabel?: string;
  actionUrl?: string;
  metric?: {
    label: string;
    current: number;
    target: number;
    unit: string;
  };
}

interface Prediction {
  label: string;
  value: number;
  change: number;
  trend: "up" | "down" | "stable";
  confidence: number;
}

export function AIInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInsights();
  }, []);

  async function loadInsights() {
    setLoading(true);
    // Simulate loading - in production this would call the API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setInsights([
      {
        id: "1",
        type: "warning",
        title: "Flaky Test Detected",
        description: "The 'User Authentication Flow' test has failed 3 times in the last week with intermittent timing issues.",
        impact: "high",
        actionLabel: "View Analysis",
        actionUrl: "/dashboard/projects?filter=flaky",
        metric: {
          label: "Reliability",
          current: 72,
          target: 95,
          unit: "%",
        },
      },
      {
        id: "2",
        type: "improvement",
        title: "Optimize Test Duration",
        description: "Your API tests could run 40% faster by parallelizing independent requests.",
        impact: "medium",
        actionLabel: "Apply Optimization",
      },
      {
        id: "3",
        type: "prediction",
        title: "Upcoming Risk",
        description: "Based on recent commit patterns, there's a 78% chance of test failures in the payment module next week.",
        impact: "high",
        actionLabel: "Review Changes",
      },
      {
        id: "4",
        type: "success",
        title: "Test Coverage Improved",
        description: "Your test coverage increased by 12% this week. Great progress on the user module!",
        impact: "low",
      },
    ]);

    setPredictions([
      { label: "Pass Rate (Next 7 Days)", value: 94.2, change: 2.1, trend: "up", confidence: 87 },
      { label: "Avg Test Duration", value: 12.4, change: -1.8, trend: "down", confidence: 92 },
      { label: "Failure Risk Score", value: 23, change: 5, trend: "up", confidence: 78 },
      { label: "Coverage Projection", value: 84, change: 3, trend: "up", confidence: 85 },
    ]);

    setLoading(false);
  }

  async function refresh() {
    setRefreshing(true);
    await loadInsights();
    setRefreshing(false);
  }

  function getInsightIcon(type: Insight["type"]) {
    switch (type) {
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "improvement":
        return <Lightbulb className="w-5 h-5 text-blue-500" />;
      case "prediction":
        return <Target className="w-5 h-5 text-purple-500" />;
      case "success":
        return <Sparkles className="w-5 h-5 text-green-500" />;
    }
  }

  function getInsightBg(type: Insight["type"]) {
    switch (type) {
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800";
      case "improvement":
        return "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800";
      case "prediction":
        return "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800";
      case "success":
        return "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800";
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <Brain className="w-8 h-8 animate-pulse mb-3" />
            <p className="text-sm">AI is analyzing your data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Predictions */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="w-5 h-5 text-primary" />
              AI Predictions
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={refresh}
              disabled={refreshing}
            >
              <RefreshCw className={cn("w-4 h-4 mr-1", refreshing && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {predictions.map((prediction, i) => (
              <div
                key={i}
                className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">
                    {prediction.label}
                  </span>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs",
                      prediction.trend === "up" && prediction.label.includes("Risk")
                        ? "text-red-600"
                        : prediction.trend === "up"
                        ? "text-green-600"
                        : prediction.trend === "down" && prediction.label.includes("Duration")
                        ? "text-green-600"
                        : "text-yellow-600"
                    )}
                  >
                    {prediction.trend === "up" ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : prediction.trend === "down" ? (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    ) : null}
                    {prediction.change > 0 ? "+" : ""}
                    {prediction.change}
                    {prediction.label.includes("%") || prediction.label.includes("Rate") ? "%" : ""}
                  </Badge>
                </div>
                <div className="text-2xl font-bold">
                  {prediction.value}
                  {prediction.label.includes("Duration") ? "s" : 
                   prediction.label.includes("%") || prediction.label.includes("Rate") || prediction.label.includes("Coverage") ? "%" : ""}
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${prediction.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {prediction.confidence}% conf.
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            Intelligent Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className={cn(
                  "p-4 rounded-lg border transition-all hover:shadow-md",
                  getInsightBg(insight.type)
                )}
              >
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-medium">{insight.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {insight.description}
                        </p>
                      </div>
                      <Badge
                        variant={
                          insight.impact === "high"
                            ? "destructive"
                            : insight.impact === "medium"
                            ? "secondary"
                            : "outline"
                        }
                        className="flex-shrink-0"
                      >
                        {insight.impact} impact
                      </Badge>
                    </div>

                    {insight.metric && (
                      <div className="mt-3 p-3 rounded-md bg-background/50">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span>{insight.metric.label}</span>
                          <span className="font-medium">
                            {insight.metric.current}{insight.metric.unit} / {insight.metric.target}{insight.metric.unit}
                          </span>
                        </div>
                        <Progress
                          value={(insight.metric.current / insight.metric.target) * 100}
                          className="h-2"
                        />
                      </div>
                    )}

                    {insight.actionLabel && (
                      <Button
                        variant="link"
                        size="sm"
                        className="px-0 mt-2"
                      >
                        {insight.actionLabel}
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow cursor-pointer group">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium group-hover:text-primary transition-colors">
                  Generate Tests
                </h4>
                <p className="text-sm text-muted-foreground">
                  AI-powered test creation
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer group">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-950 flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium group-hover:text-primary transition-colors">
                  Security Scan
                </h4>
                <p className="text-sm text-muted-foreground">
                  Check for vulnerabilities
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer group">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium group-hover:text-primary transition-colors">
                  Schedule Tests
                </h4>
                <p className="text-sm text-muted-foreground">
                  Automate test runs
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

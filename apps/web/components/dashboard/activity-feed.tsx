"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  RefreshCw,
  GitCommit,
  GitPullRequest,
  Rocket,
  Clock,
  User,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: "test_run" | "deployment" | "commit" | "pr" | "discovery";
  title: string;
  description: string;
  status?: "success" | "failure" | "warning" | "pending";
  project: string;
  projectId: string;
  user?: {
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  metadata?: {
    passed?: number;
    failed?: number;
    duration?: number;
    branch?: string;
  };
}

export function ActivityFeed() {
  const [activities] = useState<ActivityItem[]>([
    {
      id: "1",
      type: "test_run",
      title: "Test Run Completed",
      description: "All tests passed for production deployment",
      status: "success",
      project: "Web Application",
      projectId: "1",
      user: { name: "John Doe" },
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      metadata: { passed: 24, failed: 0, duration: 12400 },
    },
    {
      id: "2",
      type: "deployment",
      title: "Deployment to Production",
      description: "v2.4.1 deployed to production environment",
      status: "success",
      project: "API Gateway",
      projectId: "2",
      user: { name: "Jane Smith" },
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
    },
    {
      id: "3",
      type: "test_run",
      title: "Test Run Failed",
      description: "3 tests failed in the payment module",
      status: "failure",
      project: "Payment Service",
      projectId: "3",
      user: { name: "Mike Johnson" },
      timestamp: new Date(Date.now() - 1000 * 60 * 32),
      metadata: { passed: 18, failed: 3, duration: 24100 },
    },
    {
      id: "4",
      type: "pr",
      title: "PR Merged",
      description: "feat: Add retry logic for failed webhooks",
      status: "success",
      project: "Web Application",
      projectId: "1",
      user: { name: "Sarah Williams" },
      timestamp: new Date(Date.now() - 1000 * 60 * 48),
      metadata: { branch: "feature/webhook-retry" },
    },
    {
      id: "5",
      type: "discovery",
      title: "New Service Detected",
      description: "Automatically discovered Redis cache service",
      status: "success",
      project: "API Gateway",
      projectId: "2",
      timestamp: new Date(Date.now() - 1000 * 60 * 67),
    },
    {
      id: "6",
      type: "test_run",
      title: "Scheduled Test Run",
      description: "Nightly test suite completed with warnings",
      status: "warning",
      project: "Web Application",
      projectId: "1",
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
      metadata: { passed: 45, failed: 0, duration: 45000 },
    },
  ]);

  function getActivityIcon(type: ActivityItem["type"], status?: ActivityItem["status"]) {
    switch (type) {
      case "test_run":
        if (status === "success") return <CheckCircle2 className="w-5 h-5 text-green-500" />;
        if (status === "failure") return <XCircle className="w-5 h-5 text-red-500" />;
        if (status === "warning") return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
        return <Play className="w-5 h-5 text-blue-500" />;
      case "deployment":
        return <Rocket className="w-5 h-5 text-purple-500" />;
      case "commit":
        return <GitCommit className="w-5 h-5 text-gray-500" />;
      case "pr":
        return <GitPullRequest className="w-5 h-5 text-blue-500" />;
      case "discovery":
        return <RefreshCw className="w-5 h-5 text-teal-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  }

  function formatTime(date: Date) {
    const minutes = Math.floor((Date.now() - date.getTime()) / 1000 / 60);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return `${Math.floor(minutes / 1440)}d ago`;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Activity
          </CardTitle>
          <Button variant="ghost" size="sm">
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-4">
            {activities.map((activity, i) => (
              <div
                key={activity.id}
                className={cn(
                  "relative flex gap-4 pl-12",
                  i === activities.length - 1 && "pb-0"
                )}
              >
                {/* Timeline dot */}
                <div className="absolute left-3 w-5 h-5 rounded-full bg-background border-2 border-border flex items-center justify-center">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    activity.status === "success" ? "bg-green-500" :
                    activity.status === "failure" ? "bg-red-500" :
                    activity.status === "warning" ? "bg-yellow-500" :
                    "bg-blue-500"
                  )} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getActivityIcon(activity.type, activity.status)}
                      <div>
                        <p className="font-medium text-sm">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.description}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(activity.timestamp)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <Link
                      href={`/dashboard/projects/${activity.projectId}`}
                      className="hover:text-foreground"
                    >
                      {activity.project}
                    </Link>
                    {activity.user && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {activity.user.name}
                        </span>
                      </>
                    )}
                    {activity.metadata?.passed !== undefined && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                          {activity.metadata.passed}
                          {activity.metadata.failed !== undefined && activity.metadata.failed > 0 && (
                            <>
                              <XCircle className="w-3 h-3 text-red-500 ml-1" />
                              {activity.metadata.failed}
                            </>
                          )}
                        </span>
                      </>
                    )}
                    {activity.metadata?.duration && (
                      <>
                        <span>•</span>
                        <span>{(activity.metadata.duration / 1000).toFixed(1)}s</span>
                      </>
                    )}
                    {activity.metadata?.branch && (
                      <Badge variant="outline" className="text-xs">
                        {activity.metadata.branch}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

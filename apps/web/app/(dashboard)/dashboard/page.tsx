import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  ArrowRight,
  Play,
  Zap,
  Server,
  Target,
  BarChart3,
  Timer,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";

async function getDashboardData(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: {
        organizations: {
          include: {
            organization: {
              include: {
                projects: {
                  include: {
                    testRuns: {
                      take: 10,
                      orderBy: { createdAt: "desc" },
                      include: {
                        results: true,
                      },
                    },
                    services: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user || user.organizations.length === 0) {
      return null;
    }

    const org = user.organizations[0].organization;
    const projects = org.projects;

    // Calculate stats
    const totalProjects = projects.length;
    const allTestRuns = projects.flatMap((p: { testRuns: Array<{ id: string; status: string; trigger: string; duration: number | null; createdAt: Date; results: Array<{ status: string }> }> }) => p.testRuns);
    const recentRuns = allTestRuns.slice(0, 10);

    const passedRuns = allTestRuns.filter((r: { status: string }) => r.status === "PASSED").length;
    const failedRuns = allTestRuns.filter((r: { status: string }) => r.status === "FAILED").length;
    const runningRuns = allTestRuns.filter((r: { status: string }) => r.status === "RUNNING").length;
    const totalServices = projects.reduce((acc: number, p: { services: unknown[] }) => acc + p.services.length, 0);

    // Calculate average duration
    const completedRuns = allTestRuns.filter((r: { duration: number | null }) => r.duration);
    const avgDuration = completedRuns.length > 0
      ? Math.round(completedRuns.reduce((acc: number, r: { duration: number | null }) => acc + (r.duration || 0), 0) / completedRuns.length / 1000)
      : 0;

    return {
      organization: org,
      projects,
      stats: {
        totalProjects,
        totalTestRuns: allTestRuns.length,
        passedRuns,
        failedRuns,
        runningRuns,
        passRate: allTestRuns.length > 0 ? Math.round((passedRuns / allTestRuns.length) * 100) : 0,
        totalServices,
        avgDuration,
      },
      recentRuns,
    };
  } catch (error) {
    console.error("Database error in getDashboardData:", error);
    return { error: "database_error" };
  }
}

export default async function DashboardPage() {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const data = await getDashboardData(userId);

  // Handle database error
  if (data && "error" in data) {
    return (
      <div className="empty-state min-h-[60vh]">
        <div className="empty-state-icon">
          <Server />
        </div>
        <h2 className="text-2xl font-bold mb-2">Database Setup Required</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          The database tables need to be initialized. Please run the database migration command.
        </p>
        <code className="bg-muted px-4 py-2 rounded-lg text-sm font-mono mb-4">
          npx prisma db push
        </code>
        <p className="text-sm text-muted-foreground">
          Ensure your DATABASE_URL environment variable is configured correctly.
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="empty-state min-h-[60vh]">
        <div className="empty-state-icon">
          <Zap />
        </div>
        <h2 className="text-2xl font-bold mb-2">Welcome to Conduii</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Create your first project to start testing your deployments with AI-powered diagnostics.
        </p>
        <Link href="/dashboard/projects/new">
          <Button size="lg" className="gap-2">
            Create Your First Project
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    );
  }

  const { stats, projects, recentRuns } = data;

  return (
    <div className="space-y-8">
      {/* Header Section - Asymmetric layout */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1">
          <p className="text-sm font-medium text-primary uppercase tracking-wider">Overview</p>
          <h1 className="text-4xl font-bold tracking-tight">Command Center</h1>
          <p className="text-muted-foreground">
            Real-time testing metrics and activity across all projects
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/projects/new">
            <Button variant="outline" className="gap-2">
              <Layers className="w-4 h-4" />
              New Project
            </Button>
          </Link>
          <Link href="/dashboard/projects">
            <Button className="gap-2">
              <Play className="w-4 h-4" />
              Run Tests
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary Metrics - Large asymmetric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pass Rate - Featured metric */}
        <div className="stat-card col-span-2 lg:col-span-1 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Pass Rate</span>
          </div>
          <div className="metric-value text-primary">{stats.passRate}%</div>
          <div className="mt-4">
            <div className="status-bar">
              <div
                className="status-bar-segment bg-green-500"
                style={{ width: `${stats.passRate}%` }}
              />
              <div
                className="status-bar-segment bg-red-500"
                style={{ width: `${100 - stats.passRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Total Runs */}
        <div className="stat-card">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <div className="metric-value">{stats.totalTestRuns}</div>
          <div className="metric-label mt-1">Test Runs</div>
          {stats.runningRuns > 0 && (
            <div className="mt-3 flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
              <div className="pulse-indicator" style={{ '--pulse-color': 'rgb(234, 179, 8)' } as React.CSSProperties} />
              <span>{stats.runningRuns} running</span>
            </div>
          )}
        </div>

        {/* Projects */}
        <div className="stat-card">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Layers className="w-5 h-5 text-purple-500" />
            </div>
          </div>
          <div className="metric-value">{stats.totalProjects}</div>
          <div className="metric-label mt-1">Projects</div>
          <div className="mt-3 text-sm text-muted-foreground">
            {stats.totalServices} services
          </div>
        </div>

        {/* Avg Duration */}
        <div className="stat-card">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Timer className="w-5 h-5 text-orange-500" />
            </div>
          </div>
          <div className="metric-value">{stats.avgDuration}s</div>
          <div className="metric-label mt-1">Avg Duration</div>
          <div className="mt-3 text-sm text-muted-foreground">
            Per test run
          </div>
        </div>
      </div>

      {/* Activity Grid - Unique 2-column layout */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Projects List - Takes 2 columns */}
        <div className="lg:col-span-2 stat-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-lg">Active Projects</h3>
              <p className="text-sm text-muted-foreground">Quick access to your projects</p>
            </div>
            <Link href="/dashboard/projects">
              <Button variant="ghost" size="sm" className="gap-1">
                View All
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No projects yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {projects.slice(0, 5).map((project: { id: string; name: string; services: unknown[]; testRuns: Array<{ status: string }> }) => {
                const lastRun = project.testRuns[0];
                const statusColors = {
                  PASSED: "bg-green-500",
                  FAILED: "bg-red-500",
                  RUNNING: "bg-yellow-500",
                  PENDING: "bg-slate-400",
                };
                return (
                  <Link
                    key={project.id}
                    href={`/dashboard/projects/${project.id}`}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {project.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium group-hover:text-primary transition-colors">{project.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {project.services.length} services
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {lastRun && (
                        <div className={`w-2.5 h-2.5 rounded-full ${statusColors[lastRun.status as keyof typeof statusColors] || "bg-slate-400"}`} />
                      )}
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity - Takes 3 columns */}
        <div className="lg:col-span-3 stat-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-lg">Recent Activity</h3>
              <p className="text-sm text-muted-foreground">Latest test execution results</p>
            </div>
          </div>

          {recentRuns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No test runs yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRuns.slice(0, 6).map((run: { id: string; status: string; trigger: string; duration: number | null; createdAt: Date; results: Array<{ status: string }> }, index: number) => {
                const passed = run.results.filter((r: { status: string }) => r.status === "PASSED").length;
                const failed = run.results.filter((r: { status: string }) => r.status === "FAILED").length;
                const total = run.results.length;

                const statusConfig = {
                  PASSED: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
                  FAILED: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
                  RUNNING: { icon: Activity, color: "text-yellow-500", bg: "bg-yellow-500/10" },
                  PENDING: { icon: Clock, color: "text-slate-500", bg: "bg-slate-500/10" },
                };

                const config = statusConfig[run.status as keyof typeof statusConfig] || statusConfig.PENDING;
                const StatusIcon = config.icon;

                return (
                  <div
                    key={run.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center`}>
                      <StatusIcon className={`w-5 h-5 ${config.color}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{run.trigger} Run</span>
                        <span className={`run-status run-status-${run.status.toLowerCase()}`}>
                          {run.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span>{total} tests</span>
                        {total > 0 && (
                          <>
                            <span className="text-green-600 dark:text-green-400">{passed} passed</span>
                            {failed > 0 && (
                              <span className="text-red-600 dark:text-red-400">{failed} failed</span>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-mono text-sm">
                        {run.duration ? `${(run.duration / 1000).toFixed(1)}s` : "-"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(run.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="glow-line" />
      <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>{stats.passedRuns} passed</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" />
            <span>{stats.failedRuns} failed</span>
          </div>
        </div>
        <p>Last updated: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
}

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
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";

async function getDashboardData(userId: string) {
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
  const allTestRuns = projects.flatMap((p) => p.testRuns);
  const recentRuns = allTestRuns.slice(0, 10);
  
  const passedRuns = allTestRuns.filter((r) => r.status === "PASSED").length;
  const failedRuns = allTestRuns.filter((r) => r.status === "FAILED").length;
  const totalServices = projects.reduce((acc, p) => acc + p.services.length, 0);

  return {
    organization: org,
    projects,
    stats: {
      totalProjects,
      totalTestRuns: allTestRuns.length,
      passedRuns,
      failedRuns,
      passRate: allTestRuns.length > 0 ? Math.round((passedRuns / allTestRuns.length) * 100) : 0,
      totalServices,
    },
    recentRuns,
  };
}

export default async function DashboardPage() {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const data = await getDashboardData(userId);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Zap className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Welcome to Conduii</h2>
        <p className="text-muted-foreground mb-6">
          Create your first project to start testing your deployments.
        </p>
        <Link href="/dashboard/projects/new">
          <Button>
            Create Your First Project
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>
    );
  }

  const { stats, projects, recentRuns } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your testing activity
          </p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button>
            <Play className="w-4 h-4 mr-2" />
            New Test Run
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">Active projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Test Runs</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTestRuns}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.passRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.passedRuns} passed / {stats.failedRuns} failed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Services</CardTitle>
            <Server className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalServices}</div>
            <p className="text-xs text-muted-foreground">Connected integrations</p>
          </CardContent>
        </Card>
      </div>

      {/* Projects & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Projects */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Projects</CardTitle>
              <Link href="/dashboard/projects">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
            <CardDescription>Your active projects</CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No projects yet. Create your first one!
              </div>
            ) : (
              <div className="space-y-4">
                {projects.slice(0, 5).map((project) => {
                  const lastRun = project.testRuns[0];
                  return (
                    <Link
                      key={project.id}
                      href={`/dashboard/projects/${project.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {project.services.length} services • {project.testRuns.length} runs
                        </p>
                      </div>
                      {lastRun && (
                        <Badge
                          variant={
                            lastRun.status === "PASSED"
                              ? "success"
                              : lastRun.status === "FAILED"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {lastRun.status}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Test Runs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Test Runs</CardTitle>
            <CardDescription>Latest test execution results</CardDescription>
          </CardHeader>
          <CardContent>
            {recentRuns.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No test runs yet. Run your first test!
              </div>
            ) : (
              <div className="space-y-4">
                {recentRuns.slice(0, 5).map((run) => {
                  const passed = run.results.filter((r) => r.status === "PASSED").length;
                  const failed = run.results.filter((r) => r.status === "FAILED").length;
                  return (
                    <div
                      key={run.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        {run.status === "PASSED" ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : run.status === "FAILED" ? (
                          <XCircle className="w-5 h-5 text-red-500" />
                        ) : (
                          <Clock className="w-5 h-5 text-yellow-500" />
                        )}
                        <div>
                          <p className="font-medium text-sm">
                            {run.trigger} run
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {passed} passed • {failed} failed
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          {run.duration ? `${(run.duration / 1000).toFixed(1)}s` : "-"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(run.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

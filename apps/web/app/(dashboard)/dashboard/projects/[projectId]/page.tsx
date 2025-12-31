import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Server,
  Globe,
  GitBranch,
  Zap,
  Activity,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import {
  ProjectActionsDropdown,
  CheckHealthButton,
  CreateTestSuiteButton,
  RunTestSuiteButton,
} from "@/components/project";

async function getProject(projectId: string, userId: string) {
  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      organizations: {
        include: {
          organization: true,
        },
      },
    },
  });

  if (!user || user.organizations.length === 0) {
    return null;
  }

  const orgIds = user.organizations.map((m: { organizationId: string }) => m.organizationId);

  const project = await db.project.findFirst({
    where: {
      id: projectId,
      organizationId: { in: orgIds },
    },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          plan: true,
        },
      },
      services: {
        orderBy: { name: "asc" },
      },
      endpoints: {
        orderBy: { path: "asc" },
        take: 20,
      },
      environments: {
        orderBy: { name: "asc" },
      },
      testSuites: {
        include: {
          _count: {
            select: { tests: true },
          },
        },
      },
      testRuns: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          environment: {
            select: {
              id: true,
              name: true,
            },
          },
          results: {
            select: {
              status: true,
            },
          },
        },
      },
      _count: {
        select: {
          services: true,
          endpoints: true,
          testRuns: true,
        },
      },
    },
  });

  return project;
}

function getServiceStatusIcon(status: string) {
  switch (status) {
    case "HEALTHY":
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case "DEGRADED":
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    case "UNHEALTHY":
      return <XCircle className="w-4 h-4 text-red-500" />;
    default:
      return <Clock className="w-4 h-4 text-gray-400" />;
  }
}

export default async function ProjectDetailPage({
  params,
}: {
  params: { projectId: string };
}) {
  const authUser = await getAuthUser();
  if (!authUser) redirect("/sign-in");

  const project = await getProject(params.projectId, authUser.clerkId);

  if (!project) {
    notFound();
  }

  // Calculate stats
  const healthyServices = project.services.filter(
    (s: { status: string }) => s.status === "HEALTHY"
  ).length;
  const totalServices = project.services.length;
  const passRate =
    project.testRuns.length > 0
      ? Math.round(
          (project.testRuns.filter((r: { status: string }) => r.status === "PASSED").length /
            project.testRuns.length) *
            100
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href="/dashboard/projects">
            <Button variant="ghost" size="icon" data-testid="back-to-projects">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{project.name}</h1>
              {project.framework && (
                <Badge variant="outline">{project.framework}</Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              {project.description || "No description"}
            </p>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              {project.productionUrl && (
                <a
                  href={project.productionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  <Globe className="w-4 h-4" />
                  {new URL(project.productionUrl).hostname}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {project.repositoryUrl && (
                <a
                  href={project.repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  <GitBranch className="w-4 h-4" />
                  Repository
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/projects/${project.id}/runs`}>
            <Button data-testid="run-tests-header">
              <Play className="w-4 h-4 mr-2" />
              Run Tests
            </Button>
          </Link>
          <ProjectActionsDropdown projectId={project.id} projectName={project.name} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Services</CardTitle>
            <Server className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalServices}</div>
            <p className="text-xs text-muted-foreground">
              {healthyServices} healthy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Endpoints</CardTitle>
            <Globe className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project._count.endpoints}</div>
            <p className="text-xs text-muted-foreground">API routes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Test Runs</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project._count.testRuns}</div>
            <p className="text-xs text-muted-foreground">Total runs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            <Zap className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                passRate >= 80
                  ? "text-green-600"
                  : passRate >= 50
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {passRate}%
            </div>
            <p className="text-xs text-muted-foreground">Last 10 runs</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Services */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Services</CardTitle>
                <CardDescription>
                  Detected integrations and their health status
                </CardDescription>
              </div>
              <CheckHealthButton projectId={project.id} />
            </div>
          </CardHeader>
          <CardContent>
            {project.services.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Server className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No services detected yet.</p>
                <p className="text-sm">
                  Run discovery to detect your integrations.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {project.services.map((service: { id: string; name: string; type: string; status: string; latency: number | null }) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    data-testid={`service-item-${service.id}`}
                  >
                    <div className="flex items-center gap-3">
                      {getServiceStatusIcon(service.status)}
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {service.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {service.latency && (
                        <span className="text-sm text-muted-foreground">
                          {service.latency}ms
                        </span>
                      )}
                      <Badge
                        variant={
                          service.status === "HEALTHY"
                            ? "success"
                            : service.status === "UNHEALTHY"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {service.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Test Runs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Test Runs</CardTitle>
                <CardDescription>Latest test execution results</CardDescription>
              </div>
              <Link href={`/dashboard/projects/${project.id}/runs`}>
                <Button variant="outline" size="sm" data-testid="view-all-runs">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {project.testRuns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No test runs yet.</p>
                <p className="text-sm">Run your first test to see results.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {project.testRuns.map((run: { id: string; status: string; trigger: string; createdAt: Date; environment: { id: string; name: string } | null; results: Array<{ status: string }> }) => {
                  const passed = run.results.filter(
                    (r: { status: string }) => r.status === "PASSED"
                  ).length;
                  const failed = run.results.filter(
                    (r: { status: string }) => r.status === "FAILED"
                  ).length;
                  const total = run.results.length;

                  return (
                    <Link
                      key={run.id}
                      href={`/dashboard/projects/${project.id}/runs/${run.id}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      data-testid={`run-item-${run.id}`}
                    >
                      <div className="flex items-center gap-3">
                        {run.status === "PASSED" ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : run.status === "FAILED" ? (
                          <XCircle className="w-5 h-5 text-red-500" />
                        ) : run.status === "RUNNING" ? (
                          <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                        ) : (
                          <Clock className="w-5 h-5 text-gray-400" />
                        )}
                        <div>
                          <p className="font-medium text-sm">
                            {run.trigger} run
                            {run.environment && (
                              <span className="text-muted-foreground">
                                {" "}
                                - {run.environment.name}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {passed}/{total} passed
                            {failed > 0 && ` • ${failed} failed`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            run.status === "PASSED"
                              ? "success"
                              : run.status === "FAILED"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {run.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(run.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Environments */}
        <Card>
          <CardHeader>
            <CardTitle>Environments</CardTitle>
            <CardDescription>
              Configured deployment environments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {project.environments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No environments configured.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {project.environments.map((env: { id: string; name: string; url: string | null; isProduction: boolean }) => (
                  <div
                    key={env.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{env.name}</p>
                        {env.url && (
                          <a
                            href={env.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                          >
                            {env.url}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                    {env.isProduction && (
                      <Badge variant="outline">Production</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* API Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle>API Endpoints</CardTitle>
            <CardDescription>
              Discovered API routes ({project._count.endpoints} total)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {project.endpoints.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No endpoints discovered.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {project.endpoints.map((endpoint: { id: string; path: string; method: string }) => (
                  <div
                    key={endpoint.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"
                  >
                    <Badge
                      variant="outline"
                      className={`font-mono text-xs ${
                        endpoint.method === "GET"
                          ? "text-green-600 border-green-600"
                          : endpoint.method === "POST"
                          ? "text-blue-600 border-blue-600"
                          : endpoint.method === "PUT" ||
                            endpoint.method === "PATCH"
                          ? "text-yellow-600 border-yellow-600"
                          : endpoint.method === "DELETE"
                          ? "text-red-600 border-red-600"
                          : ""
                      }`}
                    >
                      {endpoint.method}
                    </Badge>
                    <code className="text-sm font-mono">{endpoint.path}</code>
                  </div>
                ))}
                {project._count.endpoints > 20 && (
                  <p className="text-sm text-muted-foreground text-center pt-2">
                    + {project._count.endpoints - 20} more endpoints
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Test Suites */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Test Suites</CardTitle>
              <CardDescription>
                Organized collections of tests for this project
              </CardDescription>
            </div>
            <CreateTestSuiteButton projectId={project.id} />
          </div>
        </CardHeader>
        <CardContent>
          {project.testSuites.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No test suites created.</p>
              <p className="text-sm">
                Test suites help organize your tests by type or feature.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {project.testSuites.map((suite: { id: string; name: string; description: string | null; isDefault: boolean; _count: { tests: number } }) => (
                <div
                  key={suite.id}
                  className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                  data-testid={`test-suite-${suite.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{suite.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {suite.description || "No description"}
                      </p>
                    </div>
                    {suite.isDefault && (
                      <Badge variant="secondary" className="text-xs">
                        Default
                      </Badge>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {suite._count.tests} tests
                    </span>
                    <RunTestSuiteButton projectId={project.id} suiteId={suite.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

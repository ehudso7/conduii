import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  FolderKanban,
  Play,
  ArrowRight,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  MoreHorizontal,
  Layers,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";

async function getProjects(userId: string) {
  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      organizations: {
        include: {
          organization: {
            include: {
              projects: {
                include: {
                  services: true,
                  testRuns: {
                    take: 3,
                    orderBy: { createdAt: "desc" },
                    select: {
                      id: true,
                      status: true,
                      createdAt: true,
                    },
                  },
                  _count: {
                    select: { testRuns: true },
                  },
                },
                orderBy: { updatedAt: "desc" },
              },
            },
          },
        },
      },
    },
  });

  if (!user || user.organizations.length === 0) {
    return [];
  }

  return user.organizations[0].organization.projects;
}

export default async function ProjectsPage() {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const projects = await getProjects(userId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1">
          <p className="text-sm font-medium text-primary uppercase tracking-wider">Projects</p>
          <h1 className="text-4xl font-bold tracking-tight">Your Projects</h1>
          <p className="text-muted-foreground">
            Manage and test your deployed applications
          </p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Projects Grid or Empty State */}
      {projects.length === 0 ? (
        <div className="empty-state min-h-[50vh]">
          <div className="empty-state-icon">
            <FolderKanban />
          </div>
          <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            Create your first project to start discovering services and running
            tests on your deployed applications.
          </p>
          <Link href="/dashboard/projects/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Your First Project
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Stats Bar */}
          <div className="flex items-center gap-6 py-4 px-6 rounded-xl bg-muted/30 border">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <span className="font-semibold">{projects.length}</span>
              <span className="text-muted-foreground">projects</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold">
                {projects.reduce((acc: number, p: { services: unknown[] }) => acc + p.services.length, 0)}
              </span>
              <span className="text-muted-foreground">services</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold">
                {projects.reduce((acc: number, p: { _count: { testRuns: number } }) => acc + p._count.testRuns, 0)}
              </span>
              <span className="text-muted-foreground">total runs</span>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project: {
              id: string;
              name: string;
              description: string | null;
              framework: string | null;
              services: Array<{ id: string; name: string; status: string }>;
              testRuns: Array<{ id: string; status: string; createdAt: Date }>;
              _count: { testRuns: number };
            }) => {
              const lastRun = project.testRuns[0];
              const recentRuns = project.testRuns.slice(0, 3);

              const statusColors = {
                PASSED: "bg-green-500",
                FAILED: "bg-red-500",
                RUNNING: "bg-yellow-500",
                PENDING: "bg-slate-400",
              };

              const serviceHealthColors = {
                HEALTHY: "bg-green-500",
                UNHEALTHY: "bg-red-500",
                UNKNOWN: "bg-slate-400",
              };

              return (
                <div key={project.id} className="project-card-futuristic group">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-lg font-bold text-primary border border-primary/10">
                          {project.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                            {project.name}
                          </h3>
                          {project.framework && (
                            <span className="text-sm text-muted-foreground">{project.framework}</span>
                          )}
                        </div>
                      </div>
                      {lastRun && (
                        <div className={`run-status run-status-${lastRun.status.toLowerCase()}`}>
                          {lastRun.status === "PASSED" && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {lastRun.status === "FAILED" && <XCircle className="w-3.5 h-3.5" />}
                          {lastRun.status === "RUNNING" && <Activity className="w-3.5 h-3.5" />}
                          {lastRun.status === "PENDING" && <Clock className="w-3.5 h-3.5" />}
                          {lastRun.status}
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {project.description || "No description provided"}
                    </p>

                    {/* Stats Row */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Layers className="w-4 h-4" />
                        {project.services.length} services
                      </span>
                      <span className="flex items-center gap-1">
                        <Activity className="w-4 h-4" />
                        {project._count.testRuns} runs
                      </span>
                    </div>

                    {/* Service Health Indicators */}
                    {project.services.length > 0 && (
                      <div className="flex items-center gap-1.5 mb-4">
                        {project.services.slice(0, 6).map((service: { id: string; name: string; status: string }) => (
                          <div
                            key={service.id}
                            className={`w-2.5 h-2.5 rounded-full ${serviceHealthColors[service.status as keyof typeof serviceHealthColors] || "bg-slate-400"}`}
                            title={`${service.name}: ${service.status}`}
                          />
                        ))}
                        {project.services.length > 6 && (
                          <span className="text-xs text-muted-foreground ml-1">
                            +{project.services.length - 6}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Recent Activity Mini Timeline */}
                    {recentRuns.length > 0 && (
                      <div className="flex items-center gap-1 mb-6">
                        <span className="text-xs text-muted-foreground mr-2">Recent:</span>
                        {recentRuns.map((run: { id: string; status: string; createdAt: Date }) => (
                          <div
                            key={run.id}
                            className={`w-6 h-1.5 rounded-full ${statusColors[run.status as keyof typeof statusColors] || "bg-slate-400"}`}
                            title={`${run.status} - ${new Date(run.createdAt).toLocaleDateString()}`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/projects/${project.id}`} className="flex-1">
                        <Button variant="outline" className="w-full gap-2 group-hover:border-primary/30 transition-colors">
                          View Details
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={`/dashboard/projects/${project.id}/runs`}>
                        <Button size="icon" className="shrink-0">
                          <Play className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add New Project Card */}
            <Link href="/dashboard/projects/new" className="block">
              <div className="h-full min-h-[300px] rounded-2xl border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer group">
                <div className="w-16 h-16 rounded-2xl bg-muted/50 group-hover:bg-primary/10 flex items-center justify-center mb-4 transition-colors">
                  <Plus className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="text-lg font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  Add New Project
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Start testing a new application
                </p>
              </div>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

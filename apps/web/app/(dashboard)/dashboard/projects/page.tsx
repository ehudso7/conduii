import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  FolderKanban,
  MoreVertical,
  Play,
  Settings,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
                    take: 1,
                    orderBy: { createdAt: "desc" },
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            Manage and test your deployed applications
          </p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FolderKanban className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Create your first project to start discovering services and running
              tests on your deployed applications.
            </p>
            <Link href="/dashboard/projects/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Project
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const lastRun = project.testRuns[0];
            const healthyServices = project.services.filter(
              (s) => s.status === "HEALTHY"
            ).length;

            return (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {project.description || "No description"}
                      </CardDescription>
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
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span>{project.services.length} services</span>
                    <span>•</span>
                    <span>{project._count.testRuns} runs</span>
                    {project.framework && (
                      <>
                        <span>•</span>
                        <span>{project.framework}</span>
                      </>
                    )}
                  </div>

                  {/* Service Health */}
                  {project.services.length > 0 && (
                    <div className="flex items-center gap-1 mb-4">
                      {project.services.slice(0, 5).map((service) => (
                        <div
                          key={service.id}
                          className={`w-2 h-2 rounded-full ${
                            service.status === "HEALTHY"
                              ? "bg-green-500"
                              : service.status === "UNHEALTHY"
                              ? "bg-red-500"
                              : "bg-gray-400"
                          }`}
                          title={`${service.name}: ${service.status}`}
                        />
                      ))}
                      {project.services.length > 5 && (
                        <span className="text-xs text-muted-foreground ml-1">
                          +{project.services.length - 5}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/projects/${project.id}`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        View Project
                      </Button>
                    </Link>
                    <Link href={`/dashboard/projects/${project.id}/runs`}>
                      <Button size="sm">
                        <Play className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Add Project Card */}
          <Link href="/dashboard/projects/new">
            <Card className="h-full border-dashed hover:border-primary hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px]">
                <Plus className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Add New Project</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      )}
    </div>
  );
}

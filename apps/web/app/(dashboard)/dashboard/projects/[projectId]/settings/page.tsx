"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Settings,
  Globe,
  GitBranch,
  Bell,
  Shield,
  Trash2,
  Plus,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

interface Environment {
  id: string;
  name: string;
  url: string | null;
  isProduction: boolean;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  repositoryUrl: string | null;
  productionUrl: string | null;
  framework: string | null;
  environments: Environment[];
}

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { toast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    repositoryUrl: "",
    productionUrl: "",
  });

  const [notifications, setNotifications] = useState({
    onFailure: true,
    onSuccess: false,
    dailyDigest: false,
  });

  const [showEnvForm, setShowEnvForm] = useState(false);
  const [newEnv, setNewEnv] = useState({ name: "", url: "", isProduction: false });
  const [addingEnv, setAddingEnv] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  async function fetchProject() {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (res.ok) {
        const { project } = await res.json();
        setProject(project);
        setFormData({
          name: project.name,
          description: project.description || "",
          repositoryUrl: project.repositoryUrl || "",
          productionUrl: project.productionUrl || "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch project:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update project");
      }

      toast({
        title: "Project Updated",
        description: "Your project settings have been saved.",
      });

      fetchProject();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update project",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (deleteConfirm !== project?.name) {
      toast({
        title: "Confirmation Required",
        description: "Please type the project name exactly to confirm deletion.",
        variant: "destructive",
      });
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete project");
      }

      toast({
        title: "Project Deleted",
        description: "The project has been permanently deleted.",
      });
      router.push("/dashboard/projects");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete project",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  }

  async function handleAddEnvironment() {
    if (!newEnv.name) {
      toast({
        title: "Error",
        description: "Please enter an environment name",
        variant: "destructive",
      });
      return;
    }

    setAddingEnv(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/environments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEnv),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add environment");
      }

      toast({
        title: "Environment Added",
        description: `"${newEnv.name}" has been added successfully.`,
      });
      setNewEnv({ name: "", url: "", isProduction: false });
      setShowEnvForm(false);
      fetchProject();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add environment",
        variant: "destructive",
      });
    } finally {
      setAddingEnv(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Settings className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The project you're looking for doesn't exist or you don't have access to it.
        </p>
        <Button onClick={() => router.push("/dashboard/projects")}>
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href={`/dashboard/projects/${projectId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Project Settings</h1>
          <p className="text-muted-foreground">
            Manage settings for {project.name}
          </p>
        </div>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <CardTitle>General Settings</CardTitle>
          </div>
          <CardDescription>
            Basic project information and configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Project Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="My Project"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="A brief description of your project..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              Repository URL
            </label>
            <Input
              type="url"
              value={formData.repositoryUrl}
              onChange={(e) => setFormData({ ...formData, repositoryUrl: e.target.value })}
              placeholder="https://github.com/username/repo"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Production URL
            </label>
            <Input
              type="url"
              value={formData.productionUrl}
              onChange={(e) => setFormData({ ...formData, productionUrl: e.target.value })}
              placeholder="https://myapp.com"
            />
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Environments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              <CardTitle>Environments</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEnvForm(!showEnvForm)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Environment
            </Button>
          </div>
          <CardDescription>
            Configure deployment environments for testing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showEnvForm && (
            <div className="p-4 mb-4 rounded-lg bg-muted/50 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={newEnv.name}
                    onChange={(e) => setNewEnv({ ...newEnv, name: e.target.value })}
                    placeholder="e.g., Staging, Production"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">URL</label>
                  <Input
                    type="url"
                    value={newEnv.url}
                    onChange={(e) => setNewEnv({ ...newEnv, url: e.target.value })}
                    placeholder="https://staging.myapp.com"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={newEnv.isProduction}
                  onCheckedChange={(checked) => setNewEnv({ ...newEnv, isProduction: checked })}
                />
                <label className="text-sm">Mark as production environment</label>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddEnvironment} disabled={addingEnv}>
                  {addingEnv ? "Adding..." : "Add Environment"}
                </Button>
                <Button variant="ghost" onClick={() => setShowEnvForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {project.environments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No environments configured.</p>
              <p className="text-sm">Add an environment to run tests against.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {project.environments.map((env) => (
                <div
                  key={env.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{env.name}</p>
                      {env.isProduction && (
                        <Badge variant="outline">Production</Badge>
                      )}
                    </div>
                    {env.url && (
                      <p className="text-sm text-muted-foreground">{env.url}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>
            Configure when to receive notifications for this project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">On Test Failure</p>
              <p className="text-sm text-muted-foreground">
                Get notified when a test run fails
              </p>
            </div>
            <Switch
              checked={notifications.onFailure}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, onFailure: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">On Test Success</p>
              <p className="text-sm text-muted-foreground">
                Get notified when all tests pass
              </p>
            </div>
            <Switch
              checked={notifications.onSuccess}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, onSuccess: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Daily Digest</p>
              <p className="text-sm text-muted-foreground">
                Receive a daily summary of testing activity
              </p>
            </div>
            <Switch
              checked={notifications.dailyDigest}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, dailyDigest: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-600" />
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
          </div>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg border border-red-200 bg-red-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Delete Project</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete this project and all associated data
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Project
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Project</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All test runs, services, and data
              associated with this project will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm">
              Type <strong>{project.name}</strong> to confirm:
            </p>
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={project.name}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting || deleteConfirm !== project.name}
            >
              {deleting ? "Deleting..." : "Delete Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

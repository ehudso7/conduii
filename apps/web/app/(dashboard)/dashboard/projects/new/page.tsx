"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Github, Globe, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function NewProjectPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    repositoryUrl: "",
    productionUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create project");
      }

      const data = await response.json();

      toast({
        title: "Project created!",
        description: "Your project has been created successfully.",
      });

      router.push(`/dashboard/projects/${data.project.id}`);
    } catch {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          data-testid="back-to-projects"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>
        <p className="text-sm font-medium text-primary uppercase tracking-wider mb-1">New Project</p>
        <h1 className="text-4xl font-bold tracking-tight">Create Project</h1>
        <p className="text-muted-foreground mt-2">
          Set up a new project to test your deployed application
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="stat-card">
          <div className="p-6 space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-4">Project Details</h3>
              <p className="text-sm text-muted-foreground mb-6">Basic information about your project</p>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="My SaaS App"
                className="w-full px-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                required
                data-testid="project-name-input"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="A brief description of your project..."
                rows={3}
                className="w-full px-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none transition-all"
                data-testid="project-description-input"
              />
            </div>

            {/* Repository URL */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                <Github className="w-4 h-4 inline mr-2" />
                Repository URL
              </label>
              <input
                type="url"
                value={formData.repositoryUrl}
                onChange={(e) =>
                  setFormData({ ...formData, repositoryUrl: e.target.value })
                }
                placeholder="https://github.com/username/repo"
                className="w-full px-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                data-testid="repo-url-input"
              />
              <p className="text-xs text-muted-foreground">
                Optional. Used for GitHub integration and auto-discovery.
              </p>
            </div>

            {/* Production URL */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                <Globe className="w-4 h-4 inline mr-2" />
                Production URL
              </label>
              <input
                type="url"
                value={formData.productionUrl}
                onChange={(e) =>
                  setFormData({ ...formData, productionUrl: e.target.value })
                }
                placeholder="https://myapp.com"
                className="w-full px-4 py-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                data-testid="prod-url-input"
              />
              <p className="text-xs text-muted-foreground">
                The URL of your deployed application.
              </p>
            </div>
          </div>
        </div>

        {/* Auto-Discovery Info */}
        <div className="stat-card bg-gradient-to-br from-primary/5 to-transparent">
          <div className="p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Automatic Discovery</h3>
              <p className="text-sm text-muted-foreground">
                After creating your project, Conduii will automatically discover
                your services, integrations, and generate tests based on your
                stack.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link href="/dashboard/projects">
            <Button variant="outline" type="button" className="px-6" data-testid="cancel-button">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={loading || !formData.name}
            className="px-6 gap-2"
            data-testid="create-project-button"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Create Project
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

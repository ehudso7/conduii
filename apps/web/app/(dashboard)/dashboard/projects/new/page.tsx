"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Github, Globe, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>
        <h1 className="text-3xl font-bold">Create New Project</h1>
        <p className="text-muted-foreground">
          Set up a new project to test your deployed application
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Basic information about your project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="My SaaS App"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="A brief description of your project..."
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
              />
            </div>

            {/* Repository URL */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <Github className="w-4 h-4 inline mr-1" />
                Repository URL
              </label>
              <input
                type="url"
                value={formData.repositoryUrl}
                onChange={(e) =>
                  setFormData({ ...formData, repositoryUrl: e.target.value })
                }
                placeholder="https://github.com/username/repo"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Optional. Used for GitHub integration and auto-discovery.
              </p>
            </div>

            {/* Production URL */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <Globe className="w-4 h-4 inline mr-1" />
                Production URL
              </label>
              <input
                type="url"
                value={formData.productionUrl}
                onChange={(e) =>
                  setFormData({ ...formData, productionUrl: e.target.value })
                }
                placeholder="https://myapp.com"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                The URL of your deployed application.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Auto-Discovery Info */}
        <Card className="mt-6 bg-primary/5 border-primary/20">
          <CardContent className="flex items-start gap-4 pt-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium mb-1">Automatic Discovery</h3>
              <p className="text-sm text-muted-foreground">
                After creating your project, Conduii will automatically discover
                your services, integrations, and generate tests based on your
                stack.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 mt-6">
          <Link href="/dashboard/projects">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading || !formData.name}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Project"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Filter,
  Calendar,
  Zap,
  AlertTriangle,
  Square,
  Trash2,
  MoreVertical,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";

interface TestRun {
  id: string;
  status: string;
  trigger: string;
  duration: number | null;
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  } | null;
  createdAt: string;
  environment: {
    id: string;
    name: string;
  } | null;
}

interface Environment {
  id: string;
  name: string;
  url: string | null;
  isProduction: boolean;
}

interface TestSuite {
  id: string;
  name: string;
  description: string | null;
}

interface Project {
  id: string;
  name: string;
  environments: Environment[];
  testSuites: TestSuite[];
}

export default function TestRunsPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { toast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>("");
  const [selectedTestType, setSelectedTestType] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [runToDelete, setRunToDelete] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [projectRes, runsRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/projects/${projectId}/runs`),
      ]);

      if (projectRes.ok) {
        const { project } = await projectRes.json();
        setProject(project);
        if (project.environments.length > 0 && !selectedEnvironment) {
          setSelectedEnvironment(project.environments[0].id);
        }
      }

      if (runsRes.ok) {
        const { testRuns } = await runsRes.json();
        setTestRuns(testRuns);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, [projectId, selectedEnvironment]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh when there are running tests
  useEffect(() => {
    const hasRunningTests = testRuns.some(
      (run) => run.status === "RUNNING" || run.status === "PENDING"
    );

    if (hasRunningTests) {
      const interval = setInterval(fetchData, 3000);
      return () => clearInterval(interval);
    }
  }, [testRuns, fetchData]);

  async function startTestRun() {
    if (!selectedEnvironment) return;

    setRunning(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          environmentId: selectedEnvironment,
          testType: selectedTestType,
        }),
      });

      if (res.ok) {
        toast({
          title: "Test Run Started",
          description: "Tests are now running...",
        });
        await fetchData();
      } else {
        const data = await res.json();
        toast({
          title: "Error",
          description: data.error || "Failed to start test run",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to start test run:", error);
      toast({
        title: "Error",
        description: "Failed to start test run",
        variant: "destructive",
      });
    } finally {
      setRunning(false);
    }
  }

  async function cancelTestRun(runId: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    try {
      const res = await fetch(`/api/test-runs/${runId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      if (res.ok) {
        toast({
          title: "Test Run Cancelled",
          description: "The test run has been cancelled.",
        });
        await fetchData();
      } else {
        const data = await res.json();
        toast({
          title: "Error",
          description: data.error || "Failed to cancel test run",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to cancel test run:", error);
      toast({
        title: "Error",
        description: "Failed to cancel test run",
        variant: "destructive",
      });
    }
  }

  async function deleteTestRun() {
    if (!runToDelete) return;

    try {
      const res = await fetch(`/api/test-runs/${runToDelete}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast({
          title: "Test Run Deleted",
          description: "The test run has been permanently deleted.",
        });
        await fetchData();
      } else {
        const data = await res.json();
        toast({
          title: "Error",
          description: data.error || "Failed to delete test run",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to delete test run:", error);
      toast({
        title: "Error",
        description: "Failed to delete test run",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setRunToDelete(null);
    }
  }

  function openDeleteDialog(runId: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setRunToDelete(runId);
    setDeleteDialogOpen(true);
  }

  const filteredRuns =
    statusFilter === "all"
      ? testRuns
      : testRuns.filter((run) => run.status === statusFilter);

  const runningCount = testRuns.filter(
    (run) => run.status === "RUNNING" || run.status === "PENDING"
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href={`/dashboard/projects/${projectId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Test Runs</h1>
            <p className="text-muted-foreground">
              {project?.name} - Run and monitor tests
            </p>
          </div>
        </div>
        {runningCount > 0 && (
          <Badge variant="secondary" className="animate-pulse">
            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
            {runningCount} running
          </Badge>
        )}
      </div>

      {/* Run Test Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Run New Test
          </CardTitle>
          <CardDescription>
            Execute tests against your deployment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Environment</label>
              <Select
                value={selectedEnvironment}
                onValueChange={setSelectedEnvironment}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select environment" />
                </SelectTrigger>
                <SelectContent>
                  {project?.environments.map((env) => (
                    <SelectItem key={env.id} value={env.id}>
                      {env.name}
                      {env.isProduction && " (Production)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Test Type</label>
              <Select
                value={selectedTestType}
                onValueChange={setSelectedTestType}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select test type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tests</SelectItem>
                  <SelectItem value="health">Health Checks</SelectItem>
                  <SelectItem value="integration">Integration Tests</SelectItem>
                  <SelectItem value="api">API Tests</SelectItem>
                  <SelectItem value="e2e">E2E Tests</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={startTestRun}
              disabled={running || !selectedEnvironment}
            >
              {running ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Tests
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Runs List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Test History</CardTitle>
              <CardDescription>
                {filteredRuns.length} test runs
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PASSED">Passed</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="RUNNING">Running</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={fetchData}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRuns.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No test runs yet.</p>
              <p className="text-sm">
                Start a new test run to see results here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRuns.map((run) => {
                const summary = run.summary || {
                  total: 0,
                  passed: 0,
                  failed: 0,
                  skipped: 0,
                };
                const isRunning = run.status === "RUNNING" || run.status === "PENDING";

                return (
                  <div
                    key={run.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                  >
                    <Link
                      href={`/dashboard/projects/${projectId}/runs/${run.id}`}
                      className="flex items-center gap-4 flex-1"
                    >
                      {run.status === "PASSED" ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      ) : run.status === "FAILED" ? (
                        <XCircle className="w-6 h-6 text-red-500" />
                      ) : run.status === "RUNNING" ? (
                        <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
                      ) : run.status === "CANCELLED" ? (
                        <Square className="w-6 h-6 text-gray-500" />
                      ) : (
                        <Clock className="w-6 h-6 text-gray-400" />
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {run.trigger} run
                          </p>
                          {run.environment && (
                            <Badge variant="outline" className="text-xs">
                              {run.environment.name}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(run.createdAt).toLocaleString()}
                          </span>
                          {run.duration && (
                            <span>
                              Duration: {(run.duration / 1000).toFixed(1)}s
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>

                    <div className="flex items-center gap-4">
                      {/* Test Summary */}
                      <div className="flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="w-4 h-4" />
                          {summary.passed}
                        </span>
                        <span className="flex items-center gap-1 text-red-600">
                          <XCircle className="w-4 h-4" />
                          {summary.failed}
                        </span>
                        {summary.skipped > 0 && (
                          <span className="flex items-center gap-1 text-yellow-600">
                            <AlertTriangle className="w-4 h-4" />
                            {summary.skipped}
                          </span>
                        )}
                      </div>

                      <Badge
                        variant={
                          run.status === "PASSED"
                            ? "success"
                            : run.status === "FAILED"
                            ? "destructive"
                            : run.status === "RUNNING"
                            ? "secondary"
                            : "outline"
                        }
                        className="min-w-[80px] justify-center"
                      >
                        {run.status}
                      </Badge>

                      {/* Actions Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {isRunning && (
                            <DropdownMenuItem
                              onClick={(e) => cancelTestRun(run.id, e as unknown as React.MouseEvent)}
                              className="text-yellow-600"
                            >
                              <Square className="w-4 h-4 mr-2" />
                              Cancel Run
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={(e) => openDeleteDialog(run.id, e as unknown as React.MouseEvent)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Run
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Test Run</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this test run? This action cannot
              be undone and all associated test results will be permanently
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteTestRun}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

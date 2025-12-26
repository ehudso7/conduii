"use client";

import { useState, useEffect } from "react";
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

  const [project, setProject] = useState<Project | null>(null);
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>("");
  const [selectedTestType, setSelectedTestType] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchData();
  }, [projectId]);

  async function fetchData() {
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
  }

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
        await fetchData();
      }
    } catch (error) {
      console.error("Failed to start test run:", error);
    } finally {
      setRunning(false);
    }
  }

  const filteredRuns =
    statusFilter === "all"
      ? testRuns
      : testRuns.filter((run) => run.status === statusFilter);

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
                  Running...
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

                return (
                  <Link
                    key={run.id}
                    href={`/dashboard/projects/${projectId}/runs/${run.id}`}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      {run.status === "PASSED" ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      ) : run.status === "FAILED" ? (
                        <XCircle className="w-6 h-6 text-red-500" />
                      ) : run.status === "RUNNING" ? (
                        <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
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
                    </div>

                    <div className="flex items-center gap-6">
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
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

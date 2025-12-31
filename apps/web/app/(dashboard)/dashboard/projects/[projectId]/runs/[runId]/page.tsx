"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Lightbulb,
  Bug,
  Timer,
  Activity,
  Square,
  Trash2,
  Bot,
  Terminal,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { AIAssistant } from "@/components/test-run/ai-assistant";
import { StreamingOutput } from "@/components/test-run/streaming-output";

interface TestResult {
  id: string;
  status: string;
  duration: number | null;
  error: string | null;
  assertions: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  test: {
    id: string;
    name: string;
    type: string;
  };
}

interface Diagnostic {
  id: string;
  severity: string;
  issue: string;
  component: string;
  description: string;
  suggestions: string[];
}

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
  completedAt: string | null;
  environment: {
    id: string;
    name: string;
    url: string | null;
  } | null;
  testSuite: {
    id: string;
    name: string;
  } | null;
  triggeredBy: {
    id: string;
    name: string | null;
    imageUrl: string | null;
  } | null;
  results: TestResult[];
  diagnostics: Diagnostic[];
}

interface Project {
  id: string;
  name: string;
}

function getStatusIcon(status: string) {
  switch (status) {
    case "PASSED":
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    case "FAILED":
      return <XCircle className="w-5 h-5 text-red-500" />;
    case "RUNNING":
      return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
    case "SKIPPED":
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    default:
      return <Clock className="w-5 h-5 text-gray-400" />;
  }
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case "CRITICAL":
      return "text-red-600 bg-red-50 border-red-200";
    case "HIGH":
      return "text-orange-600 bg-orange-50 border-orange-200";
    case "MEDIUM":
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "LOW":
      return "text-blue-600 bg-blue-50 border-blue-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
}

export default function TestRunDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const projectId = params.projectId as string;
  const runId = params.runId as string;

  const [testRun, setTestRun] = useState<TestRun | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());
  const [cancelling, setCancelling] = useState(false);
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null);
  const [activeTab, setActiveTab] = useState<string>("results");

  useEffect(() => {
    fetchData();
    // Poll for updates if the run is still in progress
    const interval = setInterval(() => {
      if (testRun?.status === "RUNNING" || testRun?.status === "PENDING") {
        fetchData();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [projectId, runId, testRun?.status]);

  async function fetchData() {
    try {
      const [runRes, projectRes] = await Promise.all([
        fetch(`/api/test-runs/${runId}`),
        fetch(`/api/projects/${projectId}`),
      ]);

      if (runRes.ok) {
        const { testRun } = await runRes.json();
        setTestRun(testRun);
      }

      if (projectRes.ok) {
        const { project } = await projectRes.json();
        setProject(project);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }

  function toggleResult(resultId: string) {
    const newExpanded = new Set(expandedResults);
    if (newExpanded.has(resultId)) {
      newExpanded.delete(resultId);
    } else {
      newExpanded.add(resultId);
    }
    setExpandedResults(newExpanded);
  }

  async function cancelTestRun() {
    setCancelling(true);
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
    } finally {
      setCancelling(false);
    }
  }

  async function deleteTestRun() {
    try {
      const res = await fetch(`/api/test-runs/${runId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast({
          title: "Test Run Deleted",
          description: "The test run has been permanently deleted.",
        });
        router.push(`/dashboard/projects/${projectId}/runs`);
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
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!testRun) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertTriangle className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Test Run Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The test run you're looking for doesn't exist or you don't have access to it.
        </p>
        <Button onClick={() => router.push(`/dashboard/projects/${projectId}/runs`)}>
          Back to Test Runs
        </Button>
      </div>
    );
  }

  const summary = testRun.summary || { total: 0, passed: 0, failed: 0, skipped: 0 };
  const passRate = summary.total > 0 ? Math.round((summary.passed / summary.total) * 100) : 0;

  function hasAssertions(assertions: Record<string, unknown> | null): assertions is { passed: number; failed: number } {
    return assertions !== null && typeof assertions === 'object' && 'passed' in assertions && 'failed' in assertions;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href={`/dashboard/projects/${projectId}/runs`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Test Run</h1>
              <Badge
                variant={
                  testRun.status === "PASSED"
                    ? "success"
                    : testRun.status === "FAILED"
                    ? "destructive"
                    : testRun.status === "RUNNING"
                    ? "secondary"
                    : "outline"
                }
                className="text-sm"
              >
                {testRun.status}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {project?.name} • {testRun.trigger} run
              {testRun.environment && ` • ${testRun.environment.name}`}
            </p>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span>Started {new Date(testRun.createdAt).toLocaleString()}</span>
              {testRun.duration && (
                <span className="flex items-center gap-1">
                  <Timer className="w-4 h-4" />
                  {(testRun.duration / 1000).toFixed(1)}s
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(testRun.status === "RUNNING" || testRun.status === "PENDING") && (
            <>
              <Badge variant="secondary" className="animate-pulse">
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                {testRun.status === "RUNNING" ? "Running..." : "Pending..."}
              </Badge>
              <Button
                variant="outline"
                onClick={cancelTestRun}
                disabled={cancelling}
                className="text-yellow-600 hover:text-yellow-700"
              >
                <Square className="w-4 h-4 mr-2" />
                {cancelling ? "Cancelling..." : "Cancel"}
              </Button>
            </>
          )}
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={deleteTestRun}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Passed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary.passed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${passRate >= 80 ? "text-green-600" : passRate >= 50 ? "text-yellow-600" : "text-red-600"}`}>
              {passRate}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="results" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Results</span>
          </TabsTrigger>
          <TabsTrigger value="output" className="flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            <span className="hidden sm:inline">Live Output</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            <span className="hidden sm:inline">AI Assistant</span>
          </TabsTrigger>
          <TabsTrigger value="diagnostics" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            <span className="hidden sm:inline">Diagnostics</span>
            {testRun.diagnostics.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 justify-center">
                {testRun.diagnostics.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Live Output Tab */}
        <TabsContent value="output" className="mt-4">
          <StreamingOutput
            testRunId={runId}
            status={testRun.status as "PENDING" | "RUNNING" | "PASSED" | "FAILED" | "CANCELLED"}
            onTestClick={(testName) => {
              const test = testRun.results.find(r => r.test.name === testName);
              if (test) {
                setSelectedTest(test);
                setActiveTab("ai");
              }
            }}
          />
        </TabsContent>

        {/* AI Assistant Tab */}
        <TabsContent value="ai" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <AIAssistant
                testRunId={runId}
                projectId={projectId}
                context={selectedTest ? {
                  testName: selectedTest.test.name,
                  testType: selectedTest.test.type,
                  error: selectedTest.error || undefined,
                  duration: selectedTest.duration || undefined,
                  assertions: selectedTest.assertions || undefined,
                } : undefined}
                onApplyFix={(code, filename) => {
                  toast({
                    title: "Fix Applied",
                    description: `Code saved to ${filename}. Verify the changes before committing.`,
                  });
                }}
              />
            </div>
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setSelectedTest(
                      testRun.results.find(r => r.status === "FAILED") || null
                    )}
                  >
                    <XCircle className="w-4 h-4 mr-2 text-red-500" />
                    Analyze First Failure
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <Bug className="w-4 h-4 mr-2" />
                    Debug All Failures
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
              
              {/* Failed Tests Quick Select */}
              {testRun.results.filter(r => r.status === "FAILED").length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-red-600">
                      Failed Tests ({testRun.results.filter(r => r.status === "FAILED").length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {testRun.results
                      .filter(r => r.status === "FAILED")
                      .map((result) => (
                        <button
                          key={result.id}
                          onClick={() => setSelectedTest(result)}
                          className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                            selectedTest?.id === result.id
                              ? "bg-red-100 dark:bg-red-950 border border-red-200 dark:border-red-800"
                              : "hover:bg-muted"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <XCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                            <span className="truncate">{result.test.name}</span>
                          </div>
                        </button>
                      ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Diagnostics Tab */}
        <TabsContent value="diagnostics" className="mt-4">
          {testRun.diagnostics.length > 0 ? (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  <CardTitle>AI Diagnostics</CardTitle>
                </div>
                <CardDescription>
                  Intelligent analysis of test failures with actionable suggestions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testRun.diagnostics.map((diagnostic) => (
                    <div
                      key={diagnostic.id}
                      className={`p-4 rounded-lg border ${getSeverityColor(diagnostic.severity)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Bug className="w-5 h-5 mt-0.5" />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {diagnostic.severity}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {diagnostic.component}
                              </Badge>
                            </div>
                            <p className="font-medium">{diagnostic.issue}</p>
                            <p className="text-sm mt-2 opacity-80">{diagnostic.description}</p>
                            {diagnostic.suggestions && diagnostic.suggestions.length > 0 && (
                              <div className="mt-3">
                                <p className="text-xs font-medium mb-1">Suggestions:</p>
                                <ul className="text-sm list-disc list-inside opacity-80 space-y-1">
                                  {diagnostic.suggestions.map((suggestion, idx) => (
                                    <li key={idx}>{suggestion}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No Diagnostics Yet</p>
                <p className="text-sm">
                  AI diagnostics will appear here after analyzing test failures.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="mt-4">
          <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            <CardTitle>Test Results</CardTitle>
          </div>
          <CardDescription>
            Detailed results for each test in this run
          </CardDescription>
        </CardHeader>
        <CardContent>
          {testRun.results.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {testRun.status === "RUNNING" || testRun.status === "PENDING" ? (
                <>
                  <RefreshCw className="w-12 h-12 mx-auto mb-4 animate-spin opacity-50" />
                  <p>Tests are currently running...</p>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No test results available.</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {testRun.results.map((result) => (
                <Collapsible
                  key={result.id}
                  open={expandedResults.has(result.id)}
                  onOpenChange={() => toggleResult(result.id)}
                >
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.status)}
                        <div>
                          <p className="font-medium">{result.test.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-xs">
                              {result.test.type}
                            </Badge>
                            {result.duration && (
                              <span className="text-xs text-muted-foreground">
                                {result.duration}ms
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {hasAssertions(result.assertions) && (
                          <span className="text-sm text-muted-foreground">
                            {result.assertions.passed}/{result.assertions.passed + result.assertions.failed} assertions
                          </span>
                        )}
                        <Badge
                          variant={
                            result.status === "PASSED"
                              ? "success"
                              : result.status === "FAILED"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {result.status}
                        </Badge>
                        {expandedResults.has(result.id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-4 mt-1 rounded-lg bg-muted/30 border">
                      {result.error && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-red-600">Error</h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTest(result);
                                setActiveTab("ai");
                              }}
                              className="h-7 text-xs"
                            >
                              <Bot className="w-3 h-3 mr-1" />
                              Ask AI
                            </Button>
                          </div>
                          <pre className="text-sm bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-200 p-3 rounded overflow-x-auto">
                            {result.error}
                          </pre>
                        </div>
                      )}
                      {result.metadata && Object.keys(result.metadata).length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2">Details</h4>
                          <pre className="text-sm bg-muted p-3 rounded overflow-x-auto">
                            {JSON.stringify(result.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                      {!result.error && (!result.metadata || Object.keys(result.metadata).length === 0) && (
                        <p className="text-sm text-muted-foreground">No additional details available.</p>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>

      {/* Environment Info */}
      {testRun.environment && (
        <Card>
          <CardHeader>
            <CardTitle>Environment</CardTitle>
            <CardDescription>
              The environment this test run was executed against
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium">{testRun.environment.name}</p>
                {testRun.environment.url && (
                  <a
                    href={testRun.environment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    {testRun.environment.url}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

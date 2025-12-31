"use client";

import { useState, useRef } from "react";
import {
  Wand2,
  Loader2,
  Copy,
  Check,
  Download,
  Play,
  FileCode,
  Sparkles,
  Code,
  TestTube,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface GeneratedTest {
  id: string;
  name: string;
  type: "health" | "integration" | "api" | "e2e";
  code: string;
  description: string;
  confidence: number;
}

interface AITestGeneratorProps {
  projectId: string;
  onTestsGenerated?: (tests: GeneratedTest[]) => void;
}

const EXAMPLE_PROMPTS = [
  "Generate health checks for my API endpoints",
  "Create tests for user authentication flow",
  "Test the Stripe payment integration",
  "Generate E2E tests for the checkout process",
  "Create API tests for the REST endpoints",
];

export function AITestGenerator({ projectId: _projectId, onTestsGenerated }: AITestGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [testType, setTestType] = useState<string>("auto");
  const [generating, setGenerating] = useState(false);
  const [generatedTests, setGeneratedTests] = useState<GeneratedTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<GeneratedTest | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [streamingOutput, setStreamingOutput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function handleGenerate() {
    if (!prompt.trim() || generating) return;

    setGenerating(true);
    setStreamingOutput("");
    setGeneratedTests([]);

    // Simulate streaming generation
    const thinkingSteps = [
      "Analyzing your request...",
      "Identifying test scenarios...",
      "Generating test structure...",
      "Writing test assertions...",
      "Optimizing test coverage...",
    ];

    for (const step of thinkingSteps) {
      setStreamingOutput(step);
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    // Simulate generated tests
    const tests: GeneratedTest[] = [
      {
        id: "1",
        name: "API Health Check",
        type: "health",
        description: "Verifies the API health endpoint returns 200 OK",
        confidence: 98,
        code: `import { test, expect } from '@playwright/test';

test('API health endpoint should return 200', async ({ request }) => {
  const response = await request.get('/api/health');
  
  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);
  
  const body = await response.json();
  expect(body.status).toBe('healthy');
});`,
      },
      {
        id: "2",
        name: "Database Connection Test",
        type: "health",
        description: "Verifies database connectivity and response time",
        confidence: 95,
        code: `import { test, expect } from '@playwright/test';

test('Database connection should be healthy', async ({ request }) => {
  const response = await request.get('/api/health/db');
  
  expect(response.ok()).toBeTruthy();
  
  const body = await response.json();
  expect(body.connected).toBe(true);
  expect(body.latency).toBeLessThan(100);
});`,
      },
      {
        id: "3",
        name: "Authentication Flow Test",
        type: "integration",
        description: "Tests the complete user authentication flow",
        confidence: 92,
        code: `import { test, expect } from '@playwright/test';

test('User should be able to sign in', async ({ page }) => {
  await page.goto('/sign-in');
  
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByText('Welcome back')).toBeVisible();
});`,
      },
    ];

    setStreamingOutput("");
    setGeneratedTests(tests);
    setSelectedTest(tests[0]);
    onTestsGenerated?.(tests);
    setGenerating(false);
  }

  async function copyCode(test: GeneratedTest) {
    await navigator.clipboard.writeText(test.code);
    setCopiedId(test.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function downloadTest(test: GeneratedTest) {
    const blob = new Blob([test.code], { type: "text/typescript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${test.name.toLowerCase().replace(/\s+/g, "-")}.spec.ts`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-primary" />
            AI Test Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to test... (e.g., 'Generate health checks for my API endpoints')"
                className="min-h-[100px] resize-none"
                disabled={generating}
              />
            </div>
            <div className="w-48 space-y-3">
              <Select value={testType} onValueChange={setTestType}>
                <SelectTrigger>
                  <SelectValue placeholder="Test type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-detect</SelectItem>
                  <SelectItem value="health">Health Checks</SelectItem>
                  <SelectItem value="integration">Integration</SelectItem>
                  <SelectItem value="api">API Tests</SelectItem>
                  <SelectItem value="e2e">E2E Tests</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || generating}
                className="w-full"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Tests
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Example Prompts */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Try:</span>
            {EXAMPLE_PROMPTS.map((example, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => setPrompt(example)}
                disabled={generating}
              >
                {example}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Streaming Output */}
      {streamingOutput && (
        <Card className="border-primary/50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-sm font-medium">{streamingOutput}</span>
              <span className="flex-1" />
              <div className="flex gap-1">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Tests */}
      {generatedTests.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Test List */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TestTube className="w-4 h-4" />
                Generated Tests ({generatedTests.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {generatedTests.map((test) => (
                <button
                  key={test.id}
                  onClick={() => setSelectedTest(test)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-all",
                    selectedTest?.id === test.id
                      ? "border-primary bg-primary/5"
                      : "border-transparent bg-muted/50 hover:bg-muted"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{test.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {test.description}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs",
                        test.confidence >= 90 ? "text-green-600" :
                        test.confidence >= 70 ? "text-yellow-600" : "text-red-600"
                      )}
                    >
                      {test.confidence}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {test.type}
                    </Badge>
                  </div>
                </button>
              ))}

              <Button variant="outline" className="w-full mt-2" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Generate More
              </Button>
            </CardContent>
          </Card>

          {/* Code Preview */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  {selectedTest?.name || "Select a test"}
                </CardTitle>
                {selectedTest && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyCode(selectedTest)}
                    >
                      {copiedId === selectedTest.id ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadTest(selectedTest)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {selectedTest ? (
                <div className="relative">
                  <pre className="p-4 rounded-lg bg-zinc-950 text-zinc-100 text-sm overflow-x-auto">
                    <code>{selectedTest.code}</code>
                  </pre>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" className="flex-1">
                      <Play className="w-4 h-4 mr-2" />
                      Run Test
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <FileCode className="w-4 h-4 mr-2" />
                      Add to Project
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <Code className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Select a test to view its code</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

/**
 * AI-Powered Test Generation Service
 * Generates tests from natural language, code analysis, and API specs
 */

import { generateJSON, isAIConfigured } from "./index";
import { db } from "@/lib/db";

export interface GeneratedTest {
  name: string;
  type: "API" | "INTEGRATION" | "E2E" | "UNIT" | "HEALTH";
  description: string;
  code: string;
  assertions: string[];
  setup?: string;
  teardown?: string;
  tags: string[];
  priority: "HIGH" | "MEDIUM" | "LOW";
  estimatedDuration: number;
}

export interface TestGenerationRequest {
  projectId: string;
  prompt: string;
  context?: {
    existingTests?: string[];
    codeSnippets?: string[];
    apiEndpoints?: Array<{
      method: string;
      path: string;
      description?: string;
    }>;
  };
  testType?: "API" | "INTEGRATION" | "E2E" | "UNIT" | "HEALTH";
  framework?: "jest" | "vitest" | "playwright" | "cypress";
}

const TEST_GENERATION_SCHEMA = `{
  "tests": [
    {
      "name": "string - descriptive test name",
      "type": "API | INTEGRATION | E2E | UNIT | HEALTH",
      "description": "string - what this test verifies",
      "code": "string - complete test code",
      "assertions": ["array of assertion descriptions"],
      "setup": "string - optional setup code",
      "teardown": "string - optional teardown code",
      "tags": ["array of tags"],
      "priority": "HIGH | MEDIUM | LOW",
      "estimatedDuration": "number - milliseconds"
    }
  ]
}`;

/**
 * Generate tests from natural language description
 */
export async function generateTestsFromPrompt(
  request: TestGenerationRequest
): Promise<GeneratedTest[]> {
  if (!isAIConfigured()) {
    throw new Error("AI is not configured. Please set up an AI provider.");
  }

  // Get project context
  const project = await db.project.findUnique({
    where: { id: request.projectId },
    include: {
      endpoints: { take: 20 },
      services: { take: 10 },
      testSuites: {
        include: {
          tests: { take: 50 },
        },
      },
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  // Build context for AI
  const existingTestNames = project.testSuites
    .flatMap((suite) => suite.tests)
    .map((t) => t.name);

  const endpointContext = project.endpoints
    .map((e) => `${e.method} ${e.path} - ${e.description || "No description"}`)
    .join("\n");

  const framework = request.framework || "vitest";

  const projectContext = `Project Context:
- Name: ${project.name}
- Production URL: ${project.productionUrl || "Not set"}
- Existing tests: ${existingTestNames.slice(0, 20).join(", ") || "None"}
- API Endpoints:
${endpointContext || "None discovered"}

Guidelines:
1. Generate complete, runnable test code using ${framework}
2. Include proper error handling and edge cases
3. Use descriptive test names following the pattern: "should [expected behavior] when [condition]"
4. Include setup and teardown when necessary
5. Add meaningful assertions that validate the actual behavior
6. Consider security testing (auth, injection, etc.)
7. Consider performance implications
8. Generate at least 3 tests unless specifically asked for fewer`;

  const result = await generateJSON<{ tests: GeneratedTest[] }>(
    `${projectContext}\n\nGenerate tests for the following requirement:\n\n${request.prompt}\n\n${
      request.context?.codeSnippets
        ? `\nRelevant code:\n${request.context.codeSnippets.join("\n\n")}`
        : ""
    }`,
    TEST_GENERATION_SCHEMA,
    { maxTokens: 8000 }
  );

  return result.tests;
}

/**
 * Generate tests from OpenAPI/Swagger specification
 */
export async function generateTestsFromOpenAPI(
  projectId: string,
  spec: Record<string, unknown>
): Promise<GeneratedTest[]> {
  if (!isAIConfigured()) {
    throw new Error("AI is not configured. Please set up an AI provider.");
  }

  const paths = spec.paths as Record<string, Record<string, unknown>> || {};
  const allTests: GeneratedTest[] = [];

  // Process each endpoint
  for (const [path, methods] of Object.entries(paths)) {
    for (const [method, details] of Object.entries(methods)) {
      if (typeof details !== "object" || !details) continue;

      const endpointDetails = details as {
        summary?: string;
        description?: string;
        parameters?: unknown[];
        requestBody?: unknown;
        responses?: Record<string, unknown>;
      };

      const prompt = `Generate comprehensive API tests for:
Endpoint: ${method.toUpperCase()} ${path}
Summary: ${endpointDetails.summary || "No summary"}
Description: ${endpointDetails.description || "No description"}
Parameters: ${JSON.stringify(endpointDetails.parameters || [], null, 2)}
Request Body: ${JSON.stringify(endpointDetails.requestBody || {}, null, 2)}
Expected Responses: ${JSON.stringify(endpointDetails.responses || {}, null, 2)}

Generate tests for:
1. Happy path with valid data
2. Validation errors with invalid data
3. Authentication/Authorization (if applicable)
4. Edge cases and boundary conditions
5. Error handling`;

      const tests = await generateTestsFromPrompt({
        projectId,
        prompt,
        testType: "API",
      });

      allTests.push(...tests);
    }
  }

  return allTests;
}

/**
 * Suggest tests based on code changes
 */
export async function suggestTestsForCodeChanges(
  projectId: string,
  diff: string,
  changedFiles: string[]
): Promise<GeneratedTest[]> {
  if (!isAIConfigured()) {
    throw new Error("AI is not configured. Please set up an AI provider.");
  }

  const prompt = `Analyze the following code changes and suggest tests that should be added or modified:

Changed Files:
${changedFiles.join("\n")}

Code Diff:
${diff.slice(0, 10000)}

Based on these changes:
1. Identify what functionality was added or modified
2. Suggest new tests to cover the changes
3. Identify existing tests that might need updates
4. Consider edge cases introduced by the changes`;

  return generateTestsFromPrompt({
    projectId,
    prompt,
    context: {
      codeSnippets: [diff.slice(0, 5000)],
    },
  });
}

/**
 * Save generated tests to the database
 */
export async function saveGeneratedTests(
  projectId: string,
  testSuiteId: string,
  tests: GeneratedTest[]
): Promise<void> {
  for (const test of tests) {
    await db.test.create({
      data: {
        testSuiteId,
        name: test.name,
        type: test.type,
        description: test.description,
        config: {
          code: test.code,
          assertions: test.assertions,
          setup: test.setup,
          teardown: test.teardown,
          tags: test.tags,
          priority: test.priority,
          estimatedDuration: test.estimatedDuration,
        },
        enabled: true,
      },
    });
  }
}

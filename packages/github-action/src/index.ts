import * as core from "@actions/core";
import * as github from "@actions/github";
import { createConduii } from "@conduii/core";

// =============================================================================
// TYPES
// =============================================================================

interface ActionInputs {
  apiKey?: string;
  testType: "all" | "health" | "integration" | "api" | "e2e";
  environment: string;
  deploymentUrl?: string;
  workingDirectory: string;
  failOnError: boolean;
  vercelToken?: string;
  supabaseUrl?: string;
  supabaseKey?: string;
  stripeKey?: string;
  githubToken?: string;
}

interface TestResult {
  name: string;
  type: string;
  status: "passed" | "failed" | "skipped";
  duration: number;
  error?: string;
}

interface TestSummary {
  status: "passed" | "failed";
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  results: TestResult[];
}

// =============================================================================
// INPUT PARSING
// =============================================================================

function getInputs(): ActionInputs {
  return {
    apiKey: core.getInput("api-key") || undefined,
    testType: (core.getInput("test-type") || "all") as ActionInputs["testType"],
    environment: core.getInput("environment") || "preview",
    deploymentUrl: core.getInput("deployment-url") || undefined,
    workingDirectory: core.getInput("working-directory") || ".",
    failOnError: core.getBooleanInput("fail-on-error"),
    vercelToken: core.getInput("vercel-token") || undefined,
    supabaseUrl: core.getInput("supabase-url") || undefined,
    supabaseKey: core.getInput("supabase-key") || undefined,
    stripeKey: core.getInput("stripe-key") || undefined,
    githubToken: core.getInput("github-token") || undefined,
  };
}

// =============================================================================
// ENVIRONMENT SETUP
// =============================================================================

function setupEnvironment(inputs: ActionInputs): void {
  if (inputs.vercelToken) {
    process.env.VERCEL_TOKEN = inputs.vercelToken;
  }
  if (inputs.supabaseUrl) {
    process.env.SUPABASE_URL = inputs.supabaseUrl;
  }
  if (inputs.supabaseKey) {
    process.env.SUPABASE_SERVICE_ROLE_KEY = inputs.supabaseKey;
  }
  if (inputs.stripeKey) {
    process.env.STRIPE_SECRET_KEY = inputs.stripeKey;
  }
  if (inputs.deploymentUrl) {
    process.env.DEPLOYMENT_URL = inputs.deploymentUrl;
  }
}

// =============================================================================
// TEST EXECUTION (Uses @conduii/core for real testing)
// =============================================================================

async function runTests(inputs: ActionInputs): Promise<TestSummary> {
  const start = Date.now();

  try {
    // Create Conduii instance with environment config
    const conduii = await createConduii({
      projectDir: inputs.workingDirectory,
      environment: inputs.environment,
      environments: inputs.deploymentUrl
        ? {
            [inputs.environment]: {
              name: inputs.environment,
              url: inputs.deploymentUrl,
              isProduction: inputs.environment === "production",
            },
          }
        : undefined,
    });

    // Initialize (runs discovery)
    await conduii.initialize();

    // Run appropriate tests based on type
    let coreResult;
    switch (inputs.testType) {
      case "health":
        coreResult = await conduii.runHealthChecks();
        break;
      case "integration":
        coreResult = await conduii.runIntegrationTests();
        break;
      case "api":
        coreResult = await conduii.runApiTests();
        break;
      case "e2e":
        coreResult = await conduii.runE2ETests();
        break;
      default:
        coreResult = await conduii.runAll();
    }

    // Map core results to action results
    const results: TestResult[] = coreResult.tests.map((r: { name: string; type?: string; status: string; duration: number; error?: { message: string } }) => ({
      name: r.name,
      type: r.type || "test",
      status: r.status as "passed" | "failed" | "skipped",
      duration: r.duration,
      error: r.error?.message,
    }));

    const passed = results.filter((r) => r.status === "passed").length;
    const failed = results.filter((r) => r.status === "failed").length;
    const skipped = results.filter((r) => r.status === "skipped").length;

    return {
      status: failed === 0 ? "passed" : "failed",
      total: results.length,
      passed,
      failed,
      skipped,
      duration: Date.now() - start,
      results,
    };
  } catch (error) {
    // Return a failed summary if core engine fails to initialize
    return {
      status: "failed",
      total: 1,
      passed: 0,
      failed: 1,
      skipped: 0,
      duration: Date.now() - start,
      results: [{
        name: "Conduii Engine Initialization",
        type: "setup",
        status: "failed",
        duration: Date.now() - start,
        error: error instanceof Error ? error.message : "Unknown error",
      }],
    };
  }
}

// =============================================================================
// RESULT FORMATTING
// =============================================================================

function generateMarkdownSummary(summary: TestSummary): string {
  const statusIcon = summary.status === "passed" ? "✅" : "❌";

  const lines: string[] = [
    `## ${statusIcon} Conduii Test Results`,
    "",
    "### Summary",
    "",
    "| Metric | Value |",
    "|--------|-------|",
    `| Status | ${summary.status === "passed" ? "✅ Passed" : "❌ Failed"} |`,
    `| Duration | ${(summary.duration / 1000).toFixed(2)}s |`,
    `| Total Tests | ${summary.total} |`,
    `| Passed | ${summary.passed} |`,
    `| Failed | ${summary.failed} |`,
    `| Skipped | ${summary.skipped} |`,
    "",
    "### Test Results",
    "",
    "| Test | Type | Status | Duration |",
    "|------|------|--------|----------|",
  ];

  for (const result of summary.results) {
    const icon =
      result.status === "passed"
        ? "✅"
        : result.status === "failed"
        ? "❌"
        : "⏭️";
    lines.push(
      `| ${result.name} | ${result.type} | ${icon} ${result.status} | ${(result.duration / 1000).toFixed(2)}s |`
    );
  }

  // Add failures section
  const failures = summary.results.filter((r) => r.status === "failed");
  if (failures.length > 0) {
    lines.push("");
    lines.push("### Failures");
    lines.push("");
    for (const failure of failures) {
      lines.push(`#### ❌ ${failure.name}`);
      if (failure.error) {
        lines.push("```");
        lines.push(failure.error);
        lines.push("```");
      }
      lines.push("");
    }
  }

  lines.push("");
  lines.push("---");
  lines.push(
    `*Generated by [Conduii](https://conduii.com) at ${new Date().toISOString()}*`
  );

  return lines.join("\n");
}

// =============================================================================
// MAIN ACTION
// =============================================================================

async function run(): Promise<void> {
  try {
    const inputs = getInputs();

    core.info("🚀 Starting Conduii...");
    core.info(`Test type: ${inputs.testType}`);
    core.info(`Environment: ${inputs.environment}`);
    core.info(`Working directory: ${inputs.workingDirectory}`);

    // Setup environment
    setupEnvironment(inputs);

    // Run tests
    core.info("Running tests...");
    const summary = await runTests(inputs);

    // Set outputs
    core.setOutput("status", summary.status);
    core.setOutput("total", summary.total.toString());
    core.setOutput("passed", summary.passed.toString());
    core.setOutput("failed", summary.failed.toString());
    core.setOutput("duration", summary.duration.toString());
    core.setOutput("summary", JSON.stringify(summary));

    // Generate markdown summary
    const markdown = generateMarkdownSummary(summary);
    await core.summary.addRaw(markdown).write();

    // Log results
    core.info("");
    core.info("=".repeat(60));
    core.info(`Status: ${summary.status === "passed" ? "✅ PASSED" : "❌ FAILED"}`);
    core.info(`Duration: ${(summary.duration / 1000).toFixed(2)}s`);
    core.info(
      `Total: ${summary.total} | Passed: ${summary.passed} | Failed: ${summary.failed}`
    );
    core.info("=".repeat(60));

    // Print individual results
    for (const result of summary.results) {
      const icon =
        result.status === "passed"
          ? "✅"
          : result.status === "failed"
          ? "❌"
          : "⚠️";
      core.info(
        `  ${icon} ${result.name} (${(result.duration / 1000).toFixed(2)}s)`
      );
    }

    // Comment on PR if available
    if (
      github.context.eventName === "pull_request" &&
      inputs.githubToken
    ) {
      try {
        const octokit = github.getOctokit(inputs.githubToken);
        const { owner, repo } = github.context.repo;
        const prNumber = github.context.payload.pull_request?.number;

        if (prNumber) {
          await octokit.rest.issues.createComment({
            owner,
            repo,
            issue_number: prNumber,
            body: markdown,
          });
          core.info("Posted test results to PR");
        }
      } catch (error) {
        core.warning(
          `Failed to post PR comment: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    // Fail if tests failed and failOnError is true
    if (summary.status !== "passed" && inputs.failOnError) {
      core.setFailed(
        `Tests failed: ${summary.failed} failures out of ${summary.total} tests`
      );
    }
  } catch (error) {
    core.setFailed(
      `Conduii failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

run();

#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import Table from "cli-table3";
import boxen from "boxen";
import * as dotenv from "dotenv";
import { readFileSync, existsSync, writeFileSync, mkdirSync } from "fs";
import { join, resolve } from "path";
import { createConduii, discoverProject as coreDiscoverProject } from "@conduii/core";

// Load environment variables
dotenv.config();

const VERSION = "1.0.0";

// =============================================================================
// TYPES
// =============================================================================

interface ServiceHealth {
  name: string;
  type: string;
  status: "healthy" | "degraded" | "unhealthy" | "unknown";
  latency?: number;
  error?: string;
}

interface TestResult {
  name: string;
  type: string;
  status: "passed" | "failed" | "skipped";
  duration: number;
  error?: string;
}

interface DiscoveryResult {
  framework?: string;
  services: Array<{
    type: string;
    name: string;
    confidence: number;
  }>;
  endpoints: Array<{
    path: string;
    method: string;
  }>;
}

// =============================================================================
// CLI SETUP
// =============================================================================

const program = new Command();

program
  .name("conduii")
  .description("AI-Powered Testing Platform - Test your deployments automatically")
  .version(VERSION);

// =============================================================================
// DISCOVER COMMAND
// =============================================================================

program
  .command("discover")
  .description("Discover services and integrations in your project")
  .option("-d, --dir <path>", "Project directory", ".")
  .option("--json", "Output as JSON")
  .action(async (options) => {
    const spinner = ora("Discovering services...").start();

    try {
      const result = await discoverProject(options.dir);

      spinner.succeed("Discovery complete!");

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
      }

      // Display results
      console.log();
      
      if (result.framework) {
        console.log(chalk.bold("Framework:"), chalk.cyan(result.framework));
        console.log();
      }

      if (result.services.length > 0) {
        console.log(chalk.bold("Detected Services:"));
        const table = new Table({
          head: ["Service", "Type", "Confidence"],
          style: { head: ["cyan"] },
        });
        
        for (const service of result.services) {
          table.push([
            service.name,
            service.type,
            `${Math.round(service.confidence * 100)}%`,
          ]);
        }
        console.log(table.toString());
        console.log();
      }

      if (result.endpoints.length > 0) {
        console.log(chalk.bold(`Discovered Endpoints (${result.endpoints.length}):`));
        for (const endpoint of result.endpoints.slice(0, 10)) {
          console.log(`  ${chalk.green(endpoint.method.padEnd(6))} ${endpoint.path}`);
        }
        if (result.endpoints.length > 10) {
          console.log(`  ... and ${result.endpoints.length - 10} more`);
        }
      }
    } catch (error) {
      spinner.fail("Discovery failed");
      console.error(chalk.red(error instanceof Error ? error.message : "Unknown error"));
      process.exit(1);
    }
  });

// =============================================================================
// HEALTH COMMAND
// =============================================================================

program
  .command("health")
  .description("Check health of all services")
  .option("-d, --dir <path>", "Project directory", ".")
  .option("--json", "Output as JSON")
  .action(async (options) => {
    const spinner = ora("Running health checks...").start();

    try {
      const services = await checkHealth(options.dir);

      spinner.stop();

      if (options.json) {
        console.log(JSON.stringify(services, null, 2));
        return;
      }

      // Calculate overall status
      const healthy = services.filter((s) => s.status === "healthy").length;
      const total = services.length;
      const overallStatus = healthy === total ? "healthy" : healthy === 0 ? "unhealthy" : "degraded";

      // Display results
      const statusIcon = overallStatus === "healthy" ? "✅" : overallStatus === "degraded" ? "⚠️" : "❌";
      
      console.log(
        boxen(
          `${statusIcon} Health Status: ${overallStatus.toUpperCase()}\n\n${healthy}/${total} services healthy`,
          {
            padding: 1,
            borderColor: overallStatus === "healthy" ? "green" : overallStatus === "degraded" ? "yellow" : "red",
            borderStyle: "round",
          }
        )
      );

      console.log();

      const table = new Table({
        head: ["Service", "Type", "Status", "Latency"],
        style: { head: ["cyan"] },
      });

      for (const service of services) {
        const statusIcon = service.status === "healthy" ? "🟢" : service.status === "degraded" ? "🟡" : "🔴";
        table.push([
          service.name,
          service.type,
          `${statusIcon} ${service.status}`,
          service.latency ? `${service.latency}ms` : "-",
        ]);
      }

      console.log(table.toString());
    } catch (error) {
      spinner.fail("Health check failed");
      console.error(chalk.red(error instanceof Error ? error.message : "Unknown error"));
      process.exit(1);
    }
  });

// =============================================================================
// RUN COMMAND
// =============================================================================

program
  .command("run")
  .description("Run tests against your deployment")
  .option("-d, --dir <path>", "Project directory", ".")
  .option("-t, --type <type>", "Test type (all, health, integration, api, e2e)", "all")
  .option("-e, --env <environment>", "Environment name", "default")
  .option("--parallel", "Run tests in parallel", true)
  .option("--json", "Output as JSON")
  .action(async (options) => {
    const spinner = ora(`Running ${options.type} tests...`).start();

    try {
      const results = await runTests(options.dir, options.type, options.env);

      spinner.stop();

      if (options.json) {
        console.log(JSON.stringify(results, null, 2));
        return;
      }

      // Calculate summary
      const passed = results.filter((r) => r.status === "passed").length;
      const failed = results.filter((r) => r.status === "failed").length;
      const skipped = results.filter((r) => r.status === "skipped").length;
      const total = results.length;
      const duration = results.reduce((acc, r) => acc + r.duration, 0);

      const overallStatus = failed === 0 ? "PASSED" : "FAILED";
      const statusIcon = overallStatus === "PASSED" ? "✓" : "✗";

      // Display results
      console.log(
        boxen(
          `${statusIcon} Test Suite: ${overallStatus}\n\nStatus: ${overallStatus}\nDuration: ${(duration / 1000).toFixed(2)}s\nEnvironment: ${options.env}`,
          {
            padding: 1,
            borderColor: overallStatus === "PASSED" ? "green" : "red",
            borderStyle: "round",
          }
        )
      );

      console.log();
      console.log(chalk.bold("Summary:"));
      
      const summaryTable = new Table({
        head: ["Total", "Passed", "Failed", "Skipped"],
        style: { head: ["cyan"] },
      });
      summaryTable.push([
        total.toString(),
        chalk.green(passed.toString()),
        chalk.red(failed.toString()),
        chalk.yellow(skipped.toString()),
      ]);
      console.log(summaryTable.toString());

      console.log();
      console.log(chalk.bold("Test Results:"));

      for (const result of results) {
        const icon = result.status === "passed" ? chalk.green("✓") : result.status === "failed" ? chalk.red("✗") : chalk.yellow("○");
        const duration = `(${(result.duration / 1000).toFixed(2)}s)`;
        console.log(`  ${icon} ${result.name} ${chalk.dim(duration)}`);
        if (result.error) {
          console.log(`    ${chalk.red(result.error)}`);
        }
      }

      // Exit with error code if tests failed
      if (failed > 0) {
        process.exit(1);
      }
    } catch (error) {
      spinner.fail("Test run failed");
      console.error(chalk.red(error instanceof Error ? error.message : "Unknown error"));
      process.exit(1);
    }
  });

// =============================================================================
// INIT COMMAND
// =============================================================================

program
  .command("init")
  .description("Initialize Conduii configuration")
  .option("-d, --dir <path>", "Project directory", ".")
  .action(async (options) => {
    const spinner = ora("Initializing Conduii...").start();

    try {
      const configPath = join(options.dir, "conduii.config.json");

      if (existsSync(configPath)) {
        spinner.warn("Configuration already exists");
        return;
      }

      // Discover project
      const discovery = await discoverProject(options.dir);

      const config = {
        $schema: "https://conduii.com/schema/config.json",
        name: "my-project",
        environments: {
          default: {
            name: "preview",
            url: "",
          },
          production: {
            name: "production",
            url: "",
            isProduction: true,
          },
        },
        adapters: discovery.services.map((s) => ({
          type: s.type,
          name: s.name,
          enabled: true,
        })),
        discovery: {
          enabled: true,
        },
        defaults: {
          timeout: 30000,
          retries: 2,
          parallel: true,
        },
      };

      writeFileSync(configPath, JSON.stringify(config, null, 2));

      spinner.succeed("Configuration created!");
      console.log();
      console.log(`  ${chalk.green("✓")} Created ${chalk.bold("conduii.config.json")}`);
      console.log();
      console.log("Next steps:");
      console.log(`  1. Edit ${chalk.bold("conduii.config.json")} with your deployment URLs`);
      console.log(`  2. Run ${chalk.cyan("conduii discover")} to detect services`);
      console.log(`  3. Run ${chalk.cyan("conduii run")} to execute tests`);
    } catch (error) {
      spinner.fail("Initialization failed");
      console.error(chalk.red(error instanceof Error ? error.message : "Unknown error"));
      process.exit(1);
    }
  });

// =============================================================================
// LOGIN COMMAND
// =============================================================================

program
  .command("login")
  .description("Login to Conduii")
  .action(async () => {
    console.log();
    console.log(chalk.bold("Login to Conduii"));
    console.log();
    console.log("Visit the following URL to login:");
    console.log(chalk.cyan("  https://conduii.com/cli/login"));
    console.log();
    console.log("After logging in, run:");
    console.log(chalk.cyan("  conduii auth <token>"));
  });

// =============================================================================
// GENERATE COMMAND - AI Test Generation
// =============================================================================

program
  .command("generate")
  .description("Generate tests using AI")
  .option("-p, --prompt <prompt>", "Natural language description of tests to generate")
  .option("-t, --type <type>", "Test type (API, E2E, INTEGRATION)", "API")
  .option("-o, --output <path>", "Output file path")
  .option("--openapi <path>", "Generate tests from OpenAPI spec file")
  .option("--json", "Output as JSON")
  .action(async (options) => {
    const spinner = ora("Generating tests with AI...").start();

    try {
      const config = loadConfig();
      if (!config?.token) {
        throw new Error("Not authenticated. Run 'conduii auth <token>' first.");
      }

      const apiUrl = config.apiUrl || "https://conduii.com";
      let requestBody: Record<string, unknown>;

      if (options.openapi) {
        // Generate from OpenAPI spec
        const specPath = resolve(options.openapi);
        if (!existsSync(specPath)) {
          throw new Error(`OpenAPI spec file not found: ${specPath}`);
        }
        const specContent = readFileSync(specPath, "utf-8");
        const spec = JSON.parse(specContent);

        requestBody = {
          type: "openapi",
          projectId: await getProjectId(config),
          spec,
        };
      } else if (options.prompt) {
        // Generate from natural language prompt
        requestBody = {
          type: "prompt",
          projectId: await getProjectId(config),
          prompt: options.prompt,
          testType: options.type,
        };
      } else {
        throw new Error("Either --prompt or --openapi is required");
      }

      const response = await fetch(`${apiUrl}/api/ai/generate-tests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${config.token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `API error: ${response.statusText}`);
      }

      const { tests } = await response.json();
      spinner.succeed(`Generated ${tests.length} test(s)!`);

      if (options.json) {
        console.log(JSON.stringify(tests, null, 2));
        return;
      }

      // Display generated tests
      console.log();
      for (const test of tests) {
        console.log(chalk.bold(`📝 ${test.name}`));
        console.log(chalk.dim(`   Type: ${test.type}`));
        console.log(chalk.dim(`   Description: ${test.description}`));
        console.log();
        console.log(chalk.cyan("   Code:"));
        console.log(test.code.split("\n").map((line: string) => `   ${line}`).join("\n"));
        console.log();
      }

      // Write to file if output specified
      if (options.output) {
        const outputPath = resolve(options.output);
        const outputContent = tests.map((t: { code: string }) => t.code).join("\n\n");
        writeFileSync(outputPath, outputContent);
        console.log(chalk.green(`✓ Tests written to ${outputPath}`));
      }
    } catch (error) {
      spinner.fail("Test generation failed");
      console.error(chalk.red(error instanceof Error ? error.message : "Unknown error"));
      process.exit(1);
    }
  });

// =============================================================================
// ASK COMMAND - Natural Language Queries
// =============================================================================

program
  .command("ask <query>")
  .alias("chat")
  .description("Ask questions about your tests in natural language")
  .option("--json", "Output as JSON")
  .action(async (query, options) => {
    const spinner = ora("Processing query...").start();

    try {
      const config = loadConfig();
      if (!config?.token) {
        throw new Error("Not authenticated. Run 'conduii auth <token>' first.");
      }

      const apiUrl = config.apiUrl || "https://conduii.com";

      const response = await fetch(`${apiUrl}/api/ai/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${config.token}`,
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `API error: ${response.statusText}`);
      }

      const { result } = await response.json();
      spinner.stop();

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
      }

      console.log();
      console.log(boxen(result.answer, {
        padding: 1,
        borderColor: result.type === "ERROR" ? "red" : "cyan",
        borderStyle: "round",
        title: "Answer",
        titleAlignment: "center",
      }));

      if (result.data) {
        console.log();
        console.log(chalk.bold("Data:"));
        console.log(JSON.stringify(result.data, null, 2));
      }

      if (result.suggestedActions && result.suggestedActions.length > 0) {
        console.log();
        console.log(chalk.bold("Suggested Actions:"));
        for (const action of result.suggestedActions) {
          console.log(`  • ${action.label}`);
        }
      }

      if (result.relatedQueries && result.relatedQueries.length > 0) {
        console.log();
        console.log(chalk.dim("Related queries:"));
        for (const q of result.relatedQueries) {
          console.log(chalk.dim(`  - "${q}"`));
        }
      }
    } catch (error) {
      spinner.fail("Query failed");
      console.error(chalk.red(error instanceof Error ? error.message : "Unknown error"));
      process.exit(1);
    }
  });

// =============================================================================
// ANALYZE COMMAND - AI Failure Analysis
// =============================================================================

program
  .command("analyze")
  .description("Analyze test failures with AI")
  .option("-r, --run <runId>", "Test run ID to analyze")
  .option("--patterns", "Detect failure patterns across project")
  .option("--flaky", "Detect flaky tests")
  .option("--json", "Output as JSON")
  .action(async (options) => {
    const spinner = ora("Analyzing...").start();

    try {
      const config = loadConfig();
      if (!config?.token) {
        throw new Error("Not authenticated. Run 'conduii auth <token>' first.");
      }

      const apiUrl = config.apiUrl || "https://conduii.com";
      const projectId = await getProjectId(config);

      if (options.flaky) {
        // Flaky test detection
        const response = await fetch(`${apiUrl}/api/ai/flaky-tests`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${config.token}`,
          },
          body: JSON.stringify({
            action: "analyze",
            projectId,
          }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.error || `API error: ${response.statusText}`);
        }

        const { analysis } = await response.json();
        spinner.succeed("Flaky test analysis complete!");

        if (options.json) {
          console.log(JSON.stringify(analysis, null, 2));
          return;
        }

        console.log();
        console.log(chalk.bold("Flaky Test Analysis"));
        console.log();
        console.log(`Total tests analyzed: ${analysis.totalTests}`);
        console.log(`Flaky tests found: ${chalk.yellow(analysis.flakyTests.length)}`);

        if (analysis.flakyTests.length > 0) {
          console.log();
          const table = new Table({
            head: ["Test", "Flakiness", "Pass Rate", "Runs"],
            style: { head: ["cyan"] },
          });

          for (const test of analysis.flakyTests) {
            table.push([
              test.testName,
              `${test.flakinessScore}%`,
              `${test.passRate}%`,
              test.totalRuns.toString(),
            ]);
          }
          console.log(table.toString());
        }
      } else if (options.patterns) {
        // Failure pattern detection
        const response = await fetch(`${apiUrl}/api/ai/analyze-failure`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${config.token}`,
          },
          body: JSON.stringify({
            type: "patterns",
            projectId,
          }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.error || `API error: ${response.statusText}`);
        }

        const { patterns } = await response.json();
        spinner.succeed("Pattern analysis complete!");

        if (options.json) {
          console.log(JSON.stringify(patterns, null, 2));
          return;
        }

        console.log();
        if (patterns.length === 0) {
          console.log(chalk.green("No failure patterns detected. Great job!"));
        } else {
          console.log(chalk.bold(`Found ${patterns.length} failure pattern(s):`));
          console.log();

          for (const pattern of patterns) {
            console.log(boxen(
              `${chalk.bold(pattern.category)}\n\n` +
              `Occurrences: ${pattern.occurrences}\n` +
              `Affected tests: ${pattern.affectedTests.length}\n\n` +
              `${pattern.description}`,
              {
                padding: 1,
                borderColor: pattern.severity === "high" ? "red" : "yellow",
                borderStyle: "round",
              }
            ));
            console.log();
          }
        }
      } else if (options.run) {
        // Analyze specific run
        const response = await fetch(`${apiUrl}/api/ai/analyze-failure`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${config.token}`,
          },
          body: JSON.stringify({
            type: "analyze",
            testRunId: options.run,
            testResultId: options.run, // Will be enhanced
          }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.error || `API error: ${response.statusText}`);
        }

        const { analysis } = await response.json();
        spinner.succeed("Analysis complete!");

        if (options.json) {
          console.log(JSON.stringify(analysis, null, 2));
          return;
        }

        console.log();
        console.log(chalk.bold("Root Cause Analysis"));
        console.log();
        console.log(analysis.rootCause);

        if (analysis.suggestedFixes && analysis.suggestedFixes.length > 0) {
          console.log();
          console.log(chalk.bold("Suggested Fixes:"));
          for (const fix of analysis.suggestedFixes) {
            console.log(`  ${fix.priority === "high" ? "🔴" : "🟡"} ${fix.description}`);
            if (fix.code) {
              console.log(chalk.cyan(fix.code.split("\n").map((l: string) => `     ${l}`).join("\n")));
            }
          }
        }
      } else {
        throw new Error("Specify --run <runId>, --patterns, or --flaky");
      }
    } catch (error) {
      spinner.fail("Analysis failed");
      console.error(chalk.red(error instanceof Error ? error.message : "Unknown error"));
      process.exit(1);
    }
  });

// =============================================================================
// IMPACT COMMAND - Code Change Impact Analysis
// =============================================================================

program
  .command("impact")
  .description("Analyze impact of code changes on tests")
  .option("--diff <diff>", "Git diff to analyze")
  .option("--risk", "Calculate deployment risk score")
  .option("--json", "Output as JSON")
  .action(async (options) => {
    const spinner = ora("Analyzing impact...").start();

    try {
      const config = loadConfig();
      if (!config?.token) {
        throw new Error("Not authenticated. Run 'conduii auth <token>' first.");
      }

      const apiUrl = config.apiUrl || "https://conduii.com";
      const projectId = await getProjectId(config);

      // Get git diff if not provided
      let diff = options.diff;
      if (!diff) {
        try {
          const { execSync } = require("child_process");
          diff = execSync("git diff HEAD~1", { encoding: "utf-8" });
        } catch {
          throw new Error("Could not get git diff. Provide --diff manually.");
        }
      }

      // Parse diff to get changed files
      const changedFiles = diff.split("\n")
        .filter((line: string) => line.startsWith("diff --git"))
        .map((line: string) => {
          const match = line.match(/b\/(.+)$/);
          return match ? match[1] : "";
        })
        .filter(Boolean);

      const changes = changedFiles.map((file: string) => ({
        file,
        additions: 0,
        deletions: 0,
        diff: "",
      }));

      const action = options.risk ? "risk" : "analyze";

      const response = await fetch(`${apiUrl}/api/ai/impact-analysis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${config.token}`,
        },
        body: JSON.stringify({
          action,
          projectId,
          changes,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `API error: ${response.statusText}`);
      }

      const result = await response.json();
      spinner.succeed("Impact analysis complete!");

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
      }

      if (options.risk) {
        const risk = result.risk;
        const riskColor = risk.level === "HIGH" ? "red" : risk.level === "MEDIUM" ? "yellow" : "green";

        console.log();
        console.log(boxen(
          `Risk Level: ${chalk[riskColor].bold(risk.level)}\n` +
          `Score: ${risk.score}%\n\n` +
          `${risk.summary}`,
          {
            padding: 1,
            borderColor: riskColor,
            borderStyle: "round",
            title: "Deployment Risk",
            titleAlignment: "center",
          }
        ));

        if (risk.recommendations && risk.recommendations.length > 0) {
          console.log();
          console.log(chalk.bold("Recommendations:"));
          for (const rec of risk.recommendations) {
            console.log(`  • ${rec}`);
          }
        }
      } else {
        const impact = result.impact;

        console.log();
        console.log(chalk.bold("Impact Analysis"));
        console.log();
        console.log(`Changed files: ${impact.changedFiles}`);
        console.log(`Affected tests: ${impact.affectedTests.length}`);
        console.log(`Suggested to run: ${impact.suggestedTests.length} tests`);

        if (impact.affectedTests.length > 0) {
          console.log();
          console.log(chalk.bold("Affected Tests:"));
          const table = new Table({
            head: ["Test", "Impact", "Priority"],
            style: { head: ["cyan"] },
          });

          for (const test of impact.affectedTests.slice(0, 10)) {
            table.push([
              test.testName,
              test.impactLevel,
              test.priority,
            ]);
          }
          console.log(table.toString());
        }
      }
    } catch (error) {
      spinner.fail("Impact analysis failed");
      console.error(chalk.red(error instanceof Error ? error.message : "Unknown error"));
      process.exit(1);
    }
  });

// =============================================================================
// METRICS COMMAND - Analytics Dashboard
// =============================================================================

program
  .command("metrics")
  .description("View test metrics and analytics")
  .option("-d, --days <days>", "Time range in days", "7")
  .option("--json", "Output as JSON")
  .action(async (options) => {
    const spinner = ora("Fetching metrics...").start();

    try {
      const config = loadConfig();
      if (!config?.token) {
        throw new Error("Not authenticated. Run 'conduii auth <token>' first.");
      }

      const apiUrl = config.apiUrl || "https://conduii.com";

      const response = await fetch(`${apiUrl}/api/analytics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${config.token}`,
        },
        body: JSON.stringify({
          type: "dashboard",
          timeRangeDays: parseInt(options.days),
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `API error: ${response.statusText}`);
      }

      const { metrics } = await response.json();
      spinner.succeed("Metrics loaded!");

      if (options.json) {
        console.log(JSON.stringify(metrics, null, 2));
        return;
      }

      console.log();
      console.log(boxen(
        `📊 Dashboard Metrics (Last ${options.days} days)\n\n` +
        `Pass Rate: ${chalk.bold(metrics.passRate + "%")}\n` +
        `Total Runs: ${metrics.totalRuns}\n` +
        `Tests Executed: ${metrics.totalTests}\n` +
        `Avg Duration: ${(metrics.avgDuration / 1000).toFixed(1)}s`,
        {
          padding: 1,
          borderColor: metrics.passRate >= 90 ? "green" : metrics.passRate >= 70 ? "yellow" : "red",
          borderStyle: "round",
        }
      ));

      if (metrics.topFailingTests && metrics.topFailingTests.length > 0) {
        console.log();
        console.log(chalk.bold("Top Failing Tests:"));
        const table = new Table({
          head: ["Test", "Failures", "Pass Rate"],
          style: { head: ["cyan"] },
        });

        for (const test of metrics.topFailingTests) {
          table.push([
            test.name,
            test.failures.toString(),
            `${test.passRate}%`,
          ]);
        }
        console.log(table.toString());
      }

      if (metrics.trend) {
        console.log();
        console.log(chalk.bold("Trend:"),
          metrics.trend === "improving" ? chalk.green("📈 Improving") :
          metrics.trend === "declining" ? chalk.red("📉 Declining") :
          chalk.yellow("➡️ Stable")
        );
      }
    } catch (error) {
      spinner.fail("Failed to fetch metrics");
      console.error(chalk.red(error instanceof Error ? error.message : "Unknown error"));
      process.exit(1);
    }
  });

// =============================================================================
// AUTH COMMAND
// =============================================================================

program
  .command("auth <token>")
  .description("Authenticate with API token")
  .action(async (token) => {
    const spinner = ora("Authenticating...").start();

    try {
      // Validate token format
      if (!token || token.length < 32) {
        throw new Error("Invalid token format. Token must be at least 32 characters.");
      }

      // Validate token with API
      const apiUrl = process.env.CONDUII_API_URL || "https://conduii.com";
      try {
        const response = await fetch(`${apiUrl}/api/cli/validate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Invalid or expired token. Please generate a new token from the dashboard.");
          }
          throw new Error(`Token validation failed: ${response.statusText}`);
        }
      } catch (fetchError) {
        // If API is unreachable, store token locally but warn user
        if (fetchError instanceof TypeError && fetchError.message.includes("fetch")) {
          spinner.warn("Could not reach API for validation. Token stored locally.");
        } else {
          throw fetchError;
        }
      }

      // Ensure config directory exists
      const configDir = join(process.env.HOME || process.env.USERPROFILE || "~", ".conduii");
      if (!existsSync(configDir)) {
        mkdirSync(configDir, { recursive: true });
      }

      const configPath = join(configDir, "config.json");

      // Store token with metadata
      const config = {
        token,
        createdAt: new Date().toISOString(),
        apiUrl: process.env.CONDUII_API_URL || "https://conduii.com",
      };
      writeFileSync(configPath, JSON.stringify(config, null, 2));

      spinner.succeed("Authentication successful!");
      console.log();
      console.log("You can now use Conduii commands with your account.");
      console.log();
      console.log(`Configuration saved to ${chalk.dim(configPath)}`);
    } catch (error) {
      spinner.fail("Authentication failed");
      console.error(chalk.red(error instanceof Error ? error.message : "Unknown error"));
      process.exit(1);
    }
  });

// =============================================================================
// HELPER FUNCTIONS (Using @conduii/core for real implementation)
// =============================================================================

async function discoverProject(dir: string): Promise<DiscoveryResult> {
  const absolutePath = resolve(dir);

  // Use the real @conduii/core discovery engine
  const discovery = await coreDiscoverProject(absolutePath);

  return {
    framework: discovery.framework,
    services: discovery.services.map((s) => ({
      type: s.type,
      name: s.name,
      confidence: s.confidence,
    })),
    endpoints: discovery.endpoints.map((e) => ({
      path: e.path,
      method: e.method,
    })),
  };
}

async function checkHealth(dir: string): Promise<ServiceHealth[]> {
  const absolutePath = resolve(dir);

  // Create Conduii instance and use real health checks
  const conduii = await createConduii({
    projectDir: absolutePath,
  });

  // Initialize (runs discovery)
  await conduii.initialize();

  // Run health checks
  const healthResult = await conduii.healthCheck();

  return healthResult.services.map((s: { name: string; type: string; status: string; latency?: number; error?: string }) => ({
    name: s.name,
    type: s.type,
    status: s.status as "healthy" | "degraded" | "unhealthy" | "unknown",
    latency: s.latency,
    error: s.error,
  }));
}

async function runTests(dir: string, type: string, _env: string): Promise<TestResult[]> {
  const absolutePath = resolve(dir);

  // Create Conduii instance
  const conduii = await createConduii({
    projectDir: absolutePath,
  });

  // Initialize
  await conduii.initialize();

  // Run appropriate tests based on type
  let result;
  switch (type) {
    case "health":
      result = await conduii.runHealthChecks();
      break;
    case "integration":
      result = await conduii.runIntegrationTests();
      break;
    case "api":
      result = await conduii.runApiTests();
      break;
    case "e2e":
      result = await conduii.runE2ETests();
      break;
    default:
      result = await conduii.runAll();
  }

  return result.tests.map((r) => ({
    name: r.name,
    type: r.type || "test",
    status: r.status as "passed" | "failed" | "skipped",
    duration: r.duration,
    error: r.error?.message,
  }));
}

interface CLIConfig {
  token: string;
  apiUrl: string;
  projectId?: string;
  createdAt?: string;
}

function loadConfig(): CLIConfig | null {
  const configDir = join(process.env.HOME || process.env.USERPROFILE || "~", ".conduii");
  const configPath = join(configDir, "config.json");

  if (!existsSync(configPath)) {
    return null;
  }

  try {
    const content = readFileSync(configPath, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function getProjectId(config: CLIConfig): Promise<string> {
  // Check local conduii.config.json first
  const localConfigPath = join(process.cwd(), "conduii.config.json");
  if (existsSync(localConfigPath)) {
    try {
      const content = readFileSync(localConfigPath, "utf-8");
      const localConfig = JSON.parse(content);
      if (localConfig.projectId) {
        return localConfig.projectId;
      }
    } catch {
      // Ignore parse errors
    }
  }

  // Check stored project ID
  if (config.projectId) {
    return config.projectId;
  }

  // Fetch from API
  const apiUrl = config.apiUrl || "https://conduii.com";
  const response = await fetch(`${apiUrl}/api/projects`, {
    headers: {
      "Authorization": `Bearer ${config.token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch projects. Run 'conduii init' in a project directory.");
  }

  const { projects } = await response.json();
  if (!projects || projects.length === 0) {
    throw new Error("No projects found. Create a project in the Conduii dashboard first.");
  }

  // Return first project (could enhance with selection)
  return projects[0].id;
}

// =============================================================================
// MAIN
// =============================================================================

console.log();
console.log(chalk.bold.cyan("  Conduii") + chalk.dim(` v${VERSION}`));
console.log(chalk.dim("  AI-Powered Testing Platform"));
console.log();

program.parse();

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
  const conduii = createConduii({
    projectDir: absolutePath,
  });

  // Initialize (runs discovery)
  await conduii.initialize();

  // Run health checks
  const healthResult = await conduii.healthCheck();

  return healthResult.services.map((s) => ({
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
  const conduii = createConduii({
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

  return result.results.map((r) => ({
    name: r.name,
    type: r.type || "test",
    status: r.status as "passed" | "failed" | "skipped",
    duration: r.duration,
    error: r.error,
  }));
}

// =============================================================================
// MAIN
// =============================================================================

console.log();
console.log(chalk.bold.cyan("  Conduii") + chalk.dim(` v${VERSION}`));
console.log(chalk.dim("  AI-Powered Testing Platform"));
console.log();

program.parse();

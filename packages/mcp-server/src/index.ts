#!/usr/bin/env node
/**
 * Conduii MCP Server
 *
 * Exposes Conduii testing operations as MCP tools for Claude.
 *
 * Available tools:
 * - conduii_list_projects: List all projects
 * - conduii_create_project: Create a new project
 * - conduii_discover: Run service discovery
 * - conduii_run_tests: Run tests against a deployment
 * - conduii_get_results: Get test run results
 * - conduii_get_diagnostics: Get diagnostics for a test run
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
// zod import available for future input validation enhancements

// =============================================================================
// TOOL DEFINITIONS
// =============================================================================

const TOOLS: Tool[] = [
  {
    name: "conduii_list_projects",
    description: "List all Conduii projects accessible to the current user",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of projects to return (default: 20)",
        },
      },
    },
  },
  {
    name: "conduii_create_project",
    description: "Create a new Conduii project for testing",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Name of the project",
        },
        description: {
          type: "string",
          description: "Description of the project",
        },
        productionUrl: {
          type: "string",
          description: "Production URL to test",
        },
        repositoryUrl: {
          type: "string",
          description: "Git repository URL",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "conduii_discover",
    description: "Discover services and integrations for a project or URL",
    inputSchema: {
      type: "object",
      properties: {
        projectId: {
          type: "string",
          description: "Project ID to run discovery for",
        },
        url: {
          type: "string",
          description: "URL to discover services from (alternative to projectId)",
        },
      },
    },
  },
  {
    name: "conduii_run_tests",
    description: "Run tests against a deployment or project",
    inputSchema: {
      type: "object",
      properties: {
        projectId: {
          type: "string",
          description: "Project ID to run tests for",
        },
        deploymentUrl: {
          type: "string",
          description: "Deployment URL to test (alternative to projectId)",
        },
        testType: {
          type: "string",
          enum: ["all", "health", "integration", "api", "e2e"],
          description: "Type of tests to run (default: all)",
        },
      },
    },
  },
  {
    name: "conduii_get_results",
    description: "Get results from a test run",
    inputSchema: {
      type: "object",
      properties: {
        testRunId: {
          type: "string",
          description: "Test run ID to get results for",
        },
        projectId: {
          type: "string",
          description: "Project ID to get latest results for",
        },
      },
    },
  },
  {
    name: "conduii_get_diagnostics",
    description: "Get diagnostics and remediation suggestions for test failures",
    inputSchema: {
      type: "object",
      properties: {
        testRunId: {
          type: "string",
          description: "Test run ID to get diagnostics for",
        },
      },
      required: ["testRunId"],
    },
  },
];

// =============================================================================
// TOOL HANDLERS
// =============================================================================

interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

async function handleListProjects(args: { limit?: number }): Promise<ToolResult> {
  const apiKey = process.env.CONDUII_API_KEY;
  const apiUrl = process.env.CONDUII_API_URL || "https://conduii.com";

  if (!apiKey) {
    return {
      success: false,
      error: "CONDUII_API_KEY environment variable is required",
    };
  }

  try {
    const response = await fetch(`${apiUrl}/api/projects?limit=${args.limit || 20}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: `API error: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function handleCreateProject(args: {
  name: string;
  description?: string;
  productionUrl?: string;
  repositoryUrl?: string;
}): Promise<ToolResult> {
  const apiKey = process.env.CONDUII_API_KEY;
  const apiUrl = process.env.CONDUII_API_URL || "https://conduii.com";

  if (!apiKey) {
    return {
      success: false,
      error: "CONDUII_API_KEY environment variable is required",
    };
  }

  try {
    const response = await fetch(`${apiUrl}/api/projects`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: `API error: ${response.status} - ${JSON.stringify(errorData)}`,
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function handleDiscover(args: {
  projectId?: string;
  url?: string;
}): Promise<ToolResult> {
  const apiKey = process.env.CONDUII_API_KEY;
  const apiUrl = process.env.CONDUII_API_URL || "https://conduii.com";

  if (!apiKey) {
    return {
      success: false,
      error: "CONDUII_API_KEY environment variable is required",
    };
  }

  if (!args.projectId && !args.url) {
    return {
      success: false,
      error: "Either projectId or url is required",
    };
  }

  try {
    const endpoint = args.projectId
      ? `${apiUrl}/api/projects/${args.projectId}/discover`
      : `${apiUrl}/api/discover`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: args.url ? JSON.stringify({ url: args.url }) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: `API error: ${response.status} - ${JSON.stringify(errorData)}`,
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function handleRunTests(args: {
  projectId?: string;
  deploymentUrl?: string;
  testType?: string;
}): Promise<ToolResult> {
  const apiKey = process.env.CONDUII_API_KEY;
  const apiUrl = process.env.CONDUII_API_URL || "https://conduii.com";

  if (!apiKey) {
    return {
      success: false,
      error: "CONDUII_API_KEY environment variable is required",
    };
  }

  if (!args.projectId && !args.deploymentUrl) {
    return {
      success: false,
      error: "Either projectId or deploymentUrl is required",
    };
  }

  try {
    const response = await fetch(`${apiUrl}/api/test-runs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        projectId: args.projectId,
        deploymentUrl: args.deploymentUrl,
        testType: args.testType || "all",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: `API error: ${response.status} - ${JSON.stringify(errorData)}`,
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function handleGetResults(args: {
  testRunId?: string;
  projectId?: string;
}): Promise<ToolResult> {
  const apiKey = process.env.CONDUII_API_KEY;
  const apiUrl = process.env.CONDUII_API_URL || "https://conduii.com";

  if (!apiKey) {
    return {
      success: false,
      error: "CONDUII_API_KEY environment variable is required",
    };
  }

  if (!args.testRunId && !args.projectId) {
    return {
      success: false,
      error: "Either testRunId or projectId is required",
    };
  }

  try {
    const endpoint = args.testRunId
      ? `${apiUrl}/api/test-runs/${args.testRunId}`
      : `${apiUrl}/api/test-runs?projectId=${args.projectId}&limit=1`;

    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: `API error: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function handleGetDiagnostics(args: {
  testRunId: string;
}): Promise<ToolResult> {
  const apiKey = process.env.CONDUII_API_KEY;
  const apiUrl = process.env.CONDUII_API_URL || "https://conduii.com";

  if (!apiKey) {
    return {
      success: false,
      error: "CONDUII_API_KEY environment variable is required",
    };
  }

  try {
    const response = await fetch(
      `${apiUrl}/api/test-runs/${args.testRunId}/diagnostics`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      return {
        success: false,
        error: `API error: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// =============================================================================
// SERVER SETUP
// =============================================================================

const server = new Server(
  {
    name: "conduii-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  let result: ToolResult;

  switch (name) {
    case "conduii_list_projects":
      result = await handleListProjects(args as { limit?: number });
      break;
    case "conduii_create_project":
      result = await handleCreateProject(
        args as {
          name: string;
          description?: string;
          productionUrl?: string;
          repositoryUrl?: string;
        }
      );
      break;
    case "conduii_discover":
      result = await handleDiscover(args as { projectId?: string; url?: string });
      break;
    case "conduii_run_tests":
      result = await handleRunTests(
        args as {
          projectId?: string;
          deploymentUrl?: string;
          testType?: string;
        }
      );
      break;
    case "conduii_get_results":
      result = await handleGetResults(
        args as { testRunId?: string; projectId?: string }
      );
      break;
    case "conduii_get_diagnostics":
      result = await handleGetDiagnostics(args as { testRunId: string });
      break;
    default:
      result = { success: false, error: `Unknown tool: ${name}` };
  }

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(result, null, 2),
      },
    ],
    isError: !result.success,
  };
});

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Conduii MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});

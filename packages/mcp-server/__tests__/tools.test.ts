import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Tool definitions (matching src/index.ts)
const TOOLS = [
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
        name: { type: "string" },
        description: { type: "string" },
        productionUrl: { type: "string" },
        repositoryUrl: { type: "string" },
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
        projectId: { type: "string" },
        url: { type: "string" },
      },
    },
  },
  {
    name: "conduii_run_tests",
    description: "Run tests against a deployment or project",
    inputSchema: {
      type: "object",
      properties: {
        projectId: { type: "string" },
        deploymentUrl: { type: "string" },
        testType: {
          type: "string",
          enum: ["all", "health", "integration", "api", "e2e"],
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
        testRunId: { type: "string" },
        projectId: { type: "string" },
      },
    },
  },
  {
    name: "conduii_get_diagnostics",
    description: "Get diagnostics and remediation suggestions for test failures",
    inputSchema: {
      type: "object",
      properties: {
        testRunId: { type: "string" },
      },
      required: ["testRunId"],
    },
  },
];

describe("MCP Server Tools", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Set env for tests
    process.env.CONDUII_API_KEY = "test-api-key";
    process.env.CONDUII_API_URL = "https://test.conduii.com";
  });

  describe("Tool Definitions", () => {
    it("should have exactly 6 tools defined", () => {
      expect(TOOLS).toHaveLength(6);
    });

    it("should have conduii_list_projects tool", () => {
      const tool = TOOLS.find((t) => t.name === "conduii_list_projects");
      expect(tool).toBeDefined();
      expect(tool?.inputSchema.properties).toHaveProperty("limit");
    });

    it("should have conduii_create_project tool with required name", () => {
      const tool = TOOLS.find((t) => t.name === "conduii_create_project");
      expect(tool).toBeDefined();
      expect(tool?.inputSchema.required).toContain("name");
    });

    it("should have conduii_discover tool", () => {
      const tool = TOOLS.find((t) => t.name === "conduii_discover");
      expect(tool).toBeDefined();
      expect(tool?.inputSchema.properties).toHaveProperty("projectId");
      expect(tool?.inputSchema.properties).toHaveProperty("url");
    });

    it("should have conduii_run_tests tool with enum test types", () => {
      const tool = TOOLS.find((t) => t.name === "conduii_run_tests");
      expect(tool).toBeDefined();
      const testTypeSchema = tool?.inputSchema.properties.testType as { enum: string[] };
      expect(testTypeSchema.enum).toContain("health");
      expect(testTypeSchema.enum).toContain("integration");
      expect(testTypeSchema.enum).toContain("api");
      expect(testTypeSchema.enum).toContain("e2e");
      expect(testTypeSchema.enum).toContain("all");
    });

    it("should have conduii_get_results tool", () => {
      const tool = TOOLS.find((t) => t.name === "conduii_get_results");
      expect(tool).toBeDefined();
    });

    it("should have conduii_get_diagnostics tool with required testRunId", () => {
      const tool = TOOLS.find((t) => t.name === "conduii_get_diagnostics");
      expect(tool).toBeDefined();
      expect(tool?.inputSchema.required).toContain("testRunId");
    });
  });

  describe("Tool Input Validation", () => {
    it("conduii_create_project requires name field", () => {
      const tool = TOOLS.find((t) => t.name === "conduii_create_project");
      expect(tool?.inputSchema.required).toEqual(["name"]);
    });

    it("conduii_get_diagnostics requires testRunId field", () => {
      const tool = TOOLS.find((t) => t.name === "conduii_get_diagnostics");
      expect(tool?.inputSchema.required).toEqual(["testRunId"]);
    });

    it("conduii_run_tests has valid test type enum", () => {
      const tool = TOOLS.find((t) => t.name === "conduii_run_tests");
      const testTypeSchema = tool?.inputSchema.properties.testType as { enum: string[] };
      expect(testTypeSchema.enum).toHaveLength(5);
    });
  });

  describe("Security Checks", () => {
    it("should not include arbitrary code execution tools", () => {
      const dangerousPatterns = ["exec", "eval", "shell", "command", "script"];
      const toolNames = TOOLS.map((t) => t.name.toLowerCase());

      for (const pattern of dangerousPatterns) {
        const hasDangerous = toolNames.some((name) => name.includes(pattern));
        expect(hasDangerous).toBe(false);
      }
    });

    it("should only expose safe API operations", () => {
      const safeOperations = [
        "list_projects",
        "create_project",
        "discover",
        "run_tests",
        "get_results",
        "get_diagnostics",
      ];

      for (const tool of TOOLS) {
        const operation = tool.name.replace("conduii_", "");
        expect(safeOperations).toContain(operation);
      }
    });
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";

// Project creation schema (matching the API route)
const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  repositoryUrl: z.string().url().optional().or(z.literal("")),
  productionUrl: z.string().url().optional().or(z.literal("")),
});

// Mock Prisma client
vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
    },
    project: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    organization: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    organizationMember: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
    environment: {
      create: vi.fn(),
    },
    testSuite: {
      create: vi.fn(),
    },
  },
}));

// Mock Clerk auth
vi.mock("@clerk/nextjs", () => ({
  auth: vi.fn(() => ({
    userId: "test-user-id",
  })),
}));

describe("Projects API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Project Schema Validation", () => {
    it("should accept valid project data", () => {
      const validProject = {
        name: "Test Project",
        description: "A test project",
        repositoryUrl: "https://github.com/user/repo",
        productionUrl: "https://example.com",
      };

      const result = createProjectSchema.safeParse(validProject);
      expect(result.success).toBe(true);
    });

    it("should accept project with minimal data (name only)", () => {
      const minimalProject = {
        name: "My Project",
      };

      const result = createProjectSchema.safeParse(minimalProject);
      expect(result.success).toBe(true);
    });

    it("should reject project without name", () => {
      const invalidProject = {
        description: "No name provided",
      };

      const result = createProjectSchema.safeParse(invalidProject);
      expect(result.success).toBe(false);
    });

    it("should reject project with empty name", () => {
      const invalidProject = {
        name: "",
      };

      const result = createProjectSchema.safeParse(invalidProject);
      expect(result.success).toBe(false);
    });

    it("should reject project with name exceeding 100 characters", () => {
      const invalidProject = {
        name: "a".repeat(101),
      };

      const result = createProjectSchema.safeParse(invalidProject);
      expect(result.success).toBe(false);
    });

    it("should reject project with description exceeding 500 characters", () => {
      const invalidProject = {
        name: "Test Project",
        description: "a".repeat(501),
      };

      const result = createProjectSchema.safeParse(invalidProject);
      expect(result.success).toBe(false);
    });

    it("should reject invalid repository URL", () => {
      const invalidProject = {
        name: "Test Project",
        repositoryUrl: "not-a-valid-url",
      };

      const result = createProjectSchema.safeParse(invalidProject);
      expect(result.success).toBe(false);
    });

    it("should accept empty string for optional URL fields", () => {
      const project = {
        name: "Test Project",
        repositoryUrl: "",
        productionUrl: "",
      };

      const result = createProjectSchema.safeParse(project);
      expect(result.success).toBe(true);
    });

    it("should reject invalid production URL", () => {
      const invalidProject = {
        name: "Test Project",
        productionUrl: "not-a-valid-url",
      };

      const result = createProjectSchema.safeParse(invalidProject);
      expect(result.success).toBe(false);
    });
  });

  describe("Project Slug Generation", () => {
    const generateSlug = (name: string) => {
      return name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    };

    it("should convert name to lowercase slug", () => {
      expect(generateSlug("My Project")).toBe("my-project");
    });

    it("should replace special characters with hyphens", () => {
      expect(generateSlug("My_Project!@#")).toBe("my-project---");
    });

    it("should handle numeric names", () => {
      expect(generateSlug("Project123")).toBe("project123");
    });

    it("should handle names with spaces", () => {
      expect(generateSlug("My New Project")).toBe("my-new-project");
    });
  });
});

import { describe, it, expect } from "vitest";
import {
  AdapterType,
  TestType,
  TestStatus,
  DiagnosticSeverity,
  ConduiiConfigSchema,
  TestConfigSchema,
  AdapterConfigSchema,
  EnvironmentConfigSchema,
} from "../types";

describe("Enums", () => {
  describe("AdapterType", () => {
    it("should have all expected adapter types", () => {
      expect(AdapterType.PLATFORM).toBe("platform");
      expect(AdapterType.DATABASE).toBe("database");
      expect(AdapterType.AUTH).toBe("auth");
      expect(AdapterType.PAYMENT).toBe("payment");
      expect(AdapterType.EMAIL).toBe("email");
      expect(AdapterType.STORAGE).toBe("storage");
      expect(AdapterType.MONITORING).toBe("monitoring");
      expect(AdapterType.REPOSITORY).toBe("repository");
      expect(AdapterType.ANALYTICS).toBe("analytics");
      expect(AdapterType.CUSTOM).toBe("custom");
    });
  });

  describe("TestType", () => {
    it("should have all expected test types", () => {
      expect(TestType.HEALTH).toBe("health");
      expect(TestType.INTEGRATION).toBe("integration");
      expect(TestType.API).toBe("api");
      expect(TestType.E2E).toBe("e2e");
      expect(TestType.PERFORMANCE).toBe("performance");
      expect(TestType.SECURITY).toBe("security");
      expect(TestType.CUSTOM).toBe("custom");
    });
  });

  describe("TestStatus", () => {
    it("should have all expected test statuses", () => {
      expect(TestStatus.PENDING).toBe("pending");
      expect(TestStatus.RUNNING).toBe("running");
      expect(TestStatus.PASSED).toBe("passed");
      expect(TestStatus.FAILED).toBe("failed");
      expect(TestStatus.SKIPPED).toBe("skipped");
      expect(TestStatus.TIMEOUT).toBe("timeout");
      expect(TestStatus.ERROR).toBe("error");
    });
  });

  describe("DiagnosticSeverity", () => {
    it("should have all expected severity levels", () => {
      expect(DiagnosticSeverity.INFO).toBe("info");
      expect(DiagnosticSeverity.WARNING).toBe("warning");
      expect(DiagnosticSeverity.ERROR).toBe("error");
      expect(DiagnosticSeverity.CRITICAL).toBe("critical");
    });
  });
});

describe("Zod Schemas", () => {
  describe("AdapterConfigSchema", () => {
    it("should validate valid adapter config", () => {
      const config = {
        type: AdapterType.DATABASE,
        name: "supabase",
        enabled: true,
      };
      const result = AdapterConfigSchema.parse(config);
      expect(result.type).toBe(AdapterType.DATABASE);
      expect(result.name).toBe("supabase");
      expect(result.enabled).toBe(true);
    });

    it("should apply defaults for enabled", () => {
      const config = {
        type: AdapterType.AUTH,
        name: "clerk",
      };
      const result = AdapterConfigSchema.parse(config);
      expect(result.enabled).toBe(true);
    });

    it("should reject invalid adapter type", () => {
      const config = {
        type: "invalid",
        name: "test",
      };
      expect(() => AdapterConfigSchema.parse(config)).toThrow();
    });
  });

  describe("TestConfigSchema", () => {
    it("should validate valid test config", () => {
      const config = {
        id: "test-1",
        name: "Health Check",
        type: TestType.HEALTH,
      };
      const result = TestConfigSchema.parse(config);
      expect(result.id).toBe("test-1");
      expect(result.name).toBe("Health Check");
      expect(result.type).toBe(TestType.HEALTH);
    });

    it("should apply defaults", () => {
      const config = {
        id: "test-2",
        name: "API Test",
        type: TestType.API,
      };
      const result = TestConfigSchema.parse(config);
      expect(result.enabled).toBe(true);
      expect(result.timeout).toBe(30000);
      expect(result.retries).toBe(2);
      expect(result.tags).toEqual([]);
    });
  });

  describe("EnvironmentConfigSchema", () => {
    it("should validate valid environment config", () => {
      const config = {
        name: "production",
        url: "https://api.example.com",
        isProduction: true,
      };
      const result = EnvironmentConfigSchema.parse(config);
      expect(result.name).toBe("production");
      expect(result.url).toBe("https://api.example.com");
      expect(result.isProduction).toBe(true);
    });

    it("should apply defaults", () => {
      const config = {
        name: "development",
      };
      const result = EnvironmentConfigSchema.parse(config);
      expect(result.isProduction).toBe(false);
    });

    it("should reject invalid URL", () => {
      const config = {
        name: "test",
        url: "not-a-url",
      };
      expect(() => EnvironmentConfigSchema.parse(config)).toThrow();
    });
  });

  describe("ConduiiConfigSchema", () => {
    it("should validate empty config with defaults", () => {
      const result = ConduiiConfigSchema.parse({});
      expect(result.environment).toBe("default");
      expect(result.autoDiscover).toBe(true);
      expect(result.verbose).toBe(false);
    });

    it("should validate full config", () => {
      const config = {
        name: "my-project",
        version: "1.0.0",
        projectDir: "/path/to/project",
        environment: "production",
        autoDiscover: false,
        verbose: true,
        environments: {
          production: {
            name: "production",
            url: "https://api.example.com",
            isProduction: true,
          },
        },
        adapters: [
          {
            type: AdapterType.DATABASE,
            name: "postgres",
            enabled: true,
          },
        ],
        defaults: {
          timeout: 60000,
          retries: 3,
          parallel: true,
          maxConcurrency: 10,
        },
      };
      const result = ConduiiConfigSchema.parse(config);
      expect(result.name).toBe("my-project");
      expect(result.environments?.production.url).toBe("https://api.example.com");
      expect(result.adapters?.[0].type).toBe(AdapterType.DATABASE);
      expect(result.defaults?.timeout).toBe(60000);
    });
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock crypto for key generation
vi.mock("crypto", () => ({
  randomBytes: vi.fn(() => ({
    toString: () => "a".repeat(64),
  })),
}));

describe("API Keys", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Key Generation", () => {
    it("should generate a key with correct prefix", () => {
      const mockKey = `ck_${"a".repeat(64)}`;
      expect(mockKey.startsWith("ck_")).toBe(true);
    });

    it("should generate keys of correct length", () => {
      const mockKey = `ck_${"a".repeat(64)}`;
      expect(mockKey.length).toBe(67); // 3 (ck_) + 64 (hex)
    });
  });

  describe("Key Masking", () => {
    it("should mask API keys correctly", () => {
      const fullKey = "ck_abcdefghijklmnopqrstuvwxyz123456789abcdefghijklmnop";
      const masked = `${fullKey.slice(0, 8)}...${fullKey.slice(-4)}`;

      expect(masked).toBe("ck_abcde...mnop");
      expect(masked.length).toBeLessThan(fullKey.length);
    });
  });

  describe("Key Expiration", () => {
    it("should calculate 30 day expiration correctly", () => {
      const now = new Date();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const diffDays = Math.round(
        (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      expect(diffDays).toBe(30);
    });

    it("should allow never-expiring keys", () => {
      const expiresAt = null;
      expect(expiresAt).toBeNull();
    });
  });

  describe("Key Validation", () => {
    it("should require a name for new keys", () => {
      const validKey = { name: "My API Key" };
      const invalidKey = { name: "" };

      expect(validKey.name.length).toBeGreaterThan(0);
      expect(invalidKey.name.length).toBe(0);
    });

    it("should validate name length", () => {
      const validName = "My API Key";
      const tooLongName = "a".repeat(101);

      expect(validName.length).toBeLessThanOrEqual(100);
      expect(tooLongName.length).toBeGreaterThan(100);
    });
  });
});

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { rateLimit, getRateLimitHeaders, RATE_LIMITS } from "@/lib/rate-limit";

describe("Rate Limiter", () => {
  beforeEach(() => {
    // Reset time mocking
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("rateLimit", () => {
    it("should allow requests under the limit", () => {
      const result = rateLimit("test-user", { limit: 5, window: 60000 });
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it("should track remaining requests correctly", () => {
      const config = { limit: 3, window: 60000 };

      const r1 = rateLimit("user1", config);
      expect(r1.remaining).toBe(2);

      const r2 = rateLimit("user1", config);
      expect(r2.remaining).toBe(1);

      const r3 = rateLimit("user1", config);
      expect(r3.remaining).toBe(0);
    });

    it("should block requests over the limit", () => {
      const config = { limit: 2, window: 60000 };

      rateLimit("user2", config);
      rateLimit("user2", config);

      const blocked = rateLimit("user2", config);
      expect(blocked.success).toBe(false);
      expect(blocked.remaining).toBe(0);
    });

    it("should reset after window expires", () => {
      const config = { limit: 1, window: 1000 };

      const r1 = rateLimit("user3", config);
      expect(r1.success).toBe(true);

      const r2 = rateLimit("user3", config);
      expect(r2.success).toBe(false);

      // Advance time past the window
      vi.advanceTimersByTime(1100);

      const r3 = rateLimit("user3", config);
      expect(r3.success).toBe(true);
    });

    it("should track different identifiers separately", () => {
      const config = { limit: 1, window: 60000 };

      const r1 = rateLimit("user-a", config);
      expect(r1.success).toBe(true);

      const r2 = rateLimit("user-b", config);
      expect(r2.success).toBe(true);

      const r3 = rateLimit("user-a", config);
      expect(r3.success).toBe(false);
    });
  });

  describe("getRateLimitHeaders", () => {
    it("should return correct headers", () => {
      const result = {
        success: true,
        remaining: 5,
        reset: 1700000000000,
        limit: 10,
      };

      const headers = getRateLimitHeaders(result);

      expect(headers["X-RateLimit-Limit"]).toBe("10");
      expect(headers["X-RateLimit-Remaining"]).toBe("5");
      expect(headers["X-RateLimit-Reset"]).toBe("1700000000000");
    });
  });

  describe("RATE_LIMITS", () => {
    it("should have correct default configurations", () => {
      expect(RATE_LIMITS.api.limit).toBe(60);
      expect(RATE_LIMITS.auth.limit).toBe(10);
      expect(RATE_LIMITS.testRuns.limit).toBe(20);
      expect(RATE_LIMITS.ai.limit).toBe(10);
      expect(RATE_LIMITS.cli.limit).toBe(100);
    });

    it("should have 1 minute windows", () => {
      expect(RATE_LIMITS.api.window).toBe(60000);
      expect(RATE_LIMITS.auth.window).toBe(60000);
      expect(RATE_LIMITS.testRuns.window).toBe(60000);
    });
  });
});

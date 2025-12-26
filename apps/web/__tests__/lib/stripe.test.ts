import { describe, it, expect } from "vitest";
import { canCreateProject, canRunTests, getPlan, PLANS } from "@/lib/stripe";

describe("Stripe utilities", () => {
  describe("PLANS", () => {
    it("should have FREE, PRO, and ENTERPRISE plans", () => {
      expect(PLANS).toHaveProperty("FREE");
      expect(PLANS).toHaveProperty("PRO");
      expect(PLANS).toHaveProperty("ENTERPRISE");
    });

    it("should have correct project limits for each plan", () => {
      expect(PLANS.FREE.projectLimit).toBe(3);
      expect(PLANS.PRO.projectLimit).toBe(-1); // unlimited
      expect(PLANS.ENTERPRISE.projectLimit).toBe(-1); // unlimited
    });

    it("should have correct test run limits for each plan", () => {
      expect(PLANS.FREE.testRunLimit).toBe(100);
      expect(PLANS.PRO.testRunLimit).toBe(5000);
      expect(PLANS.ENTERPRISE.testRunLimit).toBe(-1); // unlimited
    });

    it("should have correct pricing for each plan", () => {
      expect(PLANS.FREE.price).toBe(0);
      expect(PLANS.PRO.price).toBe(29);
      expect(PLANS.ENTERPRISE.price).toBeNull(); // custom
    });
  });

  describe("getPlan", () => {
    it("should return correct plan details", () => {
      const freePlan = getPlan("FREE");
      expect(freePlan.name).toBe("Free");
      expect(freePlan.projectLimit).toBe(3);

      const proPlan = getPlan("PRO");
      expect(proPlan.name).toBe("Pro");
      expect(proPlan.projectLimit).toBe(-1);
    });
  });

  describe("canCreateProject", () => {
    it("should allow creating project when under limit", () => {
      expect(canCreateProject(0, "FREE")).toBe(true);
      expect(canCreateProject(2, "FREE")).toBe(true);
    });

    it("should prevent creating project when at limit", () => {
      expect(canCreateProject(3, "FREE")).toBe(false);
      expect(canCreateProject(4, "FREE")).toBe(false);
    });

    it("should always allow PRO to create projects (unlimited)", () => {
      expect(canCreateProject(0, "PRO")).toBe(true);
      expect(canCreateProject(100, "PRO")).toBe(true);
      expect(canCreateProject(1000, "PRO")).toBe(true);
    });

    it("should always allow ENTERPRISE to create projects (unlimited)", () => {
      expect(canCreateProject(100, "ENTERPRISE")).toBe(true);
      expect(canCreateProject(1000, "ENTERPRISE")).toBe(true);
    });
  });

  describe("canRunTests", () => {
    it("should allow running tests when under limit", () => {
      expect(canRunTests(0, "FREE")).toBe(true);
      expect(canRunTests(99, "FREE")).toBe(true);
    });

    it("should prevent running tests when at limit", () => {
      expect(canRunTests(100, "FREE")).toBe(false);
      expect(canRunTests(101, "FREE")).toBe(false);
    });

    it("should allow PRO to run up to 5000 tests", () => {
      expect(canRunTests(4999, "PRO")).toBe(true);
      expect(canRunTests(5000, "PRO")).toBe(false);
    });

    it("should always allow ENTERPRISE to run tests (unlimited)", () => {
      expect(canRunTests(10000, "ENTERPRISE")).toBe(true);
      expect(canRunTests(100000, "ENTERPRISE")).toBe(true);
    });
  });
});

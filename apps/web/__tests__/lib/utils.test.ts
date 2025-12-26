import { describe, it, expect } from "vitest";
import {
  cn,
  formatDuration,
  formatNumber,
  getInitials,
  generateId,
} from "@/lib/utils";

describe("cn utility", () => {
  it("should merge class names correctly", () => {
    const result = cn("text-red-500", "bg-blue-500");
    expect(result).toBe("text-red-500 bg-blue-500");
  });

  it("should handle conditional classes", () => {
    const isActive = true;
    const result = cn("base-class", isActive && "active-class");
    expect(result).toBe("base-class active-class");
  });

  it("should handle falsy values", () => {
    const result = cn("base-class", false, null, undefined, "another-class");
    expect(result).toBe("base-class another-class");
  });

  it("should merge conflicting tailwind classes", () => {
    const result = cn("p-4", "p-2");
    expect(result).toBe("p-2");
  });

  it("should handle empty input", () => {
    const result = cn();
    expect(result).toBe("");
  });
});

describe("formatDuration", () => {
  it("should format milliseconds", () => {
    expect(formatDuration(500)).toBe("500ms");
    expect(formatDuration(999)).toBe("999ms");
  });

  it("should format seconds", () => {
    expect(formatDuration(1000)).toBe("1.00s");
    expect(formatDuration(5500)).toBe("5.50s");
  });

  it("should format minutes", () => {
    expect(formatDuration(60000)).toBe("1.00m");
    expect(formatDuration(90000)).toBe("1.50m");
  });
});

describe("formatNumber", () => {
  it("should format numbers with commas", () => {
    expect(formatNumber(1000)).toBe("1,000");
    expect(formatNumber(1000000)).toBe("1,000,000");
  });

  it("should handle small numbers", () => {
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(999)).toBe("999");
  });
});

describe("getInitials", () => {
  it("should return initials from full name", () => {
    expect(getInitials("John Doe")).toBe("JD");
    expect(getInitials("Jane Smith")).toBe("JS");
  });

  it("should handle single name", () => {
    expect(getInitials("John")).toBe("J");
  });

  it("should limit to 2 characters", () => {
    expect(getInitials("John Robert Doe")).toBe("JR");
  });

  it("should handle lowercase names", () => {
    expect(getInitials("john doe")).toBe("JD");
  });
});

describe("generateId", () => {
  it("should generate a string ID", () => {
    const id = generateId();
    expect(typeof id).toBe("string");
  });

  it("should generate unique IDs", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });

  it("should generate IDs with reasonable length", () => {
    const id = generateId();
    expect(id.length).toBeGreaterThan(5);
    expect(id.length).toBeLessThan(20);
  });
});

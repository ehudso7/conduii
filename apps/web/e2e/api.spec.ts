import { test, expect } from "@playwright/test";

test.describe("API Health Check", () => {
  test("health endpoint should return 200", async ({ request }) => {
    const response = await request.get("/api/health");

    // Health endpoint should respond
    expect(response.status()).toBe(200);
  });

  test("health endpoint should return JSON", async ({ request }) => {
    const response = await request.get("/api/health");

    const contentType = response.headers()["content-type"];
    expect(contentType).toContain("application/json");
  });

  test("health endpoint should indicate healthy status", async ({ request }) => {
    const response = await request.get("/api/health");
    const data = await response.json();

    // Check response structure
    expect(data).toHaveProperty("status");
    expect(data.status).toBe("healthy");
  });
});

test.describe("API Authentication", () => {
  test("protected API routes should require authentication", async ({ request }) => {
    // Try to access protected endpoints without auth
    const projectsResponse = await request.get("/api/projects");
    expect([401, 403]).toContain(projectsResponse.status());
  });

  test("user profile API should require authentication", async ({ request }) => {
    const profileResponse = await request.get("/api/user/profile");
    expect([401, 403]).toContain(profileResponse.status());
  });

  test("notifications API should require authentication", async ({ request }) => {
    const notificationsResponse = await request.get("/api/user/notifications");
    expect([401, 403]).toContain(notificationsResponse.status());
  });

  test("organizations API should require authentication", async ({ request }) => {
    const orgsResponse = await request.get("/api/organizations");
    expect([401, 403]).toContain(orgsResponse.status());
  });

  test("API keys endpoint should require authentication", async ({ request }) => {
    const apiKeysResponse = await request.get("/api/api-keys");
    expect([401, 403]).toContain(apiKeysResponse.status());
  });

  test("test runs API should require authentication", async ({ request }) => {
    const testRunsResponse = await request.get("/api/test-runs");
    expect([401, 403]).toContain(testRunsResponse.status());
  });
});

test.describe("API Error Handling", () => {
  test("non-existent API route should return 404", async ({ request }) => {
    const response = await request.get("/api/non-existent-endpoint");
    expect(response.status()).toBe(404);
  });

  test("invalid project ID should return appropriate error", async ({ request }) => {
    const response = await request.get("/api/projects/invalid-id-123");
    expect([401, 403, 404]).toContain(response.status());
  });
});

test.describe("CLI Validation API", () => {
  test("CLI validate endpoint should exist", async ({ request }) => {
    const response = await request.post("/api/cli/validate", {
      data: {},
    });

    // Should respond (might be 401 for auth required or 400 for bad request)
    expect([200, 400, 401, 403]).toContain(response.status());
  });
});

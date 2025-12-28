/**
 * Real-time Updates Service using Server-Sent Events
 * Provides live updates for test runs, notifications, and system events
 */

import { db } from "@/lib/db";

export type EventType =
  | "TEST_RUN_STATUS"
  | "TEST_RESULT"
  | "NOTIFICATION"
  | "DIAGNOSTIC"
  | "SYSTEM";

export interface RealtimeEvent {
  type: EventType;
  data: unknown;
  timestamp: Date;
}

// In-memory connection store for SSE clients
interface SSEClient {
  id: string;
  userId: string;
  organizationId: string;
  projectId?: string;
  controller: ReadableStreamDefaultController;
  lastPing: Date;
}

const clients: Map<string, SSEClient> = new Map();

// Clean up stale connections every 30 seconds
setInterval(() => {
  const now = Date.now();
  const staleThreshold = 60000; // 1 minute

  for (const [id, client] of clients.entries()) {
    if (now - client.lastPing.getTime() > staleThreshold) {
      try {
        client.controller.close();
      } catch {
        // Controller may already be closed
      }
      clients.delete(id);
    }
  }
}, 30000);

/**
 * Create a new SSE connection
 */
export function createSSEConnection(
  userId: string,
  organizationId: string,
  projectId?: string
): { stream: ReadableStream; clientId: string } {
  const clientId = `${userId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const stream = new ReadableStream({
    start(controller) {
      clients.set(clientId, {
        id: clientId,
        userId,
        organizationId,
        projectId,
        controller,
        lastPing: new Date(),
      });

      // Send initial connection message
      const data = `data: ${JSON.stringify({
        type: "CONNECTED",
        clientId,
        timestamp: new Date().toISOString(),
      })}\n\n`;
      controller.enqueue(new TextEncoder().encode(data));
    },
    cancel() {
      clients.delete(clientId);
    },
  });

  return { stream, clientId };
}

/**
 * Send event to specific client
 */
export function sendToClient(clientId: string, event: RealtimeEvent): boolean {
  const client = clients.get(clientId);
  if (!client) return false;

  try {
    const data = `data: ${JSON.stringify({
      ...event,
      timestamp: event.timestamp.toISOString(),
    })}\n\n`;
    client.controller.enqueue(new TextEncoder().encode(data));
    client.lastPing = new Date();
    return true;
  } catch {
    clients.delete(clientId);
    return false;
  }
}

/**
 * Broadcast event to all clients in an organization
 */
export function broadcastToOrganization(
  organizationId: string,
  event: RealtimeEvent,
  projectId?: string
): number {
  let sent = 0;

  for (const client of clients.values()) {
    if (client.organizationId !== organizationId) continue;
    if (projectId && client.projectId && client.projectId !== projectId) continue;

    if (sendToClient(client.id, event)) {
      sent++;
    }
  }

  return sent;
}

/**
 * Broadcast event to specific user across all their connections
 */
export function broadcastToUser(userId: string, event: RealtimeEvent): number {
  let sent = 0;

  for (const client of clients.values()) {
    if (client.userId !== userId) continue;

    if (sendToClient(client.id, event)) {
      sent++;
    }
  }

  return sent;
}

/**
 * Send test run status update
 */
export async function sendTestRunUpdate(
  testRunId: string,
  status: string,
  data?: Record<string, unknown>
): Promise<number> {
  const testRun = await db.testRun.findUnique({
    where: { id: testRunId },
    include: {
      project: { select: { organizationId: true } },
      results: { include: { test: { select: { name: true } } } },
    },
  });

  if (!testRun) return 0;

  const passed = testRun.results.filter((r) => r.status === "PASSED").length;
  const failed = testRun.results.filter((r) => r.status === "FAILED").length;
  const total = testRun.results.length;

  return broadcastToOrganization(
    testRun.project.organizationId,
    {
      type: "TEST_RUN_STATUS",
      data: {
        testRunId,
        status,
        passed,
        failed,
        total,
        passRate: total > 0 ? Math.round((passed / total) * 100) : 0,
        duration: testRun.duration,
        ...data,
      },
      timestamp: new Date(),
    },
    testRun.projectId
  );
}

/**
 * Send individual test result update
 */
export async function sendTestResultUpdate(
  testRunId: string,
  testResultId: string,
  testName: string,
  status: string,
  duration: number,
  error?: string
): Promise<number> {
  const testRun = await db.testRun.findUnique({
    where: { id: testRunId },
    include: { project: { select: { organizationId: true } } },
  });

  if (!testRun) return 0;

  return broadcastToOrganization(
    testRun.project.organizationId,
    {
      type: "TEST_RESULT",
      data: {
        testRunId,
        testResultId,
        testName,
        status,
        duration,
        error,
      },
      timestamp: new Date(),
    },
    testRun.projectId
  );
}

/**
 * Send diagnostic update
 */
export async function sendDiagnosticUpdate(
  testRunId: string,
  diagnostic: {
    id: string;
    severity: string;
    issue: string;
    description: string;
  }
): Promise<number> {
  const testRun = await db.testRun.findUnique({
    where: { id: testRunId },
    include: { project: { select: { organizationId: true } } },
  });

  if (!testRun) return 0;

  return broadcastToOrganization(
    testRun.project.organizationId,
    {
      type: "DIAGNOSTIC",
      data: {
        testRunId,
        diagnostic,
      },
      timestamp: new Date(),
    },
    testRun.projectId
  );
}

/**
 * Send notification to user
 */
export function sendNotification(
  userId: string,
  notification: {
    id: string;
    type: string;
    title: string;
    description: string;
    link?: string;
  }
): number {
  return broadcastToUser(userId, {
    type: "NOTIFICATION",
    data: notification,
    timestamp: new Date(),
  });
}

/**
 * Send system event
 */
export function sendSystemEvent(
  organizationId: string,
  event: {
    action: string;
    resource: string;
    resourceId: string;
    details?: Record<string, unknown>;
  }
): number {
  return broadcastToOrganization(organizationId, {
    type: "SYSTEM",
    data: event,
    timestamp: new Date(),
  });
}

/**
 * Ping client to keep connection alive
 */
export function pingClient(clientId: string): boolean {
  const client = clients.get(clientId);
  if (!client) return false;

  try {
    const data = `: ping\n\n`;
    client.controller.enqueue(new TextEncoder().encode(data));
    client.lastPing = new Date();
    return true;
  } catch {
    clients.delete(clientId);
    return false;
  }
}

/**
 * Close client connection
 */
export function closeConnection(clientId: string): boolean {
  const client = clients.get(clientId);
  if (!client) return false;

  try {
    client.controller.close();
  } catch {
    // Controller may already be closed
  }

  clients.delete(clientId);
  return true;
}

/**
 * Get connection stats
 */
export function getConnectionStats(): {
  total: number;
  byOrganization: Record<string, number>;
} {
  const stats = {
    total: clients.size,
    byOrganization: {} as Record<string, number>,
  };

  for (const client of clients.values()) {
    stats.byOrganization[client.organizationId] =
      (stats.byOrganization[client.organizationId] || 0) + 1;
  }

  return stats;
}

/**
 * Verify if a user owns a specific client connection
 */
export function verifyClientOwnership(clientId: string, userId: string): boolean {
  const client = clients.get(clientId);
  if (!client) return false;
  return client.userId === userId;
}

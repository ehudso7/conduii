import { db } from "@/lib/db";

// NotificationType enum values from schema
type NotificationType =
  | "TEST_PASSED"
  | "TEST_FAILED"
  | "TEST_RUNNING"
  | "SERVICE_DISCOVERED"
  | "USAGE_WARNING"
  | "SYSTEM";

// JSON-compatible type for metadata
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  description: string;
  link?: string;
  metadata?: JsonValue;
}

/**
 * Create a notification for a user
 */
export async function createNotification(input: CreateNotificationInput) {
  return db.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      description: input.description,
      link: input.link,
      metadata: input.metadata,
    },
  });
}

/**
 * Create notifications for all members of an organization
 */
export async function notifyOrganizationMembers(
  organizationId: string,
  notification: Omit<CreateNotificationInput, "userId">
) {
  const members = await db.organizationMember.findMany({
    where: { organizationId },
    select: { userId: true },
  });

  const notifications = members.map((member: { userId: string }) => ({
    userId: member.userId,
    type: notification.type,
    title: notification.title,
    description: notification.description,
    link: notification.link,
    metadata: notification.metadata,
  }));

  return db.notification.createMany({ data: notifications });
}

/**
 * Create notification for test run status changes
 */
export async function notifyTestRunStatus(
  testRunId: string,
  status: "PASSED" | "FAILED" | "RUNNING",
  projectName: string,
  projectId: string,
  triggeredById?: string | null
) {
  const typeMap: Record<"PASSED" | "FAILED" | "RUNNING", NotificationType> = {
    PASSED: "TEST_PASSED",
    FAILED: "TEST_FAILED",
    RUNNING: "TEST_RUNNING",
  };

  const titleMap = {
    PASSED: "Test run completed",
    FAILED: "Test run failed",
    RUNNING: "Test run started",
  };

  const descriptionMap = {
    PASSED: `All tests passed for ${projectName}`,
    FAILED: `Some tests failed for ${projectName}`,
    RUNNING: `Running tests for ${projectName}`,
  };

  if (!triggeredById) return;

  return createNotification({
    userId: triggeredById,
    type: typeMap[status],
    title: titleMap[status],
    description: descriptionMap[status],
    link: `/dashboard/projects/${projectId}/runs/${testRunId}`,
    metadata: { testRunId, projectId, status },
  });
}

/**
 * Create notification for usage warnings
 */
export async function notifyUsageWarning(
  userId: string,
  usagePercent: number,
  organizationName: string
) {
  return createNotification({
    userId,
    type: "USAGE_WARNING",
    title: "Usage approaching limit",
    description: `${organizationName} has used ${usagePercent}% of test runs`,
    link: "/dashboard/billing",
    metadata: { usagePercent },
  });
}

/**
 * Create notification for service discovery
 */
export async function notifyServiceDiscovered(
  userId: string,
  serviceName: string,
  serviceType: string,
  projectId: string
) {
  return createNotification({
    userId,
    type: "SERVICE_DISCOVERED",
    title: "New service detected",
    description: `${serviceName} (${serviceType}) was discovered`,
    link: `/dashboard/projects/${projectId}/services`,
    metadata: { serviceName, serviceType, projectId },
  });
}

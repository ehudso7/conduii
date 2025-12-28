/**
 * Webhook Integration Service
 * Handles sending notifications to Slack, Discord, and custom webhooks
 */

import crypto from "crypto";
import { db } from "@/lib/db";
import { chat, isAIConfigured } from "@/lib/ai/index";

export type WebhookProvider = "SLACK" | "DISCORD" | "CUSTOM";
export type WebhookEventType =
  | "TEST_RUN_STARTED"
  | "TEST_RUN_COMPLETED"
  | "TEST_RUN_FAILED"
  | "FLAKY_TEST_DETECTED"
  | "DEPLOYMENT_RISK"
  | "DAILY_SUMMARY";

interface WebhookPayload {
  eventType: WebhookEventType;
  projectId: string;
  projectName: string;
  data: Record<string, unknown>;
  timestamp: Date;
}

interface SlackBlock {
  type: string;
  text?: { type: string; text: string; emoji?: boolean };
  fields?: Array<{ type: string; text: string }>;
  elements?: Array<{ type: string; text: string; url?: string; style?: string }>;
  accessory?: { type: string; text: { type: string; text: string }; url: string };
}

interface SlackMessage {
  blocks: SlackBlock[];
  text: string;
}

interface DiscordEmbed {
  title: string;
  description?: string;
  color: number;
  fields?: Array<{ name: string; value: string; inline?: boolean }>;
  footer?: { text: string };
  timestamp?: string;
}

interface DiscordMessage {
  content?: string;
  embeds: DiscordEmbed[];
}

/**
 * Send webhook notification to configured endpoints
 */
export async function sendWebhookNotification(
  payload: WebhookPayload
): Promise<{ success: boolean; errors: string[] }> {
  const errors: string[] = [];

  // Get all webhooks for this project's organization
  const project = await db.project.findUnique({
    where: { id: payload.projectId },
    select: { organizationId: true },
  });

  if (!project) {
    return { success: false, errors: ["Project not found"] };
  }

  const webhooks = await db.webhook.findMany({
    where: {
      organizationId: project.organizationId,
      enabled: true,
      events: { has: payload.eventType },
    },
  });

  if (webhooks.length === 0) {
    return { success: true, errors: [] }; // No webhooks configured is not an error
  }

  // Send to each webhook
  const results = await Promise.allSettled(
    webhooks.map((webhook: { id: string; name: string; url: string; secret: string | null; provider: string }) => sendToWebhook(webhook, payload))
  );

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === "rejected") {
      errors.push(`Webhook ${webhooks[i].name}: ${result.reason}`);
    }
  }

  return {
    success: errors.length === 0,
    errors,
  };
}

/**
 * Send payload to a specific webhook
 */
async function sendToWebhook(
  webhook: { id: string; url: string; provider: string; secret: string | null },
  payload: WebhookPayload
): Promise<void> {
  let message: unknown;

  switch (webhook.provider) {
    case "SLACK":
      message = await formatSlackMessage(payload);
      break;
    case "DISCORD":
      message = formatDiscordMessage(payload);
      break;
    default:
      message = formatCustomWebhookPayload(payload, webhook.secret);
  }

  const response = await fetch(webhook.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(webhook.secret && webhook.provider === "CUSTOM"
        ? { "X-Webhook-Secret": webhook.secret }
        : {}),
    },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }

  // Log successful delivery
  await db.webhookDelivery.create({
    data: {
      webhookId: webhook.id,
      eventType: payload.eventType,
      status: "DELIVERED",
      payload: JSON.stringify(payload),
      responseCode: response.status,
    },
  });
}

/**
 * Format message for Slack
 */
async function formatSlackMessage(payload: WebhookPayload): Promise<SlackMessage> {
  const { eventType, projectName, data } = payload;

  const blocks: SlackBlock[] = [];
  let fallbackText = "";

  switch (eventType) {
    case "TEST_RUN_STARTED": {
      fallbackText = `🚀 Test run started for ${projectName}`;
      blocks.push(
        {
          type: "header",
          text: { type: "plain_text", text: "🚀 Test Run Started", emoji: true },
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*Project:*\n${projectName}` },
            { type: "mrkdwn", text: `*Trigger:*\n${data.trigger || "Manual"}` },
            { type: "mrkdwn", text: `*Tests:*\n${data.testCount || "N/A"}` },
            { type: "mrkdwn", text: `*Run ID:*\n${(data.runId as string)?.slice(0, 8) || "N/A"}` },
          ],
        }
      );
      break;
    }

    case "TEST_RUN_COMPLETED": {
      const passRate = data.passRate as number;
      const emoji = passRate === 100 ? "✅" : passRate >= 80 ? "⚠️" : "❌";
      fallbackText = `${emoji} Test run completed for ${projectName}: ${passRate}% passed`;

      blocks.push(
        {
          type: "header",
          text: { type: "plain_text", text: `${emoji} Test Run Completed`, emoji: true },
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*Project:*\n${projectName}` },
            { type: "mrkdwn", text: `*Pass Rate:*\n${passRate}%` },
            { type: "mrkdwn", text: `*Passed:*\n${data.passed}/${data.total}` },
            { type: "mrkdwn", text: `*Duration:*\n${formatDuration(data.duration as number)}` },
          ],
        }
      );

      // Add AI summary if available
      if (isAIConfigured() && data.failed && (data.failed as number) > 0) {
        const summary = await generateAISummary(payload);
        if (summary) {
          blocks.push({
            type: "section",
            text: { type: "mrkdwn", text: `*AI Analysis:*\n${summary}` },
          });
        }
      }

      if (data.runUrl) {
        blocks.push({
          type: "section",
          text: { type: "mrkdwn", text: " " },
          accessory: {
            type: "button",
            text: { type: "plain_text", text: "View Details" },
            url: data.runUrl as string,
          },
        });
      }
      break;
    }

    case "TEST_RUN_FAILED": {
      fallbackText = `❌ Test run failed for ${projectName}`;

      blocks.push(
        {
          type: "header",
          text: { type: "plain_text", text: "❌ Test Run Failed", emoji: true },
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*Project:*\n${projectName}` },
            { type: "mrkdwn", text: `*Failed Tests:*\n${data.failed}` },
            { type: "mrkdwn", text: `*Pass Rate:*\n${data.passRate}%` },
          ],
        }
      );

      // Add failed test details
      if (data.failures && Array.isArray(data.failures)) {
        const failureList = (data.failures as Array<{ name: string; error?: string }>)
          .slice(0, 5)
          .map((f) => `• ${f.name}: ${(f.error || "Unknown error").slice(0, 50)}`)
          .join("\n");

        blocks.push({
          type: "section",
          text: { type: "mrkdwn", text: `*Failed Tests:*\n${failureList}` },
        });
      }

      // Add AI root cause analysis
      if (isAIConfigured()) {
        const analysis = await generateAISummary(payload);
        if (analysis) {
          blocks.push({
            type: "section",
            text: { type: "mrkdwn", text: `*Root Cause Analysis:*\n${analysis}` },
          });
        }
      }
      break;
    }

    case "FLAKY_TEST_DETECTED": {
      fallbackText = `⚠️ Flaky test detected in ${projectName}`;

      blocks.push(
        {
          type: "header",
          text: { type: "plain_text", text: "⚠️ Flaky Test Detected", emoji: true },
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*Project:*\n${projectName}` },
            { type: "mrkdwn", text: `*Test:*\n${data.testName}` },
            { type: "mrkdwn", text: `*Flakiness Score:*\n${data.flakinessScore}%` },
            { type: "mrkdwn", text: `*Pass Rate:*\n${data.passRate}%` },
          ],
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Recommendation:* ${data.recommendation || "Consider quarantining this test until the issue is resolved."}`,
          },
        }
      );
      break;
    }

    case "DEPLOYMENT_RISK": {
      const riskLevel = data.riskLevel as string;
      const riskEmoji = riskLevel === "HIGH" ? "🔴" : riskLevel === "MEDIUM" ? "🟡" : "🟢";
      fallbackText = `${riskEmoji} Deployment risk alert for ${projectName}`;

      blocks.push(
        {
          type: "header",
          text: { type: "plain_text", text: `${riskEmoji} Deployment Risk: ${riskLevel}`, emoji: true },
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*Project:*\n${projectName}` },
            { type: "mrkdwn", text: `*Risk Score:*\n${data.riskScore}%` },
            { type: "mrkdwn", text: `*Affected Tests:*\n${data.affectedTests}` },
            { type: "mrkdwn", text: `*Changed Files:*\n${data.changedFiles}` },
          ],
        }
      );

      if (data.recommendations && Array.isArray(data.recommendations)) {
        blocks.push({
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Recommendations:*\n${(data.recommendations as string[]).map((r) => `• ${r}`).join("\n")}`,
          },
        });
      }
      break;
    }

    case "DAILY_SUMMARY": {
      fallbackText = `📊 Daily summary for ${projectName}`;

      blocks.push(
        {
          type: "header",
          text: { type: "plain_text", text: "📊 Daily Test Summary", emoji: true },
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*Project:*\n${projectName}` },
            { type: "mrkdwn", text: `*Total Runs:*\n${data.totalRuns}` },
            { type: "mrkdwn", text: `*Pass Rate:*\n${data.passRate}%` },
            { type: "mrkdwn", text: `*Tests Run:*\n${data.testsRun}` },
          ],
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*Passed:*\n${data.passed}` },
            { type: "mrkdwn", text: `*Failed:*\n${data.failed}` },
            { type: "mrkdwn", text: `*Flaky:*\n${data.flaky}` },
            { type: "mrkdwn", text: `*Avg Duration:*\n${formatDuration(data.avgDuration as number)}` },
          ],
        }
      );

      // Add trend comparison
      if (data.trend) {
        const trendEmoji = data.trend === "up" ? "📈" : data.trend === "down" ? "📉" : "➡️";
        blocks.push({
          type: "section",
          text: {
            type: "mrkdwn",
            text: `${trendEmoji} *Trend:* Pass rate ${data.trend === "up" ? "improved" : data.trend === "down" ? "declined" : "stable"} compared to yesterday (${data.trendDelta}%)`,
          },
        });
      }
      break;
    }

    default: {
      fallbackText = `Test notification for ${projectName}`;
      blocks.push({
        type: "section",
        text: { type: "mrkdwn", text: `Event: ${eventType}\nProject: ${projectName}` },
      });
    }
  }

  return {
    blocks,
    text: fallbackText,
  };
}

/**
 * Format message for Discord
 */
function formatDiscordMessage(payload: WebhookPayload): DiscordMessage {
  const { eventType, projectName, data } = payload;

  const embeds: DiscordEmbed[] = [];

  switch (eventType) {
    case "TEST_RUN_STARTED": {
      embeds.push({
        title: "🚀 Test Run Started",
        description: `A new test run has started for **${projectName}**`,
        color: 0x3498db, // Blue
        fields: [
          { name: "Trigger", value: (data.trigger as string) || "Manual", inline: true },
          { name: "Tests", value: String(data.testCount || "N/A"), inline: true },
          { name: "Run ID", value: (data.runId as string)?.slice(0, 8) || "N/A", inline: true },
        ],
        timestamp: payload.timestamp.toISOString(),
      });
      break;
    }

    case "TEST_RUN_COMPLETED": {
      const passRate = data.passRate as number;
      const color = passRate === 100 ? 0x2ecc71 : passRate >= 80 ? 0xf39c12 : 0xe74c3c;
      const emoji = passRate === 100 ? "✅" : passRate >= 80 ? "⚠️" : "❌";

      embeds.push({
        title: `${emoji} Test Run Completed`,
        description: `Test run finished for **${projectName}** with **${passRate}%** pass rate`,
        color,
        fields: [
          { name: "Passed", value: `${data.passed}/${data.total}`, inline: true },
          { name: "Failed", value: String(data.failed || 0), inline: true },
          { name: "Duration", value: formatDuration(data.duration as number), inline: true },
        ],
        timestamp: payload.timestamp.toISOString(),
      });
      break;
    }

    case "TEST_RUN_FAILED": {
      const failureFields: Array<{ name: string; value: string; inline?: boolean }> = [
        { name: "Failed Tests", value: String(data.failed), inline: true },
        { name: "Pass Rate", value: `${data.passRate}%`, inline: true },
      ];

      if (data.failures && Array.isArray(data.failures)) {
        const failureList = (data.failures as Array<{ name: string }>)
          .slice(0, 3)
          .map((f) => `• ${f.name}`)
          .join("\n");
        failureFields.push({ name: "Failed Tests", value: failureList || "None" });
      }

      embeds.push({
        title: "❌ Test Run Failed",
        description: `Test run failed for **${projectName}**`,
        color: 0xe74c3c, // Red
        fields: failureFields,
        timestamp: payload.timestamp.toISOString(),
      });
      break;
    }

    case "FLAKY_TEST_DETECTED": {
      embeds.push({
        title: "⚠️ Flaky Test Detected",
        description: `A flaky test was detected in **${projectName}**`,
        color: 0xf39c12, // Orange
        fields: [
          { name: "Test Name", value: data.testName as string, inline: false },
          { name: "Flakiness Score", value: `${data.flakinessScore}%`, inline: true },
          { name: "Pass Rate", value: `${data.passRate}%`, inline: true },
        ],
        footer: { text: data.recommendation as string || "Consider quarantining this test" },
        timestamp: payload.timestamp.toISOString(),
      });
      break;
    }

    case "DEPLOYMENT_RISK": {
      const riskLevel = data.riskLevel as string;
      const color = riskLevel === "HIGH" ? 0xe74c3c : riskLevel === "MEDIUM" ? 0xf39c12 : 0x2ecc71;

      embeds.push({
        title: `🎯 Deployment Risk: ${riskLevel}`,
        description: `Deployment risk assessment for **${projectName}**`,
        color,
        fields: [
          { name: "Risk Score", value: `${data.riskScore}%`, inline: true },
          { name: "Affected Tests", value: String(data.affectedTests), inline: true },
          { name: "Changed Files", value: String(data.changedFiles), inline: true },
        ],
        timestamp: payload.timestamp.toISOString(),
      });
      break;
    }

    case "DAILY_SUMMARY": {
      const passRate = data.passRate as number;
      const color = passRate >= 95 ? 0x2ecc71 : passRate >= 80 ? 0xf39c12 : 0xe74c3c;

      embeds.push({
        title: "📊 Daily Test Summary",
        description: `Daily summary for **${projectName}**`,
        color,
        fields: [
          { name: "Total Runs", value: String(data.totalRuns), inline: true },
          { name: "Pass Rate", value: `${passRate}%`, inline: true },
          { name: "Tests Run", value: String(data.testsRun), inline: true },
          { name: "Passed", value: String(data.passed), inline: true },
          { name: "Failed", value: String(data.failed), inline: true },
          { name: "Avg Duration", value: formatDuration(data.avgDuration as number), inline: true },
        ],
        timestamp: payload.timestamp.toISOString(),
      });
      break;
    }

    default: {
      embeds.push({
        title: "Test Notification",
        description: `Event: ${eventType}\nProject: ${projectName}`,
        color: 0x95a5a6,
        timestamp: payload.timestamp.toISOString(),
      });
    }
  }

  return { embeds };
}

/**
 * Format payload for custom webhooks
 */
function formatCustomWebhookPayload(
  payload: WebhookPayload,
  secret: string | null
): Record<string, unknown> {
  return {
    event: payload.eventType,
    project: {
      id: payload.projectId,
      name: payload.projectName,
    },
    data: payload.data,
    timestamp: payload.timestamp.toISOString(),
    ...(secret ? { signature: generateSignature(payload, secret) } : {}),
  };
}

/**
 * Generate HMAC signature for webhook payload
 */
function generateSignature(payload: WebhookPayload, secret: string): string {
  const data = JSON.stringify({ event: payload.eventType, data: payload.data });
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

/**
 * Generate AI summary for notifications
 */
async function generateAISummary(payload: WebhookPayload): Promise<string | null> {
  if (!isAIConfigured()) return null;

  try {
    const prompt = `Summarize this test result in 1-2 sentences for a Slack notification. Be concise and actionable:

Event: ${payload.eventType}
Project: ${payload.projectName}
Data: ${JSON.stringify(payload.data, null, 2)}`;

    const response = await chat([
      { role: "system", content: "You are a concise test result summarizer. Keep responses under 100 characters." },
      { role: "user", content: prompt },
    ], { maxTokens: 150 });

    return response.content;
  } catch {
    return null;
  }
}

/**
 * Format duration in human-readable format
 */
function formatDuration(ms: number | undefined): string {
  if (!ms) return "N/A";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
}

/**
 * Send test run notification
 */
export async function notifyTestRunStatus(
  testRunId: string,
  status: "PASSED" | "FAILED" | "RUNNING",
  projectName: string,
  projectId: string,
  _userId: string
): Promise<void> {
  const testRun = await db.testRun.findUnique({
    where: { id: testRunId },
    include: {
      results: { include: { test: true } },
    },
  });

  if (!testRun) return;

  const passed = testRun.results.filter((r: { status: string }) => r.status === "PASSED").length;
  const failed = testRun.results.filter((r: { status: string }) => r.status === "FAILED").length;
  const total = testRun.results.length;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

  const eventType: WebhookEventType =
    status === "RUNNING"
      ? "TEST_RUN_STARTED"
      : status === "FAILED" || failed > 0
        ? "TEST_RUN_FAILED"
        : "TEST_RUN_COMPLETED";

  await sendWebhookNotification({
    eventType,
    projectId,
    projectName,
    data: {
      runId: testRunId,
      status,
      passed,
      failed,
      total,
      passRate,
      duration: testRun.duration,
      trigger: testRun.trigger,
      failures: testRun.results
        .filter((r: { status: string }) => r.status === "FAILED")
        .map((r: { test: { name: string }; error: string | null }) => ({ name: r.test.name, error: r.error })),
      runUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/projects/${projectId}/runs/${testRunId}`,
    },
    timestamp: new Date(),
  });
}

/**
 * Send flaky test notification
 */
export async function notifyFlakyTest(
  testId: string,
  testName: string,
  projectId: string,
  projectName: string,
  flakinessScore: number,
  passRate: number
): Promise<void> {
  await sendWebhookNotification({
    eventType: "FLAKY_TEST_DETECTED",
    projectId,
    projectName,
    data: {
      testId,
      testName,
      flakinessScore,
      passRate,
      recommendation: flakinessScore > 50
        ? "This test is highly flaky. Consider quarantining it immediately."
        : "Monitor this test closely. It may need attention.",
    },
    timestamp: new Date(),
  });
}

/**
 * Send deployment risk notification
 */
export async function notifyDeploymentRisk(
  projectId: string,
  projectName: string,
  riskLevel: "LOW" | "MEDIUM" | "HIGH",
  riskScore: number,
  affectedTests: number,
  changedFiles: number,
  recommendations: string[]
): Promise<void> {
  await sendWebhookNotification({
    eventType: "DEPLOYMENT_RISK",
    projectId,
    projectName,
    data: {
      riskLevel,
      riskScore,
      affectedTests,
      changedFiles,
      recommendations,
    },
    timestamp: new Date(),
  });
}

/**
 * Send daily summary notification
 */
export async function sendDailySummary(
  projectId: string,
  projectName: string
): Promise<void> {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const dayBefore = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const [todayRuns, yesterdayRuns] = await Promise.all([
    db.testRun.findMany({
      where: { projectId, createdAt: { gte: yesterday } },
      include: { results: true },
    }),
    db.testRun.findMany({
      where: { projectId, createdAt: { gte: dayBefore, lt: yesterday } },
      include: { results: true },
    }),
  ]);

  type RunWithResults = { results: Array<{ status: string }> };
  const todayResults = todayRuns.flatMap((r: RunWithResults) => r.results);
  const yesterdayResults = yesterdayRuns.flatMap((r: RunWithResults) => r.results);

  const todayPassed = todayResults.filter((r: { status: string }) => r.status === "PASSED").length;
  const todayFailed = todayResults.filter((r: { status: string }) => r.status === "FAILED").length;
  const todayPassRate = todayResults.length > 0
    ? Math.round((todayPassed / todayResults.length) * 100)
    : 0;

  const yesterdayPassed = yesterdayResults.filter((r: { status: string }) => r.status === "PASSED").length;
  const yesterdayPassRate = yesterdayResults.length > 0
    ? Math.round((yesterdayPassed / yesterdayResults.length) * 100)
    : 0;

  const trendDelta = todayPassRate - yesterdayPassRate;
  const trend = trendDelta > 1 ? "up" : trendDelta < -1 ? "down" : "stable";

  type RunWithDuration = { duration: number | null };
  const durations = todayRuns
    .map((r: RunWithDuration) => r.duration)
    .filter((d: number | null): d is number => d !== null);
  const avgDuration = durations.length > 0
    ? durations.reduce((a: number, b: number) => a + b, 0) / durations.length
    : 0;

  await sendWebhookNotification({
    eventType: "DAILY_SUMMARY",
    projectId,
    projectName,
    data: {
      totalRuns: todayRuns.length,
      testsRun: todayResults.length,
      passed: todayPassed,
      failed: todayFailed,
      flaky: 0, // Would need flaky detection integration
      passRate: todayPassRate,
      avgDuration,
      trend,
      trendDelta,
    },
    timestamp: new Date(),
  });
}

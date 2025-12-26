/**
 * Email Service using Resend
 *
 * Handles all transactional emails for Conduii:
 * - Member invitations
 * - Test failure notifications
 * - Welcome emails
 * - Password reset (handled by Clerk)
 */

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

interface SendResult {
  success: boolean;
  id?: string;
  error?: string;
}

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "Conduii <noreply@conduii.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://conduii.com";

/**
 * Send an email using Resend API
 */
export async function sendEmail(options: EmailOptions): Promise<SendResult> {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured, skipping email send");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Resend API error:", error);
      return { success: false, error };
    }

    const data = await response.json();
    return { success: true, id: data.id };
  } catch (error) {
    console.error("Email send error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send member invitation email
 */
export async function sendInvitationEmail(
  email: string,
  organizationName: string,
  inviterName: string,
  role: string
): Promise<SendResult> {
  const signUpUrl = `${APP_URL}/sign-up?redirect_url=/dashboard`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>You're invited to join ${organizationName}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #6366f1; margin: 0;">Conduii</h1>
          <p style="color: #666; margin: 5px 0;">AI-Powered Universal Testing Platform</p>
        </div>

        <div style="background: #f9fafb; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
          <h2 style="margin-top: 0;">You've been invited!</h2>
          <p><strong>${inviterName}</strong> has invited you to join <strong>${organizationName}</strong> as a <strong>${role}</strong>.</p>
          <p>Conduii helps teams automatically test their applications across all integrated services, APIs, and endpoints.</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${signUpUrl}" style="display: inline-block; background: #6366f1; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600;">Accept Invitation</a>
        </div>

        <p style="color: #666; font-size: 14px;">If you don't want to accept this invitation, you can ignore this email.</p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

        <p style="color: #999; font-size: 12px; text-align: center;">
          This email was sent by Conduii. If you have questions, contact us at support@conduii.com
        </p>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `You're invited to join ${organizationName} on Conduii`,
    html,
    text: `${inviterName} has invited you to join ${organizationName} as a ${role}. Accept the invitation at: ${signUpUrl}`,
  });
}

/**
 * Send test failure notification
 */
export async function sendTestFailureNotification(
  emails: string[],
  projectName: string,
  testRunId: string,
  summary: { total: number; passed: number; failed: number }
): Promise<SendResult> {
  const testRunUrl = `${APP_URL}/dashboard/test-runs/${testRunId}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Test Run Failed - ${projectName}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #6366f1; margin: 0;">Conduii</h1>
        </div>

        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h2 style="color: #dc2626; margin-top: 0;">⚠️ Test Run Failed</h2>
          <p style="margin-bottom: 0;"><strong>Project:</strong> ${projectName}</p>
        </div>

        <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h3 style="margin-top: 0;">Test Summary</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">Total Tests</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right; font-weight: 600;">${summary.total}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #16a34a;">Passed</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right; font-weight: 600; color: #16a34a;">${summary.passed}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #dc2626;">Failed</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #dc2626;">${summary.failed}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${testRunUrl}" style="display: inline-block; background: #6366f1; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600;">View Test Results</a>
        </div>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

        <p style="color: #999; font-size: 12px; text-align: center;">
          You're receiving this because you have notifications enabled for ${projectName}.
          <br>
          <a href="${APP_URL}/dashboard/settings" style="color: #6366f1;">Manage notification settings</a>
        </p>
      </body>
    </html>
  `;

  return sendEmail({
    to: emails,
    subject: `❌ Test Run Failed - ${projectName}`,
    html,
    text: `Test run failed for ${projectName}. ${summary.failed} of ${summary.total} tests failed. View results at: ${testRunUrl}`,
  });
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<SendResult> {
  const dashboardUrl = `${APP_URL}/dashboard`;
  const docsUrl = `${APP_URL}/docs`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Conduii!</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #6366f1; margin: 0;">Welcome to Conduii! 🎉</h1>
        </div>

        <p>Hi ${name || "there"},</p>

        <p>Thanks for signing up for Conduii! We're excited to help you test your applications across all your integrated services.</p>

        <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Getting Started</h3>
          <ol style="margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 10px;">Create your first project</li>
            <li style="margin-bottom: 10px;">Add your services and endpoints</li>
            <li style="margin-bottom: 10px;">Run your first test suite</li>
            <li style="margin-bottom: 10px;">Set up CI/CD integration (optional)</li>
          </ol>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${dashboardUrl}" style="display: inline-block; background: #6366f1; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin-right: 10px;">Go to Dashboard</a>
          <a href="${docsUrl}" style="display: inline-block; background: white; color: #6366f1; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; border: 1px solid #6366f1;">Read the Docs</a>
        </div>

        <p>If you have any questions, just reply to this email or check out our documentation.</p>

        <p>Happy testing!<br>The Conduii Team</p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

        <p style="color: #999; font-size: 12px; text-align: center;">
          Conduii - AI-Powered Universal Testing Platform<br>
          <a href="${APP_URL}" style="color: #6366f1;">conduii.com</a>
        </p>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "Welcome to Conduii! 🎉",
    html,
    text: `Hi ${name || "there"}, Thanks for signing up for Conduii! Get started at: ${dashboardUrl}`,
  });
}

/**
 * Send subscription confirmation email
 */
export async function sendSubscriptionEmail(
  email: string,
  planName: string,
  interval: "monthly" | "yearly"
): Promise<SendResult> {
  const billingUrl = `${APP_URL}/dashboard/billing`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Subscription Confirmed</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #6366f1; margin: 0;">Conduii</h1>
        </div>

        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin-bottom: 20px; text-align: center;">
          <h2 style="color: #16a34a; margin-top: 0;">✓ Subscription Confirmed</h2>
          <p style="margin-bottom: 0;">You're now on the <strong>${planName}</strong> plan (${interval})</p>
        </div>

        <p>Thank you for upgrading! Your new plan is now active and you have access to all ${planName} features.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${billingUrl}" style="display: inline-block; background: #6366f1; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600;">Manage Subscription</a>
        </div>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

        <p style="color: #999; font-size: 12px; text-align: center;">
          Questions about billing? Contact us at billing@conduii.com
        </p>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `✓ ${planName} Plan Activated - Conduii`,
    html,
    text: `Your ${planName} (${interval}) subscription is now active. Manage your subscription at: ${billingUrl}`,
  });
}

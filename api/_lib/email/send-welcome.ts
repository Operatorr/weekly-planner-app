import { sendEmail } from "../resend.js";
import { welcomeEmailHtml, WELCOME_EMAIL_SUBJECT } from "./welcome.js";

/**
 * Send a welcome email to a newly provisioned user.
 * Non-blocking: errors are logged but don't throw.
 */
export async function sendWelcomeEmail(email: string): Promise<void> {
  const appUrl = process.env.APP_URL ?? "https://domarrow.app";

  try {
    await sendEmail({
      to: email,
      subject: WELCOME_EMAIL_SUBJECT,
      html: welcomeEmailHtml({ appUrl: `${appUrl}/app` }),
    });
  } catch (err) {
    console.error("Failed to send welcome email:", err);
    // Non-blocking — don't fail user provisioning
  }
}

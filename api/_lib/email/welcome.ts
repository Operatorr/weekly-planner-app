interface WelcomeEmailData {
  appUrl: string;
}

export function welcomeEmailHtml(data: WelcomeEmailData): string {
  const { appUrl } = data;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Marrow Tasker</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F9FAFB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F9FAFB; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 8px; border: 1px solid #E5E7EB; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 24px 32px 16px; border-bottom: 1px solid #F3F4F6;">
              <span style="font-size: 18px; font-weight: 600; color: #D4644A;">Marrow Tasker</span>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px 32px 24px;">
              <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 600; color: #111827;">Welcome to Marrow Tasker</h1>
              <p style="margin: 0 0 24px; font-size: 15px; color: #4B5563; line-height: 1.6;">
                You're all set! Here are a few tips to get the most out of your new task manager:
              </p>

              <!-- Tips -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 12px 16px; background-color: #FEF7F5; border-radius: 6px; margin-bottom: 8px;">
                    <p style="margin: 0; font-size: 14px; color: #1F2937; line-height: 1.5;">
                      <strong style="color: #D4644A;">1.</strong> Add tasks without a date &mdash; they'll appear in your "Undated" section until you're ready to schedule them.
                    </p>
                  </td>
                </tr>
                <tr><td style="height: 8px;"></td></tr>
                <tr>
                  <td style="padding: 12px 16px; background-color: #FEF7F5; border-radius: 6px;">
                    <p style="margin: 0; font-size: 14px; color: #1F2937; line-height: 1.5;">
                      <strong style="color: #D4644A;">2.</strong> Use the weekly view to plan your week at a glance. Drag tasks between days to reschedule.
                    </p>
                  </td>
                </tr>
                <tr><td style="height: 8px;"></td></tr>
                <tr>
                  <td style="padding: 12px 16px; background-color: #FEF7F5; border-radius: 6px;">
                    <p style="margin: 0; font-size: 14px; color: #1F2937; line-height: 1.5;">
                      <strong style="color: #D4644A;">3.</strong> Set reminders on important tasks &mdash; we'll send you an email so nothing falls through the cracks.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding-top: 28px;">
                <tr>
                  <td>
                    <a href="${appUrl}" style="display: inline-block; padding: 12px 28px; background-color: #D4644A; color: #FFFFFF; text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: 500;">Open Marrow Tasker</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 16px 32px 24px; border-top: 1px solid #F3F4F6;">
              <p style="margin: 0; font-size: 12px; color: #9CA3AF; line-height: 1.5;">
                You're receiving this because you signed up for Marrow Tasker.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export const WELCOME_EMAIL_SUBJECT = "Welcome to Marrow Tasker";

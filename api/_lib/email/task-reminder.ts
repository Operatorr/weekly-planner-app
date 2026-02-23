interface TaskReminderData {
  taskName: string;
  description?: string | null;
  dueDate?: string | null;
  checklistTotal?: number;
  checklistCompleted?: number;
  taskUrl: string;
}

export function taskReminderHtml(data: TaskReminderData): string {
  const { taskName, description, dueDate, checklistTotal, checklistCompleted, taskUrl } = data;

  const dueDateSection = dueDate
    ? `<tr>
        <td style="padding: 0 0 12px;">
          <span style="color: #6B7280; font-size: 13px;">Due</span><br />
          <span style="color: #1F2937; font-size: 15px;">${formatDate(dueDate)}</span>
        </td>
      </tr>`
    : "";

  const descriptionSection = description
    ? `<tr>
        <td style="padding: 0 0 16px;">
          <p style="margin: 0; color: #4B5563; font-size: 14px; line-height: 1.5;">${escapeHtml(description)}</p>
        </td>
      </tr>`
    : "";

  const checklistSection =
    checklistTotal && checklistTotal > 0
      ? `<tr>
          <td style="padding: 0 0 12px;">
            <span style="color: #6B7280; font-size: 13px;">Checklist</span><br />
            <span style="color: #1F2937; font-size: 15px;">${checklistCompleted ?? 0} of ${checklistTotal} completed</span>
          </td>
        </tr>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Task Reminder</title>
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
            <td style="padding: 24px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 0 0 8px;">
                    <span style="font-size: 13px; font-weight: 500; color: #D4644A; text-transform: uppercase; letter-spacing: 0.05em;">Reminder</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 0 16px;">
                    <h1 style="margin: 0; font-size: 20px; font-weight: 600; color: #111827; line-height: 1.3;">${escapeHtml(taskName)}</h1>
                  </td>
                </tr>
                ${descriptionSection}
                ${dueDateSection}
                ${checklistSection}
                <tr>
                  <td style="padding: 16px 0 0;">
                    <a href="${taskUrl}" style="display: inline-block; padding: 10px 24px; background-color: #D4644A; color: #FFFFFF; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">Open in Marrow Tasker</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 16px 32px 24px; border-top: 1px solid #F3F4F6;">
              <p style="margin: 0; font-size: 12px; color: #9CA3AF; line-height: 1.5;">
                You're receiving this because you set a reminder in Marrow Tasker.
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

export function taskReminderSubject(taskName: string): string {
  return `Reminder: ${taskName}`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

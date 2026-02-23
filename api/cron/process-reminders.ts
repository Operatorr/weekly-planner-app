import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";
import { sendEmail } from "../_lib/resend.js";
import {
  taskReminderHtml,
  taskReminderSubject,
} from "../_lib/email/task-reminder.js";

const BATCH_LIMIT = 50;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Verify cron secret — Vercel sends this as Authorization: Bearer <secret>
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const sql = neon(process.env.DATABASE_URL!);
  const appUrl = process.env.APP_URL ?? "https://marrowtasker.com";

  try {
    // Fetch due reminders that haven't been sent yet
    const dueReminders = await sql`
      SELECT
        r.id AS reminder_id,
        r.task_id,
        r.user_id,
        t.title AS task_name,
        t.description AS task_description,
        t.due_date,
        u.email
      FROM reminders r
      JOIN tasks t ON t.id = r.task_id
      JOIN users u ON u.id = r.user_id
      WHERE r.reminder_at <= NOW()
        AND r.sent = false
      ORDER BY r.reminder_at ASC
      LIMIT ${BATCH_LIMIT}
    `;

    let sent = 0;
    let failed = 0;

    for (const reminder of dueReminders) {
      try {
        // Fetch checklist progress for this task
        const checklistRows = await sql`
          SELECT
            COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE is_completed = true)::int AS completed
          FROM checklist_items
          WHERE task_id = ${reminder.task_id}
        `;

        const checklist = checklistRows[0] ?? { total: 0, completed: 0 };
        const taskUrl = `${appUrl}/app?task=${reminder.task_id}`;

        const html = taskReminderHtml({
          taskName: reminder.task_name,
          description: reminder.task_description,
          dueDate: reminder.due_date,
          checklistTotal: checklist.total,
          checklistCompleted: checklist.completed,
          taskUrl,
        });

        await sendEmail({
          to: reminder.email,
          subject: taskReminderSubject(reminder.task_name),
          html,
        });

        // Mark as sent
        await sql`
          UPDATE reminders SET sent = true WHERE id = ${reminder.reminder_id}
        `;

        sent++;
      } catch (err) {
        failed++;
        console.error(
          `Failed to process reminder ${reminder.reminder_id}:`,
          err,
        );
        // Continue processing remaining reminders
      }
    }

    return res.status(200).json({
      processed: dueReminders.length,
      sent,
      failed,
    });
  } catch (err) {
    console.error("Cron process-reminders error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

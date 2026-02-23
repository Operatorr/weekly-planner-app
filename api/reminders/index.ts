import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";
import { authenticateRequest } from "../_lib/auth";
import { parseBody, handleError } from "../_lib/validate";
import { setReminderSchema } from "../_lib/schemas";
import { logActivity } from "../_lib/activity";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId } = await authenticateRequest(req);
    const data = parseBody(req, setReminderSchema);
    const sql = neon(process.env.DATABASE_URL!);

    // Verify the task belongs to the user
    const tasks = await sql`
      SELECT id FROM tasks WHERE id = ${data.task_id} AND user_id = ${userId}
    `;
    if (tasks.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Validate reminder_at is in the future
    if (new Date(data.reminder_at) <= new Date()) {
      return res.status(400).json({ error: "Reminder time must be in the future" });
    }

    // Upsert: replace any existing reminder for this task
    await sql`
      DELETE FROM reminders WHERE task_id = ${data.task_id} AND user_id = ${userId}
    `;

    const rows = await sql`
      INSERT INTO reminders (task_id, user_id, type, reminder_at, sent)
      VALUES (${data.task_id}, ${userId}, ${data.type}, ${data.reminder_at}, false)
      RETURNING *
    `;

    await logActivity(userId, "created", "reminder", rows[0].id, {
      task_id: data.task_id,
      reminder_at: data.reminder_at,
    });

    return res.status(201).json(rows[0]);
  } catch (err) {
    return handleError(err, res);
  }
}

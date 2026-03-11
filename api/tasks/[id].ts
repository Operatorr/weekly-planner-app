import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";
import { authenticateRequest } from "../_lib/auth.js";
import { parseBody, handleError } from "../_lib/validate.js";
import { updateTaskSchema } from "../_lib/schemas.js";
import { logActivity } from "../_lib/activity.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid task ID" });
  }

  try {
    const { userId } = await authenticateRequest(req);

    if (req.method === "PATCH") {
      const data = parseBody(req, updateTaskSchema);
      const sql = neon(process.env.DATABASE_URL!);

      const rows = await sql`
        UPDATE tasks
        SET
          title = COALESCE(${data.title ?? null}, title),
          description = CASE WHEN ${data.description !== undefined} THEN ${data.description ?? null} ELSE description END,
          project_id = COALESCE(${data.project_id ?? null}, project_id),
          due_date = CASE WHEN ${data.due_date !== undefined} THEN ${data.due_date ?? null} ELSE due_date END,
          sort_order = COALESCE(${data.sort_order ?? null}, sort_order),
          updated_at = NOW()
        WHERE id = ${id} AND user_id = ${userId}
        RETURNING *
      `;

      if (rows.length === 0) {
        return res.status(404).json({ error: "Task not found" });
      }

      await logActivity(userId, "updated", "task", id, data);
      return res.status(200).json(rows[0]);
    }

    if (req.method === "DELETE") {
      const sql = neon(process.env.DATABASE_URL!);

      // Verify task belongs to user before cascade
      const task = await sql`
        SELECT id, title FROM tasks WHERE id = ${id} AND user_id = ${userId}
      `;
      if (task.length === 0) {
        return res.status(404).json({ error: "Task not found" });
      }

      // Cascade delete checklist items and reminders, then the task
      await sql`DELETE FROM checklist_items WHERE task_id = ${id}`;
      await sql`DELETE FROM reminders WHERE task_id = ${id} AND user_id = ${userId}`;
      await sql`DELETE FROM tasks WHERE id = ${id} AND user_id = ${userId}`;

      await logActivity(userId, "deleted", "task", id, { title: task[0].title });
      return res.status(200).json({ success: true, id });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    return handleError(err, res);
  }
}

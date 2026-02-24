import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";
import { authenticateRequest } from "../_lib/auth";
import { parseBody, handleError } from "../_lib/validate";
import { addChecklistItemSchema } from "../_lib/schemas";
import { logActivity } from "../_lib/activity";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { userId } = await authenticateRequest(req);
    const sql = neon(process.env.DATABASE_URL!);

    // GET - Fetch checklist items for a task
    if (req.method === "GET") {
      const { task_id } = req.query;
      if (typeof task_id !== "string") {
        return res.status(400).json({ error: "task_id query parameter required" });
      }

      // Verify the task belongs to the user
      const tasks = await sql`
        SELECT id FROM tasks WHERE id = ${task_id} AND user_id = ${userId}
      `;
      if (tasks.length === 0) {
        return res.status(404).json({ error: "Task not found" });
      }

      const rows = await sql`
        SELECT * FROM checklist_items
        WHERE task_id = ${task_id}
        ORDER BY sort_order ASC
      `;
      return res.status(200).json(rows);
    }

    // POST - Add checklist item
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const data = parseBody(req, addChecklistItemSchema);

    // Verify the task belongs to the user
    const tasks = await sql`
      SELECT id FROM tasks WHERE id = ${data.task_id} AND user_id = ${userId}
    `;
    if (tasks.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Determine sort_order
    let sortOrder = data.sort_order;
    if (sortOrder === undefined) {
      const maxRows = await sql`
        SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order
        FROM checklist_items WHERE task_id = ${data.task_id}
      `;
      sortOrder = maxRows[0].next_order;
    }

    const rows = await sql`
      INSERT INTO checklist_items (task_id, title, is_completed, sort_order)
      VALUES (${data.task_id}, ${data.title}, false, ${sortOrder})
      RETURNING *
    `;

    await logActivity(userId, "created", "checklist_item", rows[0].id, {
      task_id: data.task_id,
      title: data.title,
    });

    return res.status(201).json(rows[0]);
  } catch (err) {
    return handleError(err, res);
  }
}

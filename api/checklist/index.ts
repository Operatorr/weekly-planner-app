import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";
import { authenticateRequest } from "../_lib/auth";
import { parseBody, handleError } from "../_lib/validate";
import { addChecklistItemSchema } from "../_lib/schemas";
import { logActivity } from "../_lib/activity";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId } = await authenticateRequest(req);
    const data = parseBody(req, addChecklistItemSchema);
    const sql = neon(process.env.DATABASE_URL!);

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

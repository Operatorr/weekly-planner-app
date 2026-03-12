import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";
import { authenticateRequest } from "../../_lib/auth.js";
import { parseBody, handleError } from "../../_lib/validate.js";
import { completeTaskSchema } from "../../_lib/schemas.js";
import { logActivity } from "../../_lib/activity.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;
  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid task ID" });
  }

  try {
    const { userId } = await authenticateRequest(req);
    const data = parseBody(req, completeTaskSchema);
    const sql = neon(process.env.DATABASE_URL!);

    const rows = data.completed
      ? await sql`
          UPDATE tasks
          SET status = 'completed', completed_at = NOW(), updated_at = NOW()
          WHERE id = ${id} AND user_id = ${userId}
          RETURNING *, due_date::text AS due_date
        `
      : await sql`
          UPDATE tasks
          SET status = 'active', completed_at = NULL, updated_at = NOW()
          WHERE id = ${id} AND user_id = ${userId}
          RETURNING *, due_date::text AS due_date
        `;

    if (rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    const action = data.completed ? "completed" : "uncompleted";
    await logActivity(userId, action, "task", id, { title: rows[0].title });

    return res.status(200).json(rows[0]);
  } catch (err) {
    return handleError(err, res);
  }
}

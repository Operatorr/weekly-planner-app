import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";
import { authenticateRequest } from "../_lib/auth";
import { parseBody, handleError } from "../_lib/validate";
import { createTaskSchema } from "../_lib/schemas";
import { logActivity } from "../_lib/activity";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId } = await authenticateRequest(req);
    const data = parseBody(req, createTaskSchema);
    const sql = neon(process.env.DATABASE_URL!);

    // Verify the project belongs to the user
    const projects = await sql`
      SELECT id FROM projects WHERE id = ${data.project_id} AND user_id = ${userId}
    `;
    if (projects.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Determine sort_order if not provided
    let sortOrder = data.sort_order;
    if (sortOrder === undefined) {
      const maxRows = await sql`
        SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order
        FROM tasks WHERE user_id = ${userId} AND project_id = ${data.project_id}
      `;
      sortOrder = maxRows[0].next_order;
    }

    const rows = await sql`
      INSERT INTO tasks (user_id, project_id, title, description, due_date, sort_order, status)
      VALUES (${userId}, ${data.project_id}, ${data.title}, ${data.description ?? null}, ${data.due_date ?? null}, ${sortOrder}, 'active')
      RETURNING *
    `;

    const task = rows[0];
    await logActivity(userId, "created", "task", task.id, { title: data.title });

    return res.status(201).json(task);
  } catch (err) {
    return handleError(err, res);
  }
}

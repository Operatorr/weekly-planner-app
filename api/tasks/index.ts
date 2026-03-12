import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";
import { authenticateRequest } from "../_lib/auth.js";
import { parseBody, handleError } from "../_lib/validate.js";
import { createTaskSchema } from "../_lib/schemas.js";
import { logActivity } from "../_lib/activity.js";
import { cleanupOldCompletedTasks, cleanupOldActivity } from "../_lib/tier.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { userId } = await authenticateRequest(req);
    const sql = neon(process.env.DATABASE_URL!);

    // GET - Fetch all tasks for user
    if (req.method === "GET") {
      // Cleanup old completed tasks for free users (>7 days)
      await cleanupOldCompletedTasks(userId);
      await cleanupOldActivity(userId);

      const rows = await sql`
        SELECT *, due_date::text AS due_date FROM tasks
        WHERE user_id = ${userId}
        ORDER BY sort_order ASC, created_at DESC
      `;
      return res.status(200).json(rows);
    }

    // POST - Create new task
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const data = parseBody(req, createTaskSchema);

    // Verify the project belongs to the user (only if project_id is provided)
    if (data.project_id) {
      const projects = await sql`
        SELECT id FROM projects WHERE id = ${data.project_id} AND user_id = ${userId}
      `;
      if (projects.length === 0) {
        return res.status(404).json({ error: "Project not found" });
      }
    }

    // Determine sort_order if not provided
    let sortOrder = data.sort_order;
    if (sortOrder === undefined) {
      const projectId = data.project_id ?? null;
      const maxRows = projectId
        ? await sql`
            SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order
            FROM tasks
            WHERE user_id = ${userId} AND project_id = ${projectId}
          `
        : await sql`
            SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order
            FROM tasks
            WHERE user_id = ${userId} AND project_id IS NULL
          `;
      sortOrder = maxRows[0].next_order;
    }

    const rows = await sql`
      INSERT INTO tasks (user_id, project_id, title, description, due_date, is_someday, sort_order, status)
      VALUES (${userId}, ${data.project_id ?? null}, ${data.title}, ${data.description ?? ''}, ${data.due_date ?? null}, ${data.is_someday ?? false}, ${sortOrder}, 'active')
      RETURNING *, due_date::text AS due_date
    `;

    const task = rows[0];
    await logActivity(userId, "created", "task", task.id, { title: data.title });

    return res.status(201).json(task);
  } catch (err) {
    return handleError(err, res);
  }
}

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";
import { authenticateRequest } from "../_lib/auth";
import { parseBody, handleError } from "../_lib/validate";
import { updateProjectSchema } from "../_lib/schemas";
import { logActivity } from "../_lib/activity";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid project ID" });
  }

  try {
    const { userId } = await authenticateRequest(req);

    if (req.method === "PATCH") {
      const data = parseBody(req, updateProjectSchema);
      const sql = neon(process.env.DATABASE_URL!);

      const rows = await sql`
        UPDATE projects
        SET
          name = COALESCE(${data.name ?? null}, name),
          color = COALESCE(${data.color ?? null}, color),
          updated_at = NOW()
        WHERE id = ${id} AND user_id = ${userId}
        RETURNING *
      `;

      if (rows.length === 0) {
        return res.status(404).json({ error: "Project not found" });
      }

      await logActivity(userId, "updated", "project", id, data);
      return res.status(200).json(rows[0]);
    }

    if (req.method === "DELETE") {
      const sql = neon(process.env.DATABASE_URL!);

      // Block deletion of the default project
      const project = await sql`
        SELECT id, is_default, name FROM projects WHERE id = ${id} AND user_id = ${userId}
      `;

      if (project.length === 0) {
        return res.status(404).json({ error: "Project not found" });
      }

      if (project[0].is_default) {
        return res.status(400).json({ error: "Cannot delete the default project" });
      }

      // Cascade: batch delete checklist items + reminders for all tasks, then tasks, then project
      await sql`
        DELETE FROM checklist_items WHERE task_id IN (
          SELECT id FROM tasks WHERE project_id = ${id} AND user_id = ${userId}
        )
      `;
      await sql`
        DELETE FROM reminders WHERE task_id IN (
          SELECT id FROM tasks WHERE project_id = ${id} AND user_id = ${userId}
        )
      `;
      await sql`DELETE FROM tasks WHERE project_id = ${id} AND user_id = ${userId}`;
      await sql`DELETE FROM projects WHERE id = ${id} AND user_id = ${userId}`;

      await logActivity(userId, "deleted", "project", id, { name: project[0].name });
      return res.status(200).json({ success: true, id });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    return handleError(err, res);
  }
}

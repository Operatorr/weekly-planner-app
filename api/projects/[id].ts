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

      // Get the default project to reassign tasks to
      const defaultProject = await sql`
        SELECT id FROM projects WHERE user_id = ${userId} AND is_default = true
      `;

      if (defaultProject.length > 0) {
        // Reassign tasks to the default project instead of deleting them
        await sql`
          UPDATE tasks
          SET project_id = ${defaultProject[0].id}, updated_at = NOW()
          WHERE project_id = ${id} AND user_id = ${userId}
        `;
      }

      // Now delete the project (tasks are preserved)
      await sql`DELETE FROM projects WHERE id = ${id} AND user_id = ${userId}`;

      await logActivity(userId, "deleted", "project", id, { name: project[0].name });
      return res.status(200).json({ success: true, id });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    return handleError(err, res);
  }
}

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";
import { authenticateRequest } from "../_lib/auth.js";
import { parseBody, handleError } from "../_lib/validate.js";
import { updateChecklistItemSchema } from "../_lib/schemas.js";
import { logActivity } from "../_lib/activity.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid checklist item ID" });
  }

  try {
    const { userId } = await authenticateRequest(req);

    if (req.method === "PATCH") {
      const data = parseBody(req, updateChecklistItemSchema);
      const sql = neon(process.env.DATABASE_URL!);

      // Verify ownership via the parent task
      const rows = await sql`
        UPDATE checklist_items ci
        SET
          title = COALESCE(${data.title ?? null}, ci.title),
          is_completed = COALESCE(${data.is_completed ?? null}, ci.is_completed),
          sort_order = COALESCE(${data.sort_order ?? null}, ci.sort_order)
        FROM tasks t
        WHERE ci.id = ${id} AND ci.task_id = t.id AND t.user_id = ${userId}
        RETURNING ci.*
      `;

      if (rows.length === 0) {
        return res.status(404).json({ error: "Checklist item not found" });
      }

      await logActivity(userId, "updated", "checklist_item", id, data);
      return res.status(200).json(rows[0]);
    }

    if (req.method === "DELETE") {
      const sql = neon(process.env.DATABASE_URL!);

      // Verify ownership via the parent task
      const rows = await sql`
        DELETE FROM checklist_items ci
        USING tasks t
        WHERE ci.id = ${id} AND ci.task_id = t.id AND t.user_id = ${userId}
        RETURNING ci.id, ci.title
      `;

      if (rows.length === 0) {
        return res.status(404).json({ error: "Checklist item not found" });
      }

      await logActivity(userId, "deleted", "checklist_item", id, { title: rows[0].title });
      return res.status(200).json({ success: true, id });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    return handleError(err, res);
  }
}

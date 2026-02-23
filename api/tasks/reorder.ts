import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";
import { authenticateRequest } from "../_lib/auth";
import { parseBody, handleError } from "../_lib/validate";
import { reorderTasksSchema } from "../_lib/schemas";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId } = await authenticateRequest(req);
    const { tasks } = parseBody(req, reorderTasksSchema);
    const sql = neon(process.env.DATABASE_URL!);

    // Batch update sort_order for each task — scoped to this user
    for (const { id, sort_order } of tasks) {
      await sql`
        UPDATE tasks
        SET sort_order = ${sort_order}, updated_at = NOW()
        WHERE id = ${id} AND user_id = ${userId}
      `;
    }

    return res.status(200).json({ success: true, updated: tasks.length });
  } catch (err) {
    return handleError(err, res);
  }
}

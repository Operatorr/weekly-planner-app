import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";
import { authenticateRequest } from "../_lib/auth";
import { handleError } from "../_lib/validate";
import { logActivity } from "../_lib/activity";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;
  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid reminder ID" });
  }

  try {
    const { userId } = await authenticateRequest(req);
    const sql = neon(process.env.DATABASE_URL!);

    const rows = await sql`
      DELETE FROM reminders WHERE id = ${id} AND user_id = ${userId} RETURNING id, task_id
    `;

    if (rows.length === 0) {
      return res.status(404).json({ error: "Reminder not found" });
    }

    await logActivity(userId, "deleted", "reminder", id, { task_id: rows[0].task_id });
    return res.status(200).json({ success: true, id });
  } catch (err) {
    return handleError(err, res);
  }
}

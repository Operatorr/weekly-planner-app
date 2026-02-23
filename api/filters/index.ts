import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";
import { authenticateRequest } from "../_lib/auth";
import { parseBody, handleError } from "../_lib/validate";
import { createFilterViewSchema } from "../_lib/schemas";
import { logActivity } from "../_lib/activity";
import { checkFilterLimit } from "../_lib/tier";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId } = await authenticateRequest(req);
    const data = parseBody(req, createFilterViewSchema);
    const sql = neon(process.env.DATABASE_URL!);

    // Enforce tier limit
    const canCreate = await checkFilterLimit(userId);
    if (!canCreate) {
      return res.status(403).json({
        error: "Filter limit reached",
        message: "Upgrade to Pro for up to 150 saved filters.",
      });
    }

    const rows = await sql`
      INSERT INTO filter_views (user_id, name, config)
      VALUES (${userId}, ${data.name}, ${JSON.stringify(data.config)})
      RETURNING *
    `;

    await logActivity(userId, "created", "filter_view", rows[0].id, { name: data.name });

    return res.status(201).json(rows[0]);
  } catch (err) {
    return handleError(err, res);
  }
}

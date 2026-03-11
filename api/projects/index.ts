import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";
import { authenticateRequest } from "../_lib/auth.js";
import { parseBody, handleError } from "../_lib/validate.js";
import { createProjectSchema } from "../_lib/schemas.js";
import { logActivity } from "../_lib/activity.js";
import { checkProjectLimit } from "../_lib/tier.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { userId } = await authenticateRequest(req);
    const sql = neon(process.env.DATABASE_URL!);

    // GET - Fetch all projects for user
    if (req.method === "GET") {
      const rows = await sql`
        SELECT * FROM projects
        WHERE user_id = ${userId}
        ORDER BY sort_order ASC, created_at DESC
      `;
      return res.status(200).json(rows);
    }

    // POST - Create new project
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const data = parseBody(req, createProjectSchema);

    // Enforce tier limit
    const canCreate = await checkProjectLimit(userId);
    if (!canCreate) {
      return res.status(403).json({
        error: "Project limit reached",
        message: "Upgrade to Pro for up to 300 projects.",
      });
    }

    // Determine sort_order
    const maxRows = await sql`
      SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order
      FROM projects WHERE user_id = ${userId}
    `;

    const rows = await sql`
      INSERT INTO projects (user_id, name, color, sort_order, is_default)
      VALUES (${userId}, ${data.name}, ${data.color}, ${maxRows[0].next_order}, false)
      RETURNING *
    `;

    const project = rows[0];
    await logActivity(userId, "created", "project", project.id, { name: data.name });

    return res.status(201).json(project);
  } catch (err) {
    return handleError(err, res);
  }
}

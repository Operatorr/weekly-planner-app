import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";
import { authenticateRequest } from "../_lib/auth.js";
import { parseBody, handleError } from "../_lib/validate.js";
import { createFilterViewSchema, updateFilterViewSchema } from "../_lib/schemas.js";
import { logActivity } from "../_lib/activity.js";
import { checkFilterLimit } from "../_lib/tier.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { userId } = await authenticateRequest(req);
    const sql = neon(process.env.DATABASE_URL!);

    // GET - Fetch all saved filters for user
    if (req.method === "GET") {
      const rows = await sql`
        SELECT * FROM filter_views
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
      `;
      return res.status(200).json(rows);
    }

    // DELETE - Remove a saved filter
    if (req.method === "DELETE") {
      const id = req.query.id as string;
      if (!id) {
        return res.status(400).json({ error: "Missing filter id" });
      }
      const deleted = await sql`
        DELETE FROM filter_views
        WHERE id = ${id} AND user_id = ${userId}
        RETURNING id
      `;
      if (deleted.length === 0) {
        return res.status(404).json({ error: "Filter not found" });
      }
      await logActivity(userId, "deleted", "filter_view", id);
      return res.status(200).json({ success: true });
    }

    // PUT - Update an existing filter
    if (req.method === "PUT") {
      const id = req.query.id as string;
      if (!id) {
        return res.status(400).json({ error: "Missing filter id" });
      }
      const data = parseBody(req, updateFilterViewSchema);

      const setClauses: string[] = [];
      const values: unknown[] = [];

      if (data.name !== undefined) {
        setClauses.push("name");
        values.push(data.name);
      }
      if (data.config !== undefined) {
        setClauses.push("config");
        values.push(JSON.stringify(data.config));
      }

      if (setClauses.length === 0) {
        return res.status(400).json({ error: "No fields to update" });
      }

      // Build update dynamically based on provided fields
      let rows;
      if (data.name !== undefined && data.config !== undefined) {
        rows = await sql`
          UPDATE filter_views
          SET name = ${data.name}, config = ${JSON.stringify(data.config)}, updated_at = now()
          WHERE id = ${id} AND user_id = ${userId}
          RETURNING *
        `;
      } else if (data.name !== undefined) {
        rows = await sql`
          UPDATE filter_views
          SET name = ${data.name}, updated_at = now()
          WHERE id = ${id} AND user_id = ${userId}
          RETURNING *
        `;
      } else {
        rows = await sql`
          UPDATE filter_views
          SET config = ${JSON.stringify(data.config)}, updated_at = now()
          WHERE id = ${id} AND user_id = ${userId}
          RETURNING *
        `;
      }

      if (rows.length === 0) {
        return res.status(404).json({ error: "Filter not found" });
      }

      await logActivity(userId, "updated", "filter_view", id, { name: rows[0].name });
      return res.status(200).json(rows[0]);
    }

    // POST - Create new filter
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const data = parseBody(req, createFilterViewSchema);

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

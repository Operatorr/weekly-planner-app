import type { VercelRequest, VercelResponse } from "@vercel/node";
import { neon } from "@neondatabase/serverless";
import { authenticateRequest } from "../_lib/auth.js";
import { handleError } from "../_lib/validate.js";
import { getUserTier, getActivityCutoff } from "../_lib/tier.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId } = await authenticateRequest(req);
    const sql = neon(process.env.DATABASE_URL!);

    const tier = await getUserTier(userId);
    const cutoff = getActivityCutoff(tier);

    const limit = Math.min(Number(req.query.limit) || 50, 200);

    const rows = cutoff
      ? await sql`
          SELECT * FROM activity_log
          WHERE user_id = ${userId} AND created_at >= ${cutoff.toISOString()}
          ORDER BY created_at DESC
          LIMIT ${limit}
        `
      : await sql`
          SELECT * FROM activity_log
          WHERE user_id = ${userId}
          ORDER BY created_at DESC
          LIMIT ${limit}
        `;

    return res.status(200).json({
      entries: rows,
      tier,
      cutoff_date: cutoff?.toISOString() ?? null,
    });
  } catch (err) {
    return handleError(err, res);
  }
}

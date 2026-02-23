import { neon } from "@neondatabase/serverless";

/**
 * Returns a Neon SQL tagged-template function bound to DATABASE_URL.
 *
 * Usage:
 *   const sql = getDb();
 *   const rows = await sql`SELECT * FROM tasks WHERE user_id = ${userId}`;
 *
 * The @neondatabase/serverless HTTP driver sends one-shot queries over
 * HTTPS — no persistent connection pool needed, ideal for serverless
 * functions / Vercel API routes.
 */
export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add it to your .env / Vercel environment variables.",
    );
  }
  return neon(url);
}

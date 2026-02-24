import { neon } from "@neondatabase/serverless";

function getDb() {
  return neon(process.env.DATABASE_URL!);
}

export type UserTier = "free" | "pro";

export async function getUserTier(userId: string): Promise<UserTier> {
  const sql = getDb();
  const rows = await sql`SELECT tier FROM users WHERE id = ${userId}`;
  return (rows[0]?.tier as UserTier) ?? "free";
}

const TIER_LIMITS = {
  free: { projects: 1, filters: 1, activityDays: 7 },
  pro: { projects: 300, filters: 150, activityDays: Infinity },
} as const;

export async function checkProjectLimit(userId: string): Promise<boolean> {
  const sql = getDb();
  const tier = await getUserTier(userId);
  const limit = TIER_LIMITS[tier].projects;

  const rows = await sql`
    SELECT COUNT(*)::int AS count FROM projects WHERE user_id = ${userId}
  `;
  return rows[0].count < limit;
}

export async function checkFilterLimit(userId: string): Promise<boolean> {
  const sql = getDb();
  const tier = await getUserTier(userId);
  const limit = TIER_LIMITS[tier].filters;

  const rows = await sql`
    SELECT COUNT(*)::int AS count FROM filter_views WHERE user_id = ${userId}
  `;
  return rows[0].count < limit;
}

export function getActivityCutoff(tier: UserTier): Date | null {
  const days = TIER_LIMITS[tier].activityDays;
  if (!isFinite(days)) return null;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return cutoff;
}

export async function cleanupOldCompletedTasks(userId: string): Promise<number> {
  const sql = getDb();
  const tier = await getUserTier(userId);
  const cutoff = getActivityCutoff(tier);

  // Pro users have no cutoff (unlimited retention)
  if (cutoff === null) return 0;

  const result = await sql`
    DELETE FROM tasks
    WHERE user_id = ${userId}
      AND status = 'completed'
      AND completed_at IS NOT NULL
      AND completed_at < ${cutoff.toISOString()}
    RETURNING id
  `;

  return result.length;
}

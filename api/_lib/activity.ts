import { neon } from "@neondatabase/serverless";

function getDb() {
  return neon(process.env.DATABASE_URL!);
}

export type ActivityAction = "created" | "updated" | "completed" | "uncompleted" | "deleted";
export type EntityType = "task" | "project" | "checklist_item" | "reminder" | "filter_view";

export async function logActivity(
  userId: string,
  action: ActivityAction,
  entityType: EntityType,
  entityId: string,
  details?: Record<string, unknown>,
) {
  const sql = getDb();
  await sql`
    INSERT INTO activity_log (user_id, action, entity_type, entity_id, details)
    VALUES (${userId}, ${action}, ${entityType}, ${entityId}, ${JSON.stringify(details ?? {})})
  `;
}

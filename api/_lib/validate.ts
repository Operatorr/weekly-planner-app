import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { ZodSchema, ZodError } from "zod";

export function parseBody<T>(req: VercelRequest, schema: ZodSchema<T>): T {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    throw new ValidationError(result.error);
  }
  return result.data;
}

export class ValidationError extends Error {
  issues: ZodError["issues"];
  constructor(zodError: ZodError) {
    super("Validation failed");
    this.name = "ValidationError";
    this.issues = zodError.issues;
  }
}

export function handleError(err: unknown, res: VercelResponse) {
  if (err instanceof ValidationError) {
    return res.status(400).json({ error: "Validation failed", issues: err.issues });
  }

  if (err && typeof err === "object" && "name" in err) {
    const e = err as Error & { status?: number };
    if (e.name === "AuthError") {
      return res.status(e.status ?? 401).json({ error: e.message });
    }
  }

  console.error("Unhandled API error:", err);
  return res.status(500).json({ error: "Internal server error" });
}

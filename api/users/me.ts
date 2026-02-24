import type { VercelRequest, VercelResponse } from "@vercel/node";
import { authenticateRequest } from "../_lib/auth";
import { handleError } from "../_lib/validate";
import { getUserTier } from "../_lib/tier";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId } = await authenticateRequest(req);
    const tier = await getUserTier(userId);

    return res.status(200).json({ tier });
  } catch (err) {
    return handleError(err, res);
  }
}

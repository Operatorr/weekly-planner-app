import type { VercelRequest } from "@vercel/node";
import { verifyToken, createClerkClient } from "@clerk/backend";

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

export interface AuthUser {
  userId: string;
  email: string;
}

export async function authenticateRequest(
  req: VercelRequest,
): Promise<AuthUser> {
  const token =
    req.headers.authorization?.replace("Bearer ", "") ??
    req.cookies?.__session;

  if (!token) {
    throw new AuthError("Missing authentication token", 401);
  }

  try {
    const result = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });

    if ("error" in result || !("sub" in result)) {
      throw new Error("Token verification failed");
    }

    const userId = result.sub;
    const user = await clerk.users.getUser(userId);
    const email =
      user.emailAddresses.find(
        (e) => e.id === user.primaryEmailAddressId,
      )?.emailAddress ?? "";

    return { userId, email };
  } catch {
    throw new AuthError("Invalid or expired token", 401);
  }
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

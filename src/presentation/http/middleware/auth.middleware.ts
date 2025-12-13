/**
 * Authentication Middleware
 * 
 * Validates Better-Auth session and protects routes from unauthorized access.
 * Attaches session to context for downstream handlers.
 */
import type { Context, Next } from "hono";

import { auth } from "@/lib/auth";
import { HttpStatus } from "@/shared/constants/http-status";

/**
 * Requires valid session or returns 401
 * 
 * @example
 * app.get('/dashboard', requireAuth, handler);
 */
export const requireAuth = async (c: Context, next: Next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.json(
      {
        success: false,
        message: 'Unauthorized',
        statusCode: HttpStatus.UNAUTHORIZED,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.UNAUTHORIZED
    );
  }

  // Attach session to context
  c.set('session', session);
  await next();
};
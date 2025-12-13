/**
 * Request Logger Middleware
 * 
 * Logs HTTP requests/responses with correlation IDs for distributed tracing.
 * Apply to all routes in index.ts: `app.use('*', requestLogger)`
 * 
 * @example
 * // Access correlation ID in handlers
 * const correlationId = c.get('correlationId');
 */

import type { Context, Next } from 'hono';
import { logger } from '../../../infrastructure/logging/logger';

/**
 * Request logger middleware function
 * 
 * @param c - Hono context object
 * @param next - Next middleware/handler in the chain
 * 
 * @remarks
 * **Execution Flow:**
 * 1. Extract or generate correlation ID
 * 2. Store correlation ID in context (accessible in handlers)
 * 3. Log incoming request with metadata
 * 4. Execute downstream middleware/handlers
 * 5. Calculate request duration
 * 6. Log response with status and timing
 * 7. Add correlation ID to response headers
 */
export async function requestLogger(c: Context, next: Next) {
  const start = Date.now();
  const correlationId = c.req.header('x-correlation-id') || generateCorrelationId();
  
  // Store correlation ID in context for use in handlers/error handler
  c.set('correlationId', correlationId);

  // Log incoming request
  logger.info({
    type: 'request',
    method: c.req.method,
    path: c.req.path,
    query: c.req.query(),
    correlationId,
    ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
    userAgent: c.req.header('user-agent'),
  });

  // Execute the request
  await next();

  // Log response with duration
  const duration = Date.now() - start;
  
  logger.info({
    type: 'response',
    method: c.req.method,
    path: c.req.path,
    statusCode: c.res.status,
    duration: `${duration}ms`,
    correlationId,
  });

  // Add correlation ID to response headers for client tracking
  c.res.headers.set('x-correlation-id', correlationId);
}

/**
 * Generates unique correlation ID: `{timestamp}-{random}`
 */
function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}
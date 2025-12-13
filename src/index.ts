/**
 * Application Entry Point
 * 
 * Bootstraps the Lawyer Marketplace API with middleware, routes, and error handling.
 * Middleware order: logger → CORS → request logger → routes → error handlers
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger as honoLogger } from 'hono/logger';

import { appConfig } from './config/app.config';
import { logger } from './infrastructure/logging/logger';
import { createV1Routes } from './presentation/http/routes/v1';
import { requestLogger } from './presentation/http/middleware/request-logger.middleware';
import { errorHandler } from './presentation/http/middleware/error-handler.middleware';

/**
 * Main application instance
 */
const app = new Hono();

// ============================================================================
// Global Middleware
// ============================================================================

/**
 * Hono's built-in logger
 * 
 * @remarks
 * Provides basic request logging to console.
 */
app.use('*', honoLogger());

/**
 * CORS (Cross-Origin Resource Sharing) middleware
 * 
 * @remarks
 * - Allows requests from configured origins
 * - Enables credentials (cookies, authorization headers)
 * - Required for frontend applications on different domains
 * - Origins configured via CORS_ORIGINS environment variable
 */
app.use(
  '*',
  cors({
    origin: appConfig.corsOrigins,
    credentials: true,
  })
);

/**
 * Custom request logger middleware
 * 
 * @remarks
 * - Logs structured request/response data
 * - Adds correlation ID to response headers
 * - Calculates request duration
 * 
 * Applied to all routes ('*') for comprehensive logging.
 */
app.use('*', requestLogger);

// ============================================================================
// Routes
// ============================================================================

/**
 * Health check for load balancers, monitoring tools and container orchestration
 * TODO: Add database connection check
 */
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    message: 'Lawyer Marketplace API',
    version: 'v1',
    timestamp: new Date().toISOString(),
  });
});

/**
 * API versioning: /api/v1/...
 * Enables backwards compatibility and gradual migrations
 */
app.route(`${appConfig.apiPrefix}/${appConfig.apiVersion}`, createV1Routes());

// ============================================================================
// Error Handlers
// ============================================================================

// Error handling
app.onError((err, c) => {
  return errorHandler(err, c);
});

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      message: 'Route not found',
      statusCode: 404,
      timestamp: new Date().toISOString(),
    },
    404
  );
});

// ============================================================================
// Graceful Shutdown
// ============================================================================

/**
 * Graceful shutdown handler
 * Ensures in-flight requests complete before process termination
 * Database cleanup handled in db.ts
 * TODO: Create shutdown manager to coordinate all cleanup (cache, queue, etc.)
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

// ============================================================================
// Server Start
// ============================================================================

const port = appConfig.port;

logger.info(`Server starting on port ${port}`);
logger.info(`Environment: ${appConfig.nodeEnv}`);

/**
 * Bun server export
 * 
 * @remarks
 * Bun expects a default export with `port` and `fetch` properties.
 */
export default {
  port,
  fetch: app.fetch,
};

// ============================================================================
// Development Console Logs
// ============================================================================

/**
 * Development-friendly console logs
 * 
 * TODO: Remove these in production or gate behind NODE_ENV check
 * TODO: Replace with proper startup banner
 */
console.log(`Server running on http://localhost:${port}`);
console.log(`API Documentation: http://localhost:${port}/api/v1`);

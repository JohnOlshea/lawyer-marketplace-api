import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { auth } from './lib/auth';
import { createV1Routes } from './presentation/http/routes/v1';

/**
 * Main application instance
 */
const app = new Hono();

/**
 * Global middleware stack
 * Order matters: logger -> cors -> routes
 */
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  })
);

/**
 * API versioning strategy
 * Allows gradual migration and backwards compatibility
 */
app.route('/api/v1', createV1Routes());

/**
 * Authentication routes
 * Delegated to Better Auth for OAuth, session management, etc.
 */
app.on(['POST', 'GET'], '/api/auth/**', (c) => {
  return auth.handler(c.req.raw);
});

/**
 * Example protected route
 */
app.get('/api/protected', async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  return c.json({
    message: 'This is protected',
    user: session.user,
  });
});

/**
 * Health check endpoint
 * Used by load balancers, monitoring tools, and container orchestration
 */
app.get('/', (c) => {
  return c.json({
    status: 'healthy',
    message: 'Lawyer Marketplace API',
    version: 'v1',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Graceful shutdown handler
 * Ensures in-flight requests complete before process termination
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

const PORT = Number(process.env.PORT) || 3000;

export default {
  port: PORT,
  fetch: app.fetch,
};

console.log(`Server running on http://localhost:${PORT}`);
console.log(`API Documentation: http://localhost:${PORT}/api/v1`);

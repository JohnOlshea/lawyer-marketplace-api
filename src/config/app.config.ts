
// src/config/app.config.ts
/**
 * Application Configuration
 * Centralizes application-level settings with environment-based values.
 */

import { env } from './env';

/**
 * Application configuration object
 * 
 * @property {number} port - Server port number
 * @property {string} nodeEnv - Current environment (development/production/test)
 * @property {string} apiPrefix - Base prefix for all API routes
 * @property {string} apiVersion - API version identifier
 * @property {string[]} corsOrigins - Allowed CORS origins
 * @property {number} rateLimitWindowMs - Rate limiting time window in milliseconds
 * @property {number} rateLimitMax - Maximum requests allowed per rate limit window
 */
export const appConfig = {
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  apiPrefix: '/api',
  apiVersion: 'v1',
  corsOrigins: env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
  rateLimitMax: 100, // Max requests per window
} as const;

/**
 * Type-safe configuration access
 */
export type AppConfig = typeof appConfig;
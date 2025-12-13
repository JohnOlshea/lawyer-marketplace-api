/**
 * Authentication Configuration
 * Manages Better Auth settings including session and token expiry.
 */

import { env } from './env';

/**
 * Authentication configuration constants
 * 
 * @property {string} secret - Secret key for signing tokens (minimum 32 characters)
 * @property {string} baseURL - Base URL for authentication callbacks and redirects
 * @property {string[]} trustedOrigins - List of origins allowed for authentication requests
 * @property {number} sessionExpiry - Session expiration time in seconds
 * @property {number} tokenExpiry - Access token expiration time in seconds
 */
export const authConfig = {
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL || 'http://localhost:3000',
  trustedOrigins: env.TRUSTED_ORIGINS?.split(',') || ['http://localhost:3000'],
  sessionExpiry: 60 * 60 * 24 * 7, // 7 days in seconds
  tokenExpiry: 60 * 60 * 24, // 1 day in seconds
} as const;

/**
 * Type-safe authentication configuration
 */
export type AuthConfig = typeof authConfig;

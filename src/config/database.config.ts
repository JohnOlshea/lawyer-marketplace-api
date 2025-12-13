/**
 * Database Configuration
 * 
 * PostgreSQL connection pool configuration with production-ready defaults.
 * Optimized for connection reuse and graceful handling of connection failures.
 * 
 * @module config/database
 * 
 * @remarks
 * - Connection pooling improves performance by reusing database connections
 * - SSL is enforced in production environments
 * - Timeout values are tuned for typical API response times
 */

import { env } from './env';

/**
 * Database connection pool configuration
 * 
 * @property {string} connectionString - PostgreSQL connection URI
 * @property {boolean} ssl - Enable SSL/TLS for database connections
 * @property {number} max - Maximum number of clients in the connection pool
 * @property {number} idleTimeoutMillis - Time before idle client is closed
 * @property {number} connectionTimeoutMillis - Maximum wait time for new connections
 */
export const databaseConfig = {
  connectionString: env.DATABASE_URL,
  ssl: env.NODE_ENV === 'production',
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000, // 30 seconds
  connectionTimeoutMillis: 2000, // 2 seconds
} as const;

/**
 * Type-safe database configuration
 */
export type DatabaseConfig = typeof databaseConfig;
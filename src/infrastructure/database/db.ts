import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

import * as schema from './schema';

/**
 * PostgreSQL Connection Pool
 * 
 * @remarks
 * - Configures connection pooling for efficient database access
 * - Max 10 connections to prevent database overload
 * - 30s idle timeout to release unused connections
 * 
 * TODO: Move configuration to config/database.config.ts
 * TODO: Add connection retry logic for resilience
 * TODO: Add pool event listeners for monitoring (connect, error, remove)
 */
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // 10s timeout for acquiring connections
});

/**
 * Drizzle ORM Database Instance
 * 
 * @remarks
 * - Configured with snake_case mapping for PostgreSQL conventions
 * - Schema contains all table definitions and relations
 * - Type-safe queries through Drizzle's API
 */
export const db = drizzle(pool, { schema, casing: 'snake_case' });

/**
 * Graceful shutdown handler
 * Ensures all connections are properly closed before process exit
 */
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing database pool...');
  await pool.end();
  console.log('Database pool closed');
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing database pool...');
  await pool.end();
  console.log('Database pool closed');
  process.exit(0);
});
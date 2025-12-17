/**
 * Environment configuration type definitions.
 */

export type Environment = 'development' | 'production' | 'test';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/** PostgreSQL database connection configuration */
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl: boolean;
  max: number; // Maximum pool size
}

/** Authentication and authorization configuration */
export interface AuthConfig {
  secret: string;
  baseURL: string;
  trustedOrigins: string[];
  sessionExpiry: number; // in seconds
  tokenExpiry: number; // in seconds
}
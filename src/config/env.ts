/**
 * Environment Variables Validation
 * Validates all required environment variables at startup using Zod.
 * Application fails fast if required variables are missing or invalid.
 */

import { z } from 'zod';

/**
 * Environment variable schema definition
 * 
 * Defines validation rules and default values for all configuration.
 * 
 * @remarks
 * - NODE_ENV: Determines runtime behavior and feature flags
 * - DATABASE_URL: Must be a valid PostgreSQL connection string
 * - BETTER_AUTH_SECRET: Must be at least 32 characters for security
 * - Optional variables have sensible defaults for local development
 */
const envSchema = z.object({
  // Application Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  
  // Database Configuration
  DATABASE_URL: z
    .url()
    .describe('PostgreSQL connection string (postgres://...)'),
  
  // Authentication Configuration
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, 'Auth secret must be at least 32 characters for security')
    .describe('Secret key for signing authentication tokens'),
  
  BETTER_AUTH_URL: z
    .url()
    .optional()
    .describe('Base URL for authentication callbacks'),
  
  TRUSTED_ORIGINS: z
    .string()
    .optional()
    .describe('Comma-separated list of trusted authentication origins'),
  
  // CORS Configuration
  CORS_ORIGINS: z
    .string()
    .optional()
    .describe('Comma-separated list of allowed CORS origins'),
});

/**
 * Validated environment variables
 * 
 * @throws {Error} If validation fails, with detailed error messages
 */
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  console.error(JSON.stringify(parsed.error.flatten().fieldErrors, null, 2));
  throw new Error('Environment validation failed. Check your .env file.');
}

/**
 * Type-safe, validated environment variables
 * 
 * @example
 * ```typescript
 * // All properties are type-safe and validated
 * const port: number = env.PORT;
 * const dbUrl: string = env.DATABASE_URL;
 * ```
 */
export const env = parsed.data;

/**
 * Type definition for environment variables
 * 
 * @remarks
 * Automatically inferred from the Zod schema for maximum type safety
 */
export type Env = z.infer<typeof envSchema>;
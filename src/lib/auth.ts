import { betterAuth } from 'better-auth';
import { openAPI } from "better-auth/plugins";
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import { db } from '../infrastructure/database/db';
/**
 * Better Auth Configuration
 * 
 * Handles authentication and session management.
 * Uses Drizzle adapter with PostgreSQL.
 * 
 * TODO: Add OAuth providers (Google, GitHub)
 * TODO: Configure email verification flow
 */
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
  plugins: [ openAPI() ],
});
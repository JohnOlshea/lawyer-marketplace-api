/**
 * User Request Validation Middleware
 *
 * Validates incoming HTTP requests related to User operations.
 * Uses Zod schemas to enforce input correctness and return
 * structured field-level validation errors.
 */

import { z } from 'zod';
import type { Context, Next } from 'hono';
import { HttpStatus } from '../../../shared/constants/http-status';

/**
 * Update User Profile Schema
 *
 * Validates user-owned profile fields.
 * Client-owned fields are validated in client.validator.ts.
 */
const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  image: z.string().url('Invalid image URL').optional(),
});

/**
 * Ban User Schema
 *
 * Validates administrative ban actions.
 * - Reason must be meaningful (min length enforced)
 * - Expiry is optional (permanent ban if omitted)
 */
const banUserSchema = z.object({
  reason: z.string().min(10, 'Ban reason must be at least 10 characters'),
  expiresAt: z.string().datetime().optional(),
});

/**
 * Change User Role Schema
 *
 * Validates role transitions.
 * Restricted to system-defined roles only.
 */
const changeRoleSchema = z.object({
  role: z.enum(['admin', 'lawyer', 'client'], {
    message: 'Role must be one of: admin, lawyer, client',
  }),
});

/**
 * Generic Zod validation middleware.
 *
 * @remarks
 * - Parses and validates request body
 * - Returns structured field-level errors on validation failure
 * - Delegates unexpected errors to global error handler
 */
function validate(schema: z.ZodSchema) {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json();
      schema.parse(body);
      await next();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return c.json(
          {
            success: false,
            message: 'Validation failed',
            errors: error.issues.map((e) => ({
              path: e.path.join('.'),
              message: e.message,
            })),
            statusCode: HttpStatus.BAD_REQUEST,
            timestamp: new Date().toISOString(),
          },
          HttpStatus.BAD_REQUEST
        );
      }
      throw error;
    }
  };
}

export const validateUpdateProfile = validate(updateProfileSchema);
export const validateBanUser = validate(banUserSchema);
export const validateChangeRole = validate(changeRoleSchema);
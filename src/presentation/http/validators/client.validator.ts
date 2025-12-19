/**
 * Client Request Validation Middleware
 * Validates incoming HTTP requests using Zod schemas.
 * Returns detailed field-level errors on validation failure.
 */

import { z } from 'zod';
import type { Context, Next } from 'hono';
import { HttpStatus } from '@/shared/constants/http-status';

/**
 * Complete Onboarding Schema
 * Validates client onboarding payload.
 * Enforces 1-3 specializations and required location fields.
 */
const completeOnboardingSchema = z.object({
  phoneNumber: z.string().optional(),
  country: z.string().min(2, 'Country is required'),
  state: z.string().min(2, 'State is required'),
  company: z.string().optional(),
  specializationIds: z
    .array(z.string().uuid('Invalid specialization ID'))
    .min(1, 'At least one specialization is required')
    .max(3, 'Maximum 3 specializations allowed'),
});

/**
 * Update Profile Schema
 * Validates profile update requests with cross-field validation.
 * Country and state must be provided together due to Location VO constraints.
 */
const updateProfileSchema = z.object({
  // User table fields
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  image: z.string().url('Invalid image URL').optional(),

  // Client table fields
  phoneNumber: z.string().optional(),
  country: z.string().min(2, 'Country must be at least 2 characters').optional(),
  state: z.string().min(2, 'State must be at least 2 characters').optional(),
  company: z.string().optional(),
}).refine(
  (data) => {
    // If one of country/state is provided, both must be provided
    const hasCountry = data.country !== undefined;
    const hasState = data.state !== undefined;
    return (hasCountry && hasState) || (!hasCountry && !hasState);
  },
  {
    message: 'Both country and state must be provided together',
    path: ['country'],
  }
);

/**
 * Generic Zod validation middleware.
 * Returns structured field-level errors on validation failure.
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
            errors: error.issues.map((issue) => ({
              path: issue.path.join('.'),
              message: issue.message,
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

export type CompleteOnboardingRequest = z.infer<typeof completeOnboardingSchema>;

export const validateCompleteOnboarding = validate(completeOnboardingSchema);
export const validateUpdateProfile = validate(updateProfileSchema);

/**
 * Client Request Validation Middleware
 * Validates incoming HTTP requests using Zod schemas.
 * Returns detailed field-level errors on validation failure.
 */

import { z } from 'zod';
import type { Context, Next } from 'hono';
import { HttpStatus } from '@/shared/constants/http-status';

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

export type CompleteOnboardingRequest = z.infer<typeof completeOnboardingSchema>;

/**
 * Validates complete onboarding request body
 * Returns 400 with field errors if validation fails
 */
export const validateCompleteOnboarding = async (
  c: Context,
  next: Next
): Promise<Response | void> => {
  try {
    const body = await c.req.json();
    completeOnboardingSchema.parse(body);
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
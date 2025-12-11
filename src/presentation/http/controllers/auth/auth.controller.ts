import type { Context } from 'hono';
import { auth } from '@/lib/auth';
import { HttpStatus } from '@/shared/constants/http-status';
import type { CompleteOnboardingUseCase } from '@/application/client/use-cases/complete-onboarding/complete-onboarding.use-case';

/**
 * Authentication Controller
 * 
 * Handles HTTP requests related to authentication and onboarding workflows.
 * Acts as the adapter between the HTTP layer (Hono) and the application layer.
 * 
 * 
 * @responsibilities
 * - Session validation via Better-Auth
 * - Request/response transformation (HTTP ↔ DTOs)
 * - Error handling and HTTP status code mapping
 * - Authorization checks
 */
export class AuthController {
  constructor(private readonly completeOnboardingUseCase: CompleteOnboardingUseCase) {}

  /**
   * Complete client onboarding
   * 
   * POST /api/v1/onboarding/complete
   * 
   * @remarks
   * This endpoint finalizes the client profile creation after initial
   * authentication.
   * 
   * @requires Authentication - Valid Better-Auth session
   * @body phoneNumber (optional), country, state, company (optional), specializationIds
   * 
   * @returns 201 - Onboarding completed successfully
   * @returns 400 - Validation error or business rule violation
   * @returns 401 - No valid session found
   * @returns 409 - Client profile already exists
   * 
   * @example
   * ```bash
   * curl -X POST /api/v1/onboarding/complete \
   *   -H "Cookie: session=..." \
   *   -d '{"country":"US","state":"CA","specializationIds":["corp-law"]}'
   * ```
   */
  async completeOnboarding(c: Context) {
    try {
      // Get authenticated user from Better-Auth session
      const session = await auth.api.getSession({ headers: c.req.raw.headers });

      if (!session) {
        return c.json(
          {
            success: false,
            message: 'Unauthorized',
            statusCode: HttpStatus.UNAUTHORIZED,
            timestamp: new Date().toISOString(),
          },
          HttpStatus.UNAUTHORIZED
        );
      }

      // Extract and validate request body
      const body = await c.req.json();

      // Execute use case with merged session + body data
      const result = await this.completeOnboardingUseCase.execute({
        userId: session.user.id,
        email: session.user.email,
        name: session.user.name,
        phoneNumber: body.phoneNumber,
        country: body.country,
        state: body.state,
        company: body.company,
        specializationIds: body.specializationIds,
      });

      return c.json(
        {
          success: true,
          message: 'Onboarding completed successfully',
          data: result,
          statusCode: HttpStatus.CREATED,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.CREATED
      );
    } catch (error: any) {
      return c.json(
        {
          success: false,
          message: error.message || 'Failed to complete onboarding',
          statusCode: HttpStatus.BAD_REQUEST,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.BAD_REQUEST
      );
    }
  }
}

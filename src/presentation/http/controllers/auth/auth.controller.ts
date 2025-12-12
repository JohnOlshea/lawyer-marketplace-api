import type { Context } from 'hono';
import { auth } from '@/lib/auth';
import { HttpStatus } from '@/shared/constants/http-status';
import type { CompleteOnboardingUseCase } from '@/application/client/use-cases/complete-onboarding/complete-onboarding.use-case';
import { ApiResponse } from '../../dto/client/common/api-response.dto';
import { OnboardingResponseDto } from '../../dto/client/onboarding-response.dto';

/**
 * Authentication Controller
 * 
 * Handles HTTP requests related to authentication and onboarding workflows.
 * Acts as the adapter between the HTTP layer (Hono) and the application layer.
 * 
 * 
 * @responsibilities
 * - Session validation via Better-Auth middleware
 * - Request/response transformation (HTTP ↔ DTOs)
 * - Error handling and HTTP status code mapping
 * - Authorization checks
 */
export class AuthController {
  constructor(private readonly completeOnboardingUseCase: CompleteOnboardingUseCase) { }

  /**
   * Complete client onboarding
   * 
   * POST /api/v1/onboarding/complete
   * 
   * @remarks
   * This endpoint finalizes the client profile creation after initial authentication.
   * 
   * @requires Authentication - Valid Better-Auth session
   * @requires Email verification - User must have verified email
   * 
   * @body phoneNumber (optional), country, state, company (optional), specializationIds
   * 
   * @returns 201 - Onboarding completed successfully
   * @returns 400 - Validation error or business rule violation
   * @returns 401 - No valid session found
   * @returns 409 - Client profile already exists
   * 
   */
  async completeOnboarding(c: Context) {
      // Session validated and attached by authentication middleware
      const session = c.get('session');

      // Extract request body
      const body = await c.req.json();

      const correlationId = c.get('correlationId'); // From middleware

      // Execute use case with merged session + body data
      // Domain exceptions bubble up to global error handler
      const result = await this.completeOnboardingUseCase.execute({
        userId: session.user.id,
        name: session.user.name,
        emailVerified: session.user.emailVerified,
        phoneNumber: body.phoneNumber,
        country: body.country,
        state: body.state,
        company: body.company,
        specializationIds: body.specializationIds,
      });

      // Transform domain result to presentation DTO
      const response = ApiResponse.success(
        OnboardingResponseDto.fromResult(result),
        'Onboarding completed successfully',
        HttpStatus.CREATED,
        correlationId
      );

      return c.json(response, HttpStatus.CREATED);
  }
}

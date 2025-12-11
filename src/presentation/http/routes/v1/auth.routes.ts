import { Hono } from 'hono';
import { AuthController } from '../../controllers/auth/auth.controller';
import { CompleteOnboardingUseCase } from '@/application/client/use-cases/complete-onboarding/complete-onboarding.use-case';
import { DrizzleClientRepository } from '@/infrastructure/database/repositories/client/drizzle-client.repository';
import { ClientDomainService } from '@/domain/client/services/client-domain.service';

/**
 * Authentication Routes Factory
 * 
 * Configures all authentication and onboarding-related endpoints.
 * Follows manual dependency injection pattern until DI container is configured.
 * 
 * @remarks
 * Better-Auth handles core auth flows (sign up, sign in, OAuth, etc.) via
 * its own routes mounted at /api/auth/**.
 * 
 * TODO: Migrate to DI container For better testability
 * TODO: Integrate Better-Auth route mounting in this factory
 * 
 * @returns Hono app instance with auth routes mounted
 */
export function createAuthRoutes() {
  const app = new Hono();

  // Composition Root: Wire dependencies from outer layers inward
  // Infrastructure → Domain → Application → Presentation
  const clientRepository = new DrizzleClientRepository();
  const clientDomainService = new ClientDomainService(
    clientRepository,
  );
  const completeOnboardingUseCase = new CompleteOnboardingUseCase(
    clientRepository,
    clientDomainService
  );
  const authController = new AuthController(completeOnboardingUseCase);

  /**
   * POST /api/v1/onboarding/complete
   * Complete client onboarding after authentication
   * 
   * @requires Authentication - Valid Better-Auth session
   * @body phoneNumber (optional), country, state, company (optional), specializationIds
   * @returns 201 - Onboarding completed with client profile data
   * @returns 400 - Validation error
   * @returns 401 - No valid session
   * @returns 409 - Profile already exists
   * 
   * @example Request
   * ```json
   * {
   *   "phoneNumber": "+1234567890",
   *   "country": "US",
   *   "state": "CA",
   *   "company": "Acme Legal",
   *   "specializationIds": ["corp-law", "contract-law"]
   * }
   * ```
   * 
   * @example Response
   * ```json
   * {
   *   "success": true,
   *   "message": "Onboarding completed successfully",
   *   "data": {
   *     "clientId": "uuid-...",
   *     "userId": "auth-user-123",
   *     "specializationCount": 2,
   *     "onboardingCompleted": true
   *   }
   * }
   * ```
   */
  app.post('/onboarding/complete', (c) =>
    authController.completeOnboarding(c)
  );

  return app;
}

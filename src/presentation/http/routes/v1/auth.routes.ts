/**
 * Authentication Routes Configuration
 * 
 * Integrates Better-Auth for core authentication with custom onboarding logic.
 * Uses manual dependency injection until DI container is configured.
 */

import { Hono } from 'hono';
import { auth } from '@/lib/auth';
import { requireAuth } from '../../middleware/auth.middleware';
import { AuthController } from '../../controllers/auth/auth.controller';
import { validateCompleteOnboarding } from '../../validators/client.validator';
import { ClientDomainService } from '@/domain/client/services/client-domain.service';
import { DrizzleClientRepository } from '@/infrastructure/database/repositories/client/drizzle-client.repository';
import { CompleteOnboardingUseCase } from '@/application/client/use-cases/complete-onboarding/complete-onboarding.use-case';
import { DrizzleSpecializationRepository } from '@/infrastructure/database/repositories/specialization/drizzle-specialization.repository';

/**
 * Creates authentication routes with dependency injection
 * 
 * @returns Configured Hono app with auth routes
 * 
 * @todo Migrate to DI container for better testability
 */
export function createAuthRoutes(): Hono {
  const app = new Hono();

  // Initialize dependencies (manual DI)
  const clientRepository = new DrizzleClientRepository();
  const specializationRepository = new DrizzleSpecializationRepository();
  const clientDomainService = new ClientDomainService(
    clientRepository,
    specializationRepository
  );
  const completeOnboardingUseCase = new CompleteOnboardingUseCase(
    clientRepository,
    clientDomainService
  );
  const authController = new AuthController(completeOnboardingUseCase);

  /**
   * Better-Auth handler
   * Provides: sign-up, sign-in, sign-out, session, verify-email, OAuth flows
   */
  app.on(['POST', 'GET'], '/auth/**', (c) => {
    return auth.handler(c.req.raw);
  });

  /**
   * POST /onboarding/complete
   * Complete client profile after authentication
   * 
   * @requires Authentication - Valid Better-Auth session
   * @body phoneNumber?, country, state, company?, specializationIds (1-3 UUIDs)
   * @returns 201 - Profile created
   * @returns 400 - Validation error
   * @returns 401 - Unauthorized
   * @returns 409 - Profile already exists
   */
  app.post(
    '/onboarding/complete',
    requireAuth,
    validateCompleteOnboarding,
    (c) => authController.completeOnboarding(c)
  );

  return app;
}
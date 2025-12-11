// src/presentation/http/routes/v1/auth.routes.ts

import { Hono } from 'hono';
import { AuthController } from '../../controllers/auth/auth.controller';
import { CompleteOnboardingUseCase } from '@/application/client/use-cases/complete-onboarding/complete-onboarding.use-case';
import { DrizzleClientRepository } from '@/infrastructure/database/repositories/client/drizzle-client.repository';
import { ClientDomainService } from '@/domain/client/services/client-domain.service';

export function createAuthRoutes() {
  const app = new Hono();

  const clientRepository = new DrizzleClientRepository();
  const clientDomainService = new ClientDomainService(
    clientRepository,
  );
  const completeOnboardingUseCase = new CompleteOnboardingUseCase(
    clientRepository,
    clientDomainService
  );
  const authController = new AuthController(completeOnboardingUseCase);

  // Custom endpoint: Complete client onboarding
  app.post('/onboarding/complete', (c) =>
    authController.completeOnboarding(c)
  );

  return app;
}

import type { Context } from 'hono';
import { auth } from '@/lib/auth';
import { HttpStatus } from '@/shared/constants/http-status';
import type { CompleteOnboardingUseCase } from '@/application/client/use-cases/complete-onboarding/complete-onboarding.use-case';

export class AuthController {
  constructor(private readonly completeOnboardingUseCase: CompleteOnboardingUseCase) {}

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

      const body = await c.req.json();

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

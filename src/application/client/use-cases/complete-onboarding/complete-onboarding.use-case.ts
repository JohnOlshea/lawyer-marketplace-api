import type { IClientRepository } from '../../../../domain/client/repositories/client.repository.interface';
import { ClientDomainService } from '../../../../domain/client/services/client-domain.service';
import { Client } from '../../../../domain/client/entities/client.entity';
import { Email } from '../../../../domain/client/value-objects/email.vo';
import { Location } from '../../../../domain/client/value-objects/location.vo';
import type { CompleteOnboardingDto } from './complete-onboarding.dto';
import { IdGenerator } from '../../../../shared/utils/id-generator';
import { ValidationException } from '../../../../domain/shared/errors/validation.exception';

/**
 * Result object returned after successful onboarding completion
 */
export interface CompleteOnboardingResult {
  clientId: string;
  userId: string;
  specializationCount: number;
  onboardingCompleted: boolean;
}

/**
 * Complete Onboarding Use Case
 * 
 * Orchestrates the client profile creation and onboarding completion process.
 * 
 * @responsibilities
 * - Validates specialization selection constraints (1-3 items)
 * - Ensures no duplicate client profiles per user
 * - Creates immutable value objects for email and location
 * - Delegates domain validation to ClientDomainService
 * - Persists the client aggregate through the repository
 * 
 * @throws {ValidationException} When specialization count is invalid
 * @throws {ClientAlreadyExistsError} When user already has a client profile
 * 
 * @example
 * ```typescript
 * const result = await completeOnboardingUseCase.execute({
 *   userId: 'auth-user-123',
 *   email: 'john@example.com',
 *   name: 'John Doe',
 *   country: 'US',
 *   state: 'CA',
 *   specializationIds: ['corp-law', 'contract-law']
 * });
 * ```
 */
export class CompleteOnboardingUseCase {
  constructor(
    private readonly clientRepository: IClientRepository,
    private readonly clientDomainService: ClientDomainService
  ) {}

  async execute(dto: CompleteOnboardingDto): Promise<CompleteOnboardingResult> {
    const { userId, email, name, phoneNumber, country, state, company, specializationIds } = dto;

    // Business rule: Prevent duplicate client profiles for the same user
    await this.clientDomainService.ensureClientDoesNotExist(userId);

    // Business rule: Validate specializations (1-3 required)
    if (specializationIds.length === 0 || specializationIds.length > 3) {
      throw new ValidationException('You must select between 1 and 3 specializations');
    }

    // Create immutable value objects with built-in validation
    const emailVo = Email.create(email);
    const locationVo = Location.create({country, state});

    // Create client aggregate with initial state
    const client = Client.create(
      IdGenerator.generate(),
      {
        userId,
        email: emailVo,
        name,
        phoneNumber,
        location: locationVo,
        company,
        specializationIds,
        onboardingCompleted: false,
      }
    );

    // Domain operation: Mark onboarding as complete
    client.completeOnboarding();

    // Persist the aggregate to the data store
    const savedClient = await this.clientRepository.save(client);

    // Return result object for presentation layer consumption
    return {
      clientId: savedClient.id,
      userId: savedClient.userId,
      specializationCount: savedClient.specializationIds.length,
      onboardingCompleted: savedClient.onboardingCompleted,
    };
  }
}
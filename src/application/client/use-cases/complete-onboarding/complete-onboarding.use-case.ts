import { IdGenerator } from '@/shared/utils/id-generator';
import { Client } from '@/domain/client/entities/client.entity';
import { Location } from '@/domain/client/value-objects/location.vo';
import type { CompleteOnboardingDto } from './complete-onboarding.dto';
import { UnauthorizedException } from '@/domain/shared/errors/unauthorized.exception';
import type { ClientDomainService } from '@/domain/client/services/client-domain.service';
import type { IClientRepository } from '@/domain/client/repositories/client.repository.interface';

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
 * - Validates email verification status before allowing onboarding
 * - Ensures no duplicate client profiles per user
 * - Validates specialization selection constraints (1-3 items)
 * - Creates immutable value objects for location
 * - Delegates domain validation to ClientDomainService
 * - Persists the client aggregate through the repository
 * 
 * @throws {UnauthorizedException} When email is not verified
 * @throws {ClientAlreadyExistsError} When user already has a client profile
 * @throws {ValidationException} When specialization IDs are invalid
 */
export class CompleteOnboardingUseCase {
  constructor(
    private readonly clientRepository: IClientRepository,
    private readonly clientDomainService: ClientDomainService
  ) {}

  async execute(dto: CompleteOnboardingDto): Promise<CompleteOnboardingResult> {
    const { userId, name, phoneNumber, country, state, company, specializationIds, emailVerified } = dto;

    // Guard: Email must be verified before onboarding
    if (!emailVerified) {
      throw new UnauthorizedException('Email verification required. Please verify your email before completing onboarding.');
    }

    // Step 1: Business rule: Prevent duplicate client profiles for the same user
    await this.clientDomainService.ensureClientDoesNotExist(userId);

    // Step 2: Validate that specialization IDs exist in database
    await this.clientDomainService.validateSpecializations(specializationIds);

    // Step 3: Create immutable value objects with built-in validation
    const locationVo = Location.create({country, state});

    // Step 4: Create client aggregate with initial state
    const client = Client.create(
      IdGenerator.generate(),
      {
        userId,
        name,
        phoneNumber,
        location: locationVo,
        company,
        specializationIds,
        onboardingCompleted: false,
      }
    );

     // Step 5: Domain operation: Mark onboarding as complete
    client.completeOnboarding();

    // Step 6: Persist the aggregate to the data store
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
import type { IClientRepository } from '../../../../domain/client/repositories/client.repository.interface';
import { ClientDomainService } from '../../../../domain/client/services/client-domain.service';
import { Client } from '../../../../domain/client/entities/client.entity';
import { Email } from '../../../../domain/client/value-objects/email.vo';
import { Location } from '../../../../domain/client/value-objects/location.vo';
import type { CompleteOnboardingDto } from './complete-onboarding.dto';
import { IdGenerator } from '../../../../shared/utils/id-generator';
import { ValidationException } from '../../../../domain/shared/errors/validation.exception';

export interface CompleteOnboardingResult {
  clientId: string;
  userId: string;
  specializationCount: number;
  onboardingCompleted: boolean;
}

export class CompleteOnboardingUseCase {
  constructor(
    private readonly clientRepository: IClientRepository,
    private readonly clientDomainService: ClientDomainService
  ) {}

  async execute(dto: CompleteOnboardingDto): Promise<CompleteOnboardingResult> {
    const { userId, email, name, phoneNumber, country, state, company, specializationIds } = dto;

    // Ensure client doesn't already exist
    await this.clientDomainService.ensureClientDoesNotExist(userId);

    // Validate specializations (1-3 required)
    if (specializationIds.length === 0 || specializationIds.length > 3) {
      throw new ValidationException('You must select between 1 and 3 specializations');
    }

    // Create value objects
    const emailVo = Email.create(email);
    const locationVo = Location.create({country, state});

    // Create client entity
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

    // Complete onboarding
    client.completeOnboarding();

    // Persist
    const savedClient = await this.clientRepository.save(client);

    return {
      clientId: savedClient.id,
      userId: savedClient.userId,
      specializationCount: savedClient.specializationIds.length,
      onboardingCompleted: savedClient.onboardingCompleted,
    };
  }
}
import { Client } from '../entities/client.entity';
import type { IClientRepository } from '../repositories/client.repository.interface';
import { ClientAlreadyExistsError } from '../errors/client-already-exists.error';
import { ValidationException } from '@/domain/shared/errors/validation.exception';
import type { ISpecializationRepository } from '@/domain/specialization/repositories/specialization.repository.interface';

/**
 * Client Domain Service
 * 
 * Encapsulates domain logic that doesn't naturally fit within a single entity.
 * Domain services operate on multiple aggregates or enforce cross-entity business rules.
 * 
 * @remarks
 * Use domain services sparingly - most logic should live in entities.
 * 
 * @responsibilities
 * - Enforce uniqueness constraints across the client aggregate
 * - Validate complex business rules involving multiple domain concepts
 * - Coordinate operations that span multiple entities
 * 
 */
export class ClientDomainService {
  constructor(
    private readonly clientRepository: IClientRepository,
    private readonly specializationRepository: ISpecializationRepository
  ) {}

  /**
   * Ensures no existing client profile for the given user
   * 
   * @remarks
   * Business rule: Each user account can have exactly ONE client profile.
   * 
   * @param userId - The Better-Auth user identifier
   * @throws {ClientAlreadyExistsError} When profile already exists
   * 
   */
  async ensureClientDoesNotExist(userId: string): Promise<void> {
    const existingClient = await this.clientRepository.findByUserId(userId);

    if (existingClient) {
      throw new ClientAlreadyExistsError('Client profile already exists for this user');
    }
  }

  /**
   * Validates that all provided specialization IDs exist in the database
   * 
   * @param specializationIds - Array of specialization IDs to validate
   * @throws {ValidationException} When any specialization ID is invalid
   */
  async validateSpecializations(specializationIds: string[]): Promise<void> {
    // Check if all specialization IDs exist in database
    const existingSpecs = await this.specializationRepository.findByIds(specializationIds);
    
    if (existingSpecs.length !== specializationIds.length) {
      const foundIds = existingSpecs.map(s => s.id);
      const invalidIds = specializationIds.filter(id => !foundIds.includes(id));
      
      throw new ValidationException(
        `Invalid specialization IDs: ${invalidIds.join(', ')}`
      );
    }
  }

  /**
   * Validates if a client can complete onboarding
   * 
   * @remarks
   * Onboarding completion requires:
   * - At least 1 specialization selected
   * - No more than 3 specializations
   * - Valid location information
   * 
   * @param client - The client entity to validate
   * @returns true if all requirements are met, false otherwise
   */
  canCompleteOnboarding(client: Client): boolean {
    const MIN_SPECIALIZATIONS = 1;
    const MAX_SPECIALIZATIONS = 3;

    return (
      client.specializationIds.length >= MIN_SPECIALIZATIONS &&
      client.specializationIds.length <= MAX_SPECIALIZATIONS &&
      !!client.location // Ensures location is not null/undefined
    );
  }
}

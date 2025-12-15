import { describe, it, expect, beforeEach } from 'bun:test';

import { Client } from '@/domain/client/entities/client.entity';
import { Location } from '@/domain/client/value-objects/location.vo';
import { ValidationException } from '@/domain/shared/errors/validation.exception';
import { ClientDomainService } from '@/domain/client/services/client-domain.service';
import type { Specialization } from '@/domain/specialization/entities/specialization.entity';
import { ClientAlreadyExistsError } from '@/domain/client/errors/client-already-exists.error';
import type { IClientRepository } from '@/domain/client/repositories/client.repository.interface';
import { CompleteOnboardingUseCase } from '@/application/client/use-cases/complete-onboarding/complete-onboarding.use-case';
import type { ISpecializationRepository } from '@/domain/specialization/repositories/specialization.repository.interface';

describe('CompleteOnboardingUseCase', () => {
  let useCase: CompleteOnboardingUseCase;
  let mockClientRepository: MockClientRepository;
  let mockSpecializationRepository: MockSpecializationRepository;
  let mockDomainService: MockClientDomainService;

  beforeEach(() => {
    mockClientRepository = new MockClientRepository();
    mockSpecializationRepository = new MockSpecializationRepository();
    mockDomainService = new MockClientDomainService(
      mockClientRepository,
      mockSpecializationRepository
    );
    useCase = new CompleteOnboardingUseCase(mockClientRepository, mockDomainService);
  });

  describe('execute', () => {
    it('should successfully complete onboarding with valid data', async () => {
      // Arrange
      const dto = {
        userId: 'user-123',
        name: 'John Doe',
        phoneNumber: '+1234567890',
        country: 'United States',
        state: 'California',
        company: 'Tech Corp',
        specializationIds: ['spec-1', 'spec-2'],
        emailVerified: true,
      };

      mockClientRepository.findByUserIdResponse = null;
      mockSpecializationRepository.findByIdsResponse = [
        createMockSpecialization('spec-1', 'Corporate Law'),
        createMockSpecialization('spec-2', 'Tax Law'),
      ];
      // Don't set saveResponse - let it return the actual client passed to save()

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result).toBeDefined();
      expect(result.userId).toBe(dto.userId);
      expect(result.specializationCount).toBe(2);
      expect(result.onboardingCompleted).toBe(true);
      expect(mockClientRepository.saveCalled).toBe(true);
    });

    it('should throw ClientAlreadyExistsError if client already exists', async () => {
      // Arrange
      const dto = {
        userId: 'user-123',
        name: 'John Doe',
        country: 'United States',
        state: 'California',
        specializationIds: ['spec-1'],
        emailVerified: true,
      };

      mockClientRepository.findByUserIdResponse = createMockClient(dto);

      // Act & Assert
      expect(async () => {
        await useCase.execute(dto);
      }).toThrow(ClientAlreadyExistsError);
    });

    it('should throw ValidationException if no specializations provided', async () => {
      // Arrange
      const dto = {
        userId: 'user-123',
        name: 'John Doe',
        country: 'United States',
        state: 'California',
        specializationIds: [],
        emailVerified: true,
      };

      mockClientRepository.findByUserIdResponse = null;

      // Act & Assert
      expect(async () => {
        await useCase.execute(dto);
      }).toThrow(ValidationException);
    });

    it('should throw ValidationException if more than 3 specializations provided', async () => {
      // Arrange
      const dto = {
        userId: 'user-123',
        name: 'John Doe',
        country: 'United States',
        state: 'California',
        specializationIds: ['spec-1', 'spec-2', 'spec-3', 'spec-4'],
        emailVerified: true,
      };

      mockClientRepository.findByUserIdResponse = null;

      // Act & Assert
      expect(async () => {
        await useCase.execute(dto);
      }).toThrow(ValidationException);
    });

    it('should throw ValidationException if invalid specialization IDs', async () => {
      // Arrange
      const dto = {
        userId: 'user-123',
        name: 'John Doe',
        country: 'United States',
        state: 'California',
        specializationIds: ['spec-1', 'invalid-spec'],
        emailVerified: true,
      };

      mockClientRepository.findByUserIdResponse = null;
      mockSpecializationRepository.findByIdsResponse = [
        createMockSpecialization('spec-1', 'Corporate Law'),
      ];

      // Act & Assert
      expect(async () => {
        await useCase.execute(dto);
      }).toThrow(ValidationException);
    });

    it('should throw ValidationException if name is too short', async () => {
      // Arrange
      const dto = {
        userId: 'user-123',
        name: 'J',
        country: 'United States',
        state: 'California',
        specializationIds: ['spec-1'],
        emailVerified: true,
      };

      mockClientRepository.findByUserIdResponse = null;

      // Act & Assert
      expect(async () => {
        await useCase.execute(dto);
      }).toThrow(ValidationException);
    });

    it('should handle optional company field', async () => {
      // Arrange
      const dto = {
        userId: 'user-123',
        name: 'John Doe',
        country: 'United States',
        state: 'California',
        specializationIds: ['spec-1'],
        emailVerified: true,
      };

      mockClientRepository.findByUserIdResponse = null;
      mockSpecializationRepository.findByIdsResponse = [
        createMockSpecialization('spec-1', 'Corporate Law'),
      ];

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result).toBeDefined();
      expect(result.onboardingCompleted).toBe(true);
    });

    it('should handle optional phoneNumber field', async () => {
      // Arrange
      const dto = {
        userId: 'user-123',
        name: 'John Doe',
        country: 'United States',
        state: 'California',
        specializationIds: ['spec-1'],
        emailVerified: true,
      };

      mockClientRepository.findByUserIdResponse = null;
      mockSpecializationRepository.findByIdsResponse = [
        createMockSpecialization('spec-1', 'Corporate Law'),
      ];

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result).toBeDefined();
      expect(result.onboardingCompleted).toBe(true);
    });
  });
});

// Mock Client Repository
class MockClientRepository implements IClientRepository {
  findByUserIdResponse: Client | null = null;
  saveResponse: Client | null = null;
  saveCalled = false;

  async findById(id: string): Promise<Client | null> {
    return null;
  }

  async findByUserId(userId: string): Promise<Client | null> {
    return this.findByUserIdResponse;
  }

  async findAll(): Promise<Client[]> {
    return [];
  }

  async existsByUserId(userId: string): Promise<boolean> {
    return this.findByUserIdResponse !== null;
  }

  async save(client: Client): Promise<Client> {
    this.saveCalled = true;
    return this.saveResponse || client;
  }

  async update(client: Client): Promise<Client> {
    return client;
  }

  async delete(id: string): Promise<void> {
    // Mock implementation
  }
}

// Mock Specialization Repository
class MockSpecializationRepository implements ISpecializationRepository {
  findByIdsResponse: Specialization[] = [];

  async findById(id: string): Promise<Specialization | null> {
    return this.findByIdsResponse.find(s => s.id === id) || null;
  }

  async findByIds(ids: string[]): Promise<Specialization[]> {
    return this.findByIdsResponse;
  }

  async findByName(name: string): Promise<Specialization | null> {
    return null;
  }

  async findAll(): Promise<Specialization[]> {
    return this.findByIdsResponse;
  }

  async existsByIds(ids: string[]): Promise<boolean> {
    return this.findByIdsResponse.length === ids.length;
  }

  async save(specialization: Specialization): Promise<Specialization> {
    return specialization;
  }

  async update(specialization: Specialization): Promise<Specialization> {
    return specialization;
  }

  async delete(id: string): Promise<void> {
    // Mock implementation
  }
}

// Mock Domain Service
class MockClientDomainService extends ClientDomainService {
  override async ensureClientDoesNotExist(userId: string): Promise<void> {
    const existingClient = await this['clientRepository'].findByUserId(userId);
    if (existingClient) {
      throw new ClientAlreadyExistsError('Client profile already exists for this user');
    }
  }

  override async validateSpecializations(specializationIds: string[]): Promise<void> {
    const existingSpecs = await this['specializationRepository'].findByIds(specializationIds);
    
    if (existingSpecs.length !== specializationIds.length) {
      const foundIds = existingSpecs.map(s => s.id);
      const invalidIds = specializationIds.filter(id => !foundIds.includes(id));
      
      throw new ValidationException(
        `Invalid specialization IDs: ${invalidIds.join(', ')}`
      );
    }
  }
}

// Helper function to create mock client
function createMockClient(dto: any): Client {
  const locationVo = Location.create({
    country: dto.country,
    state: dto.state,
  });

  return Client.create(
    'client-123',
    {
      userId: dto.userId,
      name: dto.name,
      phoneNumber: dto.phoneNumber,
      location: locationVo,
      company: dto.company,
      specializationIds: dto.specializationIds,
      onboardingCompleted: false,
    }
  );
}

// Helper function to create mock specialization
function createMockSpecialization(id: string, name: string): Specialization {
  return {
    id,
    name,
    description: `Description for ${name}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Specialization;
}
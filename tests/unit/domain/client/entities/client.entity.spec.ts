import { describe, it, expect } from 'bun:test';
import { Client } from '../../../../../src/domain/client/entities/client.entity';
import { Location } from '../../../../../src/domain/client/value-objects/location.vo';
import { ValidationException } from '../../../../../src/domain/shared/errors/validation.exception';
import { ClientFixtures } from '../../../../helpers/fixtures/client.fixtures';

describe('Client Entity', () => {
  describe('create', () => {
    it('should create a valid client', () => {
      // Arrange
      const id = 'client-123';
      const userId = 'user-123';
      const name = 'John Doe';
      const location = Location.create({ country: 'United States', state: 'California' });
      const specializationIds = ['spec-1', 'spec-2'];

      // Act
      const client = Client.create(id, {
        userId,
        name,
        location,
        specializationIds,
        onboardingCompleted: false,
      });

      // Assert
      expect(client).toBeDefined();
      expect(client.id).toBe(id);
      expect(client.userId).toBe(userId);
      expect(client.name).toBe(name);
      expect(client.specializationIds).toEqual(specializationIds);
      expect(client.onboardingCompleted).toBe(false);
    });

    it('should throw ValidationException when userId is empty', () => {
      // Arrange
      const location = Location.create({ country: 'United States', state: 'California' });

      // Act & Assert
      expect(() => {
        Client.create('client-123', {
          userId: '', // Empty userId
          name: 'John Doe',
          location,
          specializationIds: ['spec-1'],
          onboardingCompleted: false,
        });
      }).toThrow(ValidationException);
    });

    it('should throw ValidationException when name is too short', () => {
      // Arrange
      const location = Location.create({ country: 'United States', state: 'California' });

      // Act & Assert
      expect(() => {
        Client.create('client-123', {
          userId: 'user-123',
          name: 'J', // Too short
          location,
          specializationIds: ['spec-1'],
          onboardingCompleted: false,
        });
      }).toThrow(ValidationException);
    });

    it('should throw ValidationException when no specializations provided', () => {
      // Arrange
      const location = Location.create({ country: 'United States', state: 'California' });

      // Act & Assert
      expect(() => {
        Client.create('client-123', {
          userId: 'user-123',
          name: 'John Doe',
          location,
          specializationIds: [], // Empty array
          onboardingCompleted: false,
        });
      }).toThrow(ValidationException);
    });

    it('should throw ValidationException when more than 3 specializations', () => {
      // Arrange
      const location = Location.create({ country: 'United States', state: 'California' });

      // Act & Assert
      expect(() => {
        Client.create('client-123', {
          userId: 'user-123',
          name: 'John Doe',
          location,
          specializationIds: ['spec-1', 'spec-2', 'spec-3', 'spec-4'], // 4 specializations
          onboardingCompleted: false,
        });
      }).toThrow(ValidationException);
    });

    it('should create client with optional fields', () => {
      // Arrange
      const location = Location.create({ country: 'United States', state: 'California' });

      // Act
      const client = Client.create('client-123', {
        userId: 'user-123',
        name: 'John Doe',
        location,
        specializationIds: ['spec-1'],
        phoneNumber: '+1234567890',
        company: 'Tech Corp',
        onboardingCompleted: false,
      });

      // Assert
      expect(client.phoneNumber).toBe('+1234567890');
      expect(client.company).toBe('Tech Corp');
    });
  });

  describe('completeOnboarding', () => {
    it('should mark onboarding as completed', () => {
      // Arrange
      const client = ClientFixtures.createClient();

      // Act
      client.completeOnboarding();

      // Assert
      expect(client.onboardingCompleted).toBe(true);
    });

    it('should throw ValidationException when already completed', () => {
      // Arrange
      const client = ClientFixtures.createClient();
      client.completeOnboarding();

      // Act & Assert
      expect(() => {
        client.completeOnboarding();
      }).toThrow(ValidationException);
    });

    it('should throw ValidationException when no specializations', () => {
      // Arrange - Create client with empty specializations using reconstitute
      const location = Location.create({ country: 'United States', state: 'California' });
      const client = Client.reconstitute(
        'client-123',
        {
          userId: 'user-123',
          name: 'John Doe',
          location,
          specializationIds: [], // Empty specializations
          onboardingCompleted: false,
        },
        new Date(),
        new Date()
      );

      // Act & Assert
      expect(() => {
        client.completeOnboarding();
      }).toThrow(ValidationException);
    });
  });

  describe('addSpecialization', () => {
    it('should add a new specialization', () => {
      // Arrange
      const client = ClientFixtures.createMinimalClient(); // Has 1 spec

      // Act
      client.addSpecialization('spec-2');

      // Assert
      expect(client.specializationIds).toContain('spec-2');
      expect(client.specializationIds).toHaveLength(2);
    });

    it('should throw ValidationException when exceeding maximum', () => {
      // Arrange
      const client = ClientFixtures.createClientWithMaxSpecializations(); // Has 3

      // Act & Assert
      expect(() => {
        client.addSpecialization('spec-4');
      }).toThrow(ValidationException);
    });

    it('should throw ValidationException when adding duplicate', () => {
      // Arrange
      const client = ClientFixtures.createClient();

      // Act & Assert
      expect(() => {
        client.addSpecialization('spec-1'); // Already exists
      }).toThrow(ValidationException);
    });
  });

  describe('removeSpecialization', () => {
    it('should remove an existing specialization', () => {
      // Arrange
      const client = ClientFixtures.createClient(); // Has 2 specs

      // Act
      client.removeSpecialization('spec-1');

      // Assert
      expect(client.specializationIds).not.toContain('spec-1');
      expect(client.specializationIds).toHaveLength(1);
    });

    it('should throw ValidationException when removing last specialization', () => {
      // Arrange
      const client = ClientFixtures.createMinimalClient(); // Has 1 spec

      // Act & Assert
      expect(() => {
        client.removeSpecialization('spec-1');
      }).toThrow(ValidationException);
    });

    it('should throw ValidationException when specialization not found', () => {
      // Arrange
      const client = ClientFixtures.createClient();

      // Act & Assert
      expect(() => {
        client.removeSpecialization('non-existent');
      }).toThrow(ValidationException);
    });
  });

  describe('updateProfile', () => {
    it('should update name', () => {
      // Arrange
      const client = ClientFixtures.createClient();

      // Act
      client.updateProfile({ name: 'Jane Doe' });

      // Assert
      expect(client.name).toBe('Jane Doe');
    });

    it('should update phoneNumber', () => {
      // Arrange
      const client = ClientFixtures.createClient();

      // Act
      client.updateProfile({ phoneNumber: '+9876543210' });

      // Assert
      expect(client.phoneNumber).toBe('+9876543210');
    });

    it('should update company', () => {
      // Arrange
      const client = ClientFixtures.createClient();

      // Act
      client.updateProfile({ company: 'New Corp' });

      // Assert
      expect(client.company).toBe('New Corp');
    });

    it('should throw ValidationException when name is too short', () => {
      // Arrange
      const client = ClientFixtures.createClient();

      // Act & Assert
      expect(() => {
        client.updateProfile({ name: 'J' });
      }).toThrow(ValidationException);
    });

    it('should update multiple fields at once', () => {
      // Arrange
      const client = ClientFixtures.createClient();

      // Act
      client.updateProfile({
        name: 'Jane Smith',
        phoneNumber: '+9999999999',
        company: 'Awesome Inc',
      });

      // Assert
      expect(client.name).toBe('Jane Smith');
      expect(client.phoneNumber).toBe('+9999999999');
      expect(client.company).toBe('Awesome Inc');
    });
  });
});
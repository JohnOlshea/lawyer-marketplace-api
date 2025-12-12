import type { Client } from '@/domain/client/entities/client.entity';

/**
 * Client Response DTO
 * 
 * Data Transfer Object for client API responses.
 * 
 * @remarks
 * - Maps domain entities to API response format
 * - Hides internal implementation details from clients
 * 
 * TODO: Consider using class-validator for runtime validation
 */
export class ClientResponseDto {
  id!: string; // Unique client identifier (UUID)
  userId!: string;
  name!: string;
  phoneNumber?: string;
  location!: {
    country: string;
    state: string;
  };
  company?: string;
  specializationIds!: string[];
  onboardingCompleted!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  /**
   * Maps a domain Client entity to a DTO
   * 
   * @param client - Domain client entity
   * @returns ClientResponseDto instance
   * 
   * @remarks
   * This is where data exposed to API consumers is controlled
   * Sensitive fields should be excluded here.
   */
  static fromDomain(client: Client): ClientResponseDto {
    return {
      id: client.id,
      userId: client.userId,
      name: client.name,
      phoneNumber: client.phoneNumber,
      location: client.location,
      company: client.company,
      specializationIds: client.specializationIds,
      onboardingCompleted: client.onboardingCompleted,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    };
  }
}
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
 * TODO: Add phone number to response when implemented
 * TODO: Consider adding HATEOAS links for REST maturity
 */
export class ClientResponseDto {
  /** Unique client identifier (UUID) */
  id!: string;
  
  firstName!: string;
  lastName!: string;
  
  /** Client's full name (computed) */
  fullName!: string;

  email!: string;
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
      firstName: client.firstName,
      lastName: client.lastName,
      fullName: client.fullName,
      email: client.email,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    };
  }
}
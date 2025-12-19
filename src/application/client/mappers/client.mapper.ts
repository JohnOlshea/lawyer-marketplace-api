import { Client } from '../../../domain/client/entities/client.entity';
import type { ClientDto } from '../dto/client.dto';

/**
 * Client Mapper
 * Transforms domain entities to DTOs for presentation layer.
 * Enforces separation between domain model and API contracts.
 */
export class ClientMapper {
  static toDto(client: Client): ClientDto {
    return {
      id: client.id,
      userId: client.userId,
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
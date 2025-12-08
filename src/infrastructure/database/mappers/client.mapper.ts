import { Email } from '@/domain/client/value-objects/email.vo';
import { Client } from '@/domain/client/entities/client.entity';

/**
 * Client Data Mapper
 * 
 * Translates between database representation and domain entities.
 * 
 * @remarks
 * - Handles mapping between DB rows and domain model
 * - Reconstructs value objects from primitive values
 * - Uses reconstitute() for existing entities (no validation/events)
 */
export class ClientMapper {
  /**
   * Converts database row to domain entity
   * 
   * @param raw - Raw database row from Drizzle
   * @returns Client domain entity
   */
  static toDomain(raw: any): Client {
    const email = Email.create(raw.email);

    return Client.reconstitute(
      raw.id,
      {
        firstName: raw.firstName,
        lastName: raw.lastName,
        email,
        phoneNumber: raw.phoneNumber ?? undefined,
      },
      raw.createdAt,
      raw.updatedAt
    );
  }

  /**
   * Converts domain entity to database row format
   * 
   * TODO: Implement when save() method is needed
   */
  static toPersistence(client: Client): any {
    return {
      id: client.id,
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phoneNumber: client.phoneNumber ?? null,
    };
  }
}
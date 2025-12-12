import { Email } from '@/domain/client/value-objects/email.vo';
import { Client } from '@/domain/client/entities/client.entity';
import { Location } from '@/domain/client/value-objects/location.vo';

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
   * @param raw - Raw database row from Drizzle query
   * @returns Fully reconstituted Client domain entity
   * 
   * @remarks
   * Uses Client.reconstitute() instead of Client.create() to bypass
   * domain event generation for entities loaded from persistence.
   */
  static toDomain(raw: any): Client {
    const location = Location.create({
      country: raw.country,
      state: raw.state,
    });

    return Client.reconstitute(
      raw.id,
      {
        userId: raw.userId,
        name: raw.name || '', // From user table, or constructed
        phoneNumber: raw.phoneNumber ?? undefined,
        location,
        company: raw.company ?? undefined,
        specializationIds: raw.specializationIds || [],
        onboardingCompleted: raw.onboardingCompleted ?? false,
      },
      raw.createdAt,
      raw.updatedAt
    );
  }

  /**
   * Converts domain entity to database row format
   * 
   * @param client - Client domain entity
   * @returns Plain object matching database schema
   * 
   * @remarks
   * - Flattens value objects into primitive fields
   * - Converts undefined to null for database compatibility
   * - Excludes fields managed through junction tables (specializations)
   */
  static toPersistence(client: Client): any {
    return {
      id: client.id,
      userId: client.userId,
      phoneNumber: client.phoneNumber ?? null,
      country: client.location.country,
      state: client.location.state,
      company: client.company ?? null,
      onboardingCompleted: client.onboardingCompleted,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    };
  }
}
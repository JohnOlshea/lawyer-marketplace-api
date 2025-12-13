/**
 * Specialization Data Mapper
 * Transforms database records into domain entities.
 * Follows the Data Mapper pattern to keep domain entities persistence-ignorant.
 */

import { Specialization } from '../../../domain/specialization/entities/specialization.entity';

/**
 * Raw database record interface
 * 
 * @remarks
 * This represents the shape of data coming from the database.
 * Typically matches the Drizzle schema definition.
 */
interface SpecializationDbRecord {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Specialization mapper utility class
 * 
 * @remarks
 * Static class with no instance state.
 * All methods are pure functions for predictable mapping behavior.
 */
export class SpecializationMapper {
  /**
   * Maps a database record to a domain entity
   * 
   * @param raw - Raw database record (from Drizzle query result)
   * @returns {Specialization} Fully reconstituted domain entity
   * 
   * @remarks
   * - Uses `reconstitute` factory method (not `create`) to bypass validation
   * - Handles null values from database (converts to undefined for domain)
   * - Preserves original timestamps from database
   * - Type-safe mapping ensures all required fields are present
   * 
   * @example
   * ```typescript
   * // Single record
   * const dbRecord = await db.query.specializations.findFirst({ ... });
   * const entity = SpecializationMapper.toDomain(dbRecord);
   * ```
   * 
   * @throws May throw if database record is missing required fields
   */
  static toDomain(raw: SpecializationDbRecord): Specialization {
    return Specialization.reconstitute(
      raw.id,
      {
        name: raw.name,
        description: raw.description ?? undefined, // Convert null to undefined
      },
      raw.createdAt,
      raw.updatedAt
    );
  }
}
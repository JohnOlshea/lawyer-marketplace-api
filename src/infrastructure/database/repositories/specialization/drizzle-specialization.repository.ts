import { eq, inArray } from 'drizzle-orm';
import { db } from '@/infrastructure/database/db';
import type { ISpecializationRepository } from '../../../../domain/specialization/repositories/specialization.repository.interface';
import { Specialization } from '../../../../domain/specialization/entities/specialization.entity';
import { specializations } from '../../schema';
import { SpecializationMapper } from '../../mappers/specialization.mapper';

/**
 * Drizzle Specialization Repository Implementation
 * 
 * Concrete implementation of ISpecializationRepository using Drizzle ORM.
 * Handles data persistence and retrieval for Specialization entities.
 * 
 * @remarks
 * - Infrastructure layer: handles data access details
 * - Implements domain repository interface (Dependency Inversion Principle)
 * - Uses SpecializationMapper for domain/persistence translation
 * 
 * TODO: Inject database instance through constructor for better testability
 * TODO: Add caching layer for specializations (rarely change, frequently read)
 * TODO: Consider read replicas for high-traffic queries
 */
export class DrizzleSpecializationRepository implements ISpecializationRepository {

  /**
   * Finds a specialization by its unique ID
   * 
   * @param id - Specialization UUID
   * @returns Specialization entity or null if not found
   */
  async findById(id: string): Promise<Specialization | null> {
    const result = await db.query.specializations.findFirst({
      where: eq(specializations.id, id),
    });

    if (!result) {
      return null;
    }

    return SpecializationMapper.toDomain(result);
  }

  /**
   * Finds multiple specializations by their IDs
   * 
   * @param ids - Array of specialization UUIDs
   * @returns Array of found specializations (may be shorter than input if some IDs don't exist)
   * 
   * @remarks
   * Returns empty array if input is empty (optimization to avoid unnecessary DB query).
   */
  async findByIds(ids: string[]): Promise<Specialization[]> {
    if (ids.length === 0) {
      return [];
    }

    const results = await db
      .select()
      .from(specializations)
      .where(inArray(specializations.id, ids));

    return results.map((result) => SpecializationMapper.toDomain(result));
  }

  /**
   * Finds a specialization by its name
   * 
   * @param name - Specialization name (case-sensitive)
   * @returns Specialization entity or null if not found
   */
  async findByName(name: string): Promise<Specialization | null> {
    const result = await db.query.specializations.findFirst({
      where: eq(specializations.name, name),
    });

    if (!result) {
      return null;
    }

    return SpecializationMapper.toDomain(result);
  }

  /**
   * Retrieves all specializations
   * 
   * @returns Array of all specialization entities
   * 
   * @remarks
   * Consider pagination if specialization count grows large.
   */
  async findAll(): Promise<Specialization[]> {
    const results = await db.select().from(specializations);
    return results.map((result) => SpecializationMapper.toDomain(result));
  }

  /**
   * Checks if all provided IDs exist in the database
   * 
   * @param ids - Array of specialization IDs to verify
   * @returns true if ALL IDs exist, false otherwise
   * 
   * @remarks
   * Optimization: Returns false immediately if input array is empty.
   */
  async existsByIds(ids: string[]): Promise<boolean> {
    if (ids.length === 0) {
      return false;
    }

    const results = await db
      .select({ id: specializations.id })
      .from(specializations)
      .where(inArray(specializations.id, ids));

    return results.length === ids.length;
  }

  /**
   * Persists a new specialization to the database
   * 
   * @param specialization - Specialization domain entity to save
   * @returns The saved specialization entity
   * 
   * @throws {Error} If specialization with same ID already exists
   */
  async save(specialization: Specialization): Promise<Specialization> {
    await db.insert(specializations).values({
      id: specialization.id,
      name: specialization.name,
      description: specialization.description,
      createdAt: specialization.createdAt,
      updatedAt: specialization.updatedAt,
    });

    return specialization;
  }

  /**
   * Updates an existing specialization
   * 
   * @param specialization - Specialization domain entity with updated values
   * @returns The updated specialization entity
   * 
   * @remarks
   * Only updates mutable fields (name, description, updatedAt).
   * ID and createdAt are immutable.
   */
  async update(specialization: Specialization): Promise<Specialization> {
    await db
      .update(specializations)
      .set({
        name: specialization.name,
        description: specialization.description,
        updatedAt: specialization.updatedAt,
      })
      .where(eq(specializations.id, specialization.id));

    return specialization;
  }

  /**
   * Deletes a specialization by its ID
   * 
   * @param id - Specialization UUID to delete
   * @returns {Promise<void>} Resolves when deletion completes
   */
  async delete(id: string): Promise<void> {
    await db.delete(specializations).where(eq(specializations.id, id));
  }
}
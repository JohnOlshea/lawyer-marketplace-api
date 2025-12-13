/**
 * Specialization Repository Interface
 * Defines persistence operations for Specialization entities.
 */

import type { IRepository } from "@/domain/shared/interfaces/repository.interface";
import type { Specialization } from "../entities/specialization.entity";

/**
 * Specialization repository interface
 * 
 * @extends {IRepository<Specialization>}
 * 
 * @remarks
 * Extends base repository with specialization-specific query methods.
 * All methods return domain entities, not database DTOs.
 */
export interface ISpecializationRepository extends IRepository<Specialization> {
  /**
   * Finds multiple specializations by their IDs
   * 
   * @param ids - Array of specialization UUIDs
   * @returns {Promise<Specialization[]>} Array of found specializations
   * 
   * @remarks
   * - Returns empty array if no specializations are found
   * - Does not throw if some IDs don't exist (partial results returned)
   */
  findByIds(ids: string[]): Promise<Specialization[]>;

  /**
   * Finds a specialization by its exact name
   * 
   * @param name - Specialization name (case-sensitive)
   * @returns {Promise<Specialization | null>} Found specialization or null
   * 
   * @remarks
   * - Useful for preventing duplicate specialization names
   */
  findByName(name: string): Promise<Specialization | null>;

  /**
   * Checks if all provided specialization IDs exist
   * 
   * @param ids - Array of specialization UUIDs to verify
   * @returns {Promise<boolean>} True if all IDs exist, false otherwise
   * 
   * @remarks
   * - Returns false if any single ID doesn't exist
   * - More efficient than fetching full entities when only existence check is needed
   */
  existsByIds(ids: string[]): Promise<boolean>;
}
/**
 * Specialization Domain Entity
 * Represents a legal specialization (e.g., Corporate Law, Criminal Law).
 * Follows DDD principles with encapsulated business logic and validation.
 */

import { BaseEntity } from "@/domain/shared/base-entity";
import { ValidationException } from "@/domain/shared/errors/validation.exception";

/**
 * Specialization properties interface
 * 
 * @property {string} name - The specialization name (e.g., "Corporate Law")
 * @property {string} [description] - Optional detailed description of the specialization
 */
export interface SpecializationProps {
  name: string;
  description?: string;
}

/**
 * Specialization entity class
 * 
 * @extends {BaseEntity}
 * 
 * @remarks
 * - All modifications trigger the `touch()` method to update timestamps
 */
export class Specialization extends BaseEntity {
  private _name: string;
  private _description?: string;

  /**
   * Private constructor - use factory methods instead
   * 
   * @param id - Unique identifier (UUID)
   * @param props - Specialization properties
   * @param createdAt - Creation timestamp (optional for new entities)
   * @param updatedAt - Last update timestamp (optional for new entities)
   * 
   * @remarks
   * Constructor is private to enforce use of factory methods (create/reconstitute)
   * which provide better semantics and validation guarantees
   */
  private constructor(
    id: string,
    props: SpecializationProps,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
    this._name = props.name;
    this._description = props.description;
  }

  /**
   * Factory method: Creates a new Specialization entity
   * 
   * @param id - Unique identifier (typically a UUID v4)
   * @param name - Specialization name
   * @param description - Optional description
   * @returns {Specialization} New specialization instance
   * 
   * @throws {ValidationException} If name is empty or whitespace-only
   * 
   * @example
   * ```typescript
   * const specialization = Specialization.create(
   *   crypto.randomUUID(),
   *   'Family Law',
   *   'Divorce, custody, and family-related legal matters'
   * );
   * ```
   */
  public static create(
    id: string,
    name: string,
    description?: string
  ): Specialization {
    if (!name || name.trim().length === 0) {
      throw new ValidationException('Specialization name is required');
    }

    return new Specialization(id, { name: name.trim(), description });
  }

  /**
   * Factory method: Reconstitutes an existing Specialization from persistence
   * 
   * @param id - Unique identifier
   * @param props - Specialization properties
   * @param createdAt - Original creation timestamp
   * @param updatedAt - Last update timestamp
   * @returns {Specialization} Reconstituted specialization instance
   * 
   * @remarks
   * Used by repository/mapper to rebuild entities from database records.
   * Bypasses validation since data is assumed to be already validated.
   * 
   * @example
   * ```typescript
   * const specialization = Specialization.reconstitute(
   *   dbRecord.id,
   *   { name: dbRecord.name, description: dbRecord.description },
   *   dbRecord.createdAt,
   *   dbRecord.updatedAt
   * );
   * ```
   */
  public static reconstitute(
    id: string,
    props: SpecializationProps,
    createdAt: Date,
    updatedAt: Date
  ): Specialization {
    return new Specialization(id, props, createdAt, updatedAt);
  }

  // ============================================================================
  // Getters - Provide read-only access to internal state
  // ============================================================================

  /**
   * Gets the specialization name
   * @returns {string} The specialization name
   */
  get name(): string {
    return this._name;
  }

  /**
   * Gets the specialization description
   * @returns {string | undefined} The specialization description, if any
   */
  get description(): string | undefined {
    return this._description;
  }

  // ============================================================================
  // Business Methods - Enforce business rules and maintain invariants
  // ============================================================================

  /**
   * Updates the specialization name
   * 
   * @param name - New specialization name
   * @throws {ValidationException} If name is empty or whitespace-only
   * 
   * @remarks
   * - Trims whitespace from the name
   * - Updates the `updatedAt` timestamp
   * - Validates name is not empty
   */
  public updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new ValidationException('Specialization name is required');
    }
    this._name = name.trim();
    this.touch();
  }

  /**
   * Updates the specialization description
   * 
   * @param description - New description (can be empty to clear)
   * 
   * @remarks
   * - No validation on description content
   * - Updates the `updatedAt` timestamp
   * - Can be set to empty string to clear description
   */
  public updateDescription(description: string): void {
    this._description = description;
    this.touch();
  }
}
import { ValidationException } from '@/domain/shared/errors/validation.exception';
import { ValueObject } from '../../shared/value-object';

interface LocationProps {
  state: string;
  country: string;
}

/**
 * Location Value Object
 * 
 * Represents a physical address location in the system.
 * Encapsulates state and country information with validation.
 * 
 * @remarks
 * Design Characteristics:
 * - Immutable: Cannot be changed after creation
 * - Self-validating: Validates on construction
 * 
 * @example
 * ```typescript
 * const location = Location.create({
 *   state: 'CA',
 *   country: 'US'
 * });
 * ```
 */
export class Location extends ValueObject<LocationProps> {
  private constructor(value: LocationProps) {
    super(value);
  }

  /**
   * Factory method for creating Location value objects
   * 
   * @param props - Location properties
   * @returns Valid Location instance
   * @throws {ValidationException} If validation fails
   * 
   * @remarks
   * Trims whitespace
   */
  public static create(props: LocationProps): Location {
    this.validateProps(props);

    const normalizedProps: LocationProps = {
      state: props.state.trim(),
      country: props.country.trim(),
    };

    return new Location(normalizedProps);
  }

  /**
   * Validates location properties against business rules
   * 
   * @param props - Properties to validate
   * @throws {ValidationException} If validation fails
   */
  private static validateProps(props: LocationProps): void {
    if (!props.country || props.country.trim().length === 0) {
      throw new ValidationException('Country is required');
    }

    if (!props.state || props.state.trim().length === 0) {
      throw new ValidationException('State is required');
    }
  }

  // ===================================
  // Getters (Value Object Public API)
  // ===================================

  /**
   * Gets the state/province code
   * @example 'CA', 'NY', 'ON'
   */
  get state(): string {
    return this._value.state;
  }

  /**
   * Gets the ISO country code
   * @example 'US', 'CA', 'GB'
   */
  get country(): string {
    return this._value.country;
  }

  // ===================================
  // Utility Methods
  // ===================================

  /**
   * Serializes location to JSON
   * 
   * @returns Plain object representation
   * 
   * @remarks
   * Useful for:
   * - API responses
   * - Database persistence
   * - Logging and debugging
   */
  public toJSON(): LocationProps {
    return { ...this._value };
  }
}
import { ValueObject } from '../../shared/value-object';

/**
 * Location Value Object Properties
 */
interface LocationProps {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
}

/**
 * Location Value Object
 * 
 * Represents a physical address in the system.
 * 
 * @remarks
 * - Immutable once created
 * - Self-validating
 * - Can be compared for equality
 * - Useful for client addresses, lawyer office locations, etc.
 * 
 * @example
 * ```typescript
 * const location = Location.create({
 *   address: '123 Main St',
 *   city: 'New York',
 *   state: 'NY',
 *   country: 'USA',
 *   postalCode: '10001'
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
   * @throws {Error} If validation fails (TODO: Replace with DomainException)
   */
  public static create(props: LocationProps): Location {
    this.validateProps(props);

    // Normalize data
    const normalizedProps: LocationProps = {
      address: props.address.trim(),
      city: props.city.trim(),
      state: props.state.trim().toUpperCase(), // Standard: state codes in uppercase
      country: props.country.trim().toUpperCase(), // ISO country codes
      postalCode: props.postalCode?.trim(),
    };

    return new Location(normalizedProps);
  }

  /**
   * Validates location properties
   * @throws {Error} If validation fails
   */
  private static validateProps(props: LocationProps): void {
    const errors: string[] = [];

    if (!props.address || props.address.trim().length === 0) {
      errors.push('Address is required');
    }

    if (!props.city || props.city.trim().length === 0) {
      errors.push('City is required');
    }

    if (!props.state || props.state.trim().length === 0) {
      errors.push('State is required');
    }

    if (!props.country || props.country.trim().length === 0) {
      errors.push('Country is required');
    }

    // Optional: Validate postal code format based on country
    if (props.postalCode && props.postalCode.trim().length === 0) {
      errors.push('Postal code cannot be empty if provided');
    }

    if (errors.length > 0) {
      throw new Error(`Location validation failed: ${errors.join(', ')}`);
    }
  }

  // ===================================
  // Getters
  // ===================================

  get address(): string {
    return this._value.address;
  }

  get city(): string {
    return this._value.city;
  }

  get state(): string {
    return this._value.state;
  }

  get country(): string {
    return this._value.country;
  }

  get postalCode(): string | undefined {
    return this._value.postalCode;
  }

  // ===================================
  // Utility Methods
  // ===================================

  /**
   * Returns formatted address as a single string
   * @example "123 Main St, New York, NY 10001, USA"
   */
  public getFormattedAddress(): string {
    const parts = [
      this.address,
      this.city,
      this.postalCode ? `${this.state} ${this.postalCode}` : this.state,
      this.country,
    ];

    return parts.filter(Boolean).join(', ');
  }

  /**
   * Returns location as JSON object
   * Useful for API responses and serialization
   */
  public toJSON(): LocationProps {
    return { ...this._value };
  }

  /**
   * Checks if location is in a specific country
   */
  public isInCountry(countryCode: string): boolean {
    return this.country === countryCode.toUpperCase();
  }
}
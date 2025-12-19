import { ValueObject } from '../../shared/value-object';
import { ValidationException } from '../../shared/errors/validation.exception';

interface LocationProps {
  country: string;
  state?: string;
  city?: string;
  address?: string;
  zipCode?: string;
}

/**
 * Location Value Object
 *
 * Encapsulates geographic information for the lawyer.
 * Enforces mandatory country and optional fields.
 *
 * @remarks
 * - Immutable and self-validating
 * - Ensures country is always provided
 * - Trims optional string fields
 *
 * @example
 * ```ts
 * const loc = Location.create({ country: 'Nigeria', state: 'Lagos', city: 'Ikeja' });
 * console.log(loc.country); // 'Nigeria'
 * console.log(loc.state); // 'Lagos'
 * ```
 */
export class Location extends ValueObject<LocationProps> {
  private constructor(value: LocationProps) {
    super(value);
  }

  public static create(props: LocationProps): Location {
    if (!props.country || props.country.trim().length === 0) {
      throw new ValidationException('Country is required');
    }

    return new Location({
      country: props.country.trim(),
      state: props.state?.trim(),
      city: props.city?.trim(),
      address: props.address?.trim(),
      zipCode: props.zipCode?.trim(),
    });
  }

  get country(): string {
    return this._value.country;
  }

  get state(): string | undefined {
    return this._value.state;
  }

  get city(): string | undefined {
    return this._value.city;
  }

  get address(): string | undefined {
    return this._value.address;
  }

  get zipCode(): string | undefined {
    return this._value.zipCode;
  }

  public toJSON(): LocationProps {
    return { ...this._value };
  }
}

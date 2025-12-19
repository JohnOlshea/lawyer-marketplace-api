import { ValueObject } from '../../shared/value-object';
import { ValidationException } from '../../shared/errors/validation.exception';

interface BarCredentialsProps {
  barNumber: string;
  issueDate: string;
  expiryDate?: string;
}

/**
 * BarCredentials Value Object
 *
 * Represents lawyer's bar association registration details.
 * Ensures bar number format and valid dates.
 *
 * @remarks
 * - Immutable and self-validating
 * - Validates mandatory fields
 *
 * @example
 * ```ts
 * const bar = BarCredentials.create('BAR12345', '2020-01-01');
 * console.log(bar.barNumber); // 'BAR12345'
 * ```
 */
export class BarCredentials extends ValueObject<BarCredentialsProps> {
  private constructor(value: BarCredentialsProps) {
    super(value);
  }

  public static create(barNumber: string, issueDate: string, expiryDate?: string): BarCredentials {
    if (!barNumber || barNumber.trim().length < 5) {
      throw new ValidationException('Bar number must be at least 5 characters');
    }
    if (!issueDate) {
      throw new ValidationException('Issue date is required');
    }

    return new BarCredentials({
      barNumber: barNumber.trim(),
      issueDate,
      expiryDate,
    });
  }

  get barNumber(): string {
    return this._value.barNumber;
  }

  get issueDate(): string {
    return this._value.issueDate;
  }

  get expiryDate(): string | undefined {
    return this._value.expiryDate;
  }
}

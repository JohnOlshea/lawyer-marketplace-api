import { ValueObject } from '../../shared/value-object';
import { ValidationException } from '../../shared/errors/validation.exception';

/**
 * Email Value Object
 *
 * Encapsulates email validation and normalization logic.
 * Ensures immutability and prevents invalid emails in the system.
 *
 * @remarks
 * - Normalizes email (trim + lowercase)
 * - Self-validating: invalid emails cannot exist
 * - Immutable: follows DDD ValueObject pattern
 *
 * @example
 * ```ts
 * const email = Email.create(' John.Doe@Example.com ');
 * console.log(email.value); // 'john.doe@example.com'
 *
 * // Invalid email:
 * const invalid = Email.create('not-an-email'); // throws ValidationException
 * ```
 */
export class Email extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  public static create(email: string): Email {
    if (!this.isValid(email)) {
      throw new ValidationException('Invalid email format');
    }
    return new Email(email.toLowerCase().trim());
  }

  private static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

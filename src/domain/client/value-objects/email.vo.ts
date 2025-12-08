import { ValueObject } from '../../shared/value-object';

/**
 * Email Value Object
 * 
 * Encapsulates email validation logic and ensures email immutability.
 * 
 * @remarks
 * - Validates email format on creation
 * - Normalizes email (lowercase, trimmed)
 * - Immutable by design (Value Object pattern)
 * - Self-validating - invalid emails cannot exist
 * 
 * @example
 * ```typescript
 * const email = Email.create('john.doe@example.com');
 * console.log(email.value); // 'john.doe@example.com'
 * 
 * // This will throw:
 * const invalid = Email.create('not-an-email');
 * ```
 */
export class Email extends ValueObject<string> {
  /**
   * Private constructor enforces factory method usage
   * Guarantees that all Email instances are valid
   */
  private constructor(value: string) {
    super(value);
  }

  /**
   * Factory method for creating Email value objects
   * 
   * @param email - Raw email string
   * @returns Valid Email instance
   * @throws {Error} If email format is invalid (TODO: Replace with DomainException)
   */
  public static create(email: string): Email {
    const trimmedEmail = email.trim();

    if (!this.isValid(trimmedEmail)) {
      throw new Error(
        `Invalid email format: "${email}". Email must be in format: user@domain.com`
      );
    }

    // Normalize: lowercase for case-insensitive comparison
    return new Email(trimmedEmail.toLowerCase());
  }

  /**
   * Validates email format using RFC 5322 simplified regex
   * 
   * @param email - Email string to validate
   * @returns true if valid, false otherwise
   * 
   * @remarks
   * This is a simplified validation. For production, consider:
   * - More comprehensive RFC 5322 regex
   * - DNS MX record validation
   * - Disposable email detection
   * - Email verification services
   */
  private static isValid(email: string): boolean {
    if (!email || email.length === 0) {
      return false;
    }

    // Simplified RFC 5322 regex
    // Matches: user@domain.tld
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Additional checks
    const hasValidLength = email.length <= 254; // RFC 5321
    const localPartLength = email.split('@')[0]?.length || 0;
    const hasValidLocalPart = localPartLength > 0 && localPartLength <= 64; // RFC 5321

    return emailRegex.test(email) && hasValidLength && hasValidLocalPart;
  }

  // TODO: Implement getDomain, getLocalPart, isFromDomain
}
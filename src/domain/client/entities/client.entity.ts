import { AggregateRoot } from '../../shared/aggregate-root';
import { Email } from '../value-objects/email.vo';

/**
 * Client Entity Properties
 * Represents the data required to construct a Client aggregate
 */
export interface ClientProps {
  firstName: string;
  lastName: string;
  email: Email;
  phoneNumber?: string;
}

/**
 * Client Aggregate Root
 * 
 * Represents a client in the lawyer marketplace system.
 * This is the primary aggregate for managing client data and behavior.
 * 
 * @remarks
 * - Enforces business rules through private constructor and factory methods
 * - Emits domain events for significant state changes
 * - Maintains invariants through validation
 * 
 * @example
 * ```typescript
 * const email = Email.create('john@example.com');
 * const client = Client.create('uuid', {
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   email,
 *   phoneNumber: '+1234567890'
 * });
 * ```
 */
export class Client extends AggregateRoot {
  private _firstName: string;
  private _lastName: string;
  private _email: Email;
  private _phoneNumber?: string;

  private constructor(
    id: string,
    props: ClientProps,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
    this._firstName = props.firstName;
    this._lastName = props.lastName;
    this._email = props.email;
    this._phoneNumber = props.phoneNumber;
  }

  /**
   * Factory method for creating new Client instances
   * 
   * @param id - Unique identifier for the client
   * @param props - Client properties
   * @returns A new Client instance
   * @throws {Error} If validation fails (TODO: Replace with DomainException)
   * 
   * @remarks
   * - Validates all business rules
   * - Emits ClientCreatedEvent (TODO)
   * - Use this for NEW clients being created in the system
   */
  public static create(id: string, props: ClientProps): Client {
    this.validateProps(props);

    const client = new Client(id, props);

    // TODO: Emit ClientCreatedEvent
    // client.applyEvent(new ClientCreatedEvent(client));

    return client;
  }

  /**
   * Reconstitutes an existing Client from persistence
   * 
   * @param id - Client identifier
   * @param props - Client properties from database
   * @param createdAt - Original creation timestamp
   * @param updatedAt - Last update timestamp
   * @returns Reconstituted Client instance
   * 
   * @remarks
   * - Used ONLY for loading existing entities from the database
   * - Skips validation (data was already validated on creation)
   * - Does NOT emit domain events
   * - Maintains historical timestamps
   */
  public static reconstitute(
    id: string,
    props: ClientProps,
    createdAt: Date,
    updatedAt: Date
  ): Client {
    return new Client(id, props, createdAt, updatedAt);
  }

  /**
   * Validates client properties against business rules
   * 
   * @throws {Error} If any validation rule fails
   * TODO: Replace with custom DomainException for better error handling
   */
  private static validateProps(props: ClientProps): void {
    const errors: string[] = [];

    if (!props.firstName || props.firstName.trim().length < 2) {
      errors.push('First name must be at least 2 characters');
    }

    if (!props.lastName || props.lastName.trim().length < 2) {
      errors.push('Last name must be at least 2 characters');
    }

    if (!props.email) {
      errors.push('Email is required');
    }

    // Optional: Phone number validation
    if (props.phoneNumber && !this.isValidPhoneNumber(props.phoneNumber)) {
      errors.push('Invalid phone number format');
    }

    if (errors.length > 0) {
      throw new Error(`Client validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * Basic phone number validation
   * TODO: Consider using a library like libphonenumber-js for production
   */
  private static isValidPhoneNumber(phone: string): boolean {
    // Basic check: 10-15 digits, may contain +, spaces, dashes, parentheses
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone);
  }

  // ===================================
  // Getters (Public API)
  // ===================================

  get firstName(): string {
    return this._firstName;
  }

  get lastName(): string {
    return this._lastName;
  }

  get fullName(): string {
    return `${this._firstName} ${this._lastName}`;
  }

  get email(): string {
    return this._email.value;
  }

  get phoneNumber(): string | undefined {
    return this._phoneNumber;
  }
}
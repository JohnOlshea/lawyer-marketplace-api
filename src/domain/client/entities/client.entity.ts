import { Email } from '../value-objects/email.vo';
import { AggregateRoot } from '../../shared/aggregate-root';
import { ValidationException } from '@/domain/shared/errors/validation.exception';
import type { Location } from '../value-objects/location.vo';

/**
 * Client Entity Properties
 * 
 * Represents the data required to construct a Client aggregate
 */
export interface ClientProps {
  userId: string; // Reference to authenticated user in Better Auth
  email: Email; // Client's email address (validated via Email VO)
  name: string;
  phoneNumber?: string;
  location: Location;
  company?: string;
  specializationIds: string[];
  onboardingCompleted: boolean;
}

/**
 * Client Aggregate Root
 * 
 * Represents a client in the lawyer marketplace system.
 * This is the primary aggregate for managing client data and behavior.
 * 
 * @remarks
 * **Aggregate Root Responsibilities:**
 * - Enforces all business rules and invariants
 * - Emits domain events for state changes
 * 
 * **Key Business Rules:**
 * - Client must have 1-3 legal specializations
 * - Onboarding must be completed before posting requests
 * - Name must be at least 2 characters
 * 
 * **Invariants Maintained:**
 * - Specialization count always between 1-3
 * - Onboarding completed only when all required data exists
 * - Email is always valid (via Email VO)
 * - Location is always valid (via Location VO)
 * 
 * @example
 * ```typescript
 * // Creating a new client
 * const email = Email.create('john@example.com');
 * const location = Location.create({ state: 'CA', country: 'US' });
 * 
 * const client = Client.create(uuid(), {
 *   userId: 'auth-user-id',
 *   email,
 *   name: 'John Doe',
 *   location,
 *   specializationIds: ['family-law', 'estate-planning'],
 *   onboardingCompleted: false
 * });
 * 
 * // Completing onboarding
 * client.completeOnboarding();
 * await clientRepository.save(client);
 * ```
 */
export class Client extends AggregateRoot {
  // Private state - only accessible through methods and getters
  private _userId: string;
  private _email: Email;
  private _name: string;
  private _phoneNumber?: string;
  private _location: Location;
  private _company?: string;
  private _specializationIds: string[];
  private _onboardingCompleted: boolean;

  /**
   * Private constructor enforces use of factory methods
   * 
   * @remarks
   * Prevents direct instantiation with `new Client()`.
   * Forces use of:
   * - `Client.create()` for new aggregates
   * - `Client.reconstitute()` for loading from DB
   */
  private constructor(
    id: string,
    props: ClientProps,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
    this._userId = props.userId;
    this._email = props.email;
    this._name = props.name;
    this._phoneNumber = props.phoneNumber;
    this._location = props.location;
    this._company = props.company;
    this._specializationIds = props.specializationIds;
    this._onboardingCompleted = props.onboardingCompleted;
  }

  /**
   * Factory method for creating new Client instances
   * 
   * @param id - Unique identifier (UUID) for the client
   * @param props - Client properties
   * @returns A new, valid Client instance
   * @throws {ValidationException} If any business rule is violated
   * 
   * @remarks
   * - Validates all business rules
   * - Emits ClientCreatedEvent (TODO)
   * - Use this for NEW clients being created in the system
   */
  public static create(id: string, props: ClientProps): Client {
    this.validateProps(props);

    const client = new Client(id, {
      ...props,
      onboardingCompleted: false,
    });

    // TODO: Emit ClientCreatedEvent for event-driven side effects
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
   * - Preserves original timestamps
   * 
   * **Warning:** Never call this with untrusted data!
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
   * @param props - Properties to validate
   * @throws {ValidationException} If any validation rule fails
   * 
   * @remarks
   * Email and Location are validated by their respective Value Objects,
   * so we don't need to validate them here (Single Responsibility).
   */
  private static validateProps(props: ClientProps): void {
    if (!props.userId || props.userId.trim().length === 0) {
      throw new ValidationException('User ID is required');
    }

    if (!props.name || props.name.trim().length < 2) {
      throw new ValidationException('Name must be at least 2 characters');
    }

    if (props.specializationIds.length === 0) {
      throw new ValidationException('At least one specialization is required');
    }

    if (props.specializationIds.length > 3) {
      throw new ValidationException('Maximum 3 specializations allowed');
    }

    // Phone validation disabled - consider enabling with proper library
    // if (props.phoneNumber && !this.isValidPhoneNumber(props.phoneNumber)) {
    //   throw new ValidationException('Invalid phone number format');
    // }
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
  // Getters (Public API for Reading State)
  // ===================================
  
  /** Gets the associated user ID from auth system */
  get userId(): string {
    return this._userId;
  }

  /** Gets the email address as string */
  get email(): string {
    return this._email.value;
  }

  /** Gets the client's name */
  get name(): string {
    return this._name;
  }

  /** Gets the phone number (if provided) */
  get phoneNumber(): string | undefined {
    return this._phoneNumber;
  }

  /** 
   * Gets location as plain object
   * Returns a copy to maintain immutability
   */
  get location(): { country: string; state: string } {
    return {
      country: this._location.country,
      state: this._location.state,
    };
  }

  /** Gets the company name (if provided) */
  get company(): string | undefined {
    return this._company;
  }

  /** 
   * Gets specialization IDs
   * Returns a copy to prevent external mutation
   */
  get specializationIds(): string[] {
    return [...this._specializationIds];
  }

  /** Checks if onboarding is completed */
  get onboardingCompleted(): boolean {
    return this._onboardingCompleted;
  }

// ===================================
  // Business Methods (Commands)
  // ===================================

  /**
   * Completes the client onboarding process
   * 
   * @throws {ValidationException} If business rules prevent completion
   * 
   * @remarks
   * **Business Rules:**
   * - Cannot complete onboarding twice (idempotency check)
   * - Must have at least one specialization selected
   * 
   * **Side Effects:**
   * - Sets onboardingCompleted flag to true
   * - Updates entity timestamp
   * - Emits ClientOnboardingCompletedEvent (TODO)
   * 
   * @example
   * ```typescript
   * const client = await clientRepo.findByUserId(userId);
   * if (client && !client.onboardingCompleted) {
   *   client.completeOnboarding();
   *   await clientRepo.save(client);
   *   // Event will trigger welcome email, analytics, etc.
   * }
   * ```
   */
  public completeOnboarding(): void {
    // Idempotency check
    if (this._onboardingCompleted) {
      throw new ValidationException('Onboarding already completed');
    }

    // Business rule: must have specializations to complete onboarding
    if (this._specializationIds.length === 0) {
      throw new ValidationException(
        'Specializations are required to complete onboarding'
      );
    }

    this._onboardingCompleted = true;
    this.touch(); // Updates the updatedAt timestamp

    // TODO: Emit domain event for side effects (email, analytics, etc.)
    // this.addDomainEvent(
    //   new ClientOnboardingCompletedEvent(this.id, this._userId)
    // );
  }
}
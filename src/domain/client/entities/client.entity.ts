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
 */
export class Client extends AggregateRoot {
  // Private state - only accessible through methods and getters
  private _userId: string;
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
   * Location validation is not done here but in value Object (Single Responsibility).
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

  /**
   * Adds a specialization to the client's profile
   * 
   * @param specializationId - ID of the specialization to add
   * @throws {ValidationException} If business rules prevent addition
   * 
   * @remarks
   * **Business Rules:**
   * - Cannot exceed 3 specializations (maximum limit)
   * - Cannot add duplicate specializations
   * 
   * **Side Effects:**
   * - Adds specialization to the list
   * - Updates entity timestamp
   * - Emits SpecializationAddedEvent (TODO)
   */
  public addSpecialization(specializationId: string): void {
    // Business rule: maximum 3 specializations
    if (this._specializationIds.length >= 3) {
      throw new ValidationException('Maximum 3 specializations allowed');
    }

    // Business rule: no duplicate specializations
    if (this._specializationIds.includes(specializationId)) {
      throw new ValidationException('Specialization already exists');
    }

    this._specializationIds.push(specializationId);
    this.touch();

    // TODO: Emit domain event
    // this.addDomainEvent(
    //   new SpecializationAddedEvent(this.id, specializationId)
    // );
  }

  /**
   * Removes a specialization from the client's profile
   * 
   * @param specializationId - ID of the specialization to remove
   * @throws {ValidationException} If business rules prevent removal
   * 
   * @remarks
   * **Business Rules:**
   * - Must keep at least 1 specialization
   * - Specialization must exist in the list
   * 
   * **Side Effects:**
   * - Removes specialization from the list
   * - Updates entity timestamp
   * - Emits SpecializationRemovedEvent (TODO)
   */
  public removeSpecialization(specializationId: string): void {
    // Business rule: must keep at least one specialization
    if (this._specializationIds.length <= 1) {
      throw new ValidationException('At least one specialization is required');
    }

    const index = this._specializationIds.indexOf(specializationId);

    // Business rule: specialization must exist
    if (index === -1) {
      throw new ValidationException('Specialization not found');
    }

    this._specializationIds.splice(index, 1);
    this.touch();

    // TODO: Emit domain event
    // this.addDomainEvent(
    //   new SpecializationRemovedEvent(this.id, specializationId)
    // );
  }

  /**
   * Updates the client's profile information
   * 
   * @param updates - Partial profile updates
   * @throws {ValidationException} If validation fails
   * 
   * @remarks
   * **Allowed Updates:**
   * - Name (must be at least 2 characters)
   * - Phone number
   * - Company
   * 
   * **Not Allowed:**
   * - User ID (immutable - tied to auth system)
   * - Location (use separate method if needed)
   * - Specializations (use add/remove methods)
   * 
   * **Side Effects:**
   * - Updates specified fields
   * - Updates entity timestamp
   * - Emits ProfileUpdatedEvent (TODO)
   */
  public updateProfile(updates: {
    name?: string;
    phoneNumber?: string;
    company?: string;
  }): void {
    // Validate name if provided
    if (updates.name !== undefined) {
      if (updates.name.trim().length < 2) {
        throw new ValidationException('Name must be at least 2 characters');
      }
      this._name = updates.name;
    }

    // Update phone number if provided
    if (updates.phoneNumber !== undefined) {
      this._phoneNumber = updates.phoneNumber;
    }

    // Update company if provided
    if (updates.company !== undefined) {
      this._company = updates.company;
    }

    this.touch();

    // TODO: Emit domain event
    // this.addDomainEvent(
    //   new ProfileUpdatedEvent(this.id, updates)
    // );
  }
}
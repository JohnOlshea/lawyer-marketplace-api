import { AggregateRoot } from '../../shared/aggregate-root';
import { Role } from '../value-objects/role.vo';
import { UserRoleChangedEvent } from '../events/user-role-changed.event';
import { UserBannedEvent } from '../events/user-banned.event';
import { ValidationException } from '../../shared/errors/validation.exception';

export interface UserProps {
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  role: Role;
  banned: boolean;
  banReason?: string;
  banExpires?: Date;
  onboardingCompleted: boolean;
}

/**
 * User Aggregate Root
 * 
 * Core domain entity representing a platform user with their identity,
 * role-based permissions, and account status.
 * 
 * Enforces:
 * - Role change business rules and authorization
 * - Ban/unban lifecycle with expiration handling
 * - Profile update validation
 * - Invariants around ban state consistency
 */
export class User extends AggregateRoot {
  private _name: string;
  private _email: string;
  private _emailVerified: boolean;
  private _image?: string;
  private _role: Role;
  private _banned: boolean;
  private _banReason?: string;
  private _banExpires?: Date;
  private _onboardingCompleted: boolean;

  private constructor(
    id: string,
    props: UserProps,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
    this._name = props.name;
    this._email = props.email;
    this._emailVerified = props.emailVerified;
    this._image = props.image;
    this._role = props.role;
    this._banned = props.banned;
    this._banReason = props.banReason;
    this._banExpires = props.banExpires;
    this._onboardingCompleted = props.onboardingCompleted;
  }

  /**
   * Reconstitutes user from persistence
   * Used by repository when hydrating from database
   */
  public static reconstitute(
    id: string,
    props: UserProps,
    createdAt: Date,
    updatedAt: Date
  ): User {
    return new User(id, props, createdAt, updatedAt);
  }

  // Getters
  get name(): string { return this._name; }
  get email(): string { return this._email; }
  get emailVerified(): boolean { return this._emailVerified; }
  get image(): string | undefined { return this._image; }
  get role(): string { return this._role.value; }
  get banned(): boolean { return this._banned; }
  get banReason(): string | undefined { return this._banReason; }
  get banExpires(): Date | undefined { return this._banExpires; }
  get onboardingCompleted(): boolean { return this._onboardingCompleted; }

  /**
   * Updates user profile fields
   * @throws {ValidationException} If name is less than 2 characters
   */
  public updateProfile(updates: {
    name?: string;
    image?: string;
  }): void {
    if (updates.name !== undefined) {
      if (updates.name.trim().length < 2) {
        throw new ValidationException('Name must be at least 2 characters');
      }
      this._name = updates.name;
    }

    if (updates.image !== undefined) {
      this._image = updates.image;
    }

    this.touch();
  }

  /**
   * Changes user's role and emits domain event
   * @throws {ValidationException} If user already has the target role
   */
  public changeRole(newRole: Role, adminId: string): void {
    if (this._role.equals(newRole)) {
      throw new ValidationException('User already has this role');
    }

    const oldRole = this._role.value;
    this._role = newRole;
    this.touch();
    
    this.applyEvent(new UserRoleChangedEvent(this.id, oldRole, newRole.value, adminId));
  }

  /**
   * Bans user with reason and optional expiration
   * @throws {ValidationException} If user already banned or reason is empty
   */
  public ban(reason: string, expiresAt?: Date, adminId?: string): void {
    if (this._banned) {
      throw new ValidationException('User is already banned');
    }

    if (!reason || reason.trim().length === 0) {
      throw new ValidationException('Ban reason is required');
    }

    this._banned = true;
    this._banReason = reason;
    this._banExpires = expiresAt;
    this.touch();

    this.applyEvent(new UserBannedEvent(this.id, reason, expiresAt, adminId));
  }

  /**
   * Removes ban and clears ban metadata
   * @throws {ValidationException} If user is not currently banned
   */
  public unban(adminId?: string): void {
    if (!this._banned) {
      throw new ValidationException('User is not banned');
    }

    this._banned = false;
    this._banReason = undefined;
    this._banExpires = undefined;
    this.touch();
  }

  public isAdmin(): boolean {
    return this._role.value === 'admin';
  }

  public isLawyer(): boolean {
    return this._role.value === 'lawyer';
  }

  public isClient(): boolean {
    return this._role.value === 'client';
  }

  /**
   * Checks if ban has expired based on current time
   * @returns false if not banned or no expiration set
   */
  public isBanExpired(): boolean {
    if (!this._banned || !this._banExpires) {
      return false;
    }
    return new Date() > this._banExpires;
  }

  public completeOnboarding(): void {
    this._onboardingCompleted = true;
    this.touch();
  }
}
import { ValueObject } from '../../shared/value-object';
import { ValidationException } from '../../shared/errors/validation.exception';

export type RoleType = 'admin' | 'lawyer' | 'client';

/**
 * Role Value Object
 * 
 * Encapsulates role validation and behavior. Immutable by design.
 * Use factory methods (Admin(), Lawyer(), Client()) for type-safe creation.
 * 
 * @example
 * const role = Role.Admin();
 * const customRole = Role.create('lawyer');
 */
export class Role extends ValueObject<RoleType> {
  private constructor(value: RoleType) {
    super(value);
  }

  /**
   * Creates role from string with validation
   * @throws {ValidationException} If role is not admin, lawyer, or client
   */
  public static create(role: string): Role {
    if (!this.isValid(role)) {
      throw new ValidationException(`Invalid role: ${role}. Must be one of: admin, lawyer, client`);
    }
    return new Role(role as RoleType);
  }

  private static isValid(role: string): boolean {
    return ['admin', 'lawyer', 'client'].includes(role);
  }

  // Factory methods for type-safe role creation
  public static Admin(): Role {
    return new Role('admin');
  }

  public static Lawyer(): Role {
    return new Role('lawyer');
  }

  public static Client(): Role {
    return new Role('client');
  }

  // Convenience predicates
  public isAdmin(): boolean {
    return this._value === 'admin';
  }

  public isLawyer(): boolean {
    return this._value === 'lawyer';
  }

  public isClient(): boolean {
    return this._value === 'client';
  }
}
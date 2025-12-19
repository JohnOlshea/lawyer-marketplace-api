import { User } from '../../../domain/user/entities/user.entity';
import { Role } from '../../../domain/user/value-objects/role.vo';

/**
 * User Data Mapper
 *
 * Translates between database representation and User domain entity.
 *
 * @remarks
 * - Responsible for reconstituting persisted User aggregates
 * - Rebuilds value objects from primitive values
 * - Avoids domain validation and events for persisted data
 */
export class UserMapper {
  /**
   * Converts database row to User domain entity
   *
   * @param raw - Raw database row from Drizzle query
   * @returns Fully reconstituted User domain entity
   *
   * @remarks
   * Uses User.reconstitute() instead of User.create() to prevent
   * triggering domain events or invariants on persisted data.
   */
  static toDomain(raw: any): User {
    const role = Role.create(raw.role);

    return User.reconstitute(
      raw.id,
      {
        name: raw.name,
        email: raw.email,
        emailVerified: raw.emailVerified,
        image: raw.image,
        role,
        banned: raw.banned,
        banReason: raw.banReason,
        banExpires: raw.banExpires,
        onboardingCompleted: raw.onboardingCompleted,
      },
      raw.createdAt,
      raw.updatedAt
    );
  }

  /**
   * Converts User domain entity to database row format
   *
   * @param user - User domain entity
   * @returns Plain object matching database schema
   *
   * @remarks
   * - Flattens value objects into primitives
   * - Converts undefined values to null for DB compatibility
   * - Only includes fields owned by the User aggregate
   */
  static toPersistence(user: User): any {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image ?? null,
      role: user.role,
      banned: user.banned,
      banReason: user.banReason ?? null,
      banExpires: user.banExpires ?? null,
      onboardingCompleted: user.onboardingCompleted,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
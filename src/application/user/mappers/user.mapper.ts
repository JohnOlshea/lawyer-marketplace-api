import { User } from '../../../domain/user/entities/user.entity';
import type { UserDto } from '../dto/user.dto';

/**
 * UserMapper
 * 
 * Provides transformation methods between domain entities and DTOs.
 * Isolates domain entities from external representations.
 * 
 * Responsibilities:
 * - Entity to DTO transformation
 * - Ensures domain model encapsulation
 */
export class UserMapper {
  /**
   * Converts a User domain entity to a Data Transfer Object.
   * 
   * @param user - User domain entity
   * @returns User DTO suitable for API responses
   * 
   * Note: Excludes sensitive fields like password hashes.
   * DTOs represent the contract with external systems.
   */
  static toDto(user: User): UserDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
      role: user.role,
      banned: user.banned,
      banReason: user.banReason,
      banExpires: user.banExpires,
      onboardingCompleted: user.onboardingCompleted,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

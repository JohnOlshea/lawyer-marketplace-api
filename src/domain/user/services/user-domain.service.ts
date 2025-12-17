import { User } from '../entities/user.entity';
import type { IUserRepository } from '../repositories/user.repository.interface';
import { ForbiddenException } from '../../shared/errors/forbidden.exception';

/**
 * UserDomainService
 * 
 * Encapsulates business rules and policies for user management operations.
 * Contains domain logic that doesn't belong to a single entity.
 * 
 * Responsibilities:
 * - Authorization checks for administrative actions
 * - Business rule validation
 * - Cross-entity domain logic
 */
export class UserDomainService {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Ensures that the given user can perform administrative actions.
   * 
   * @param adminUser - User attempting to perform the action
   * @throws {ForbiddenException} If user is not an admin or is banned
   * 
   * Business rules:
   * - Only users with admin role can perform admin actions
   * - Banned users cannot perform any admin actions
   */
  async ensureCanPerformAdminAction(adminUser: User): Promise<void> {
    if (!adminUser.isAdmin()) {
      throw new ForbiddenException('Only administrators can perform this action');
    }

    if (adminUser.banned) {
      throw new ForbiddenException('Banned users cannot perform admin actions');
    }
  }

  /**
   * Determines if a user can change another user's role.
   * 
   * @param targetUser - User whose role would be changed
   * @param performingUser - User attempting to change the role
   * @returns True if the action is allowed, false otherwise
   * 
   * Business rules:
   * - Only admins can change roles
   * - Users cannot change their own role (prevents privilege escalation)
   */
  canChangeRole(targetUser: User, performingUser: User): boolean {
    // Only admins can change roles
    if (!performingUser.isAdmin()) {
      return false;
    }

    // Admins cannot change their own role
    if (targetUser.id === performingUser.id) {
      return false;
    }

    return true;
  }

  /**
   * Determines if a user can ban another user.
   * 
   * @param targetUser - User who would be banned
   * @param performingUser - User attempting to ban
   * @returns True if the action is allowed, false otherwise
   * 
   * Business rules:
   * - Only admins can ban users
   * - Users cannot ban themselves
   * - Admins cannot ban other admins (prevents admin abuse)
   */
  canBanUser(targetUser: User, performingUser: User): boolean {
    // Only admins can ban users
    if (!performingUser.isAdmin()) {
      return false;
    }

    // Admins cannot ban themselves
    if (targetUser.id === performingUser.id) {
      return false;
    }

    // Cannot ban other admins
    if (targetUser.isAdmin()) {
      return false;
    }

    return true;
  }
}
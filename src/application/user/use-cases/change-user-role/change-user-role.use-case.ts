import { Role } from '@/domain/user/value-objects/role.vo';
import type { User } from '@/domain/user/entities/user.entity';
import type { ChangeUserRoleDto } from './change-user-role.dto';
import { UserNotFoundError } from '@/domain/user/errors/user-not-found.error';
import { ForbiddenException } from '@/domain/shared/errors/forbidden.exception';
import type { UserDomainService } from '@/domain/user/services/user-domain.service';
import type { IUserRepository } from '@/domain/user/repositories/user.repository.interface';

/**
 * ChangeUserRoleUseCase
 * 
 * Application service that orchestrates the process of changing a user's role.
 * Handles authorization, validation, and coordination between domain services and repositories.
 * 
 * @remarks
 * Role changes are sensitive operations that can affect:
 * - User permissions and access control
 * - System security boundaries
 * - Business logic and workflows
 * 
 * This use case ensures that role changes follow business rules such as:
 * - Only admins can change roles
 * - Certain roles cannot be changed by certain admins
 * - Role changes are properly audited
 * 
 * Responsibilities:
 * - Authorization verification (admin privileges)
 * - Target user existence validation
 * - Domain rule enforcement (who can change whose role)
 * - Role value object creation and validation
 * - State change delegation to domain entity
 * - Persistence through repository
 * 
 * @example
 * ```typescript
 * const useCase = new ChangeUserRoleUseCase(userRepo, userDomainService);
 * const updatedUser = await useCase.execute(adminUser, {
 *   userId: 'usr_123',
 *   newRole: 'lawyer'
 * });
 * ```
 */
export class ChangeUserRoleUseCase {
  /**
   * Creates an instance of ChangeUserRoleUseCase
   * 
   * @param userRepository - Repository for user persistence operations
   * @param userDomainService - Domain service for user business rule enforcement
   */
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userDomainService: UserDomainService
  ) {}

  /**
   * Executes the change user role use case
   * 
   * @param adminUser - User performing the role change (must have admin privileges)
   * @param dto - Data transfer object containing the target user ID and new role
   * @returns The user entity with updated role
   * 
   * @throws {ForbiddenException} If adminUser lacks admin permissions
   * @throws {UserNotFoundError} If target user does not exist
   * @throws {ForbiddenException} If adminUser cannot change this specific user's role
   * @throws {InvalidRoleError} If newRole is not a valid role value (thrown by Role.create)
   * 
   * @remarks
   * Flow:
   * 1. Verify admin has permission to perform admin actions
   * 2. Retrieve target user from repository
   * 3. Verify target user exists
   * 4. Verify admin can change this specific user's role (domain rules)
   * 5. Create and validate Role value object from string
   * 6. Execute role change on user entity (maintains audit trail)
   * 7. Persist updated user state
   * 8. Return updated user
   * 
   * The Role value object creation (Role.create) enforces role validation,
   * ensuring only valid roles are assigned to users.
   */
  async execute(adminUser: User, dto: ChangeUserRoleDto): Promise<User> {
    // Enforce authorization at use case boundary
    await this.userDomainService.ensureCanPerformAdminAction(adminUser);

    // Retrieve target user
    const targetUser = await this.userRepository.findById(dto.userId);
    if (!targetUser) {
      throw new UserNotFoundError();
    }

    // Enforce domain rules about who can change whose role
    if (!this.userDomainService.canChangeRole(targetUser, adminUser)) {
      throw new ForbiddenException('You cannot change this user\'s role');
    }

    // Create and validate Role value object
    // This ensures only valid roles are assigned
    const newRole = Role.create(dto.newRole);
    
    // Delegate role change to domain entity
    // Entity maintains audit trail (who changed it and when)
    targetUser.changeRole(newRole, adminUser.id);
    
    // Persist state changes
    return await this.userRepository.update(targetUser);
  }
}
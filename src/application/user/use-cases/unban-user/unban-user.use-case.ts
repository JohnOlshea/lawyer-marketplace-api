import type { User } from "@/domain/user/entities/user.entity";
import { UserNotFoundError } from "@/domain/user/errors/user-not-found.error";
import type { UserDomainService } from "@/domain/user/services/user-domain.service";
import type { IUserRepository } from "@/domain/user/repositories/user.repository.interface";

/**
 * UnbanUserUseCase
 * 
 * Application service that orchestrates the user unbanning process.
 * Removes ban restrictions from a user account, restoring normal access.
 * 
 * @remarks
 * This use case is the inverse operation of BanUserUseCase. It allows admins
 * to manually lift bans before their expiration date or remove permanent bans.
 * 
 * Unbanning operations are typically performed when:
 * - A ban was issued in error
 * - The user has appealed successfully
 * - The reason for the ban no longer applies
 * - An admin decides to grant clemency
 * 
 * Responsibilities:
 * - Verify admin has permission to perform admin actions
 * - Validate target user exists
 * - Delegate unban operation to User entity
 * - Persist changes through repository
 * 
 * Unlike banning, unbanning typically doesn't require checking if the admin
 * can unban this specific user - any admin can usually unban any user.
 * This simplifies the authorization logic compared to BanUserUseCase.
 * 
 * @example
 * ```typescript
 * const unbanUserUseCase = new UnbanUserUseCase(userRepo, userDomainService);
 * const unbanedUser = await unbanUserUseCase.execute(adminUser, 'usr_123');
 * console.log(unbanedUser.isBanned()); // false
 * ```
 */
export class UnbanUserUseCase {
  /**
   * Creates an instance of UnbanUserUseCase
   * 
   * @param userRepository - Repository for user persistence operations
   * @param userDomainService - Domain service for user business rules
   */
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userDomainService: UserDomainService
  ) {}

  /**
   * Executes the unban user use case
   * 
   * @param adminUser - User performing the unban action (must have admin privileges)
   * @param userId - Unique identifier of the user to unban
   * @returns The unbanned user entity with updated state
   * 
   * @throws {ForbiddenException} If adminUser lacks admin permissions
   * @throws {UserNotFoundError} If target user does not exist
   * 
   * @remarks
   * Flow:
   * 1. Verify admin has permission to perform admin actions
   * 2. Retrieve target user from repository
   * 3. Verify target user exists
   * 4. Execute unban operation on user entity
   * 5. Persist updated user state
   * 6. Return updated user
   * 
   * The unban operation on the User entity:
   * - Clears the ban status
   * - Clears the ban reason
   * - Clears the ban expiration date
   * - Records who performed the unban (audit trail)
   * - Records when the unban occurred
   * 
   * Note: If the user is not currently banned, the operation is idempotent
   * and will not throw an error - it will simply ensure the user is unbanned.
   */
  async execute(adminUser: User, userId: string): Promise<User> {
    // Enforce authorization at use case boundary
    await this.userDomainService.ensureCanPerformAdminAction(adminUser);

    // Retrieve target user
    const targetUser = await this.userRepository.findById(userId);
    if (!targetUser) {
      throw new UserNotFoundError();
    }

    // Delegate unban operation to domain entity
    // Entity clears ban status and maintains audit trail
    targetUser.unban(adminUser.id);
    
    // Persist state changes
    return await this.userRepository.update(targetUser);
  }
}
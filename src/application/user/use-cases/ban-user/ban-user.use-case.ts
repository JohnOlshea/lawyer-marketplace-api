import type { BanUserDto } from './ban-user.dto';
import type { User } from '@/domain/user/entities/user.entity';
import { UserNotFoundError } from '@/domain/user/errors/user-not-found.error';
import { ForbiddenException } from '@/domain/shared/errors/forbidden.exception';
import type { UserDomainService } from '@/domain/user/services/user-domain.service';
import type { IUserRepository } from '@/domain/user/repositories/user.repository.interface';

/**
 * BanUserUseCase
 * 
 * Application service that orchestrates the user banning process.
 * Enforces authorization and business rules before delegating to domain entities.
 * 
 * @remarks
 * This use case follows the application layer pattern where:
 * - Authorization is verified at the use case boundary
 * - Domain rules are enforced through domain services and entities
 * - State changes are persisted through repositories
 * 
 * Responsibilities:
 * - Verify admin has permission to perform ban operations
 * - Validate target user exists
 * - Enforce domain rules about who can be banned
 * - Delegate ban operation to User entity
 * - Persist changes through repository
 */
export class BanUserUseCase {
  /**
   * Creates an instance of BanUserUseCase
   * 
   * @param userRepository - Repository for user persistence operations
   * @param userDomainService - Domain service for user business rules
   */
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userDomainService: UserDomainService
  ) {}

  /**
   * Executes the ban user use case
   * 
   * @param adminUser - User performing the ban action (must have admin privileges)
   * @param dto - Data transfer object containing ban parameters
   * @returns The banned user entity with updated state
   * 
   * @throws {ForbiddenException} If adminUser lacks admin permissions
   * @throws {UserNotFoundError} If target user does not exist
   * @throws {ForbiddenException} If adminUser cannot ban the target user (e.g., same rank)
   * 
   * @remarks
   * Flow:
   * 1. Verify admin has permission to perform admin actions
   * 2. Retrieve target user from repository
   * 3. Verify target user exists
   * 4. Verify admin can ban this specific user (domain rules)
   * 5. Execute ban operation on user entity
   * 6. Persist updated user state
   * 7. Return updated user
   */
  async execute(adminUser: User, dto: BanUserDto): Promise<User> {
    // Enforce authorization at use case boundary
    await this.userDomainService.ensureCanPerformAdminAction(adminUser);

    // Retrieve target user
    const targetUser = await this.userRepository.findById(dto.userId);
    if (!targetUser) {
      throw new UserNotFoundError();
    }

    // TODO: Give reason why user cannot be banned
    // Enforce domain rules about who can ban whom
    if (!this.userDomainService.canBanUser(targetUser, adminUser)) {
      throw new ForbiddenException('You cannot ban this user');
    }

    // Delegate ban operation to domain entity
    // Entity encapsulates ban logic and state changes
    targetUser.ban(dto.reason, dto.expiresAt, adminUser.id);
    
    // Persist state changes
    return await this.userRepository.update(targetUser);
  }
}
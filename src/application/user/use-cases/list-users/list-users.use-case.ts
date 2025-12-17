import type { IUserRepository, ListUsersFilter, ListUsersResult } from '../../../../domain/user/repositories/user.repository.interface';
import { UserDomainService } from '../../../../domain/user/services/user-domain.service';
import { User } from '../../../../domain/user/entities/user.entity';

/**
 * ListUsersUseCase
 * 
 * Application service that orchestrates the listing of users with filtering.
 * Part of the application layer, coordinating between domain services and repositories.
 * 
 * Responsibilities:
 * - Authorization verification
 * - Use case orchestration
 * - Transaction boundary (if applicable)
 */
export class ListUsersUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userDomainService: UserDomainService
  ) {}

  /**
   * Executes the list users use case.
   * 
   * @param adminUser - User performing the action (must be admin)
   * @param filter - Filtering and pagination parameters
   * @returns Paginated list of users
   * @throws {ForbiddenException} If adminUser lacks permissions
   * 
   * Flow:
   * 1. Verify admin has permission to list users
   * 2. Delegate to repository for filtered query
   * 3. Return paginated results
   */
  async execute(adminUser: User, filter: ListUsersFilter): Promise<ListUsersResult> {
    // Enforce authorization at use case level
    await this.userDomainService.ensureCanPerformAdminAction(adminUser);

    // Delegate to repository
    return await this.userRepository.list(filter);
  }
}
import type { IUserRepository } from '../../../../domain/user/repositories/user.repository.interface';
import { User } from '../../../../domain/user/entities/user.entity';
import { UserNotFoundError } from '../../../../domain/user/errors/user-not-found.error';

/**
 * GetUserProfileUseCase
 * 
 * Simple application service that retrieves a user's profile by ID.
 * Provides a clean boundary between the presentation layer and data access.
 * 
 * @remarks
 * This is a query-only use case with no side effects or state changes.
 * It follows the principle of separating reads from writes (CQS pattern).
 * 
 * Unlike admin operations, this use case does not require authorization checks
 * as authorization is typically handled at the controller/route level based on
 * whether the requesting user can access the specific profile being queried.
 * 
 * Responsibilities:
 * - Retrieve user entity by ID
 * - Validate user existence
 * - Return user entity to caller
 * 
 * Common usage scenarios:
 * - Fetching the current authenticated user's profile
 * - Admin viewing any user's profile
 * - Public profile viewing (if permissions allow)
 */
export class GetUserProfileUseCase {
  /**
   * Creates an instance of GetUserProfileUseCase
   * 
   * @param userRepository - Repository for user data access operations
   */
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Retrieves a user profile by user ID
   * 
   * @param userId - Unique identifier of the user to retrieve
   * @returns The complete user entity
   * 
   * @throws {UserNotFoundError} If no user exists with the given ID
   * 
   * @remarks
   * This method performs a simple lookup and does not modify any state.
   * The returned User entity contains all user properties including:
   * - Basic profile info (name, email, image)
   * - Role and permissions
   * - Ban status and details
   * - Onboarding completion status
   * - Metadata (created/updated timestamps)
   * 
   * Authorization should be handled by the caller to ensure the requesting
   * user has permission to view this profile.
   */
  async execute(userId: string): Promise<User> {
    // Retrieve user from repository
    const user = await this.userRepository.findById(userId);

    // Validate existence
    if (!user) {
      throw new UserNotFoundError();
    }

    return user;
  }
}
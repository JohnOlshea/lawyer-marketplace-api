import type { User } from '@/domain/user/entities/user.entity';
import type { UpdateUserProfileDto } from './update-user-profile.dto';
import { UserNotFoundError } from '@/domain/user/errors/user-not-found.error';
import type { IUserRepository } from '@/domain/user/repositories/user.repository.interface';

/**
 * UpdateUserProfileUseCase
 * 
 * Application service that orchestrates the user profile update process.
 * Allows users to modify their own profile information (name, image).
 * 
 * @remarks
 * This is a self-service use case where users update their own profiles.
 * It does NOT require admin privileges or domain service authorization checks,
 * as authorization is typically handled at the controller/route level to ensure
 * users can only update their own profile (userId matches authenticated user).
 * 
 * This use case intentionally handles only non-sensitive profile fields.
 * For sensitive operations, use specialized use cases:
 * - Role changes: ChangeUserRoleUseCase (admin only)
 * - Ban operations: BanUserUseCase/UnbanUserUseCase (admin only)
 * - Email changes: Would require a separate EmailChangeUseCase with verification
 * 
 * Responsibilities:
 * - Validate user exists
 * - Delegate profile update to User entity
 * - Persist changes through repository
 * 
 * The actual validation of profile data (name length, image URL format, etc.)
 * is handled by the User entity or its value objects, maintaining proper
 * domain-driven design boundaries.
 * 
 * @example
 * ```typescript
 * const useCase = new UpdateUserProfileUseCase(userRepository);
 * const updatedUser = await useCase.execute('usr_123', {
 *   name: 'John Doe',
 *   image: 'https://example.com/avatar.jpg'
 * });
 * ```
 */
export class UpdateUserProfileUseCase {
  /**
   * Creates an instance of UpdateUserProfileUseCase
   * 
   * @param userRepository - Repository for user persistence operations
   */
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Executes the update user profile use case
   * 
   * @param userId - Unique identifier of the user updating their profile
   * @param dto - Data transfer object containing the fields to update
   * @returns The user entity with updated profile information
   * 
   * @throws {UserNotFoundError} If no user exists with the given ID
   * @throws {ValidationError} If profile data fails domain validation (thrown by entity)
   * 
   * @remarks
   * Flow:
   * 1. Retrieve user from repository
   * 2. Verify user exists
   * 3. Execute profile update on user entity (with domain validation)
   * 4. Persist updated user state
   * 5. Return updated user
   * 
   * The DTO supports partial updates - only provided fields are updated:
   * - If only name is provided, only name is updated
   * - If only image is provided, only image is updated
   * - If both are provided, both are updated
   * - If neither is provided, no changes occur (but no error is thrown)
   * 
   * Authorization consideration:
   * The caller (usually a controller) should verify that the requesting user
   * has permission to update this profile. Typically this means:
   * - The authenticated user's ID matches the userId parameter, OR
   * - The authenticated user is an admin performing the update
   */
  async execute(userId: string, dto: UpdateUserProfileDto): Promise<User> {
    // Retrieve user from repository
    const user = await this.userRepository.findById(userId);

    // Validate existence
    if (!user) {
      throw new UserNotFoundError();
    }

    // Delegate profile update to domain entity
    // Entity enforces validation rules and maintains consistency
    user.updateProfile({
      name: dto.name,
      image: dto.image,
    });

    // Persist state changes
    return await this.userRepository.update(user);
  }
}
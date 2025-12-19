import type { Context } from 'hono';
import { GetUserProfileUseCase } from '../../../../application/user/use-cases/get-user-profile/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from '../../../../application/user/use-cases/update-user-profile/update-user-profile.use-case';
import { UserMapper } from '../../../../application/user/mappers/user.mapper';
import { HttpStatus } from '../../../../shared/constants/http-status';
import { ApiResponse } from '../../dto/common/api-response.dto';

/**
 * User Controller
 *
 * HTTP adapter responsible for handling authenticated User profile operations.
 *
 * @remarks
 * - Delegates all business logic to application use cases
 * - Performs request/response transformation only
 * - Relies on global error handler for exception handling
 * - Uses unified API response format
 */
export class UserController {
  constructor(
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase
  ) { }

  /**
   * Get authenticated user's profile
   *
   * GET /api/v1/user/profile
   *
   * @requires Authentication - Valid session
   *
   * @returns 200 - User profile retrieved successfully
   * @returns 404 - User not found
   */
  async getProfile(c: Context) {
    const userId = c.get('userId'); // From auth middleware
    const correlationId = c.get('correlationId');

    const user = await this.getUserProfileUseCase.execute(userId);
    const userDto = UserMapper.toDto(user);

    const response = ApiResponse.success(
      userDto,
      'Profile retrieved successfully',
      HttpStatus.OK,
      correlationId
    );

    return c.json(response, HttpStatus.OK);
  }

  /**
   * Update authenticated user's profile
   *
   * PATCH /api/v1/user/profile
   *
   * @requires Authentication - Valid session
   *
   * @body name (optional), image (optional)
   *
   * @returns 200 - Profile updated successfully
   * @returns 400 - Validation or business rule violation
   */
  async updateProfile(c: Context) {
    const userId = c.get('userId');
    const correlationId = c.get('correlationId');
    const body = await c.req.json();

    const user = await this.updateUserProfileUseCase.execute(userId, {
      name: body.name,
      image: body.image,
    });

    const userDto = UserMapper.toDto(user);

    const response = ApiResponse.success(
      userDto,
      'Profile updated successfully',
      HttpStatus.OK,
      correlationId
    );

    return c.json(response, HttpStatus.OK);
  }
}
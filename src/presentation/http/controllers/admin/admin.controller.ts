import type { Context } from 'hono';
import { ListUsersUseCase } from '../../../../application/user/use-cases/list-users/list-users.use-case';
import { BanUserUseCase } from '../../../../application/user/use-cases/ban-user/ban-user.use-case';
import { UnbanUserUseCase } from '../../../../application/user/use-cases/unban-user/unban-user.use-case';
import { ChangeUserRoleUseCase } from '../../../../application/user/use-cases/change-user-role/change-user-role.use-case';
import { GetUserProfileUseCase } from '../../../../application/user/use-cases/get-user-profile/get-user-profile.use-case';
import { UserMapper } from '../../../../application/user/mappers/user.mapper';
import { HttpStatus } from '../../../../shared/constants/http-status';

/**
 * AdminController
 * 
 * Handles HTTP requests for administrative user management operations.
 * Orchestrates use cases and transforms domain responses into HTTP responses.
 * 
 * Responsibilities:
 * - Request validation and parameter extraction
 * - Use case orchestration
 * - HTTP response formatting
 * - Error handling at the presentation layer
 */
export class AdminController {
  constructor(
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly banUserUseCase: BanUserUseCase,
    private readonly unbanUserUseCase: UnbanUserUseCase,
    private readonly changeUserRoleUseCase: ChangeUserRoleUseCase,
    private readonly getUserProfileUseCase: GetUserProfileUseCase
  ) { }

  /**
   * Lists users with optional filtering and pagination.
   * 
   * @param c - Hono context containing request and response
   * @returns Paginated list of users with metadata
   * 
   * Query parameters:
   * - page: Page number (default: 1)
   * - limit: Items per page (default: 20)
   * - role: Filter by user role
   * - banned: Filter by ban status (true/false)
   * - onboardingCompleted: Filter by onboarding status (true/false)
   */
  async listUsers(c: Context) {
    try {
      // Extract and verify admin user identity
      const adminUserId = c.get('userId');
      const adminUser = await this.getUserProfileUseCase.execute(adminUserId);

      // Parse query parameters with defaults
      const query = c.req.query();
      const page = parseInt(query.page || '1');
      const limit = parseInt(query.limit || '20');
      const role = query.role;
      const banned = query.banned === 'true' ? true : query.banned === 'false' ? false : undefined;
      const onboardingCompleted = query.onboardingCompleted === 'true' ? true : query.onboardingCompleted === 'false' ? false : undefined;

      // Execute use case
      const result = await this.listUsersUseCase.execute(adminUser, {
        page,
        limit,
        role,
        banned,
        onboardingCompleted,
      });

      return c.json(
        {
          success: true,
          message: 'Users retrieved successfully',
          data: {
            users: result.data.map(UserMapper.toDto),
            pagination: result.pagination,
          },
          statusCode: HttpStatus.OK,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.OK
      );
    } catch (error: any) {
      return c.json(
        {
          success: false,
          message: error.message || 'Failed to list users',
          statusCode: HttpStatus.FORBIDDEN,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.FORBIDDEN
      );
    }
  }

  /**
   * Bans a user from the platform.
   * 
   * @param c - Hono context containing request and response
   * @returns Updated user with ban status
   * 
   * URL parameters:
   * - userId: ID of the user to ban
   * 
   * Request body:
   * - reason: Reason for the ban
   * - expiresAt: Optional expiration date for the ban
   */
  async banUser(c: Context) {
    try {
      // Extract and verify admin user identity
      const adminUserId = c.get('userId');
      const adminUser = await this.getUserProfileUseCase.execute(adminUserId);

      const { userId } = c.req.param();

      // Validate required parameter
      // TODO: Move to middleware/validation layer for consistency
      if (!userId) {
        return c.json(
          {
            success: false,
            message: 'User ID is required',
            statusCode: HttpStatus.BAD_REQUEST,
            timestamp: new Date().toISOString(),
          },
          HttpStatus.BAD_REQUEST
        );
      }

      const body = await c.req.json();

      // Execute use case
      const user = await this.banUserUseCase.execute(adminUser, {
        userId,
        reason: body.reason,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
      });

      return c.json(
        {
          success: true,
          message: 'User banned successfully',
          data: UserMapper.toDto(user),
          statusCode: HttpStatus.OK,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.OK
      );
    } catch (error: any) {
      return c.json(
        {
          success: false,
          message: error.message || 'Failed to ban user',
          statusCode: HttpStatus.FORBIDDEN,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.FORBIDDEN
      );
    }
  }

  /**
  * Removes a ban from a user.
  * 
  * @param c - Hono context containing request and response
  * @returns Updated user with ban removed
  * 
  * URL parameters:
  * - userId: ID of the user to unban
  */
  async unbanUser(c: Context) {
    try {
      // Extract and verify admin user identity
      const adminUserId = c.get('userId');
      const adminUser = await this.getUserProfileUseCase.execute(adminUserId);

      const { userId } = c.req.param();

      // Validate required parameter
      // TODO: Move to middleware/validation layer for consistency
      if (!userId) {
        return c.json(
          {
            success: false,
            message: 'User ID is required',
            statusCode: HttpStatus.BAD_REQUEST,
            timestamp: new Date().toISOString(),
          },
          HttpStatus.BAD_REQUEST
        );
      }

      // Execute use case
      const user = await this.unbanUserUseCase.execute(adminUser, userId);

      return c.json(
        {
          success: true,
          message: 'User unbanned successfully',
          data: UserMapper.toDto(user),
          statusCode: HttpStatus.OK,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.OK
      );
    } catch (error: any) {
      return c.json(
        {
          success: false,
          message: error.message || 'Failed to unban user',
          statusCode: HttpStatus.FORBIDDEN,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.FORBIDDEN
      );
    }
  }

  /**
   * Changes a user's role.
   * 
   * @param c - Hono context containing request and response
   * @returns Updated user with new role
   * 
   * URL parameters:
   * - userId: ID of the user whose role to change
   * 
   * Request body:
   * - role: New role to assign
   */
  async changeUserRole(c: Context) {
    try {
      // Extract and verify admin user identity
      const adminUserId = c.get('userId');
      const adminUser = await this.getUserProfileUseCase.execute(adminUserId);

      const { userId } = c.req.param();

      // Validate required parameter
      // TODO: Move to middleware/validation layer for consistency
      if (!userId) {
        return c.json(
          {
            success: false,
            message: 'User ID is required',
            statusCode: HttpStatus.BAD_REQUEST,
            timestamp: new Date().toISOString(),
          },
          HttpStatus.BAD_REQUEST
        );
      }
      const body = await c.req.json();

      // Execute use case
      const user = await this.changeUserRoleUseCase.execute(adminUser, {
        userId,
        newRole: body.role,
      });

      return c.json(
        {
          success: true,
          message: 'User role changed successfully',
          data: UserMapper.toDto(user),
          statusCode: HttpStatus.OK,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.OK
      );
    } catch (error: any) {
      return c.json(
        {
          success: false,
          message: error.message || 'Failed to change user role',
          statusCode: HttpStatus.FORBIDDEN,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.FORBIDDEN
      );
    }
  }
}
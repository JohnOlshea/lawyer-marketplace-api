import type { Context } from 'hono';
import { ListUsersUseCase } from '../../../../application/user/use-cases/list-users/list-users.use-case';
import { BanUserUseCase } from '../../../../application/user/use-cases/ban-user/ban-user.use-case';
import { UnbanUserUseCase } from '../../../../application/user/use-cases/unban-user/unban-user.use-case';
import { ChangeUserRoleUseCase } from '../../../../application/user/use-cases/change-user-role/change-user-role.use-case';
import { GetUserProfileUseCase } from '../../../../application/user/use-cases/get-user-profile/get-user-profile.use-case';
import { UserMapper } from '../../../../application/user/mappers/user.mapper';
import { HttpStatus } from '../../../../shared/constants/http-status';
import { ApiResponse } from '../../dto/common/api-response.dto';

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
   * List users with filtering and pagination
   * 
   * GET /api/v1/admin/users
   * 
   * @remarks
   * Retrieves paginated list of users with optional filtering by role, ban status,
   * and onboarding completion status.
   * 
   * @requires Authentication - Valid Better-Auth session
   * @requires Authorization - Admin role
   * 
   * @query page - Page number (default: 1)
   * @query limit - Items per page (default: 20, max: 100)
   * @query role - Filter by user role (admin|lawyer|client)
   * @query banned - Filter by ban status (true|false)
   * @query onboardingCompleted - Filter by onboarding status (true|false)
   * 
   * @returns 200 - Paginated list of users
   * @returns 401 - No valid session found
   * @returns 403 - User is not an admin or is banned
   */
  async listUsers(c: Context) {
      // Session validated by authentication middleware
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
      // Domain exceptions (ForbiddenException, etc.) bubble up to global error handler
      const result = await this.listUsersUseCase.execute(adminUser, {
        page,
        limit,
        role,
        banned,
        onboardingCompleted,
      });

      const correlationId = c.get('correlationId'); // From middleware

      // Transform domain result to presentation DTO
      const response = ApiResponse.success(
        {
          users: result.data.map(UserMapper.toDto),
          pagination: result.pagination,
        },
        'Users retrieved successfully',
        HttpStatus.OK,
        correlationId
      );

      return c.json(response, HttpStatus.OK);
  }

  /**
   * Ban a user
   * 
   * POST /api/v1/admin/users/:userId/ban
   * 
   * @remarks
   * Prevents a user from accessing the platform. Ban can be temporary (with expiration)
   * or permanent. Admins cannot ban themselves or other admins.
   * 
   * @requires Authentication - Valid Better-Auth session
   * @requires Authorization - Admin role
   * 
   * @param userId - ID of the user to ban
   * @body reason - Reason for the ban
   * @body expiresAt - Optional ISO 8601 date string for temporary ban
   * 
   * @returns 200 - User banned successfully
   * @returns 400 - Validation error (missing userId or invalid data)
   * @returns 401 - No valid session found
   * @returns 403 - User is not an admin, is banned, or attempting to ban another admin
   * @returns 404 - User not found
   */
  async banUser(c: Context) {
    // Session validated by authentication middleware
    const adminUserId = c.get('userId');
    const adminUser = await this.getUserProfileUseCase.execute(adminUserId);

    const { userId } = c.req.param();

    // Validate required parameter
    // TODO: Move to middleware/validation layer for consistency across controllers
    if (!userId) {
      const correlationId = c.get('correlationId');
      const response = ApiResponse.error(
        'User ID is required',
        HttpStatus.BAD_REQUEST,
        correlationId
      );
      return c.json(response, HttpStatus.BAD_REQUEST);
    }

    const body = await c.req.json();

    // Execute use case
    // Domain exceptions bubble up to global error handler
    const user = await this.banUserUseCase.execute(adminUser, {
      userId,
      reason: body.reason,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
    });

    const correlationId = c.get('correlationId');

    // Transform domain result to presentation DTO
    const response = ApiResponse.success(
      UserMapper.toDto(user),
      'User banned successfully',
      HttpStatus.OK,
      correlationId
    );

    return c.json(response, HttpStatus.OK);
  }

  /**
   * Unban a user
   * 
   * POST /api/v1/admin/users/:userId/unban
   * 
   * @remarks
   * Removes an active ban from a user, restoring their access to the platform.
   * 
   * @requires Authentication - Valid Better-Auth session
   * @requires Authorization - Admin role
   * 
   * @param userId - ID of the user to unban
   * 
   * @returns 200 - User unbanned successfully
   * @returns 400 - Validation error (missing userId)
   * @returns 401 - No valid session found
   * @returns 403 - User is not an admin or is banned
   * @returns 404 - User not found
   */
  async unbanUser(c: Context) {
    // Session validated by authentication middleware
    const adminUserId = c.get('userId');
    const adminUser = await this.getUserProfileUseCase.execute(adminUserId);

    const { userId } = c.req.param();

    // Validate required parameter
    // TODO: Move to middleware/validation layer for consistency across controllers
    if (!userId) {
      const correlationId = c.get('correlationId');
      const response = ApiResponse.error(
        'User ID is required',
        HttpStatus.BAD_REQUEST,
        correlationId
      );
      return c.json(response, HttpStatus.BAD_REQUEST);
    }

    // Execute use case
    // Domain exceptions bubble up to global error handler
    const user = await this.unbanUserUseCase.execute(adminUser, userId);

    const correlationId = c.get('correlationId');

    // Transform domain result to presentation DTO
    const response = ApiResponse.success(
      UserMapper.toDto(user),
      'User unbanned successfully',
      HttpStatus.OK,
      correlationId
    );

    return c.json(response, HttpStatus.OK);
  }

  /**
   * Change a user's role
   * 
   * PATCH /api/v1/admin/users/:userId/role
   * 
   * @remarks
   * Updates a user's role. Admins cannot change their own role to prevent
   * privilege escalation or accidental lockout.
   * 
   * @requires Authentication - Valid Better-Auth session
   * @requires Authorization - Admin role
   * 
   * @param userId - ID of the user whose role to change
   * @body role - New role to assign (admin|lawyer|client)
   * 
   * @returns 200 - User role changed successfully
   * @returns 400 - Validation error (missing userId or invalid role)
   * @returns 401 - No valid session found
   * @returns 403 - User is not an admin, is banned, or attempting to change own role
   * @returns 404 - User not found
   */
  async changeUserRole(c: Context) {
    // Session validated by authentication middleware
    const adminUserId = c.get('userId');
    const adminUser = await this.getUserProfileUseCase.execute(adminUserId);

    const { userId } = c.req.param();

    // Validate required parameter
    // TODO: Move to middleware/validation layer for consistency across controllers
    if (!userId) {
      const correlationId = c.get('correlationId');
      const response = ApiResponse.error(
        'User ID is required',
        HttpStatus.BAD_REQUEST,
        correlationId
      );
      return c.json(response, HttpStatus.BAD_REQUEST);
    }

    const body = await c.req.json();

    // Execute use case
    // Domain exceptions bubble up to global error handler
    const user = await this.changeUserRoleUseCase.execute(adminUser, {
      userId,
      newRole: body.role,
    });

    const correlationId = c.get('correlationId');

    // Transform domain result to presentation DTO
    const response = ApiResponse.success(
      UserMapper.toDto(user),
      'User role changed successfully',
      HttpStatus.OK,
      correlationId
    );

    return c.json(response, HttpStatus.OK);
  }
}
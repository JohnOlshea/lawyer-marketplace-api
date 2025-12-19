import { Hono } from 'hono';
import { UserController } from '../../controllers/user/user.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validateUpdateProfile } from '../../validators/user.validator';
import { UpdateUserProfileUseCase } from '@/application/user/use-cases/update-user-profile/update-user-profile.use-case';
import { GetUserProfileUseCase } from '@/application/user/use-cases/get-user-profile/get-user-profile.use-case';
import { DrizzleUserRepository } from '@/infrastructure/database/repositories/user/drizzle-user.repository';
import { db } from '@/infrastructure/database/db';

/**
 * User Routes
 * Configures HTTP routes for user profile operations.
 * Wires up dependencies and applies middleware chain.
 */
export function createUserRoutes() {
  const app = new Hono();
  
  // Dependency wiring - repository -> use cases -> controller
  // TODO: Use DI Container
  const userRepository = new DrizzleUserRepository(db);
  const getUserProfileUseCase = new GetUserProfileUseCase(userRepository);
  const updateUserProfileUseCase = new UpdateUserProfileUseCase(userRepository);
  const userController = new UserController(
    getUserProfileUseCase,
    updateUserProfileUseCase
  );

  // Global auth requirement for all user routes
  app.use('*', authMiddleware);

  // GET /api/v1/user/profile - Retrieve current user's profile
  app.get(
    '/profile',
    (c) => userController.getProfile(c)
  );

  // PATCH /api/v1/user/profile - Update current user's profile
  app.patch(
    '/profile',
    validateUpdateProfile,
    (c) => userController.updateProfile(c)
  );

  return app;
}
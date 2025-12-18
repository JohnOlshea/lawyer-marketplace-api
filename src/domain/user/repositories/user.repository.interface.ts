import { User } from '../entities/user.entity';

/**
 * Filter criteria for listing users with pagination
 */
export interface ListUsersFilter {
  role?: string;
  banned?: boolean;
  onboardingCompleted?: boolean;
  page: number;
  limit: number;
}

/**
 * Paginated result set for user listings
 * Includes navigation metadata for client-side pagination
 */
export interface ListUsersResult {
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

/**
 * Repository interface for User aggregate persistence
 * 
 * Infrastructure layer implements this with specific data store
 * (e.g., PostgreSQL, MongoDB). Domain layer depends on abstraction.
 * 
 * Note: Methods return domain entities, not data transfer objects
 */
export interface IUserRepository {
  /**
   * @returns null if user not found
   */
  findById(id: string): Promise<User | null>;
  
  /**
   * @returns null if no user with email exists
   */
  findByEmail(email: string): Promise<User | null>;
  
  /**
   * Optimized existence check without full hydration
   */
  existsByEmail(email: string): Promise<boolean>;
  
  /**
   * Retrieves paginated and filtered user list
   * Supports filtering by role, ban status, and onboarding completion
   */
  list(filter: ListUsersFilter): Promise<ListUsersResult>;
  
  /**
   * Persists user aggregate changes
   * @returns Updated user with new timestamps
   */
  update(user: User): Promise<User>;
}
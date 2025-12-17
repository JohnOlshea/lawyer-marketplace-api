import { eq, and, sql } from 'drizzle-orm';
import type { IUserRepository, ListUsersFilter, ListUsersResult } from '../../../../domain/user/repositories/user.repository.interface';
import { User } from '../../../../domain/user/entities/user.entity';
import { user } from '../../schema';
import { UserMapper } from '../../mappers/user.mapper';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

/**
 * DrizzleUserRepository
 * 
 * Concrete implementation of IUserRepository using Drizzle ORM and PostgreSQL.
 * Handles data persistence and retrieval operations for User entities.
 * 
 * Responsibilities:
 * - Database operations (CRUD)
 * - Query building and filtering
 * - Pagination logic
 * - Mapping between database records and domain entities
 */
export class DrizzleUserRepository implements IUserRepository {
  constructor(private readonly db: NodePgDatabase<typeof import('../../schema')>) { }

  /**
   * Finds a user by their unique identifier.
   * 
   * @param id - User's unique identifier
   * @returns User entity if found, null otherwise
   */
  async findById(id: string): Promise<User | null> {
    const result = await this.db.query.user.findFirst({
      where: eq(user.id, id),
    });

    if (!result) {
      return null;
    }

    return UserMapper.toDomain(result);
  }

  /**
   * Finds a user by their email address.
   * 
   * @param email - User's email address
   * @returns User entity if found, null otherwise
   */
  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db.query.user.findFirst({
      where: eq(user.email, email),
    });

    if (!result) {
      return null;
    }

    return UserMapper.toDomain(result);
  }

  /**
   * Retrieves all users without pagination.
   * 
   * @returns Array of all user entities
   * @deprecated Use list() method for better performance with large datasets
   */
  async findAll(): Promise<User[]> {
    const results = await this.db.select().from(user);
    return results.map((result) => UserMapper.toDomain(result));
  }

  /**
   * Lists users with filtering and pagination.
   * 
   * @param filter - Filtering and pagination criteria
   * @returns Paginated result with users and pagination metadata
   * 
   * Supports filtering by:
   * - role: User role (admin, lawyer, client)
   * - banned: Ban status
   * - onboardingCompleted: Onboarding completion status
   */
  async list(filter: ListUsersFilter): Promise<ListUsersResult> {
    // Build dynamic WHERE clause based on filters
    const conditions = [];

    if (filter.role) {
      conditions.push(eq(user.role, filter.role));
    }

    if (filter.banned !== undefined) {
      conditions.push(eq(user.banned, filter.banned));
    }

    if (filter.onboardingCompleted !== undefined) {
      conditions.push(eq(user.onboardingCompleted, filter.onboardingCompleted));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Execute count query for pagination metadata
    const countResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(user)
      .where(whereClause);

    const total = Number(countResult[0]?.count ?? 0);


    // Execute count query for pagination metadata
    const offset = (filter.page - 1) * filter.limit;
    const results = await this.db
      .select()
      .from(user)
      .where(whereClause)
      .limit(filter.limit)
      .offset(offset)
      .orderBy(user.createdAt);

    const users = results.map((result) => UserMapper.toDomain(result));

    const totalPages = Math.ceil(total / filter.limit);

    return {
      data: users,
      pagination: {
        page: filter.page,
        limit: filter.limit,
        total,
        totalPages,
        hasNext: filter.page < totalPages,
        hasPrevious: filter.page > 1,
      },
    };
  }

  /**
 * Updates an existing user entity.
 * 
 * @param userEntity - User entity with updated values
 * @returns Updated user entity
 * 
 * Note: Only updates mutable fields. Immutable fields like id, email,
 * and createdAt are not modified.
 */
  async update(userEntity: User): Promise<User> {
    await this.db
      .update(user)
      .set({
        name: userEntity.name,
        image: userEntity.image,
        role: userEntity.role,
        banned: userEntity.banned,
        banReason: userEntity.banReason,
        banExpires: userEntity.banExpires,
        onboardingCompleted: userEntity.onboardingCompleted,
        updatedAt: userEntity.updatedAt,
      })
      .where(eq(user.id, userEntity.id));

    return userEntity;
  }

  /**
   * Permanently deletes a user.
   * 
   * @param id - ID of the user to delete
   * 
   * Warning: This is a hard delete. Consider implementing soft delete
   * for audit trails and data recovery.
   */
  async delete(id: string): Promise<void> {
    await this.db.delete(user).where(eq(user.id, id));
  }

  /**
   * Checks if a user with the given email exists.
   * 
   * @param email - Email address to check
   * @returns True if user exists, false otherwise
   * 
   * Optimized query that only selects the ID field.
   */
  async existsByEmail(email: string): Promise<boolean> {
    const result = await this.db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    return result.length > 0;
  }
}
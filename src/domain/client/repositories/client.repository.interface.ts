import type { IRepository } from '../../shared/interfaces/repository.interface';
import type { Client } from '../entities/client.entity';

/**
 * Client Repository Interface
 * 
 * Defines the contract for client persistence operations.
 * This interface sits in the domain layer, while implementations live in infrastructure.
 * 
 * @remarks
 * - Infrastructure layer implements this interface
 * - Domain depends on abstraction, not concrete implementation (Dependency Inversion)
 * - Easy to swap implementations (Drizzle → Prisma → TypeORM)
 */
export interface IClientRepository extends IRepository<Client> {
  /**
   * Finds a client by their associated user ID
   * 
   * @param userId - UUID of the authenticated user from Better Auth
   * @returns Client aggregate or null if not found
   */
  findByUserId(userId: string): Promise<Client | null>;

  /**
   * Persists client aggregate updates.
   * Handles specializations and related data in transaction.
   * 
   * @param client - Updated client aggregate
   * @returns Persisted client entity
   */
  update(client: Client): Promise<Client>;
}
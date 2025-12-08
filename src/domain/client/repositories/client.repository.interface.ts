import type { IRepository } from '../../shared/interfaces/repository.interface';
import type { Client } from '../entities/client.entity';

/**
 * Client Repository Interface
 * 
 * Defines the contract for client persistence operations.
 * 
 * @remarks
 * - Follows Repository pattern from DDD
 * - Infrastructure layer implements this interface
 * - Domain layer depends on this abstraction (Dependency Inversion)
 * - Keeps domain logic independent of data access details
 * 
 * @example
 * ```typescript
 * class DrizzleClientRepository implements IClientRepository {
 *   async findByEmail(email: string): Promise<Client | null> {
 *     // Implementation details...
 *   }
 * }
 * ```
 */
export interface IClientRepository extends IRepository<Client> {
  /**
   * Finds a client by their email address
   * 
   * @param email - Email address to search for
   * @returns Client if found, null otherwise
   * 
   * @remarks
   * Email should be unique in the system (business rule)
   * Used for duplicate detection during registration
   */
  findByEmail(email: string): Promise<Client | null>;
}
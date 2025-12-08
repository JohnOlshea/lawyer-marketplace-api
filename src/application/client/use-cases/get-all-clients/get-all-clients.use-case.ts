import type { Client } from '@/domain/client/entities/client.entity';
import type { IClientRepository } from '@/domain/client/repositories/client.repository.interface';
import type { IUseCaseWithoutInput } from '@/application/shared/interfaces/use-case.interface';

/**
 * Get All Clients Use Case
 * 
 * Retrieves all clients from the system.
 * 
 * @remarks
 * - Application layer orchestrates the workflow
 * - Depends on domain repository abstraction (not concrete implementation)
 * - Returns domain entities (not DTOs - controller handles mapping)
 * 
 * TODO: Add pagination support for production
 * TODO: Add filtering/sorting capabilities
 * TODO: Consider implementing cursor-based pagination for large datasets
 * 
 * @example
 * ```typescript
 * const useCase = new GetAllClientsUseCase(clientRepository);
 * const clients = await useCase.execute();
 * ```
 */
export class GetAllClientsUseCase implements IUseCaseWithoutInput<Client[]> {
  constructor(private readonly clientRepository: IClientRepository) {}

  /**
   * Executes the use case
   * 
   * @returns Array of all clients
   * @throws {Error} If repository operation fails
   */
  async execute(): Promise<Client[]> {
    try {
      const clients = await this.clientRepository.findAll();
      return clients;
    } catch (error) {
      // Log error and re-throw
      // TODO: Integrate proper logging service (Winston)
      console.error('[GetAllClientsUseCase] Failed to retrieve clients:', error);
      throw error;
    }
  }
}
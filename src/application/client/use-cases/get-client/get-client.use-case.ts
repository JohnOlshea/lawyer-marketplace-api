import type { Client } from '@/domain/client/entities/client.entity';
import type { IClientRepository } from '@/domain/client/repositories/client.repository.interface';
import type { IUseCase } from '@/application/shared/interfaces/use-case.interface';

/**
 * Get Client Use Case Input
 */
export interface GetClientInput {
  id: string;
}

/**
 * Get Client Use Case
 * 
 * Retrieves a single client by their ID.
 * 
 * @remarks
 * - Follows Single Responsibility Principle
 * - Throws descriptive error when client not found
 * - TODO: Replace generic Error with ClientNotFoundException for better error handling
 * 
 * @example
 * ```typescript
 * const useCase = new GetClientUseCase(clientRepository);
 * const client = await useCase.execute({ id: 'client-uuid' });
 * ```
 */
export class GetClientUseCase implements IUseCase<GetClientInput, Client> {
  constructor(private readonly clientRepository: IClientRepository) {}

  /**
   * Executes the use case
   * 
   * @param input - Contains client ID to retrieve
   * @returns Client entity
   * @throws {Error} If client doesn't exist or operation fails
   * TODO: Create ClientNotFoundException for better error handling in controllers
   */
  async execute(input: GetClientInput): Promise<Client> {
    this.validateInput(input);

    try {
      const client = await this.clientRepository.findById(input.id);

      if (!client) {
        // TODO: Replace with ClientNotFoundException
        throw new Error(`Client with ID '${input.id}' not found`);
      }

      return client;
    } catch (error) {
      // Log and re-throw
      console.error('[GetClientUseCase] Failed to retrieve client:', error);
      throw error;
    }
  }

  /**
   * Validates use case input
   * @throws {Error} If validation fails
   */
  private validateInput(input: GetClientInput): void {
    if (!input.id || input.id.trim().length === 0) {
      throw new Error('Client ID is required');
    }

    // Optional: UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(input.id)) {
      throw new Error('Invalid client ID format. Expected UUID.');
    }
  }
}
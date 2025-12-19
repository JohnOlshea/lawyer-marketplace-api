import type { GetClientDto } from './get-client.dto';
import type { Client } from '@/domain/client/entities/client.entity';
import type { IUseCase } from '@/application/shared/interfaces/use-case.interface';
import type { IClientRepository } from '@/domain/client/repositories/client.repository.interface';
import { ClientNotFoundError } from '@/domain/client/errors/client-not-found.error';

/**
 * Get Client Use Case
 * 
 * Retrieves a single client by their ID.
 * 
 * @example
 * ```typescript
 * const useCase = new GetClientUseCase(clientRepository);
 * const client = await useCase.execute({ id: 'client-uuid' });
 * ```
 */
export class GetClientUseCase implements IUseCase<GetClientDto, Client> {
  constructor(private readonly clientRepository: IClientRepository) {}

  /**
   * Executes the use case
   * 
   * @param dto - Contains client ID to retrieve
   * @returns Client entity
   * @throws {Error} If client doesn't exist or operation fails
   * TODO: Create ClientNotFoundException for better error handling in controllers
   */
  async execute(dto: GetClientDto): Promise<Client> {
    // this.validateInput(dto);

    // TODO: Is try catch needed?
    try {
      const client = await this.clientRepository.findByUserId(dto.userId);

      if (!client) {
        throw new ClientNotFoundError(`Client not found for user: ${dto.userId}`);
      }

      return client;
    } catch (error) {
      // Log and re-throw
      console.error('[GetClientUseCase] Failed to retrieve client:', error);
      throw error;
    }
  }

  // TODO: is this the best location for this?

  /**
   * Validates use case input
   * @throws {Error} If validation fails
   */
  private validateInput(input: GetClientDto): void {
    if (!input.userId || input.userId.trim().length === 0) {
      throw new Error('Client ID is required');
    }

    // Optional: UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(input.userId)) {
      throw new Error('Invalid client ID format. Expected UUID.');
    }
  }
}
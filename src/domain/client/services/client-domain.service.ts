import { Client } from '../entities/client.entity';
import type { IClientRepository } from '../repositories/client.repository.interface';
import { ClientAlreadyExistsError } from '../errors/client-already-exists.error';

export class ClientDomainService {
  constructor(
    private readonly clientRepository: IClientRepository,
  ) {}

  async ensureClientDoesNotExist(userId: string): Promise<void> {
    const existingClient = await this.clientRepository.findByUserId(userId);

    if (existingClient) {
      throw new ClientAlreadyExistsError('Client profile already exists for this user');
    }
  }

  canCompleteOnboarding(client: Client): boolean {
    return (
      client.specializationIds.length > 0 &&
      client.specializationIds.length <= 3 &&
      !!client.location
    );
  }
}

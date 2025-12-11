import { NotFoundException } from '../../shared/errors/not-found.exception';

/**
 * Client Not Found Domain Error
 * 
 * Thrown when a requested client cannot be located in the repository.
 * Typically occurs during read or update operations with invalid identifiers.
 */
export class ClientNotFoundError extends NotFoundException {
  constructor(message: string = 'Client not found') {
    super(message);
    this.name = 'ClientNotFoundError';
  }
}

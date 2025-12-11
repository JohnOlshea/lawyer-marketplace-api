import { NotFoundException } from '../../shared/errors/not-found.exception';

export class ClientNotFoundError extends NotFoundException {
  constructor(message: string = 'Client not found') {
    super(message);
    this.name = 'ClientNotFoundError';
  }
}

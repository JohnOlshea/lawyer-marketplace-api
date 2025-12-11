import { ConflictException } from '../../shared/errors/conflict.exception';

export class ClientAlreadyExistsError extends ConflictException {
  constructor(message: string = 'Client already exists') {
    super(message);
    this.name = 'ClientAlreadyExistsError';
  }
}

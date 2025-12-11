import { ConflictException } from '../../shared/errors/conflict.exception';

/**
 * Client Already Exists Domain Error
 * 
 * Thrown when attempting to create a client profile for a user
 * who already has an existing profile in the system.
 * 
 * @remarks
 * This enforces the business rule: one client profile per user account.
 */
export class ClientAlreadyExistsError extends ConflictException {
  constructor(message: string = 'Client already exists') {
    super(message);
    this.name = 'ClientAlreadyExistsError';
  }
}

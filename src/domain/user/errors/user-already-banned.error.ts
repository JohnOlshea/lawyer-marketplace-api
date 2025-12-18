import { ConflictException } from '../../shared/errors/conflict.exception';

/**
 * Domain error thrown when attempting to ban an already banned user
 * Indicates business rule violation at domain level
 */
export class UserAlreadyBannedError extends ConflictException {
  constructor(message: string = 'User is already banned') {
    super(message);
    this.name = 'UserAlreadyBannedError';
  }
}
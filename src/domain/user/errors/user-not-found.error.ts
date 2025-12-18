import { NotFoundException } from '../../shared/errors/not-found.exception';

/**
 * Domain error thrown when user cannot be found by identifier
 * Used by repositories and domain services for missing aggregate roots
 */
export class UserNotFoundError extends NotFoundException {
  constructor(message: string = 'User not found') {
    super(message);
    this.name = 'UserNotFoundError';
  }
}
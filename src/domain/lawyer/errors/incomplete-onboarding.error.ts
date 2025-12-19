import { DomainException } from '../../shared/errors/domain.exception';

/**
 * IncompleteOnboardingError
 * Thrown when attempting to submit with missing required data
 */
export class IncompleteOnboardingError extends DomainException {
  constructor(message: string = 'Onboarding is incomplete') {
    super(message);
    this.name = 'IncompleteOnboardingError';
  }
}
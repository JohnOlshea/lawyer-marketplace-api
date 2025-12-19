import { DomainException } from '../../shared/errors/domain.exception';

/**
 * InvalidOnboardingStepError
 * Thrown when attempting to perform actions out of sequence
 */
export class InvalidOnboardingStepError extends DomainException {
  constructor(message: string = 'Invalid onboarding step') {
    super(message);
    this.name = 'InvalidOnboardingStepError';
  }
}
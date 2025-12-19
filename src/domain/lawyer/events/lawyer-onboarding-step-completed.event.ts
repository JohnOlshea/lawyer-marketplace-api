import { DomainEvent } from '../../shared/domain-event';

/**
 * LawyerOnboardingStepCompletedEvent
 * Published when a lawyer advances to the next onboarding step
 */
export class LawyerOnboardingStepCompletedEvent extends DomainEvent {
  constructor(
    public readonly lawyerId: string,
    public readonly step: string,
    public readonly nextStep: string
  ) {
    super('LawyerOnboardingStepCompleted');
  }

  getAggregateId(): string {
    return this.lawyerId;
  }
}
import { DomainEvent } from '../../shared/domain-event';

/**
 * LawyerOnboardingSubmittedEvent
 * Published when a lawyer submits their profile for admin review
 * Triggers admin notification and review workflow
 */
export class LawyerOnboardingSubmittedEvent extends DomainEvent {
  constructor(
    public readonly lawyerId: string,
    public readonly lawyerName: string,
    public readonly email: string
  ) {
    super('LawyerOnboardingSubmitted');
  }

  getAggregateId(): string {
    return this.lawyerId;
  }
}
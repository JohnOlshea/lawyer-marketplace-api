import { DomainEvent } from '../../shared/domain-event';

/**
 * LawyerCreatedEvent
 * Published when a new lawyer begins onboarding (Step 1 complete)
 */
export class LawyerCreatedEvent extends DomainEvent {
  constructor(
    public readonly lawyerId: string,
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string
  ) {
    super('LawyerCreated');
  }

  getAggregateId(): string {
    return this.lawyerId;
  }
}
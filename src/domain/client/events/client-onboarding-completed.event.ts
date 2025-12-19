/**
 * ClientOnboardingCompletedEvent
 * Published when client completes initial onboarding flow.
 * Signals readiness for full platform access.
 */
import { DomainEvent } from '../../shared/domain-event';

export class ClientOnboardingCompletedEvent extends DomainEvent {
  constructor(
    public readonly clientId: string,
    public readonly userId: string
  ) {
    super('ClientOnboardingCompleted');
  }

  getAggregateId(): string {
    return this.clientId;
  }
}
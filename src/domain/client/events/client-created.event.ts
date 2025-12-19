import { DomainEvent } from '../../shared/domain-event';

/**
 * ClientCreatedEvent
 * Published when a new client aggregate is created.
 * Useful for triggering welcome emails, analytics, etc.
 */
export class ClientCreatedEvent extends DomainEvent {
  constructor(
    public readonly clientId: string,
    public readonly userId: string
  ) {
    super('ClientCreated');
  }

  getAggregateId(): string {
    return this.clientId;
  }
}
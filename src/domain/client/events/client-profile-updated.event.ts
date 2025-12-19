/**
 * ClientProfileUpdatedEvent
 * Published on any client profile modification.
 * Useful for audit logs, cache invalidation, etc.
 */
import { DomainEvent } from '../../shared/domain-event';

export class ClientProfileUpdatedEvent extends DomainEvent {
  constructor(public readonly clientId: string) {
    super('ClientProfileUpdated');
  }

  getAggregateId(): string {
    return this.clientId;
  }
}
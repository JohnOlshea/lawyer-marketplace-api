import { BaseEntity } from './base-entity';
import { DomainEvent } from './domain-event';

export abstract class AggregateRoot extends BaseEntity {
  // Consistency boundaries Controlls all access to their child entities

  protected applyEvent(event: DomainEvent): void {
    this.addDomainEvent(event);
  }
}

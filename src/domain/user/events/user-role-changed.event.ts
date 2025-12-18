import { DomainEvent } from '../../shared/domain-event';

/**
 * Event emitted when a user's role is changed
 * 
 * Subscribers might:
 * - Update permission caches
 * - Notify the user
 * - Trigger role-specific onboarding
 * - Audit log the change
 */
export class UserRoleChangedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly oldRole: string,
    public readonly newRole: string,
    public readonly changedBy: string
  ) {
    super('UserRoleChanged');
  }

  getAggregateId(): string {
    return this.userId;
  }
}
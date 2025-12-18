import { DomainEvent } from '../../shared/domain-event';

/**
 * Event emitted when a user is banned
 * 
 * Subscribers might:
 * - Revoke active sessions
 * - Send notification emails
 * - Audit log the action
 * - Trigger related business processes
 */
export class UserBannedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly reason: string,
    public readonly expiresAt?: Date,
    public readonly bannedBy?: string
  ) {
    super('UserBanned');
  }

  getAggregateId(): string {
    return this.userId;
  }
}
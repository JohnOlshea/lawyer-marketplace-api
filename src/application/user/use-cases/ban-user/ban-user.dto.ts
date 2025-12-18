/**
 * Data Transfer Object for banning a user
 * 
 * @remarks
 * Used to transfer ban operation parameters from the presentation layer
 * to the application layer. Ensures type safety and explicit contract
 * for ban operations.
 * 
 * @example
 * ```typescript
 * const banDto: BanUserDto = {
 *   userId: 'usr_123',
 *   reason: 'Violation of terms of service',
 *   expiresAt: new Date('2024-12-31')
 * };
 * ```
 */
export interface BanUserDto {
  userId: string;
  reason: string;
  expiresAt?: Date;
}
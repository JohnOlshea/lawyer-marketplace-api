/**
 * Data Transfer Object for changing a user's role
 * 
 * @remarks
 * Carries the minimal data required to change a user's role in the system.
 * Used to transfer parameters from presentation layer to application layer.
 * 
 * The newRole string will be validated and transformed into a Role value object
 * by the use case, ensuring type safety and domain rule enforcement.
 * 
 * @example
 * ```typescript
 * const changeRoleDto: ChangeUserRoleDto = {
 *   userId: 'usr_123',
 *   newRole: 'lawyer'
 * };
 * ```
 */
export interface ChangeUserRoleDto {
  userId: string;
  newRole: string;
}
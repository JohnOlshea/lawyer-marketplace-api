/**
 * Data Transfer Object for updating user profile information
 * 
 * @remarks
 * Carries user-editable profile fields from the presentation layer to the
 * application layer. All fields are optional to support partial updates.
 * 
 * This DTO intentionally excludes sensitive or system-managed fields such as:
 * - Email (usually requires verification flow)
 * - Role (requires admin privileges via ChangeUserRoleUseCase)
 * - Ban status (requires admin privileges via BanUserUseCase)
 * - Onboarding completion (managed by system)
 * 
 * Users can only update cosmetic/profile fields through this interface,
 * ensuring proper separation of concerns and security boundaries.
 * 
 * @example
 * ```typescript
 * // Update just the name
 * const dto1: UpdateUserProfileDto = {
 *   name: 'John Smith'
 * };
 * 
 * // Update just the image
 * const dto2: UpdateUserProfileDto = {
 *   image: 'https://example.com/avatar.jpg'
 * };
 * 
 * // Update both
 * const dto3: UpdateUserProfileDto = {
 *   name: 'Jane Doe',
 *   image: 'https://example.com/jane.jpg'
 * };
 * ```
 */
export interface UpdateUserProfileDto {
  /**
   * Updated display name for the user
   * 
   * @remarks
   * This is the name shown throughout the application UI.
   * Should be validated for:
   * - Minimum/maximum length
   * - Allowed characters
   * - Profanity/inappropriate content (if applicable)
   * 
   * Validation typically happens in the domain entity or value object.
   * 
   * @optional
   */
  name?: string;

  /**
   * Updated profile image URL
   * 
   * @remarks
   * Should be a valid URL pointing to an image resource.
   * Common sources:
   * - Cloud storage (S3/Cloudinary)
   * - OAuth provider (Google, GitHub avatar)
   * - Gravatar
   * 
   * Validation considerations:
   * - URL format validation
   * - Image accessibility/existence check
   * - File type verification
   * - Size/dimension constraints
   * 
   * Security note: Never trust user-provided URLs without validation.
   * Consider implementing URL allowlisting or content verification.
   * 
   * @optional
   */
  image?: string;
}
/**
 * UserDto
 * 
 * Data Transfer Object representing user information for API responses.
 * Defines the contract between the API and its consumers.
 * 
 * This DTO excludes sensitive information like password hashes
 * and represents the public view of a user entity.
 */
export interface UserDto {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  role: string;
  banned: boolean;
  banReason?: string;
  banExpires?: Date;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
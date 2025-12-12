/**
 * Complete Onboarding Data Transfer Object
 * 
 * This DTO bridges the presentation layer and application layer.
 */
export interface CompleteOnboardingDto {
  userId: string; // Better-Auth user ID - links client profile to authentication
  name: string;
  emailVerified: boolean;
  phoneNumber?: string;
  country: string;
  state: string;
  company?: string;
  specializationIds: string[];
}

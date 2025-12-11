/**
 * Complete Onboarding Data Transfer Object
 * 
 * This DTO bridges the presentation layer and application layer.
 */
export interface CompleteOnboardingDto {
  userId: string; // Better-Auth user ID - links client profile to authentication
  email: string;
  name: string;
  phoneNumber?: string;
  country: string;
  state: string;
  company?: string;
  specializationIds: string[];
}

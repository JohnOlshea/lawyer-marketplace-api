export interface CompleteOnboardingDto {
  userId: string;
  email: string;
  name: string;
  phoneNumber?: string;
  country: string;
  state: string;
  company?: string;
  specializationIds: string[];
}

/**
 * Client DTO
 * Presentation layer representation of a client aggregate.
 * Used for API responses to decouple domain entities from external contracts.
 */
export interface ClientDto {
  id: string;
  userId: string;
  phoneNumber?: string;
  location: {
    country: string;
    state: string;
  };
  company?: string;
  specializationIds: string[];
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
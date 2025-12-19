/**
 * Update Client Profile DTO
 * Partial update payload supporting both user and client table fields.
 * Country/state must be provided together due to Location value object constraints.
 */
export interface UpdateClientProfileDto {
  // User table fields
  name?: string;
  image?: string;

  // Client table fields
  phoneNumber?: string;
  country?: string;
  state?: string;
  company?: string;
}
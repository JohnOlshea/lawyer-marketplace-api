import type { UpdateClientProfileResult } from "@/application/client/use-cases/update-client-profile/update-client-profile.use-case";

/**
 * Client Profile Update Response DTO
 * 
 * Returns the updated profile data spanning both User and Client entities.
 * comment on why DTO.fromResult() (static factory) was used over Mapper.toDto()- Can handle complex, multi-entity results
 
 */
export class ClientProfileUpdateResponseDto {
  // User fields
  id!: string;
  name!: string;
  email!: string;
  emailVerified!: boolean;
  image!: string | null;
  role!: string;
  
  // Client fields
  clientId!: string;
  phoneNumber!: string | null;
  country!: string;
  state!: string;
  company!: string | null;
  
  createdAt!: Date;
  updatedAt!: Date;

  /**
   * Maps UpdateClientProfileResult to DTO
   * 
   * Merges User and Client entity data into a unified profile response.
   */
  static fromResult(result: UpdateClientProfileResult, userId: string): ClientProfileUpdateResponseDto {
    // At least one entity should be updated
    const user = result.user;
    const client = result.client;

    if (!user && !client) {
      throw new Error('No updates were performed');
    }

    return {
      // Use updated user data if available, otherwise we need to fetch it
      id: user?.id || userId,
      name: user?.name || '',
      email: user?.email || '',
      emailVerified: user?.emailVerified || false,
      image: user?.image || null,
      role: user?.role || 'client',
      
      // Client data
      clientId: client?.id || '',
      phoneNumber: client?.phoneNumber || null,
      country: client?.location?.country || '',
      state: client?.location?.state || '',
      company: client?.company || null,
      
      createdAt: user?.createdAt || client?.createdAt || new Date(),
      updatedAt: user?.updatedAt || client?.updatedAt || new Date(),
    };
  }
}
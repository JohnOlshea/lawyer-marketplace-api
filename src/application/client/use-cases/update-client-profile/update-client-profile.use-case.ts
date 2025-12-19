import type { IUserRepository } from '../../../../domain/user/repositories/user.repository.interface';
import type { IClientRepository } from '../../../../domain/client/repositories/client.repository.interface';
import { UserNotFoundError } from '../../../../domain/user/errors/user-not-found.error';
import { ClientNotFoundError } from '../../../../domain/client/errors/client-not-found.error';
import { Location } from '../../../../domain/client/value-objects/location.vo';
import type { UpdateClientProfileDto } from './update-client-profile.dto';
import type { User } from '@/domain/user/entities/user.entity';
import type { Client } from '@/domain/client/entities/client.entity';

export interface UpdateClientProfileResult {
  user: User | null;
  client: Client | null;
}

/**
 * UpdateClientProfileUseCase
 * 
 * Coordinates profile updates across User and Client aggregates.
 * Handles partial updates - only modifies fields provided in DTO.
 * 
 * Business Rules:
 * - Location updates require both country AND state (enforced by Location VO)
 * - User and Client updates are independent - either can be null in result
 * - Client must complete onboarding before profile updates
 */
export class UpdateClientProfileUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly clientRepository: IClientRepository
  ) {}

  /**
   * @param userId - ID of user performing the update
   * @param dto - Partial update fields for user and/or client
   * @returns Updated entities (null if not modified)
   * @throws {UserNotFoundError} If user doesn't exist
   * @throws {ClientNotFoundError} If client doesn't exist or hasn't completed onboarding
   * @throws {Error} If country/state provided separately
   */
  async execute(userId: string, dto: UpdateClientProfileDto): Promise<UpdateClientProfileResult> {
    let updatedUser: User | null = null;
    let updatedClient: Client | null = null;

    // Update User table (name, image) - if provided
    if (dto.name !== undefined || dto.image !== undefined) {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new UserNotFoundError();
      }

      user.updateProfile({
        name: dto.name,
        image: dto.image,
      });

      updatedUser = await this.userRepository.update(user);
    }

    // Update Client table (phoneNumber, country, state, company) - if provided
    if (
      dto.phoneNumber !== undefined ||
      dto.country !== undefined ||
      dto.state !== undefined ||
      dto.company !== undefined
    ) {
      const client = await this.clientRepository.findByUserId(userId);
      if (!client) {
        throw new ClientNotFoundError('Client profile not found. Complete onboarding first.');
      }

      const updates: any = {};

      if (dto.phoneNumber !== undefined) {
        updates.phoneNumber = dto.phoneNumber;
      }

      if (dto.company !== undefined) {
        updates.company = dto.company;
      }

      // Location update requires both country and state
      if (dto.country !== undefined && dto.state !== undefined) {
        updates.location = Location.create({state: dto.state, country: dto.country});
      } else if (dto.country !== undefined || dto.state !== undefined) {
        throw new Error('Both country and state must be provided together');
      }

      client.updateProfile(updates);
      updatedClient = await this.clientRepository.update(client);
    }

    // Return the actual entities, not just flags
    return {
      user: updatedUser,
      client: updatedClient,
    };

    
    // TODO: return data also why await this.clientRepository.findByUserId(userId))!.id
    // return {
    //   userId,
    //   clientId: clientUpdated ? (await this.clientRepository.findByUserId(userId))!.id : '',
    //   updated: {
    //     user: userUpdated,
    //     client: clientUpdated,
    //   },
    // };
  }
}
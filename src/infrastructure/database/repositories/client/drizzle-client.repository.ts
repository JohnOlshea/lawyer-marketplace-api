import { eq } from 'drizzle-orm';

import { db } from '@/infrastructure/database/db';
import { ClientMapper } from '../../mappers/client.mapper';
import { clients, clientSpecializations, user } from '../../schema';
import type { Client } from '@/domain/client/entities/client.entity';
import type { IClientRepository } from '@/domain/client/repositories/client.repository.interface';

/**
 * Drizzle Client Repository Implementation
 * 
 * Concrete implementation of IClientRepository using Drizzle ORM.
 * Handles data persistence and retrieval for Client aggregates.
 * 
 * @remarks
 * - Infrastructure layer: handles data access details
 * - Implements domain repository interface (Dependency Inversion Principle)
 * - Uses ClientMapper to convert between DB rows and domain entities
 * - Database-agnostic from domain's perspective
 * 
 * TODO: Inject database instance through constructor for better testability
 * TODO: Add caching layer for frequently accessed clients
 * TODO: Add comprehensive error handling with custom exceptions
 * TODO: Add query performance monitoring/logging
 */
export class DrizzleClientRepository implements IClientRepository {
  /**
   * Finds a client by their unique ID
   * 
   * @param id - Client UUID
   * @returns Client entity or null if not found
   * 
   * @remarks
   * Eagerly loads related entities (user, specializations) to prevent N+1 queries.
   */
  async findById(id: string): Promise<Client | null> {
    const result = await db.query.clients.findFirst({
      where: eq(clients.id, id),
      with: {
        user: true,  // Join with user table to get name
        specializations: {
          with: {
            specialization: true,
          },
        },
      },
    });

    if (!result) return null;

    // Extract specialization IDs from junction table
    const specializationIds = result.specializations.map(
      (cs) => cs.specializationId
    );

    return ClientMapper.toDomain({
      ...result,
      name: result.user.name,  // Get name from user table
      specializationIds,
    });
  }

  /**
   * Finds a client by their associated user ID
   * 
   * @param userId - User UUID from auth system
   * @returns Client domain entity or null if not found
   * 
   * @remarks
   * Eagerly loads related entities (user, specializations) to prevent N+1 queries.
   */
  async findByUserId(userId: string): Promise<Client | null> {
    const result = await db.query.clients.findFirst({
      where: eq(clients.userId, userId),
      with: {
        user: true,
        specializations: {
          with: {
            specialization: true,
          },
        },
      },
    });

    if (!result) return null;

    // Extract specialization IDs and name from joined data
    const specializationIds = result.specializations.map(
      (cs) => cs.specializationId
    );

    return ClientMapper.toDomain({
      ...result,
      name: result.user.name,  // Get name from user table
      specializationIds,        // Pass extracted IDs
    });
  }

  /**
   * Retrieves all clients with their related data
   * 
   * @returns Array of all client domain entities
   * 
   * @remarks
   * Eagerly loads relations to prevent N+1 queries.
   * 
   * WARNING: This loads ALL clients into memory.
   * TODO: Add pagination support for production use:
   * TODO: Add optional filtering (by country, specialization, etc.)
   * TODO: Add sorting options (createdAt, name, etc.)
   */
  async findAll(): Promise<Client[]> {
    const results = await db.query.clients.findMany({
      with: {
        user: true,
        specializations: {
          with: {
            specialization: true,
          },
        },
      },
    });

    return results.map((result) => ClientMapper.toDomain(result));
  }

  /**
   * Persists a client aggregate to the database
   * 
   * @param client - Client domain entity to save
   * @returns The saved client entity
   * 
   * @remarks
   * Performs a multi-step transactional save:
   * 1. Inserts/updates client record
   * 2. Manages client-specialization many-to-many relationships
   * 3. Updates user onboarding status if applicable
   * 
   * The entire operation is atomic - either all steps succeed or all are rolled back.
   * 
   * @throws {Error} If transaction fails (TODO: Wrap in RepositoryException)
   * 
   * TODO: Handle update case (currently only handles insert)
   * TODO: Publish domain events after successful transaction
   * TODO: Consider event sourcing for audit trail
   */
  async save(client: Client): Promise<Client> {
    return await db.transaction(async (tx) => {
      // Step 1: Use mapper to convert domain entity to persistence format
      const persistenceData = ClientMapper.toPersistence(client);

      // Step 2: Insert client record
      await tx.insert(clients).values(persistenceData)

      // Step 3: Insert client specializations only if there are specializations
      if (client.specializationIds.length > 0) {
        await tx.insert(clientSpecializations).values(
          client.specializationIds.map((specializationId) => ({
            clientId: client.id,
            specializationId,
          }))
        );
      }

      // Step 4: Update user onboarding_completed flag if onboarding is complete
      if (client.onboardingCompleted) {
        await tx
          .update(user)
          .set({
            onboardingCompleted: true,
            updatedAt: new Date(),
          })
          .where(eq(user.id, client.userId));
      }

      // Return the domain entity, not the DB row
      return client;
    });
  }
}
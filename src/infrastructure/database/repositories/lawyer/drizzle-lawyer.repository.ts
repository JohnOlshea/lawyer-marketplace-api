import { eq, and, inArray } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { ILawyerRepository } from '../../../../domain/lawyer/repositories/lawyer.repository.interface';
import { Lawyer } from '../../../../domain/lawyer/entities/lawyer.entity';
import { LawyerMapper } from '../../mappers/lawyer.mapper';
import * as schema from '../../schema';

/**
 * Drizzle ORM implementation of the Lawyer Repository
 * 
 * @remarks
 * Provides data persistence for Lawyer aggregate root with full support for:
 * - User relationship (1:1)
 * - Documents collection (1:N)
 * - Specializations with metadata (M:N through join table)
 * - Languages (M:N through join table)
 * 
 * All query methods eagerly load relations to ensure domain entities are fully hydrated.
 * Specializations and languages use replace-all strategy for updates (delete + insert).
 * 
 * @see {@link ILawyerRepository} for the domain contract
 * @see {@link LawyerMapper} for domain/persistence transformations
 */
export class DrizzleLawyerRepository implements ILawyerRepository {
  constructor(private readonly db: PostgresJsDatabase<typeof schema>) {}

  /**
   * Retrieves lawyer by unique identifier with all relations
   * 
   * @param id - Lawyer UUID
   * @returns Fully hydrated lawyer domain entity or null if not found
   * 
   * @remarks
   * Eagerly loads: user, documents, specializations (with metadata), and languages.
   * This ensures the returned aggregate is complete and ready for domain logic.
   */
  async findById(id: string): Promise<Lawyer | null> {
    const result = await this.db.query.lawyers.findFirst({
      where: eq(schema.lawyers.id, id),
      with: {
        user: true,
        documents: true,
        specializations: {
          with: {
            specialization: true,
          },
        },
        languages: {
          with: {
            language: true,
          },
        },
      },
    });

    return result ? LawyerMapper.toDomain(result) : null;
  }

  /**
   * Retrieves lawyer by associated user ID
   * 
   * @param userId - User UUID (1:1 relationship)
   * @returns Fully hydrated lawyer domain entity or null if no lawyer profile exists
   * 
   * @remarks
   * Used for profile lookups and ensuring users have only one lawyer profile.
   * Returns null for users without lawyer profiles (e.g., clients, admins).
   */
  async findByUserId(userId: string): Promise<Lawyer | null> {
    const result = await this.db.query.lawyers.findFirst({
      where: eq(schema.lawyers.userId, userId),
      with: {
        user: true,
        documents: true,
        specializations: {
          with: {
            specialization: true,
          },
        },
        languages: {
          with: {
            language: true,
          },
        },
      },
    });

    return result ? LawyerMapper.toDomain(result) : null;
  }

  /**
   * Retrieves lawyer by email address via user relationship
   * 
   * @param email - User's email address
   * @returns Fully hydrated lawyer domain entity or null if not found
   * 
   * @remarks
   * Queries through the user table join. Useful for authentication flows
   * and email-based lookups without requiring userId.
   */
  async findByEmail(email: string): Promise<Lawyer | null> {
    const result = await this.db.query.lawyers.findFirst({
      where: eq(schema.user.email, email),
      with: {
        user: true,
        documents: true,
        specializations: {
          with: {
            specialization: true,
          },
        },
        languages: {
          with: {
            language: true,
          },
        },
      },
    });

    return result ? LawyerMapper.toDomain(result) : null;
  }

  /**
   * Retrieves all lawyers with full relations
   * 
   * @returns Array of fully hydrated lawyer domain entities
   * 
   * @remarks
   * Use with caution in production - no pagination implemented.
   * Consider adding pagination parameters for large datasets.
   * 
   * TODO: Add pagination support (offset/limit or cursor-based)
   * TODO: Add filtering options (by status, specialization, etc.)
   */
  async findAll(): Promise<Lawyer[]> {
    const results = await this.db.query.lawyers.findMany({
      with: {
        user: true,
        documents: true,
        specializations: {
          with: {
            specialization: true,
          },
        },
        languages: {
          with: {
            language: true,
          },
        },
      },
    });

    return results.map((result) => LawyerMapper.toDomain(result));
  }

  /**
   * Persists a new lawyer aggregate to the database
   * 
   * @param lawyer - Lawyer domain entity to save
   * @returns The saved lawyer entity with database-generated fields
   * 
   * @remarks
   * Performs a two-step operation:
   * 1. Inserts lawyer record (flattened from domain entity)
   * 2. Re-fetches with all relations to return fully hydrated aggregate
   * 
   * Relations (documents, specializations, languages) should be saved separately
   * using their dedicated methods after the main record is persisted.
   * 
   * @throws {Error} If insert fails or returns no result
   * @throws {Error} If re-fetch fails (data inconsistency)
   * 
   * TODO: Consider wrapping in transaction for atomic saves with relations
   * TODO: Wrap errors in RepositoryException for better domain-layer handling
   * TODO: Publish domain events after successful save
   */
  async save(lawyer: Lawyer): Promise<Lawyer> {
    const persistence = LawyerMapper.toPersistence(lawyer);

    // Step 1: Insert lawyer record
    const result = await this.db
      .insert(schema.lawyers)
      .values(persistence)
      .returning();

    // Validate insert succeeded
    if (!result || result.length === 0 || !result[0]) {
      throw new Error('Failed to save lawyer: No result returned from insert');
    }

    const saved = result[0];

    // Step 2: Re-fetch with relations to ensure aggregate is complete
    const lawyerWithRelations = await this.findById(saved.id);
    
    if (!lawyerWithRelations) {
      throw new Error(`Failed to retrieve saved lawyer with id: ${saved.id}`);
    }

    return lawyerWithRelations;
  }

  /**
   * Updates existing lawyer aggregate in the database
   * 
   * @param lawyer - Lawyer domain entity with updated values
   * @returns The updated lawyer entity with all relations
   * 
   * @remarks
   * Updates only the main lawyer record. To update relations:
   * - Documents: Use saveDocuments()
   * - Specializations: Use saveSpecializations()
   * - Languages: Use saveLanguages()
   * 
   * Automatically sets updatedAt timestamp to current time.
   * 
   * @throws {Error} If lawyer not found after update (possible race condition)
   * 
   * TODO: Consider returning null instead of throwing if not found
   * TODO: Add optimistic locking with version field
   * TODO: Wrap in transaction when updating relations simultaneously
   */
  async update(lawyer: Lawyer): Promise<Lawyer> {
    const persistence = LawyerMapper.toPersistence(lawyer);

    // Update lawyer record with automatic timestamp
    await this.db
      .update(schema.lawyers)
      .set({
        ...persistence,
        updatedAt: new Date(),
      })
      .where(eq(schema.lawyers.id, lawyer.id));

    // Re-fetch to ensure we return latest state with relations
    const updated = await this.findById(lawyer.id);
    
    if (!updated) {
      throw new Error(`Failed to retrieve updated lawyer with id: ${lawyer.id}`);
    }

    return updated;
  }

  /**
   * Permanently removes lawyer and cascades to related records
   * 
   * @param id - Lawyer UUID to delete
   * 
   * @remarks
   * Database cascade rules handle deletion of:
   * - lawyerDocuments (foreign key cascade)
   * - lawyerSpecializations (foreign key cascade)
   * - lawyerLanguages (foreign key cascade)
   * 
   * Does NOT delete the associated user record (business requirement).
   * 
   * TODO: Consider soft delete pattern for audit trail
   * TODO: Add pre-delete validation (e.g., no active cases)
   * TODO: Publish domain event after successful deletion
   */
  async delete(id: string): Promise<void> {
    await this.db.delete(schema.lawyers).where(eq(schema.lawyers.id, id));
  }

  /**
   * Checks if a lawyer profile exists for given user ID
   * 
   * @param userId - User UUID to check
   * @returns true if lawyer profile exists, false otherwise
   * 
   * @remarks
   * Optimized query selecting only ID column for existence check.
   * Used for validation: ensuring users don't create duplicate lawyer profiles.
   */
  async existsByUserId(userId: string): Promise<boolean> {
    const result = await this.db.query.lawyers.findFirst({
      where: eq(schema.lawyers.userId, userId),
      columns: { id: true },
    });

    return !!result;
  }

  /**
   * Checks if bar license number is already registered
   * 
   * @param barNumber - Bar license number to check
   * @returns true if bar number exists, false otherwise
   * 
   * @remarks
   * Optimized query selecting only ID column for existence check.
   * Used for validation: bar numbers must be unique per jurisdiction requirements.
   */
  async existsByBarNumber(barNumber: string): Promise<boolean> {
    const result = await this.db.query.lawyers.findFirst({
      where: eq(schema.lawyers.barLicenseNumber, barNumber),
      columns: { id: true },
    });

    return !!result;
  }

  /**
   * Persists lawyer document records (credentials, certificates, etc.)
   * 
   * @param lawyerId - The lawyer's UUID
   * @param documents - Array of document metadata with validated types
   * 
   * @remarks
   * Document types are strongly typed for verification workflow:
   * - bar_certificate: State bar admission certificate
   * - law_degree: JD or equivalent degree
   * - professional_id: Government-issued ID
   * - other: Additional credentials
   * 
   * Documents are stored as metadata only; actual files are in cloud storage (publicId).
   * Safe to call multiple times - appends documents without deleting existing ones.
   * 
   * TODO: Add duplicate detection (same publicId/URL)
   * TODO: Consider batch size limits for large uploads
   */
  async saveDocuments(
    lawyerId: string,
    documents: Array<{
      type: 'bar_certificate' | 'law_degree' | 'professional_id' | 'other';
      url: string;
      publicId: string;
      originalName?: string;
      fileSize?: number;
      mimeType?: string;
    }>
  ): Promise<void> {
    if (documents.length === 0) return;

    await this.db.insert(schema.lawyerDocuments).values(
      documents.map((doc) => ({
        lawyerId,
        type: doc.type,
        url: doc.url,
        publicId: doc.publicId,
        originalName: doc.originalName,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
      }))
    );
  }

  /**
   * Replaces lawyer specializations with full replace strategy
   * 
   * @param lawyerId - The lawyer's UUID
   * @param specializations - Complete array of specializations with metadata
   * 
   * @remarks
   * Uses delete-then-insert pattern for simplicity and correctness.
   * 
   * Transaction boundaries (sequential operations):
   * 1. Delete all existing specializations for this lawyer
   * 2. Insert new specializations with type and experience metadata
   * 
   * Specialization metadata:
   * - type: 'primary' (main practice area) or 'secondary' (additional areas)
   * - yearsOfExperience: Experience in this specific specialization
   * 
   * Full replace chosen over merge/diff strategy for:
   * - Simplicity: Easier to reason about
   * - Correctness: No orphaned records
   * - Performance: Acceptable for typical specialization counts (< 10)
   * 
   * @throws {Error} If delete or insert operations fail
   * 
   * TODO: Wrap in explicit transaction for atomicity
   * TODO: Validate at least one primary specialization exists
   * TODO: Consider diff-based updates if performance becomes issue
   */
  async saveSpecializations(
    lawyerId: string,
    specializations: Array<{
      specializationId: string;
      type: 'primary' | 'secondary';
      yearsOfExperience: number;
    }>
  ): Promise<void> {
    if (specializations.length === 0) return;

    // Step 1: Clear existing specializations
    await this.db
      .delete(schema.lawyerSpecializations)
      .where(eq(schema.lawyerSpecializations.lawyerId, lawyerId));

    // Step 2: Insert new specializations
    await this.db.insert(schema.lawyerSpecializations).values(
      specializations.map((spec) => ({
        lawyerId,
        specializationId: spec.specializationId,
        type: spec.type,
        yearsOfExperience: spec.yearsOfExperience,
      }))
    );
  }

  /**
   * Replaces lawyer languages with full replace strategy
   * 
   * @param lawyerId - The lawyer's UUID
   * @param languageIds - Complete array of language UUIDs
   * 
   * @remarks
   * Uses delete-then-insert pattern for simplicity and correctness.
   * 
   * Transaction boundaries (sequential operations):
   * 1. Delete all existing languages for this lawyer
   * 2. Insert new language associations
   * 
   * Full replace chosen over merge/diff strategy for:
   * - Simplicity: Easier to reason about
   * - Correctness: No orphaned language associations
   * - Performance: Acceptable for typical language counts (< 5)
   * 
   * @throws {Error} If delete or insert operations fail
   * 
   * TODO: Wrap in explicit transaction for atomicity
   * TODO: Validate languageIds exist in languages table
   * TODO: Consider diff-based updates if needed
   */
  async saveLanguages(lawyerId: string, languageIds: string[]): Promise<void> {
    if (languageIds.length === 0) return;

    // Step 1: Clear existing languages
    await this.db
      .delete(schema.lawyerLanguages)
      .where(eq(schema.lawyerLanguages.lawyerId, lawyerId));

    // Step 2: Insert new languages
    await this.db.insert(schema.lawyerLanguages).values(
      languageIds.map((languageId) => ({
        lawyerId,
        languageId,
      }))
    );
  }
}
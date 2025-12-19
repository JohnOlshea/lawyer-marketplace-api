import type { IRepository } from '../../shared/interfaces/repository.interface';
import { Lawyer } from '../entities/lawyer.entity';

/**
 * ILawyerRepository
 * 
 * Repository contract for Lawyer aggregate persistence.
 * Handles complex relationships: documents, specializations, languages.
 */
export interface ILawyerRepository extends IRepository<Lawyer> {
 /**
   * Find lawyer by Better Auth user ID
   * Primary lookup method for authenticated users
   */
  findByUserId(userId: string): Promise<Lawyer | null>;

  /**
   * Find lawyer by email address
   * Used for duplicate detection and searches
   */
  findByEmail(email: string): Promise<Lawyer | null>;

  /**
   * Check if lawyer profile exists for user
   * Avoids full object hydration for existence checks
   */
  existsByUserId(userId: string): Promise<boolean>;

  /**
   * Check if bar number is already registered
   * Enforces uniqueness of bar credentials
   */
  existsByBarNumber(barNumber: string): Promise<boolean>;

  /**
   * Persist lawyer documents atomically
   * 
   * @param lawyerId - Lawyer's UUID
   * @param documents - Validated document metadata
   */
  saveDocuments(
    lawyerId: string,
    documents: Array<{
      type: string;
      url: string;
      publicId: string;
      originalName?: string;
      fileSize?: number;
      mimeType?: string;
    }>
  ): Promise<void>;

  /**
   * Replace lawyer specializations atomically
   * Uses full-replace strategy: delete all + insert new
   * 
   * @param lawyerId - Lawyer's UUID
   * @param specializations - Primary and secondary practice areas with experience
   */
  saveSpecializations(
    lawyerId: string,
    specializations: Array<{
      specializationId: string;
      type: 'primary' | 'secondary';
      yearsOfExperience: number;
    }>
  ): Promise<void>;

  /**
   * Replace lawyer languages atomically
   * Uses full-replace strategy: delete all + insert new
   * 
   * @param lawyerId - Lawyer's UUID
   * @param languageIds - Language UUIDs
   */
  saveLanguages(lawyerId: string, languageIds: string[]): Promise<void>;
}
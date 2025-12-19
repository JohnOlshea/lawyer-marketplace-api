import { Lawyer } from '../../../domain/lawyer/entities/lawyer.entity';
import { Email } from '../../../domain/lawyer/value-objects/email.vo';
import { BarCredentials } from '../../../domain/lawyer/value-objects/bar-credentials.vo';
import { Location } from '../../../domain/lawyer/value-objects/location.vo';
import { Education } from '../../../domain/lawyer/value-objects/education.vo';
import type { Lawyer as LawyerSchema } from '../schema/lawyer.schema';

/**
 * LawyerMapper
 * 
 * Bidirectional transformation between domain and persistence models.
 * Handles Value Object reconstruction and flattening.
 */
export class LawyerMapper {
  /**
   * Convert database record to domain entity
   * Reconstructs Value Objects from flattened schema
   */
  static toDomain(raw: any): Lawyer {
    const email = Email.create(raw.user.email);
    
    const barCredentials = raw.barLicenseNumber && raw.barAssociation && raw.yearOfBarAdmission
      ? BarCredentials.create(
          raw.barLicenseNumber, 
          raw.barAssociation, 
          raw.yearOfBarAdmission
        )
      : undefined;

    // TODO: add state, city, address and zipcode to schema
    const location = Location.create({
      country: raw.country,
      state: '',
      city: '',
      address: '',
      zipCode: '',
    });

    const education = raw.lawSchool && raw.graduationYear
      ? Education.create(raw.lawSchool, raw.graduationYear)
      : undefined;

    return Lawyer.reconstitute(
      raw.id,
      {
        userId: raw.userId,
        firstName: raw.firstName,
        middleName: raw.middleName,
        lastName: raw.lastName,
        email,
        phoneNumber: raw.phoneNumber,
        country: raw.country,
        barCredentials,
        education,
        currentFirm: raw.currentFirm,
        onboardingStep: raw.onboardingStep,
        applicationStatus: raw.applicationStatus,
        profileCompleted: raw.profileCompleted,
        documents: raw.documents || [],
        specializations: raw.specializations || [],
        languages: raw.languages || [],
      },
      raw.createdAt,
      raw.updatedAt
    );
  }

  /**
   * Convert domain entity to database record
   * Flattens Value Objects into primitive columns
   */
  static toPersistence(lawyer: Lawyer): Omit<LawyerSchema, 'createdAt' | 'updatedAt'> {
    return {
      id: lawyer.id,
      userId: lawyer.userId,
      firstName: lawyer.firstName,
      middleName: lawyer.middleName || null,
      lastName: lawyer.lastName,
      phoneNumber: lawyer.phoneNumber,
      country: lawyer.country,
      barLicenseNumber: lawyer.barCredentials?.barNumber || null,
      barAssociation: lawyer.barCredentials?.barAssociation || null,
      yearOfBarAdmission: lawyer.barCredentials?.yearOfBarAdmission || null,
      lawSchool: lawyer.education?.school || null,
      graduationYear: lawyer.education?.graduationYear || null,
      currentFirm: lawyer.currentFirm || null,
      onboardingStep: lawyer.onboardingStep,
      applicationStatus: lawyer.applicationStatus,
      reviewNotes: null,
      profileCompleted: lawyer.profileCompleted,
    };
  }
}
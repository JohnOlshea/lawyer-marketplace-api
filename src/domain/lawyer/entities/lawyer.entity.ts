
import { AggregateRoot } from '../../shared/aggregate-root';
import { Email } from '../value-objects/email.vo';
import { BarCredentials } from '../value-objects/bar-credentials.vo';
import { Location } from '../value-objects/location.vo';
import { Education } from '../value-objects/education.vo';
import { PracticeInfo } from '../value-objects/practice-info.vo';
import { LawyerCreatedEvent } from '../events/lawyer-created.event';
import { LawyerOnboardingStepCompletedEvent } from '../events/lawyer-onboarding-step-completed.event';
import { LawyerOnboardingSubmittedEvent } from '../events/lawyer-onboarding-submitted.event';
import { ValidationException } from '../../shared/errors/validation.exception';
import { InvalidOnboardingStepError } from '../errors/invalid-onboarding-step.error';
import { IncompleteOnboardingError } from '../errors/incomplete-onboarding.error';

type OnboardingStep = 'basic_info' | 'credentials' | 'specializations' | 'submitted';
type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'revision';

/**
 * Lawyer Entity Properties
 * Data required to construct a Lawyer aggregate
 */
export interface LawyerProps {
  userId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: Email;
  phoneNumber: string;
  country: string;
  barCredentials?: BarCredentials;
  education?: Education;
  currentFirm?: string;
  onboardingStep: OnboardingStep;
  applicationStatus: ApplicationStatus;
  profileCompleted: boolean;
  documents: any[];
  specializations: any[];
  languages: any[];
}

/**
 * Lawyer Aggregate Root
 * 
 * Manages lawyer profiles with a multi-step onboarding workflow.
 * Enforces business rules around credentials, specializations, and admin approval.
 * 
 * **Onboarding Flow:**
 * 1. basic_info → Personal details
 * 2. credentials → Bar admission, education, documents
 * 3. specializations → Practice areas, experience, languages
 * 4. submitted → Under admin review
 * 
 * **Business Rules:**
 * - Steps must be completed in sequence
 * - Maximum 5 primary + 3 secondary specializations
 * - At least one language required
 * - Bar credentials and education required for submission
 * - At least one document required for submission
 */
export class Lawyer extends AggregateRoot {
  private _userId: string;
  private _firstName: string;
  private _middleName?: string;
  private _lastName: string;
  private _email: Email;
  private _phoneNumber: string;
  private _country: string;
  private _barCredentials?: BarCredentials;
  private _education?: Education;
  private _currentFirm?: string;
  private _onboardingStep: OnboardingStep;
  private _applicationStatus: ApplicationStatus;
  private _profileCompleted: boolean;
  private _documents: any[];
  private _specializations: any[];
  private _languages: any[];

  /**
   * Private constructor enforces use of factory methods
   * Prevents direct instantiation with `new Lawyer()`
   */
  private constructor(
    id: string,
    props: LawyerProps,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
    this._userId = props.userId;
    this._firstName = props.firstName;
    this._middleName = props.middleName;
    this._lastName = props.lastName;
    this._email = props.email;
    this._phoneNumber = props.phoneNumber;
    this._country = props.country;
    this._barCredentials = props.barCredentials;
    this._education = props.education;
    this._currentFirm = props.currentFirm;
    this._onboardingStep = props.onboardingStep;
    this._applicationStatus = props.applicationStatus;
    this._profileCompleted = props.profileCompleted;
    this._documents = props.documents;
    this._specializations = props.specializations;
    this._languages = props.languages;
  }

  /**
   * Factory method for new lawyers - Step 1: Basic Info
   * 
   * @param id - Generated UUID
   * @param userId - Better Auth user ID
   * @param firstName - Minimum 2 characters
   * @param middleName - Optional middle name
   * @param lastName - Minimum 2 characters
   * @param email - Valid email format (enforced by Email VO)
   * @param phoneNumber - Minimum 10 characters
   * @param country - ISO country code or name
   * @returns New Lawyer aggregate in 'basic_info' step
   * @throws {ValidationException} If validation fails
   */
  public static create(
    id: string,
    userId: string,
    firstName: string,
    middleName: string | undefined,
    lastName: string,
    email: string,
    phoneNumber: string,
    country: string
  ): Lawyer {
    // Enforce basic validations
    if (firstName.trim().length < 2) {
      throw new ValidationException('First name must be at least 2 characters');
    }
    if (lastName.trim().length < 2) {
      throw new ValidationException('Last name must be at least 2 characters');
    }
    if (phoneNumber.trim().length < 10) {
      throw new ValidationException('Invalid phone number');
    }

    const emailVo = Email.create(email);

    const lawyer = new Lawyer(
      id,
      {
        userId,
        firstName: firstName.trim(),
        middleName: middleName?.trim(),
        lastName: lastName.trim(),
        email: emailVo,
        phoneNumber: phoneNumber.trim(),
        country: country.trim(),
        onboardingStep: 'basic_info',
        applicationStatus: 'pending',
        profileCompleted: false,
        documents: [],
        specializations: [],
        languages: [],
      }
    );

    lawyer.applyEvent(
      new LawyerCreatedEvent(
        lawyer.id,
        userId,
        email,
        `${firstName} ${lastName}`
      )
    );

    return lawyer;
  }

  /**
   * Reconstitute from database
   * Used by repository to rebuild domain entity from persistence
   */
  public static reconstitute(
    id: string,
    props: LawyerProps,
    createdAt: Date,
    updatedAt: Date
  ): Lawyer {
    return new Lawyer(id, props, createdAt, updatedAt);
  }

  /**
   * Step 2: Save credentials (bar admission, education, documents)
   * 
   * @throws {InvalidOnboardingStepError} If not in 'basic_info' step
   */
  public saveCredentials(
    barNumber: string,
    barAssociation: string,
    yearOfBarAdmission: number,
    lawSchool: string,
    graduationYear: number,
    currentFirm?: string
  ): void {
    if (this._onboardingStep !== 'basic_info') {
      throw new InvalidOnboardingStepError(
        'Cannot save credentials. Complete basic info first.'
      );
    }

    this._barCredentials = BarCredentials.create(
      barNumber,
      barAssociation,
      yearOfBarAdmission
    );

    this._education = Education.create(lawSchool, graduationYear);
    this._currentFirm = currentFirm?.trim();

    this._onboardingStep = 'credentials';
    this.touch();

    this.applyEvent(
      new LawyerOnboardingStepCompletedEvent(
        this.id,
        'credentials',
        'specializations'
      )
    );
  }

  /**
   * Step 3: Save specializations and languages
   * 
   * @param primarySpecializations - Up to 5 primary practice areas
   * @param secondarySpecializations - Up to 3 secondary practice areas
   * @param languageIds - At least one language required
   * @throws {InvalidOnboardingStepError} If not in 'credentials' step
   * @throws {ValidationException} If limits exceeded
   */
  public saveSpecializations(
    primarySpecializations: Array<{ id: string; yearsOfExperience: number }>,
    secondarySpecializations: Array<{ id: string; yearsOfExperience: number }>,
    languageIds: string[]
  ): void {
    if (this._onboardingStep !== 'credentials') {
      throw new InvalidOnboardingStepError(
        'Cannot save specializations. Complete credentials first.'
      );
    }

    // Enforce business limits
    if (primarySpecializations.length > 5) {
      throw new ValidationException('Maximum 5 primary specializations allowed');
    }
    if (secondarySpecializations.length > 3) {
      throw new ValidationException('Maximum 3 secondary specializations allowed');
    }
    if (languageIds.length === 0) {
      throw new ValidationException('At least one language is required');
    }

    this._specializations = [
      ...primarySpecializations.map(spec => ({ ...spec, type: 'primary' })),
      ...secondarySpecializations.map(spec => ({ ...spec, type: 'secondary' })),
    ];

    this._languages = languageIds;
    this._onboardingStep = 'specializations';
    this.touch();

    this.applyEvent(
      new LawyerOnboardingStepCompletedEvent(
        this.id,
        'specializations',
        'submitted'
      )
    );
  }

  /**
   * Step 4: Submit for admin review
   * 
   * Validates completeness before submission:
   * - All onboarding steps completed
   * - Bar credentials present
   * - Education present
   * - At least one document uploaded
   * - At least one specialization selected
   * 
   * @throws {IncompleteOnboardingError} If validation fails
   */
  public submitForReview(): void {
    if (this._onboardingStep !== 'specializations') {
      throw new IncompleteOnboardingError(
        'Cannot submit. Complete all onboarding steps first.'
      );
    }

    if (!this._barCredentials || !this._education) {
      throw new IncompleteOnboardingError(
        'Bar credentials and education are required'
      );
    }

    if (this._documents.length === 0) {
      throw new IncompleteOnboardingError(
        'At least one document is required'
      );
    }

    if (this._specializations.length === 0) {
      throw new IncompleteOnboardingError(
        'At least one specialization is required'
      );
    }

    this._onboardingStep = 'submitted';
    this._profileCompleted = true;
    this.touch();

    this.applyEvent(
      new LawyerOnboardingSubmittedEvent(
        this.id,
        this.fullName,
        this._email.value
      )
    );
  }

  // Getters
  get userId(): string { return this._userId; }
  get firstName(): string { return this._firstName; }
  get middleName(): string | undefined { return this._middleName; }
  get lastName(): string { return this._lastName; }
  get fullName(): string {
    return this._middleName
      ? `${this._firstName} ${this._middleName} ${this._lastName}`
      : `${this._firstName} ${this._lastName}`;
  }
  get email(): string { return this._email.value; }
  get phoneNumber(): string { return this._phoneNumber; }
  get country(): string { return this._country; }
  get barCredentials(): BarCredentials | undefined { return this._barCredentials; }
  get education(): Education | undefined { return this._education; }
  get currentFirm(): string | undefined { return this._currentFirm; }
  get onboardingStep(): OnboardingStep { return this._onboardingStep; }
  get applicationStatus(): ApplicationStatus { return this._applicationStatus; }
  get profileCompleted(): boolean { return this._profileCompleted; }
  get documents(): any[] { return this._documents; }
  get specializations(): any[] { return this._specializations; }
  get languages(): any[] { return this._languages; }

  /** Check if onboarding workflow is complete */
  get isOnboardingComplete(): boolean {
    return this._onboardingStep === 'submitted' && this._profileCompleted;
  }

  /** Check if admin has approved the application */
  get isApproved(): boolean {
    return this._applicationStatus === 'approved';
  }
}
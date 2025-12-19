import { ValueObject } from '../../shared/value-object';
import { ValidationException } from '../../shared/errors/validation.exception';

interface EducationProps {
  school: string;
  graduationYear: number;
}

/**
 * Education Value Object
 *
 * Represents the lawyer's educational background.
 * Validates school name and graduation year.
 *
 * @remarks
 * - Immutable by design
 * - Self-validating: invalid school names or future graduation years are rejected
 * - Provides helper for years since graduation
 *
 * @example
 * ```ts
 * const edu = Education.create('Harvard Law School', 2015);
 * console.log(edu.school); // 'Harvard Law School'
 * console.log(edu.yearsSinceGraduation); // e.g., 10
 * ```
 */
export class Education extends ValueObject<EducationProps> {
  private constructor(value: EducationProps) {
    super(value);
  }

  public static create(school: string, graduationYear: number): Education {
    if (!school || school.trim().length < 3) {
      throw new ValidationException('Law school name must be at least 3 characters');
    }

    const currentYear = new Date().getFullYear();
    if (graduationYear > currentYear) {
      throw new ValidationException('Graduation year cannot be in the future');
    }

    if (graduationYear < 1900) {
      throw new ValidationException('Invalid graduation year');
    }

    return new Education({ school: school.trim(), graduationYear });
  }

  get school(): string {
    return this._value.school;
  }

  get graduationYear(): number {
    return this._value.graduationYear;
  }

  get yearsSinceGraduation(): number {
    return new Date().getFullYear() - this._value.graduationYear;
  }
}

import { ValueObject } from '../../shared/value-object';

/**
 * PracticeInfo Value Object
 *
 * Represents a lawyer's practice structure.
 * Determines whether the lawyer is solo or part of a firm.
 *
 * @remarks
 * - Immutable and self-validating
 * - Solo practitioner inferred if no current firm provided
 *
 * @example
 * ```ts
 * const solo = PracticeInfo.create(); // solo practitioner
 * const firm = PracticeInfo.create('Acme Law Firm');
 * console.log(firm.isSoloPractitioner); // false
 * ```
 */
interface PracticeInfoProps {
  currentFirm?: string;
  isSoloPractitioner: boolean;
}

export class PracticeInfo extends ValueObject<PracticeInfoProps> {
  private constructor(value: PracticeInfoProps) {
    super(value);
  }

  public static create(currentFirm?: string): PracticeInfo {
    const isSoloPractitioner = !currentFirm || currentFirm.trim().length === 0;

    return new PracticeInfo({
      currentFirm: currentFirm?.trim(),
      isSoloPractitioner,
    });
  }

  get currentFirm(): string | undefined {
    return this._value.currentFirm;
  }

  get isSoloPractitioner(): boolean {
    return this._value.isSoloPractitioner;
  }
}

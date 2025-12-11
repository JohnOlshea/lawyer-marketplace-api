import { randomUUID } from 'crypto';

export class IdGenerator {
  /**
   * Generates a standard UUID v4
   * 
   * @example
   * ```typescript
   * const id = IdGenerator.generate();
   * // "a3bb189e-8bf9-3888-9912-ace4e6543002"
   * ```
   */
  static generate(): string {
    return randomUUID();
  }

  /**
   * Generates a prefixed UUID for domain-specific identifiers
   * 
   * @param prefix - Short identifier prefix (e.g., 'usr', 'inv', 'case')
   * @returns Prefixed UUID in format: `{prefix}_{uuid}`
   * 
   * @example
   * ```typescript
   * const userId = IdGenerator.generateWithPrefix('usr');
   * // "usr_a3bb189e-8bf9-3888-9912-ace4e6543002"
   * 
   * const caseId = IdGenerator.generateWithPrefix('case');
   * // "case_550e8400-e29b-41d4-a716-446655440000"
   * ```
   */
  static generateWithPrefix(prefix: string): string {
    return `${prefix}_${randomUUID()}`;
  }
}

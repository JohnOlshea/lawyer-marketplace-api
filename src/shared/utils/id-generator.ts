import { randomUUID } from 'crypto';

export class IdGenerator {
  static generate(): string {
    return randomUUID();
  }

  static generateWithPrefix(prefix: string): string {
    return `${prefix}_${randomUUID()}`;
  }
}

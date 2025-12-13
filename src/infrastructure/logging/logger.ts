/**
 * Application Logger Service
 * Structured logging with environment-aware behavior.
 * Pretty-printed in development, compact JSON in production.
 * 
 * @example
 * ```typescript
 * // Simple message
 * logger.info('User logged in');
 * 
 * // With metadata
 * logger.info('User created', { userId: '123', email: 'user@example.com' });
 * 
 * // Error logging
 * logger.error('Database connection failed', { error: err.message });
 * ```
 */

import { env } from '../../config/env';

/**
 * Log severity levels
 * 
 * @remarks
 * Follows standard syslog severity levels (subset):
 * - debug: Detailed information for debugging (dev only)
 * - info: Informational messages about normal operations
 * - warn: Warning messages for potentially harmful situations
 * - error: Error events that might still allow the application to continue
 */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  [key: string]: any; // Additional metadata
}

/**
 * Application logger class
 * 
 * @remarks
 * - Singleton pattern (single instance exported)
 * - Environment-aware formatting (pretty vs JSON)
 * - Flexible metadata support
 * - Type-safe log levels
 */
class Logger {
  private readonly isDevelopment: boolean;

  constructor() {
    this.isDevelopment = env.NODE_ENV === 'development';
  }

  /**
   * Internal log method - formats and outputs log entries
   * 
   * @param level - Log severity level
   * @param message - Log message
   * @param meta - Additional metadata to include
   * 
   * @remarks
   * - Pretty-prints in development (2-space indentation)
   * - Compact JSON in production (no indentation)
   * - Always includes timestamp and level
   */
  private log(level: LogLevel, message: string, meta?: any): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta, // Spread metadata into log entry
    };

    if (this.isDevelopment) {
      // Pretty-printed for development
      console.log(JSON.stringify(logEntry, null, 2));
    } else {
      // Compact JSON for production (easier for log parsers)
      console.log(JSON.stringify(logEntry));
    }
  }

  /**
   * Logs debug-level messages (development only)
   * 
   * @param message - Debug message
   * @param meta - Optional metadata
   * 
   * @remarks
   * Debug logs are suppressed in production for performance.
   * Use for verbose information useful during development.
   */
  public debug(message: string, meta?: any): void {
    if (this.isDevelopment) {
      this.log('debug', message, meta);
    }
  }

  /**
   * Logs informational messages
   * 
   * @param message - Info message or object
   * @param meta - Optional metadata
   * 
   * @remarks
   * - Accepts string message or object (for flexibility)
   * - Always logged regardless of environment
   * - Use for normal operational messages
   */
  public info(message: string | any, meta?: any): void {
    if (typeof message === 'string') {
      this.log('info', message, meta);
    } else {
      // If message is an object, use it as metadata with empty message
      this.log('info', '', message);
    }
  }

  /**
   * Logs warning messages
   * 
   * @param message - Warning message
   * @param meta - Optional metadata
   * 
   * @remarks
   * Use for potentially harmful situations that don't prevent operation.
   */
  public warn(message: string, meta?: any): void {
    this.log('warn', message, meta);
  }

  /**
   * Logs error messages
   * 
   * @param message - Error message or Error object
   * @param meta - Optional metadata
   * 
   * @remarks
   * - Accepts string message or object (for flexibility)
   * - Use for error events that need investigation
   * - Include error stack traces in metadata when available
   */
  public error(message: string | any, meta?: any): void {
    if (typeof message === 'string') {
      this.log('error', message, meta);
    } else {
      // If message is an object (like Error), use it as metadata
      this.log('error', '', message);
    }
  }
}

/**
 * Singleton logger instance
 * 
 * @remarks
 * Export single instance to ensure consistent logging configuration.
 * Import this instance throughout the application.
 */
export const logger = new Logger();
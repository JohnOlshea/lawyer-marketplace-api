/**
 * Standard API Response Wrapper
 * Provides consistent response structure across all API endpoints.
 * Follows JSend specification for standardized JSON responses.
 */

import { HttpStatus } from '@/shared/constants/http-status';

/**
 * API Response wrapper class
 * 
 * @template T - The type of data payload (defaults to any)
 * 
 * @property {boolean} success - Indicates if the request was successful
 * @property {string} message - Human-readable message describing the result
 * @property {T | null} data - Response payload (null for errors)
 * @property {number} statusCode - HTTP status code
 * @property {string} timestamp - ISO 8601 timestamp of response creation
 * @property {string} [correlationId] - Optional correlation ID for distributed tracing
 */
export class ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
  statusCode: number;
  timestamp: string;
  correlationId?: string;

  /**
   * Constructs an API response
   * 
   * @param success - Whether the operation succeeded
   * @param message - Descriptive message
   * @param data - Response data payload
   * @param statusCode - HTTP status code
   * @param correlationId - Optional correlation ID for request tracing
   * 
   * @remarks
   * Constructor is public but factory methods (success/error) are preferred
   * for better semantics and type safety.
   */
  constructor(
    success: boolean,
    message: string,
    data: T | null,
    statusCode: number,
    correlationId?: string
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
    this.correlationId = correlationId;
  }

  /**
   * Factory method: Creates a successful response
   * 
   * @template T - Type of the response data
   * @param data - The response payload
   * @param message - Success message (default: "Success")
   * @param statusCode - HTTP status code (default: 200 OK)
   * @param correlationId - Optional correlation ID for tracing
   * @returns {ApiResponse<T>} Success response instance
   */
  static success<T>(
    data: T,
    message: string = 'Success',
    statusCode: number = HttpStatus.OK,
    correlationId?: string
  ): ApiResponse<T> {
    return new ApiResponse(true, message, data, statusCode, correlationId);
  }

  /**
   * Factory method: Creates an error response
   * 
   * @param message - Error message (should be user-friendly)
   * @param statusCode - HTTP status code (default: 400 Bad Request)
   * @param data - Optional error details (e.g., validation errors, error codes)
   * @param correlationId - Optional correlation ID for tracing
   * @returns {ApiResponse<null>} Error response instance
   */
  static error(
    message: string,
    statusCode: number = HttpStatus.BAD_REQUEST,
    data: any = null,
    correlationId?: string
  ): ApiResponse<null> {
    return new ApiResponse(false, message, data, statusCode, correlationId);
  }

  /**
   * Converts response to plain JSON object
   * 
   * @returns Plain object representation
   */
  toJSON() {
    return {
      success: this.success,
      message: this.message,
      data: this.data,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      ...(this.correlationId && { correlationId: this.correlationId }),
    };
  }
}
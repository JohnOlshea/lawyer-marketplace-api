/**
 * Standard API Response Wrapper
 * 
 * Provides consistent response structure across all API endpoints.
 * 
 * @template T - Type of data being returned
 * 
 * @remarks
 * - Follows JSend specification pattern
 * - Makes error handling consistent on the client side
 * - Includes metadata (timestamp, status code) for debugging
 * 
 * @example
 * Success response:
 * ```typescript
 * ApiResponse.success({ id: '123', name: 'John' }, 'User retrieved');
 * ```
 * 
 * Error response:
 * ```typescript
 * ApiResponse.error('User not found', 404);
 * ```
 */
export class ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
  statusCode: number;
  timestamp: string;

  constructor(
    success: boolean, 
    message: string, 
    data: T | null, 
    statusCode: number
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }

  /**
   * Creates a success response
   * 
   * @param data - Response payload
   * @param message - Success message
   * @param statusCode - HTTP status code (default: 200)
   * @returns ApiResponse instance
   */
  static success<T>(
    data: T,
    message: string = 'Success',
    statusCode: number = 200
  ): ApiResponse<T> {
    return new ApiResponse(true, message, data, statusCode);
  }

  /**
   * Creates an error response
   * 
   * @param message - Error message
   * @param statusCode - HTTP status code (default: 400)
   * @param data - Optional error details (validation errors, etc.)
   * @returns ApiResponse instance
   */
  static error(
    message: string, 
    statusCode: number = 400, 
    data: any = null
  ): ApiResponse<null> {
    return new ApiResponse(false, message, data, statusCode);
  }
}
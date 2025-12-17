/**
 * Shared type definitions used across the application.
 */

export type Role = 'admin' | 'lawyer' | 'client';

export type Specialty =
  | 'criminal'
  | 'corporate'
  | 'family'
  | 'immigration'
  | 'intellectual-property'
  | 'real-estate'
  | 'tax'
  | 'labor'
  | 'bankruptcy'
  | 'personal-injury';

/** Query parameters for paginated endpoints */
export interface PaginationParams {
  page: number;
  limit: number;
}

/** Generic paginated response wrapper */
export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

/** Standard API success response format */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
  statusCode: number;
  timestamp: string;
}

/** Standard API error response format */
export interface ErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  correlationId?: string;
  timestamp: string;
  details?: any;
}
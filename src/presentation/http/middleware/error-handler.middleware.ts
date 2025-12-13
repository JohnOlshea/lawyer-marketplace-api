/**
 * Global Error Handler
 * 
 * Transforms domain exceptions into standardized HTTP responses.
 * Logs errors with context and hides sensitive details in production.
 */
import type { Context } from 'hono';
import { ValidationException } from '../../../domain/shared/errors/validation.exception';
import { NotFoundException } from '../../../domain/shared/errors/not-found.exception';
import { UnauthorizedException } from '../../../domain/shared/errors/unauthorized.exception';
import { ForbiddenException } from '../../../domain/shared/errors/forbidden.exception';
import { ConflictException } from '../../../domain/shared/errors/conflict.exception';
import { DomainException } from '../../../domain/shared/errors/domain.exception';
import { HttpStatus } from '../../../shared/constants/http-status';
import { logger } from '../../../infrastructure/logging/logger';

interface ErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  correlationId: string;
  timestamp: string;
  details?: any;
}

export function errorHandler(error: Error, c: Context): Response {
  // Get correlation ID from context (set by request logger)
  const correlationId = c.get('correlationId') || generateCorrelationId();
  
  // Log error with context
  logger.error({
    message: error.message,
    stack: error.stack,
    correlationId,
    path: c.req.path,
    method: c.req.method,
    userId: c.get('user')?.id, // Assuming you set user in context //TODO: check this
  });

  // Map domain exceptions to HTTP responses
  if (error instanceof ValidationException) {
    return c.json(
      {
        success: false,
        message: error.message,
        statusCode: HttpStatus.BAD_REQUEST,
        correlationId,
        timestamp: new Date().toISOString(),
        details: (error as any).errors || undefined,
      } as ErrorResponse,
      HttpStatus.BAD_REQUEST
    );
  }

  if (error instanceof NotFoundException) {
    return c.json(
      {
        success: false,
        message: error.message,
        statusCode: HttpStatus.NOT_FOUND,
        correlationId,
        timestamp: new Date().toISOString(),
      } as ErrorResponse,
      HttpStatus.NOT_FOUND
    );
  }

  if (error instanceof UnauthorizedException) {
    return c.json(
      {
        success: false,
        message: error.message,
        statusCode: HttpStatus.UNAUTHORIZED,
        correlationId,
        timestamp: new Date().toISOString(),
      } as ErrorResponse,
      HttpStatus.UNAUTHORIZED
    );
  }

  if (error instanceof ForbiddenException) {
    return c.json(
      {
        success: false,
        message: error.message,
        statusCode: HttpStatus.FORBIDDEN,
        correlationId,
        timestamp: new Date().toISOString(),
      } as ErrorResponse,
      HttpStatus.FORBIDDEN
    );
  }

  if (error instanceof ConflictException) {
    return c.json(
      {
        success: false,
        message: error.message,
        statusCode: HttpStatus.CONFLICT,
        correlationId,
        timestamp: new Date().toISOString(),
      } as ErrorResponse,
      HttpStatus.CONFLICT
    );
  }

  if (error instanceof DomainException) {
    return c.json(
      {
        success: false,
        message: error.message,
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        correlationId,
        timestamp: new Date().toISOString(),
      } as ErrorResponse,
      HttpStatus.UNPROCESSABLE_ENTITY
    );
  }

  // Default: 500 Internal Server Error
  const response: any = {
    success: false,
    message: 'Internal server error',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    correlationId,
    timestamp: new Date().toISOString(),
  };

  // Only expose error details in non-production
  if (process.env.NODE_ENV !== 'production') {
    response.details = {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name,
    };
  }

  return c.json(response, HttpStatus.INTERNAL_SERVER_ERROR);
}

function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}
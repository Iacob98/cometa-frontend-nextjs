/**
 * Standardized API error handling for Equipment and other endpoints
 * Provides consistent error responses across all API routes
 */

import { NextResponse } from 'next/server';

export interface ApiError {
  error: string;
  details?: string;
  code?: string;
  timestamp?: string;
}

export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

/**
 * Create a standardized error response
 * @param message - Human-readable error message
 * @param status - HTTP status code
 * @param details - Optional additional details
 * @param code - Optional error code
 * @returns NextResponse with error payload
 */
export function createErrorResponse(
  message: string,
  status: number = 500,
  details?: string,
  code?: string
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      error: message,
      ...(details && { details }),
      ...(code && { code }),
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Handle Supabase database errors with consistent formatting
 * @param error - Supabase error object
 * @param operation - Description of the operation that failed
 * @returns NextResponse with formatted error
 */
export function handleSupabaseError(
  error: any,
  operation: string
): NextResponse<ApiError> {
  console.error(`Supabase ${operation} error:`, error);

  // PostgreSQL error codes
  const errorCode = error?.code;
  const errorMessage = error?.message || 'Database operation failed';

  // Map common PostgreSQL errors to user-friendly messages
  const errorMap: Record<string, { message: string; status: number }> = {
    '23505': { message: 'Resource already exists', status: 409 }, // unique_violation
    '23503': { message: 'Referenced resource not found', status: 404 }, // foreign_key_violation
    '23502': { message: 'Required field is missing', status: 400 }, // not_null_violation
    '23514': { message: 'Invalid data value', status: 400 }, // check_violation
    '42P01': { message: 'Database table not found', status: 500 }, // undefined_table
    '42703': { message: 'Database column not found', status: 500 }, // undefined_column
  };

  const mappedError = errorCode ? errorMap[errorCode] : null;

  if (mappedError) {
    return createErrorResponse(
      mappedError.message,
      mappedError.status,
      errorMessage,
      errorCode
    );
  }

  // Default error response
  return createErrorResponse(
    `Failed to ${operation}`,
    500,
    errorMessage,
    errorCode
  );
}

/**
 * Handle validation errors (e.g., from Zod)
 * @param error - Validation error object
 * @returns NextResponse with validation error details
 */
export function handleValidationError(error: any): NextResponse<ApiError> {
  console.error('Validation error:', error);

  // Zod error format
  if (error?.issues && Array.isArray(error.issues)) {
    const details = error.issues
      .map((issue: any) => `${issue.path.join('.')}: ${issue.message}`)
      .join(', ');

    return createErrorResponse('Validation failed', 400, details, 'VALIDATION_ERROR');
  }

  return createErrorResponse('Invalid request data', 400, error?.message);
}

/**
 * Handle authentication/authorization errors
 * @param message - Error message
 * @returns NextResponse with 401 or 403 status
 */
export function handleAuthError(message: string = 'Unauthorized'): NextResponse<ApiError> {
  const status = message.toLowerCase().includes('permission') ? 403 : 401;
  return createErrorResponse(message, status, undefined, 'AUTH_ERROR');
}

/**
 * Handle not found errors
 * @param resource - Name of the resource not found
 * @returns NextResponse with 404 status
 */
export function handleNotFoundError(resource: string): NextResponse<ApiError> {
  return createErrorResponse(
    `${resource} not found`,
    404,
    undefined,
    'NOT_FOUND'
  );
}

/**
 * Handle generic errors with fallback
 * @param error - Error object
 * @param operation - Description of the operation
 * @returns NextResponse with error details
 */
export function handleGenericError(
  error: unknown,
  operation: string
): NextResponse<ApiError> {
  console.error(`${operation} error:`, error);

  if (error instanceof Error) {
    return createErrorResponse(
      'Internal server error',
      500,
      error.message,
      'INTERNAL_ERROR'
    );
  }

  return createErrorResponse(
    `Failed to ${operation}`,
    500,
    'Unknown error occurred',
    'UNKNOWN_ERROR'
  );
}

/**
 * Wrap an async API handler with error handling
 * @param handler - Async function to wrap
 * @param operation - Description of the operation (for logging)
 * @returns Wrapped function with error handling
 */
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  operation: string
): (...args: T) => Promise<R | NextResponse<ApiError>> {
  return async (...args: T): Promise<R | NextResponse<ApiError>> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleGenericError(error, operation);
    }
  };
}

/**
 * Log and return error for debugging in development
 * @param error - Error object
 * @param context - Additional context
 */
export function logError(error: unknown, context: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}]`, error);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
  }
}

// Query and Mutation Utilities for TanStack Query

import type { UseMutationOptions } from "@tanstack/react-query";

/**
 * Retry configuration for mutations with exponential backoff
 *
 * Retries: 3 times
 * Delay: 1s → 2s → 4s (exponential backoff, max 30s)
 */
export const mutationRetryConfig = {
  retry: 3,
  retryDelay: (attemptIndex: number) =>
    Math.min(1000 * 2 ** attemptIndex, 30000), // 1s, 2s, 4s, max 30s
};

/**
 * Check if error is retryable (network errors, 5xx, timeouts)
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Network errors
    if (message.includes('network') ||
        message.includes('timeout') ||
        message.includes('fetch')) {
      return true;
    }

    // Check for HTTP status in error
    const status = (error as any).status;
    if (typeof status === 'number') {
      // Retry on 5xx server errors and 408 timeout
      return status >= 500 || status === 408;
    }
  }

  return false;
}

/**
 * Get mutation configuration with retry strategy
 *
 * @param options - Additional mutation options
 * @returns Mutation config with retry strategy
 *
 * @example
 * ```typescript
 * useMutation({
 *   ...getMutationConfig({
 *     onSuccess: (data) => { ... },
 *     onError: (error) => { ... }
 *   })
 * })
 * ```
 */
export function getMutationConfig<TData = unknown, TError = Error, TVariables = void, TContext = unknown>(
  options?: Partial<UseMutationOptions<TData, TError, TVariables, TContext>>
): Partial<UseMutationOptions<TData, TError, TVariables, TContext>> {
  return {
    ...mutationRetryConfig,
    retry: (failureCount: number, error: TError) => {
      // Don't retry if we've hit the limit
      if (failureCount >= 3) return false;

      // Only retry on retryable errors
      return isRetryableError(error);
    },
    ...options,
  };
}

/**
 * Get mutation config for critical operations (no retry on client errors)
 *
 * Use for: Deletes, state changes, payments
 */
export function getCriticalMutationConfig<TData = unknown, TError = Error, TVariables = void, TContext = unknown>(
  options?: Partial<UseMutationOptions<TData, TError, TVariables, TContext>>
): Partial<UseMutationOptions<TData, TError, TVariables, TContext>> {
  return {
    retry: false, // Never retry critical operations
    ...options,
  };
}

/**
 * Get mutation config for idempotent operations (safe to retry)
 *
 * Use for: Reads, safe updates, creates with idempotency keys
 */
export function getIdempotentMutationConfig<TData = unknown, TError = Error, TVariables = void, TContext = unknown>(
  options?: Partial<UseMutationOptions<TData, TError, TVariables, TContext>>
): Partial<UseMutationOptions<TData, TError, TVariables, TContext>> {
  return {
    retry: 5, // More retries for idempotent operations
    retryDelay: (attemptIndex: number) =>
      Math.min(500 * 2 ** attemptIndex, 30000), // Faster initial retry
    ...options,
  };
}
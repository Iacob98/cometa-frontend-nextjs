/**
 * Pagination utilities for API routes
 * Standardizes pagination across all Equipment and other API endpoints
 */

export interface PaginationParams {
  page: number;
  per_page: number;
  offset: number;
}

export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Parse pagination parameters from URL search params
 * @param searchParams - URLSearchParams from Next.js request
 * @param defaultPerPage - Default items per page (default: 20)
 * @returns Parsed pagination parameters with page, per_page, and offset
 */
export function parsePaginationParams(
  searchParams: URLSearchParams,
  defaultPerPage: number = 20
): PaginationParams {
  const pageParam = searchParams.get("page") || "1";
  const perPageParam = searchParams.get("per_page") || String(defaultPerPage);

  const page = parseInt(pageParam, 10);
  const per_page = parseInt(perPageParam, 10);

  // Handle NaN from invalid inputs
  const validPage = isNaN(page) ? 1 : Math.max(1, page);
  const validPerPage = isNaN(per_page) ? defaultPerPage : Math.max(1, Math.min(100, per_page));

  const offset = (validPage - 1) * validPerPage;

  return {
    page: validPage,
    per_page: validPerPage,
    offset: Math.max(0, offset),
  };
}

/**
 * Create pagination metadata for API responses
 * @param page - Current page number
 * @param per_page - Items per page
 * @param total - Total number of items
 * @returns Pagination metadata object
 */
export function createPaginationMeta(
  page: number,
  per_page: number,
  total: number
): PaginationMeta {
  return {
    page,
    per_page,
    total,
    total_pages: Math.ceil(total / per_page),
  };
}

/**
 * Create a paginated response with data and metadata
 * @param data - Array of items for current page
 * @param page - Current page number
 * @param per_page - Items per page
 * @param total - Total number of items
 * @returns Paginated response object
 */
export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  per_page: number,
  total: number
): PaginatedResponse<T> {
  return {
    data,
    meta: createPaginationMeta(page, per_page, total),
  };
}

/**
 * Apply pagination to a Supabase query builder
 * Uses .range() method for efficient pagination
 * @param query - Supabase query builder
 * @param offset - Starting offset
 * @param per_page - Items per page
 * @returns Query with pagination applied
 */
export function applyPagination<T>(
  query: T,
  offset: number,
  per_page: number
): T {
  // TypeScript type assertion for Supabase query builder
  const queryWithRange = query as any;
  return queryWithRange.range(offset, offset + per_page - 1);
}

/**
 * Validate pagination parameters
 * @param page - Page number
 * @param per_page - Items per page
 * @throws Error if parameters are invalid
 */
export function validatePagination(page: number, per_page: number): void {
  if (page < 1) {
    throw new Error("Page number must be at least 1");
  }
  if (per_page < 1 || per_page > 100) {
    throw new Error("Items per page must be between 1 and 100");
  }
}

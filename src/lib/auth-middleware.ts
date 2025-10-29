/**
 * Authentication Middleware for API Routes
 *
 * Provides authentication and authorization helpers for Next.js API routes.
 * Use these functions at the beginning of API route handlers to ensure
 * proper access control.
 *
 * @example
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   const authResult = await requireRole(request, ['admin', 'pm']);
 *   if (authResult instanceof NextResponse) return authResult;
 *
 *   const session = authResult; // TypeScript knows this is a Session
 *   // ... business logic with session.user
 * }
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import type { Session } from 'next-auth';

/**
 * Require authentication for API route
 *
 * @param request - Next.js request object
 * @returns Session object or error response
 *
 * @example
 * ```typescript
 * const authResult = await requireAuth(request);
 * if (authResult instanceof NextResponse) return authResult;
 * const session = authResult; // Session object
 * ```
 */
export async function requireAuth(
  request: NextRequest
): Promise<Session | NextResponse> {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      {
        error: 'Unauthorized',
        message: 'Authentication required. Please login to access this resource.'
      },
      { status: 401 }
    );
  }

  return session;
}

/**
 * Require specific role(s) for API route
 *
 * @param request - Next.js request object
 * @param allowedRoles - Array of allowed role names
 * @returns Session object or error response
 *
 * @example
 * ```typescript
 * // Only admin and pm can access
 * const authResult = await requireRole(request, ['admin', 'pm']);
 * if (authResult instanceof NextResponse) return authResult;
 *
 * // Only admin can access
 * const authResult = await requireRole(request, ['admin']);
 * ```
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: string[]
): Promise<Session | NextResponse> {
  const authResult = await requireAuth(request);

  // If auth check failed, return the error response
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const session = authResult;

  // Check if user has one of the allowed roles
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json(
      {
        error: 'Forbidden',
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${session.user.role}.`
      },
      { status: 403 }
    );
  }

  return session;
}

/**
 * Check if user owns a resource or has admin/pm role
 *
 * Useful for endpoints where users can only modify their own resources,
 * but admins/PMs can modify any resource.
 *
 * @param request - Next.js request object
 * @param resourceOwnerId - User ID of the resource owner
 * @returns Session object or error response
 *
 * @example
 * ```typescript
 * // Check if user can modify equipment assigned to a specific user
 * const authResult = await requireOwnershipOrRole(
 *   request,
 *   equipment.assigned_user_id,
 *   ['admin', 'pm']
 * );
 * ```
 */
export async function requireOwnershipOrRole(
  request: NextRequest,
  resourceOwnerId: string | null | undefined,
  adminRoles: string[] = ['admin', 'pm']
): Promise<Session | NextResponse> {
  const authResult = await requireAuth(request);

  // If auth check failed, return the error response
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const session = authResult;

  // Admin/PM can access anything
  if (adminRoles.includes(session.user.role)) {
    return session;
  }

  // User must own the resource
  if (session.user.id !== resourceOwnerId) {
    return NextResponse.json(
      {
        error: 'Forbidden',
        message: 'You can only access your own resources.'
      },
      { status: 403 }
    );
  }

  return session;
}

/**
 * Permission matrix for equipment operations
 *
 * Defines which roles can perform which operations on equipment.
 */
export const EQUIPMENT_PERMISSIONS = {
  // Anyone authenticated can view equipment
  view: ['admin', 'pm', 'foreman', 'crew', 'worker', 'viewer'],

  // Only admin, pm, and foreman can create equipment
  create: ['admin', 'pm', 'foreman'],

  // Only admin and pm can update equipment
  update: ['admin', 'pm'],

  // Only admin can delete equipment
  delete: ['admin'],

  // Admin, pm, and foreman can create/manage assignments
  assign: ['admin', 'pm', 'foreman'],

  // Admin, pm, and foreman can create/manage reservations
  reserve: ['admin', 'pm', 'foreman'],

  // Admin, pm, and foreman can upload documents
  uploadDocuments: ['admin', 'pm', 'foreman'],

  // Admin, pm, and foreman can log usage
  logUsage: ['admin', 'pm', 'foreman', 'crew'],

  // Admin and pm can view analytics
  viewAnalytics: ['admin', 'pm'],

  // Admin and pm can manage maintenance
  manageMaintenance: ['admin', 'pm'],
} as const;

/**
 * Helper to check equipment permissions
 *
 * @example
 * ```typescript
 * const authResult = await requireEquipmentPermission(request, 'create');
 * if (authResult instanceof NextResponse) return authResult;
 * ```
 */
export async function requireEquipmentPermission(
  request: NextRequest,
  operation: keyof typeof EQUIPMENT_PERMISSIONS
): Promise<Session | NextResponse> {
  const allowedRoles = EQUIPMENT_PERMISSIONS[operation];
  return requireRole(request, allowedRoles as string[]);
}

/**
 * Log authentication events
 *
 * Useful for security auditing and debugging.
 */
export function logAuthEvent(
  event: 'success' | 'unauthorized' | 'forbidden',
  details: {
    endpoint: string;
    userId?: string;
    role?: string;
    requiredRoles?: string[];
    ip?: string;
  }
) {
  const timestamp = new Date().toISOString();
  const logLevel = event === 'success' ? 'info' : 'warn';

  console[logLevel](`[AUTH ${event.toUpperCase()}] ${timestamp}`, {
    event,
    ...details,
  });
}

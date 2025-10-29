import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

/**
 * API Authentication Utilities
 *
 * Provides authentication and authorization helpers for API routes.
 *
 * Security Implementation (Phase 1):
 * - Token-based authentication using JWT
 * - Role-based access control
 * - Project-level authorization
 *
 * @see .claude/implementation-plans/soil-types-phase1-security-fixes.md
 */

export interface AuthUser {
  id?: string;           // Optional for backward compatibility
  user_id?: string;      // JWT payload uses user_id
  email: string;
  role: string;
  first_name?: string;   // May not be in JWT
  last_name?: string;    // May not be in JWT
}

export interface AuthResult {
  authenticated: boolean;
  user: AuthUser | null;
}

/**
 * Validates authentication token from request headers
 *
 * Checks for "Authorization: Bearer <token>" header and validates JWT.
 *
 * @param request - Next.js API request
 * @returns AuthResult with user data if authenticated
 */
export async function validateApiAuth(request: NextRequest): Promise<AuthResult> {
  // Check Authorization header
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authenticated: false, user: null };
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  try {
    // Verify JWT token with secret
    const secret = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
    const decoded = jwt.verify(token, secret) as AuthUser;

    return {
      authenticated: true,
      user: decoded
    };
  } catch (error) {
    console.warn('Invalid authentication token:', error instanceof Error ? error.message : error);
    return { authenticated: false, user: null };
  }
}

/**
 * Requires authentication - returns 401 if not authenticated
 *
 * @param authResult - Result from validateApiAuth()
 * @returns NextResponse with 401 error, or null if authenticated
 */
export function requireAuth(authResult: AuthResult): NextResponse | null {
  if (!authResult.authenticated || !authResult.user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  return null;
}

/**
 * Requires specific role - returns 403 if insufficient permissions
 *
 * @param authResult - Result from validateApiAuth()
 * @param allowedRoles - Array of allowed roles (e.g., ['admin', 'pm'])
 * @returns NextResponse with 401/403 error, or null if authorized
 */
export function requireRole(
  authResult: AuthResult,
  allowedRoles: string[]
): NextResponse | null {
  // First check authentication
  const authError = requireAuth(authResult);
  if (authError) return authError;

  // Then check role
  if (!allowedRoles.includes(authResult.user!.role)) {
    return NextResponse.json(
      {
        error: 'Forbidden - insufficient permissions',
        required_roles: allowedRoles,
        user_role: authResult.user!.role
      },
      { status: 403 }
    );
  }

  return null;
}

/**
 * Checks if user can access a specific project
 *
 * User has access if:
 * - User is admin (can access all projects)
 * - User is PM of the project
 * - User is assigned to project via crew
 *
 * @param userId - User ID to check
 * @param projectId - Project ID to check access for
 * @param supabase - Supabase client instance
 * @returns true if user has access, false otherwise
 */
export async function canAccessProject(
  userId: string,
  projectId: string,
  supabase: any
): Promise<boolean> {
  try {
    // Check if user is PM of project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('pm_user_id')
      .eq('id', projectId)
      .single();

    if (projectError) {
      console.warn(`Project ${projectId} not found:`, projectError);
      return false;
    }

    if (project?.pm_user_id === userId) {
      return true;
    }

    // Check if user is assigned via crew
    const { data: crewAssignments, error: crewError } = await supabase
      .from('crew_members')
      .select(`
        id,
        crew:crews!inner(
          id,
          project_id
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true);

    if (crewError) {
      console.warn('Error checking crew assignments:', crewError);
      return false;
    }

    // Check if any crew assignment is for this project
    if (crewAssignments && crewAssignments.length > 0) {
      return crewAssignments.some((assignment: any) =>
        assignment.crew?.project_id === projectId
      );
    }

    return false;
  } catch (error) {
    console.error('Error in canAccessProject:', error);
    return false;
  }
}

/**
 * Requires project access - returns 403 if user cannot access project
 *
 * Combines authentication and project-level authorization.
 * Admins bypass project access checks.
 *
 * @param authResult - Result from validateApiAuth()
 * @param projectId - Project ID to check access for
 * @param supabase - Supabase client instance
 * @returns NextResponse with 401/403/404 error, or null if authorized
 */
export async function requireProjectAccess(
  authResult: AuthResult,
  projectId: string,
  supabase: any
): Promise<NextResponse | null> {
  // First check authentication
  const authError = requireAuth(authResult);
  if (authError) return authError;

  const user = authResult.user!;

  // Admins can access everything
  if (user.role === 'admin') {
    return null;
  }

  // Verify project exists
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .single();

  if (projectError || !project) {
    return NextResponse.json(
      { error: 'Project not found' },
      { status: 404 }
    );
  }

  // Check if user has access to project
  const userId = user.user_id || user.id!;
  const hasAccess = await canAccessProject(userId, projectId, supabase);
  if (!hasAccess) {
    console.warn(`User ${userId} (${user.email}) attempted to access project ${projectId} without permission`);
    return NextResponse.json(
      { error: 'Forbidden - you do not have access to this project' },
      { status: 403 }
    );
  }

  return null;
}

/**
 * Logs security event for audit trail
 *
 * @param event - Event type (e.g., 'unauthorized_access')
 * @param details - Additional details about the event
 */
export function logSecurityEvent(event: string, details: any) {
  const logEntry = {
    event,
    ...details,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  };

  if (process.env.NODE_ENV === 'production') {
    // In production: structured logging for external service
    console.error('[SECURITY]', JSON.stringify(logEntry));
    // TODO: Send to external logging service (Sentry, CloudWatch, etc.)
  } else {
    // In development: verbose console output
    console.warn('[SECURITY]', logEntry);
  }
}

/**
 * Helper to log unauthorized access attempts
 *
 * @param userId - User ID if authenticated, undefined otherwise
 * @param resource - Resource being accessed (e.g., 'soil-types')
 * @param request - Next.js request object
 */
export function logUnauthorizedAccess(
  userId: string | undefined,
  resource: string,
  request: NextRequest
) {
  logSecurityEvent('unauthorized_access_attempt', {
    userId,
    resource,
    method: request.method,
    url: request.url,
    ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
  });
}

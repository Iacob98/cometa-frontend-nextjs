import { redirect } from "next/navigation";
import { getStoredUser, getStoredToken } from "@/hooks/use-auth";
import type { AuthUser } from "@/types";

// Auth validation utilities
export function validateAuth(): AuthUser | null {
  if (typeof window === "undefined") return null;

  const token = getStoredToken();
  const user = getStoredUser();

  if (!token || !user) return null;

  // For now, just check if token exists
  // TODO: Implement proper token validation
  return user;
}

// Server-side auth check for pages
export function requireAuth(): never | void {
  const user = validateAuth();

  if (!user) {
    redirect('/login');
  }
}

// Role-based access control
export function requireRole(allowedRoles: string[]): never | void {
  const user = validateAuth();

  if (!user) {
    redirect('/login');
  }

  if (!allowedRoles.includes(user.role)) {
    redirect('/dashboard'); // Redirect to dashboard if no permission
  }
}

// Permission-based access control
export function requirePermission(permission: string): never | void {
  const user = validateAuth();

  if (!user) {
    redirect('/login');
  }

  if (!user.permissions?.includes(permission)) {
    redirect('/dashboard');
  }
}

// Auth utilities for components
export function useAuthGuard() {
  return {
    requireAuth,
    requireRole,
    requirePermission,
    validateAuth,
  };
}

// Quick role checks
export const roleChecks = {
  isAdmin: (user: AuthUser) => user.role === 'admin',
  isProjectManager: (user: AuthUser) => user.role === 'pm',
  isForeman: (user: AuthUser) => user.role === 'foreman',
  isWorker: (user: AuthUser) => ['crew', 'worker'].includes(user.role),
  isViewer: (user: AuthUser) => user.role === 'viewer',

  // Combined checks
  canManageProjects: (user: AuthUser) => ['admin', 'pm'].includes(user.role),
  canApproveWork: (user: AuthUser) => ['admin', 'pm', 'foreman'].includes(user.role),
  canCreateWork: (user: AuthUser) => ['admin', 'pm', 'foreman', 'crew', 'worker'].includes(user.role),
  canViewReports: (user: AuthUser) => ['admin', 'pm', 'viewer'].includes(user.role),
};
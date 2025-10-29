# Phase 1 Implementation - Current Situation Analysis

**Date**: 2025-10-29
**Status**: Analysis Complete - Ready to Implement

---

## Current State Analysis

### Authentication Status: ❌ NOT IMPLEMENTED

After analyzing the codebase:

1. **No NextAuth configuration** - Project uses custom auth system
2. **No API route authentication** - All routes are publicly accessible
3. **Service role key everywhere** - All API routes use SUPABASE_SERVICE_ROLE_KEY

### Current Auth Implementation

**Client-side auth** (`src/lib/auth.ts`):
- Uses localStorage for token/user storage
- `validateAuth()` function for client-side checks
- `requireAuth()` redirects to login (client-side only)
- Does NOT work in API routes (server-side)

**API routes** (example: `src/app/api/crews/route.ts`):
```typescript
// NO authentication checks
export async function GET(request: NextRequest) {
  try {
    // Direct query without auth check
    const { data: crews } = await supabase.from('crews').select('*');
    return NextResponse.json(crews);
  } catch (error) {
    // ...
  }
}
```

### Impact

**CRITICAL**: Every API route in the project is vulnerable:
- `/api/projects/*` - No auth
- `/api/crews/*` - No auth
- `/api/work-entries/*` - No auth
- `/api/materials/*` - No auth
- `/api/equipment/*` - No auth
- `/api/vehicles/*` - No auth
- **ALL other API routes** - No auth

This is a **systemic security issue**, not just Soil Types.

---

## Decision Point: Authentication Strategy

### Option 1: Token-Based Auth (Custom Implementation)
**Current system**: Users get JWT token from `/api/auth/login`

**Pros**:
- Matches existing client-side auth
- No new dependencies
- Simple to implement

**Cons**:
- Need to implement token validation
- Need to decode JWT
- Need to verify token signature
- More code to maintain

**Implementation**:
```typescript
// src/lib/api-auth.ts
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export async function validateApiAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authenticated: false, user: null };
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return { authenticated: true, user: decoded };
  } catch (error) {
    return { authenticated: false, user: null };
  }
}
```

### Option 2: Cookie-Based Auth (Middleware)
**Use existing cookies** set by frontend

**Pros**:
- Automatically sent with requests
- More secure (HttpOnly cookies)
- Can be validated in middleware

**Cons**:
- Need to ensure cookies are properly set
- CSRF considerations

### Option 3: Supabase Auth (Recommended)
**Use Supabase's built-in auth**

**Pros**:
- RLS policies automatically work
- Session management handled
- Security best practices built-in
- No JWT validation needed

**Cons**:
- Requires migrating from custom auth
- More significant refactor

---

## Recommended Approach

### SHORT-TERM (Phase 1): Token-Based Auth
Implement custom token validation to quickly secure API routes.

**Why**:
- Fastest to implement (24-48 hours)
- Works with existing auth system
- Blocks the critical security holes

**Steps**:
1. Create `src/lib/api-auth.ts` with token validation
2. Add `validateApiAuth()` to all API routes
3. Return 401 if not authenticated
4. Return 403 if not authorized

### LONG-TERM (Post-Phase 1): Migrate to Supabase Auth
Refactor entire auth system to use Supabase Auth properly.

**Benefits**:
- RLS policies work correctly
- Better security
- Less code to maintain
- Industry standard

---

## Phase 1 Implementation Plan - Revised

### Task 1.0: Create API Auth Utilities (NEW)
**File**: `src/lib/api-auth.ts` (new)
**Time**: 2 hours
**Status**: ⬜ Pending

Create reusable authentication utilities for API routes.

```typescript
// src/lib/api-auth.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

interface AuthUser {
  id: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
}

interface AuthResult {
  authenticated: boolean;
  user: AuthUser | null;
}

export async function validateApiAuth(request: NextRequest): Promise<AuthResult> {
  // Check Authorization header
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authenticated: false, user: null };
  }

  const token = authHeader.substring(7); // Remove 'Bearer '

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as AuthUser;

    return {
      authenticated: true,
      user: decoded
    };
  } catch (error) {
    console.warn('Invalid token:', error);
    return { authenticated: false, user: null };
  }
}

export function requireAuth(authResult: AuthResult): NextResponse | null {
  if (!authResult.authenticated || !authResult.user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  return null;
}

export function requireRole(
  authResult: AuthResult,
  allowedRoles: string[]
): NextResponse | null {
  const authError = requireAuth(authResult);
  if (authError) return authError;

  if (!allowedRoles.includes(authResult.user!.role)) {
    return NextResponse.json(
      { error: 'Forbidden - insufficient permissions' },
      { status: 403 }
    );
  }

  return null;
}

// Check if user can access project
export async function canAccessProject(
  userId: string,
  projectId: string,
  supabase: any
): Promise<boolean> {
  // Check if user is PM of project
  const { data: project } = await supabase
    .from('projects')
    .select('pm_user_id')
    .eq('id', projectId)
    .single();

  if (project?.pm_user_id === userId) {
    return true;
  }

  // Check if user is assigned via crew
  const { data: assignment } = await supabase
    .from('crew_members')
    .select('id')
    .eq('user_id', userId)
    .limit(1);

  return !!assignment && assignment.length > 0;
}

export async function requireProjectAccess(
  authResult: AuthResult,
  projectId: string,
  supabase: any
): Promise<NextResponse | null> {
  const authError = requireAuth(authResult);
  if (authError) return authError;

  const user = authResult.user!;

  // Admin can access everything
  if (user.role === 'admin') {
    return null;
  }

  // Check project access
  const hasAccess = await canAccessProject(user.id, projectId, supabase);
  if (!hasAccess) {
    return NextResponse.json(
      { error: 'Forbidden - no access to this project' },
      { status: 403 }
    );
  }

  return null;
}
```

### Task 1.1-REVISED: Secure GET Endpoint
**File**: `src/app/api/projects/[id]/soil-types/route.ts`
**Time**: 30 minutes
**Status**: ⬜ Pending

```typescript
import { validateApiAuth, requireProjectAccess } from '@/lib/api-auth';

export async function GET(request: NextRequest, { params }: Context) {
  try {
    // Step 1: Validate authentication
    const authResult = await validateApiAuth(request);
    const authError = await requireProjectAccess(authResult, (await params).id, supabase);
    if (authError) return authError;

    // Step 2: Continue with query (now authenticated & authorized)
    const { id: projectId } = await params;
    const { data: soilTypes, error } = await supabase
      .from('project_soil_types')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Soil types query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch soil types' },
        { status: 500 }
      );
    }

    return NextResponse.json(soilTypes || []);
  } catch (error) {
    console.error('Project soil types error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project soil types' },
      { status: 500 }
    );
  }
}
```

### Task 1.2-REVISED: Secure POST Endpoint
```typescript
export async function POST(request: NextRequest, { params }: Context) {
  try {
    // Auth check - only PM and admin can create
    const authResult = await validateApiAuth(request);
    const roleError = requireRole(authResult, ['admin', 'pm']);
    if (roleError) return roleError;

    const { id: projectId } = await params;
    const projectAccessError = await requireProjectAccess(authResult, projectId, supabase);
    if (projectAccessError) return projectAccessError;

    // Continue with POST logic...
  } catch (error) {
    // ...
  }
}
```

### Task 1.3-REVISED: Secure DELETE Endpoint
```typescript
export async function DELETE(request: NextRequest, { params }: Context) {
  try {
    // Auth check - only PM and admin can delete
    const authResult = await validateApiAuth(request);
    const roleError = requireRole(authResult, ['admin', 'pm']);
    if (roleError) return roleError;

    const { id: projectId } = await params;
    const projectAccessError = await requireProjectAccess(authResult, projectId, supabase);
    if (projectAccessError) return projectAccessError;

    // Continue with DELETE logic...
  } catch (error) {
    // ...
  }
}
```

---

## Testing Strategy - Revised

### Manual Testing
```bash
# Test 1: No token (should fail)
curl http://localhost:3000/api/projects/123/soil-types
# Expected: 401 Unauthorized

# Test 2: Invalid token (should fail)
curl -H "Authorization: Bearer invalid" http://localhost:3000/api/projects/123/soil-types
# Expected: 401 Unauthorized

# Test 3: Valid token (should work)
# First, login to get token:
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"pm@cometa.de","pin_code":"1234"}' | jq -r '.token')

# Then use token:
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/projects/123/soil-types
# Expected: 200 OK with data
```

---

## Dependencies Required

```bash
# Install JWT library
npm install jsonwebtoken
npm install --save-dev @types/jsonwebtoken
```

---

## Updated Timeline

| Task | Original | Revised | Reason |
|------|----------|---------|--------|
| Task 1.0 | N/A | 2 hours | New: Create auth utilities |
| Task 1.1 | 1 hour | 30 min | Simpler with utilities |
| Task 1.2 | 2 hours | 30 min | Simpler with utilities |
| Task 1.3 | 1.5 hours | 30 min | Simpler with utilities |
| Task 1.4 | 1.5 hours | 30 min | Simpler with utilities |
| Task 1.5 | 30 min | 30 min | No change |
| **Total** | **7.5 hours** | **5 hours** | More efficient |

---

## Next Steps

1. ✅ Create `src/lib/api-auth.ts` with utilities
2. ✅ Install jsonwebtoken dependency
3. ✅ Update GET endpoint with auth
4. ✅ Update POST endpoint with auth
5. ✅ Update DELETE endpoint with auth
6. ✅ Remove/secure PUT endpoint
7. ✅ Test all endpoints
8. ✅ Document changes

---

**Status**: Ready to implement
**Priority**: 🔴 CRITICAL
**Blocking**: Production deployment

**Note**: This is SHORT-TERM solution. Post-Phase 1, recommend migrating entire project to Supabase Auth for better security and RLS integration.

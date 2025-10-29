# Phase 1: Critical Security Fixes - Implementation Plan

**Priority**: 🔴 CRITICAL - BLOCKING DEPLOYMENT
**Timeline**: 24-48 hours
**Status**: 🚧 In Progress

---

## Overview

This phase addresses CRITICAL security vulnerabilities that make the Soil Types feature unsafe for production. All tasks in this phase are BLOCKING - deployment must not occur until completion.

---

## Task Breakdown

### Task 1.1: Add Authentication to GET Endpoint
**File**: `src/app/api/projects/[id]/soil-types/route.ts`
**Lines**: 64-91
**Estimated Time**: 1 hour
**Status**: ⬜ Pending

#### Current Code (Vulnerable)
```typescript
export async function GET(request: NextRequest, { params }: Context) {
  try {
    const { id: projectId } = await params
    const { data: soilTypes, error } = await supabase
      .from('project_soil_types')
      .select('*')
      .eq('project_id', projectId)
    // NO AUTHENTICATION CHECK!
```

#### Required Changes
1. Import authentication utilities
2. Check for valid session
3. Return 401 if not authenticated
4. Return 404 for non-existent project
5. Add logging for unauthorized attempts

#### Implementation Steps
```typescript
// Step 1: Add imports
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Step 2: Add session check
export async function GET(request: NextRequest, { params }: Context) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.warn('Unauthorized access attempt to soil types API');
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id: projectId } = await params;

    // Verify project exists
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, pm_user_id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Continue with existing logic...
```

#### Testing Checklist
- [ ] Test: Anonymous GET returns 401
- [ ] Test: Invalid token returns 401
- [ ] Test: Non-existent project returns 404
- [ ] Test: Valid session returns 200 with data
- [ ] Verify console.warn logs unauthorized attempts

---

### Task 1.2: Add Authorization to GET Endpoint
**File**: `src/app/api/projects/[id]/soil-types/route.ts`
**Estimated Time**: 2 hours
**Status**: ⬜ Pending

#### Required Changes
1. Check if user has access to project
2. Verify user is admin, PM, or assigned to project
3. Return 403 if unauthorized

#### Implementation Steps
```typescript
// Step 1: Create helper function (if doesn't exist)
// File: src/lib/auth-utils.ts
async function isUserAssignedToProject(
  userId: string,
  projectId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('crew_members')
    .select('id')
    .eq('user_id', userId)
    .eq('project_id', projectId)
    .limit(1);

  return !!data && data.length > 0;
}

// Step 2: Add authorization check in GET
const canAccess =
  session.user.role === 'admin' ||
  project.pm_user_id === session.user.id ||
  await isUserAssignedToProject(session.user.id, projectId);

if (!canAccess) {
  console.warn(`User ${session.user.id} attempted to access project ${projectId} without permission`);
  return NextResponse.json(
    { error: "Forbidden - insufficient permissions" },
    { status: 403 }
  );
}
```

#### Testing Checklist
- [ ] Test: Admin can access any project
- [ ] Test: PM can access their projects
- [ ] Test: Crew member can access assigned project
- [ ] Test: User A cannot access User B's project (403)
- [ ] Test: Foreman can access team's project
- [ ] Verify authorization logs in console

---

### Task 1.3: Add Authentication & Authorization to POST Endpoint
**File**: `src/app/api/projects/[id]/soil-types/route.ts`
**Lines**: 94-147
**Estimated Time**: 1.5 hours
**Status**: ⬜ Pending

#### Required Changes
1. Same authentication check as GET
2. More restrictive authorization (only PM and admin can CREATE)
3. Validate project ownership before insert

#### Implementation Steps
```typescript
export async function POST(request: NextRequest, { params }: Context) {
  try {
    // Step 1: Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id: projectId } = await params;

    // Step 2: Verify project and ownership
    const { data: project } = await supabase
      .from('projects')
      .select('pm_user_id')
      .eq('id', projectId)
      .single();

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Step 3: Authorization - ONLY pm and admin can create
    const canCreate =
      session.user.role === 'admin' ||
      project.pm_user_id === session.user.id;

    if (!canCreate) {
      console.warn(`User ${session.user.id} attempted to create soil type without permission`);
      return NextResponse.json(
        { error: "Forbidden - only project manager or admin can add soil types" },
        { status: 403 }
      );
    }

    // Continue with existing POST logic...
```

#### Testing Checklist
- [ ] Test: Anonymous POST returns 401
- [ ] Test: Crew member POST returns 403
- [ ] Test: PM can POST to their project
- [ ] Test: Admin can POST to any project
- [ ] Test: User A PM cannot POST to User B project
- [ ] Verify audit logging for unauthorized attempts

---

### Task 1.4: Add Authentication & Authorization to DELETE Endpoint
**File**: `src/app/api/projects/[id]/soil-types/route.ts`
**Lines**: 215-254
**Estimated Time**: 1.5 hours
**Status**: ⬜ Pending

#### Required Changes
1. Same authentication as POST
2. Same authorization as POST (only PM/admin)
3. Double-check soil type belongs to specified project

#### Implementation Steps
```typescript
export async function DELETE(request: NextRequest, { params }: Context) {
  try {
    // Step 1: Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id: projectId } = await params;
    const url = new URL(request.url);
    const soilTypeId = url.searchParams.get('soil_type_id');

    if (!soilTypeId) {
      return NextResponse.json(
        { error: 'soil_type_id parameter is required' },
        { status: 400 }
      );
    }

    // Step 2: Verify project ownership
    const { data: project } = await supabase
      .from('projects')
      .select('pm_user_id')
      .eq('id', projectId)
      .single();

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Step 3: Authorization
    const canDelete =
      session.user.role === 'admin' ||
      project.pm_user_id === session.user.id;

    if (!canDelete) {
      console.warn(`User ${session.user.id} attempted to delete soil type without permission`);
      return NextResponse.json(
        { error: "Forbidden - only project manager or admin can delete soil types" },
        { status: 403 }
      );
    }

    // Step 4: Verify soil type belongs to this project (prevent ID manipulation)
    const { data: existingSoilType } = await supabase
      .from('project_soil_types')
      .select('project_id')
      .eq('id', soilTypeId)
      .single();

    if (!existingSoilType) {
      return NextResponse.json(
        { error: "Soil type not found" },
        { status: 404 }
      );
    }

    if (existingSoilType.project_id !== projectId) {
      console.warn(`User ${session.user.id} attempted to delete soil type from wrong project`);
      return NextResponse.json(
        { error: "Soil type does not belong to this project" },
        { status: 400 }
      );
    }

    // Continue with delete...
```

#### Testing Checklist
- [ ] Test: Anonymous DELETE returns 401
- [ ] Test: Crew member DELETE returns 403
- [ ] Test: PM can DELETE from their project
- [ ] Test: Admin can DELETE from any project
- [ ] Test: Cannot DELETE soil type from wrong project
- [ ] Test: Cannot DELETE non-existent soil type (404)

---

### Task 1.5: Remove/Secure PUT Endpoint
**File**: `src/app/api/projects/[id]/soil-types/route.ts`
**Lines**: 149-212
**Estimated Time**: 30 minutes
**Status**: ⬜ Pending

#### Decision Point
Two options:
1. **Delete entirely** (recommended - no UI exists)
2. **Add auth/authz** (if needed in future)

#### Option 1: Delete PUT Endpoint (Recommended)
```typescript
// Simply remove lines 149-212
// Saves 64 LOC, reduces attack surface
```

#### Option 2: Secure PUT Endpoint
```typescript
export async function PUT(request: NextRequest, { params }: Context) {
  // Same auth/authz pattern as POST
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  // ... same authorization checks as POST/DELETE
}
```

#### Recommendation
**DELETE the PUT endpoint** because:
- No edit UI exists
- Reduces attack surface
- Follows YAGNI principle
- Can rebuild when needed

#### Testing Checklist (if Option 2 chosen)
- [ ] Test: Anonymous PUT returns 401
- [ ] Test: Unauthorized user PUT returns 403
- [ ] Test: PM can PUT to their project
- [ ] Test: Cannot PUT to wrong project

---

### Task 1.6: Replace Service Role Key with Authenticated Client
**File**: `src/app/api/projects/[id]/soil-types/route.ts`
**Lines**: 4-8
**Estimated Time**: 2 hours
**Status**: ⬜ Pending

#### Current Code (Vulnerable)
```typescript
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  // ^^^ BYPASSES ALL RLS POLICIES!
)
```

#### Required Changes
1. Use authenticated client that respects RLS
2. Pass user session to Supabase
3. Test that RLS policies are enforced

#### Implementation Steps

**Step 1**: Create authenticated Supabase client helper
```typescript
// File: src/lib/supabase-server.ts (if doesn't exist)
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createServerSupabaseClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,  // Use anon key, not service role
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}
```

**Step 2**: Update route.ts to use authenticated client
```typescript
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest, { params }: Context) {
  const session = await getServerSession(authOptions);
  // ... auth checks ...

  // Use authenticated client
  const supabase = createServerSupabaseClient();

  // This will now respect RLS policies
  const { data: soilTypes, error } = await supabase
    .from('project_soil_types')
    .select('*')
    .eq('project_id', projectId);

  // ...
}
```

#### Testing Checklist
- [ ] Test: Authenticated user can access their data
- [ ] Test: User cannot access other user's data (RLS blocks)
- [ ] Verify RLS policies are being enforced (check Supabase logs)
- [ ] Test all endpoints work with authenticated client

---

### Task 1.7: Create RLS Policies
**File**: `database/migrations/002_add_soil_types_rls.sql` (new file)
**Estimated Time**: 1 hour
**Status**: ⬜ Pending

#### SQL Migration
```sql
-- Enable RLS on project_soil_types table
ALTER TABLE project_soil_types ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can read soil types for projects they have access to
CREATE POLICY "Users can read accessible project soil types"
ON project_soil_types
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_soil_types.project_id
    AND (
      -- User is project manager
      p.pm_user_id = auth.uid()
      -- OR user is admin
      OR (auth.jwt()->>'role')::text = 'admin'
      -- OR user is assigned to project via crew
      OR EXISTS (
        SELECT 1
        FROM crew_members cm
        JOIN crews c ON cm.crew_id = c.id
        WHERE cm.user_id = auth.uid()
        AND c.project_id = p.id
      )
    )
  )
);

-- Policy 2: Only PMs and admins can insert soil types
CREATE POLICY "PMs and admins can create soil types"
ON project_soil_types
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_soil_types.project_id
    AND (
      p.pm_user_id = auth.uid()
      OR (auth.jwt()->>'role')::text = 'admin'
    )
  )
);

-- Policy 3: Only PMs and admins can update soil types
CREATE POLICY "PMs and admins can update soil types"
ON project_soil_types
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_soil_types.project_id
    AND (
      p.pm_user_id = auth.uid()
      OR (auth.jwt()->>'role')::text = 'admin'
    )
  )
);

-- Policy 4: Only PMs and admins can delete soil types
CREATE POLICY "PMs and admins can delete soil types"
ON project_soil_types
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_soil_types.project_id
    AND (
      p.pm_user_id = auth.uid()
      OR (auth.jwt()->>'role')::text = 'admin'
    )
  )
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_soil_types_project_id
ON project_soil_types(project_id);

CREATE INDEX IF NOT EXISTS idx_project_soil_types_created_at
ON project_soil_types(created_at);
```

#### Testing Checklist
- [ ] Run migration on development database
- [ ] Test: User can read their project soil types
- [ ] Test: User cannot read other user's soil types
- [ ] Test: PM can create soil types
- [ ] Test: Crew member cannot create soil types
- [ ] Test: PM can delete their project soil types
- [ ] Verify policies in Supabase dashboard

---

### Task 1.8: Update Middleware to Protect API Routes
**File**: `src/middleware.ts`
**Lines**: 39-48
**Estimated Time**: 1 hour
**Status**: ⬜ Pending

#### Current Code (Vulnerable)
```typescript
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    //      ^^^ API routes are NOT protected!
  ],
};
```

#### Required Changes
Include API routes in authentication middleware

#### Implementation Steps

**Option 1**: Include API routes in matcher
```typescript
export const config = {
  matcher: [
    // Protect API routes
    '/api/:path*',
    // Protect dashboard
    '/dashboard/:path*',
    // Exclude public assets
    '/((?!_next/static|_next/image|favicon.ico|login).*)',
  ],
};
```

**Option 2**: Create dedicated API middleware
```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check if API route
  if (path.startsWith('/api')) {
    // Allow public routes
    const publicApiRoutes = ['/api/auth', '/api/health'];
    if (publicApiRoutes.some(route => path.startsWith(route))) {
      return NextResponse.next();
    }

    // Require authentication for all other API routes
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/((?!_next/static|_next/image|favicon.ico|login).*)',
  ],
};
```

#### Testing Checklist
- [ ] Test: Unauthenticated API call returns 401
- [ ] Test: Public routes still accessible (/api/auth)
- [ ] Test: Authenticated API calls pass through
- [ ] Test: Dashboard routes still protected
- [ ] Verify middleware logs in development

---

### Task 1.9: Add Security Logging
**File**: `src/lib/security-logger.ts` (new file)
**Estimated Time**: 45 minutes
**Status**: ⬜ Pending

#### Create Security Logger
```typescript
// src/lib/security-logger.ts
interface SecurityEvent {
  event: string;
  userId?: string;
  projectId?: string;
  ip?: string;
  userAgent?: string;
  details?: any;
  timestamp: string;
}

export function logSecurityEvent(event: SecurityEvent) {
  const logEntry = {
    ...event,
    timestamp: event.timestamp || new Date().toISOString(),
    environment: process.env.NODE_ENV,
  };

  if (process.env.NODE_ENV === 'production') {
    // In production: send to logging service (Sentry, CloudWatch, etc.)
    console.error('[SECURITY]', JSON.stringify(logEntry));
    // TODO: Send to external logging service
  } else {
    // In development: verbose console logging
    console.warn('[SECURITY]', logEntry);
  }
}

// Helper for unauthorized access attempts
export function logUnauthorizedAccess(
  userId: string | undefined,
  resource: string,
  request: NextRequest
) {
  logSecurityEvent({
    event: 'unauthorized_access_attempt',
    userId,
    details: {
      resource,
      method: request.method,
      url: request.url,
    },
    ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    timestamp: new Date().toISOString(),
  });
}
```

#### Update Routes to Use Logger
```typescript
import { logSecurityEvent, logUnauthorizedAccess } from '@/lib/security-logger';

export async function GET(request: NextRequest, { params }: Context) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    logUnauthorizedAccess(undefined, 'soil-types-read', request);
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  // ... authorization check ...

  if (!canAccess) {
    logUnauthorizedAccess(session.user.id, `soil-types-read-${projectId}`, request);
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Log successful access for audit
  logSecurityEvent({
    event: 'soil_types_accessed',
    userId: session.user.id,
    projectId,
    timestamp: new Date().toISOString(),
  });

  // ... continue ...
}
```

#### Testing Checklist
- [ ] Test: Unauthorized attempts are logged
- [ ] Test: Successful accesses are logged
- [ ] Verify log format is consistent
- [ ] Check logs contain necessary details (user, IP, timestamp)

---

### Task 1.10: Write Security Tests
**File**: `src/__tests__/api/soil-types-security.test.ts` (new file)
**Estimated Time**: 2 hours
**Status**: ⬜ Pending

#### Test Suite
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('Soil Types API Security', () => {
  describe('Authentication Tests', () => {
    it('GET without auth returns 401', async () => {
      const response = await fetch('/api/projects/test-id/soil-types');
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toContain('Authentication required');
    });

    it('POST without auth returns 401', async () => {
      const response = await fetch('/api/projects/test-id/soil-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          soil_type_name: 'Test',
          price_per_meter: 10
        })
      });
      expect(response.status).toBe(401);
    });

    it('DELETE without auth returns 401', async () => {
      const response = await fetch('/api/projects/test-id/soil-types?soil_type_id=x', {
        method: 'DELETE'
      });
      expect(response.status).toBe(401);
    });
  });

  describe('Authorization Tests', () => {
    it('User A cannot access User B project', async () => {
      const tokenUserA = await getTestToken('user-a');
      const response = await fetch('/api/projects/user-b-project/soil-types', {
        headers: { 'Authorization': `Bearer ${tokenUserA}` }
      });
      expect(response.status).toBe(403);
    });

    it('PM can access their project', async () => {
      const tokenPM = await getTestToken('pm-user');
      const response = await fetch('/api/projects/pm-project/soil-types', {
        headers: { 'Authorization': `Bearer ${tokenPM}` }
      });
      expect(response.status).toBe(200);
    });

    it('Admin can access any project', async () => {
      const tokenAdmin = await getTestToken('admin-user');
      const response = await fetch('/api/projects/any-project/soil-types', {
        headers: { 'Authorization': `Bearer ${tokenAdmin}` }
      });
      expect(response.status).toBe(200);
    });

    it('Crew member cannot create soil types', async () => {
      const tokenCrew = await getTestToken('crew-user');
      const response = await fetch('/api/projects/project-id/soil-types', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenCrew}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          soil_type_name: 'Test',
          price_per_meter: 10
        })
      });
      expect(response.status).toBe(403);
    });
  });

  describe('RLS Policy Tests', () => {
    it('RLS blocks unauthorized SELECT', async () => {
      // Create authenticated Supabase client for user A
      const supabaseUserA = createAuthenticatedClient('user-a');

      const { data, error } = await supabaseUserA
        .from('project_soil_types')
        .select('*')
        .eq('project_id', 'user-b-project');

      expect(data).toEqual([]);  // RLS should block
    });

    it('RLS allows authorized SELECT', async () => {
      const supabasePM = createAuthenticatedClient('pm-user');

      const { data, error } = await supabasePM
        .from('project_soil_types')
        .select('*')
        .eq('project_id', 'pm-project');

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });
  });
});
```

#### Testing Checklist
- [ ] All authentication tests pass
- [ ] All authorization tests pass
- [ ] RLS policy tests pass
- [ ] Test coverage > 90% for security-critical paths

---

## Success Criteria

### Phase 1 Complete When:
- ✅ All API endpoints require authentication (401 if not logged in)
- ✅ All state-changing operations require authorization (403 if not PM/admin)
- ✅ RLS policies active and enforced
- ✅ Service role key replaced with authenticated client
- ✅ Middleware protects API routes
- ✅ Security logging implemented
- ✅ All security tests pass
- ✅ No anonymous access possible

### Validation Steps
1. **Manual Testing**:
   ```bash
   # Should fail (401)
   curl http://localhost:3000/api/projects/123/soil-types

   # Should succeed with valid token
   curl -H "Authorization: Bearer <token>" http://localhost:3000/api/projects/123/soil-types
   ```

2. **Automated Testing**:
   ```bash
   npm run test -- soil-types-security.test.ts
   ```

3. **RLS Verification**:
   - Check Supabase dashboard → Authentication → Policies
   - Verify all 4 policies are active
   - Test with different user roles

4. **Code Review**:
   - All endpoints have auth checks
   - No service role key usage
   - Logging in place

---

## Documentation Updates

### Files to Update
1. `.claude/reviews/soil-types-comprehensive-review.md` - Mark Phase 1 complete
2. `CHANGELOG.md` - Document security fixes
3. `.claude/implementation-plans/soil-types-security-fixes-log.md` - Detailed log

---

## Next Phase
Once Phase 1 is complete and validated:
→ **Phase 2: Input Validation & Rate Limiting**

---

**Created**: 2025-10-29
**Last Updated**: 2025-10-29
**Assignee**: Claude Code Agent
**Status**: 🚧 Ready to Start

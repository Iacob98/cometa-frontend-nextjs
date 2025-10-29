# Equipment API Security Audit Report
**Date:** 2025-10-29
**Scope:** All Equipment API endpoints
**Auditor:** Security Specialist Agent

---

## Executive Summary

This comprehensive security audit identified **CRITICAL vulnerabilities** across all Equipment API endpoints. The most severe finding is **MISSING AUTHENTICATION AND AUTHORIZATION** on ALL Equipment API routes, allowing unauthorized access to sensitive data and operations.

### Risk Overview
- **CRITICAL Issues:** 2
- **HIGH Issues:** 5
- **MEDIUM Issues:** 4
- **LOW Issues:** 3

### Overall Security Posture: **CRITICAL - IMMEDIATE ACTION REQUIRED**

---

## Critical Findings

### 🔴 CRITICAL-001: No Authentication on Equipment API Routes
**Severity:** CRITICAL
**CWE-284:** Improper Access Control
**CVSS Score:** 9.8 (Critical)

#### Description
**NONE of the Equipment API endpoints implement authentication or authorization checks.** The middleware at `/src/middleware.ts` explicitly EXCLUDES API routes from auth checks (line 44: `'/((?!api|_next/static|_next/image|favicon.ico).*)'`).

#### Affected Endpoints
All endpoints in the following files are completely unauthenticated:
- `/src/app/api/equipment/route.ts` (GET, POST)
- `/src/app/api/equipment/[id]/route.ts` (GET, PUT, DELETE)
- `/src/app/api/equipment/analytics/route.ts` (GET)
- `/src/app/api/equipment/reservations/route.ts` (GET, POST)
- `/src/app/api/equipment/reservations/[id]/route.ts` (DELETE)
- `/src/app/api/equipment/documents/route.ts` (GET, POST, PUT)
- `/src/app/api/equipment/documents/[id]/route.ts` (GET, DELETE)
- `/src/app/api/equipment/maintenance-schedules/route.ts` (GET, POST)
- `/src/app/api/equipment/typed-views/[viewType]/route.ts` (GET)
- `/src/app/api/equipment/usage/route.ts` (GET, POST, PUT, DELETE)
- `/src/app/api/resources/equipment-assignments/route.ts` (GET, POST, PUT)
- `/src/app/api/resources/rental-equipment/route.ts` (POST)
- `/src/app/api/resources/assignments/equipment/[id]/route.ts` (DELETE)

#### Proof of Concept
```bash
# Any unauthenticated user can:

# 1. List ALL equipment (including sensitive rental costs, locations)
curl http://localhost:3000/api/equipment

# 2. Delete ANY equipment
curl -X DELETE http://localhost:3000/api/equipment/[id]

# 3. Access financial analytics
curl http://localhost:3000/api/equipment/analytics

# 4. Download confidential documents
curl http://localhost:3000/api/equipment/documents/[id]

# 5. Modify equipment assignments
curl -X PUT http://localhost:3000/api/resources/equipment-assignments \
  -H "Content-Type: application/json" \
  -d '{"assignment_id":"123","is_active":false}'
```

#### Impact
- **Data Breach:** Complete exposure of all equipment data, financial information, and documents
- **Data Manipulation:** Unauthorized modification/deletion of equipment records
- **Business Logic Bypass:** Circumvent rental tracking, assignments, and maintenance schedules
- **Compliance Violation:** GDPR/data protection law violations

#### Remediation (Priority 1 - Immediate)

**Step 1:** Create authentication middleware for API routes
```typescript
// src/lib/api-auth.ts
import { NextRequest, NextResponse } from 'next/server';

export async function verifyAuth(request: NextRequest) {
  const token = request.cookies.get('cometa_auth_token')?.value ||
                request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  // Validate token with auth service
  try {
    const response = await fetch(`${process.env.GATEWAY_URL}/api/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const user = await response.json();
    return user;
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication verification failed' },
      { status: 500 }
    );
  }
}

export async function requireAuth(
  request: NextRequest,
  allowedRoles: string[] = []
) {
  const authResult = await verifyAuth(request);

  if (authResult instanceof NextResponse) {
    return authResult; // Return error response
  }

  // Check role-based access
  if (allowedRoles.length > 0 && !allowedRoles.includes(authResult.role)) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  return authResult; // Return authenticated user
}
```

**Step 2:** Apply authentication to ALL Equipment API routes
```typescript
// Example: src/app/api/equipment/route.ts
import { requireAuth } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  // Verify authentication
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult; // Return 401/403 error
  }

  const user = authResult;

  // Existing logic...
}

export async function POST(request: NextRequest) {
  // Only admin and pm can create equipment
  const authResult = await requireAuth(request, ['admin', 'pm']);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  // Existing logic...
}
```

**Step 3:** Apply role-based access control to sensitive operations
- **admin, pm:** Full access (create, update, delete)
- **foreman:** Read, update assignments
- **crew, worker:** Read-only
- **viewer:** Read-only (no sensitive financial data)

---

### 🔴 CRITICAL-002: SQL Injection via Unsafe Query Construction
**Severity:** CRITICAL
**CWE-89:** SQL Injection
**CVSS Score:** 9.1 (Critical)

#### Description
Multiple endpoints use **unsafe string interpolation** in Supabase queries, particularly with `.or()`, `.ilike()`, and `.in()` filters that accept user input without proper sanitization.

#### Vulnerable Code Locations

**File:** `/src/app/api/equipment/route.ts` (Lines 121-123)
```typescript
if (search) {
  query = query.or(
    `name.ilike.%${search}%,inventory_no.ilike.%${search}%,type.ilike.%${search}%,description.ilike.%${search}%,notes.ilike.%${search}%,current_location.ilike.%${search}%`
  );
}
```
**Vulnerability:** Direct interpolation of `search` parameter into SQL ILIKE patterns.

**File:** `/src/app/api/equipment/route.ts` (Lines 108-110)
```typescript
if (assignedEquipmentIds.length > 0) {
  query = query.not("id", "in", `(${assignedEquipmentIds.join(",")})`);
}
```
**Vulnerability:** Array elements joined without validation could inject SQL.

**File:** `/src/app/api/equipment/typed-views/[viewType]/route.ts` (Lines 79-82)
```typescript
if (search) {
  query = query.or(
    `name.ilike.%${search}%,inventory_no.ilike.%${search}%,brand.ilike.%${search}%,model.ilike.%${search}%`
  );
}
```
**Vulnerability:** Same pattern as above.

#### Proof of Concept
```bash
# Inject malicious search pattern
curl "http://localhost:3000/api/equipment?search=%25%27%29%20OR%201%3D1%20--%20"

# This could bypass filters and expose all data or cause database errors
# Pattern: %') OR 1=1 --
```

#### Impact
- **Data Exfiltration:** Access to all equipment records
- **Database Enumeration:** Leak database structure information
- **Denial of Service:** Trigger expensive queries or errors

#### Remediation (Priority 1 - Immediate)

**Step 1:** Use parameterized queries for all user input
```typescript
// FIXED: Use Supabase's built-in sanitization
if (search) {
  // Option 1: Use textSearch (if full-text search is enabled)
  query = query.textSearch('name', search);

  // Option 2: Apply individual filters safely
  const searchTerm = `%${search.replace(/[%_]/g, '\\$&')}%`;
  query = query.or(
    `name.ilike.${searchTerm},inventory_no.ilike.${searchTerm}`
  );
}

// For ID arrays, validate each element
if (assignedEquipmentIds.length > 0) {
  // Validate all IDs are UUIDs
  const validIds = assignedEquipmentIds.filter(id =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  );

  if (validIds.length > 0) {
    query = query.not("id", "in", `(${validIds.join(",")})`);
  }
}
```

**Step 2:** Input validation middleware
```typescript
// src/lib/input-validation.ts
import { z } from 'zod';

export const equipmentSearchSchema = z.object({
  search: z.string().max(100).regex(/^[a-zA-Z0-9\s\-_]*$/).optional(),
  page: z.number().int().min(1).max(1000).optional(),
  per_page: z.number().int().min(1).max(100).optional(),
  status: z.enum(['available', 'assigned_to_project', 'issued_to_brigade',
                  'in_maintenance', 'broken']).optional(),
  type: z.string().max(50).optional(),
});

// Use in API routes
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  try {
    const validated = equipmentSearchSchema.parse({
      search: searchParams.get('search'),
      page: parseInt(searchParams.get('page') || '1'),
      per_page: parseInt(searchParams.get('per_page') || '20'),
      status: searchParams.get('status'),
    });

    // Use validated.search instead of raw input
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid query parameters', details: error.errors },
      { status: 400 }
    );
  }
}
```

---

## High Severity Findings

### 🟠 HIGH-001: Insecure Direct Object References (IDOR)
**Severity:** HIGH
**CWE-639:** Authorization Bypass Through User-Controlled Key
**CVSS Score:** 8.1 (High)

#### Description
All endpoints that accept IDs (equipment_id, document_id, reservation_id) do NOT verify ownership or access rights. Any authenticated user can access/modify any resource.

#### Vulnerable Endpoints
- `DELETE /api/equipment/[id]` - No owner check before deletion
- `PUT /api/equipment/[id]` - No permission check before update
- `GET /api/equipment/documents/[id]` - No ownership verification
- `DELETE /api/equipment/documents/[id]` - No owner check
- `DELETE /api/equipment/reservations/[id]` - No reservation owner check

#### Proof of Concept
```bash
# User A creates equipment
curl -X POST http://localhost:3000/api/equipment \
  -H "Authorization: Bearer USER_A_TOKEN" \
  -d '{"name":"Expensive Tool",...}'

# User B (different user) can delete User A's equipment
curl -X DELETE http://localhost:3000/api/equipment/[id] \
  -H "Authorization: Bearer USER_B_TOKEN"
```

#### Remediation

**Step 1:** Add ownership verification helper
```typescript
// src/lib/authorization.ts
export async function verifyEquipmentAccess(
  equipmentId: string,
  user: AuthUser,
  operation: 'read' | 'write' | 'delete'
) {
  // Admin and PM have full access
  if (['admin', 'pm'].includes(user.role)) {
    return true;
  }

  // Check if equipment belongs to user's project/crew
  const { data: equipment } = await supabase
    .from('equipment')
    .select(`
      id,
      equipment_assignments!inner (
        project_id,
        crew_id
      )
    `)
    .eq('id', equipmentId)
    .single();

  if (!equipment) {
    return false;
  }

  // Check if user is assigned to the project/crew
  const assignments = equipment.equipment_assignments;
  for (const assignment of assignments) {
    if (assignment.project_id === user.project_id ||
        assignment.crew_id === user.crew_id) {

      // Read allowed for all assigned users
      if (operation === 'read') return true;

      // Write/delete only for foreman and above
      if (['foreman', 'pm', 'admin'].includes(user.role)) {
        return true;
      }
    }
  }

  return false;
}
```

**Step 2:** Apply in DELETE endpoint
```typescript
// src/app/api/equipment/[id]/route.ts
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult;
  const { id: equipmentId } = await params;

  // Check authorization
  const hasAccess = await verifyEquipmentAccess(equipmentId, user, 'delete');
  if (!hasAccess) {
    return NextResponse.json(
      { error: 'You do not have permission to delete this equipment' },
      { status: 403 }
    );
  }

  // Existing deletion logic...
}
```

---

### 🟠 HIGH-002: File Upload Security Vulnerabilities
**Severity:** HIGH
**CWE-434:** Unrestricted Upload of File with Dangerous Type
**CVSS Score:** 7.5 (High)

#### Description
Equipment documents upload endpoint lacks critical security validations:
1. No file type validation (allows executable files)
2. No content verification (mimetype can be spoofed)
3. No malware scanning
4. Insufficient file size limits

#### Vulnerable Code

**File:** `/src/app/api/equipment/documents/route.ts` (Lines 152-190)
```typescript
export async function POST(request: NextRequest) {
  // ...
  const file = formData.get('file') as File;

  // PROBLEM: Only checks file.type (client-provided, can be spoofed)
  // No validation at all!

  const fileBuffer = await file.arrayBuffer();
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, fileBuffer, {
      contentType: file.type, // Trusts client-provided type!
      upsert: false,
    });
}
```

#### Attack Scenarios
1. **Malware Upload:** Upload .exe, .bat, .sh disguised as PDF
2. **XSS via SVG:** Upload malicious SVG with embedded JavaScript
3. **Path Traversal:** Manipulate filename to write outside intended directory
4. **DoS:** Upload extremely large files to exhaust storage

#### Proof of Concept
```bash
# Upload executable disguised as PDF
curl -X POST http://localhost:3000/api/equipment/documents \
  -F "equipment_id=123" \
  -F "document_type=manual" \
  -F "document_name=malware.pdf" \
  -F "file=@malware.exe;type=application/pdf"

# Upload path traversal filename
curl -X POST http://localhost:3000/api/equipment/documents \
  -F "equipment_id=123" \
  -F "document_type=manual" \
  -F "document_name=../../../etc/passwd" \
  -F "file=@attack.txt"
```

#### Remediation

**Step 1:** Implement strict file validation
```typescript
// src/lib/file-upload-security.ts
import { fileTypeFromBuffer } from 'file-type';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function validateFileUpload(file: File): Promise<{
  valid: boolean;
  error?: string;
  actualMimeType?: string;
}> {
  // 1. Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)` };
  }

  // 2. Read file buffer
  const buffer = await file.arrayBuffer();

  // 3. Verify actual file type (magic bytes)
  const fileType = await fileTypeFromBuffer(Buffer.from(buffer));

  if (!fileType) {
    return { valid: false, error: 'Unable to determine file type' };
  }

  // 4. Check against whitelist
  if (!ALLOWED_MIME_TYPES.includes(fileType.mime)) {
    return {
      valid: false,
      error: `File type ${fileType.mime} not allowed`,
      actualMimeType: fileType.mime
    };
  }

  // 5. Verify claimed type matches actual type
  if (file.type !== fileType.mime) {
    return {
      valid: false,
      error: `File type mismatch: claimed ${file.type}, actual ${fileType.mime}`,
      actualMimeType: fileType.mime
    };
  }

  return { valid: true, actualMimeType: fileType.mime };
}

export function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts
  return filename
    .replace(/\.\./g, '')
    .replace(/[\/\\]/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .substring(0, 255);
}
```

**Step 2:** Apply validation in upload endpoint
```typescript
// src/app/api/equipment/documents/route.ts
import { validateFileUpload, sanitizeFilename } from '@/lib/file-upload-security';

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request, ['admin', 'pm', 'foreman']);
  if (authResult instanceof NextResponse) return authResult;

  const formData = await request.formData();
  const file = formData.get('file') as File;

  // Validate file
  const validation = await validateFileUpload(file);
  if (!validation.valid) {
    return NextResponse.json(
      { error: validation.error },
      { status: 400 }
    );
  }

  // Sanitize filename
  const timestamp = Date.now();
  const sanitized = sanitizeFilename(file.name);
  const filePath = `${EQUIPMENT_DOCS_PREFIX}${equipment_id}/${timestamp}_${sanitized}`;

  // Use validated MIME type
  const fileBuffer = await file.arrayBuffer();
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, fileBuffer, {
      contentType: validation.actualMimeType!, // Use verified type
      upsert: false,
    });

  // Continue...
}
```

---

### 🟠 HIGH-003: Missing Rate Limiting and DoS Protection
**Severity:** HIGH
**CWE-770:** Allocation of Resources Without Limits or Throttling
**CVSS Score:** 7.5 (High)

#### Description
NO rate limiting on any Equipment API endpoints. Attackers can:
- Exhaust database connections
- Cause storage exhaustion via file uploads
- Overwhelm server with analytics queries

#### Vulnerable Endpoints
All endpoints, but especially:
- `POST /api/equipment/documents` (file uploads)
- `GET /api/equipment/analytics` (expensive queries)
- `GET /api/equipment` (pagination bypass with large `per_page`)

#### Attack Scenarios
```bash
# DoS via pagination
for i in {1..1000}; do
  curl "http://localhost:3000/api/equipment?per_page=1000" &
done

# Storage exhaustion
for i in {1..100}; do
  curl -X POST http://localhost:3000/api/equipment/documents \
    -F "file=@10mb_file.pdf" &
done
```

#### Remediation

**Step 1:** Implement rate limiting middleware
```typescript
// src/lib/rate-limit.ts
import { LRUCache } from 'lru-cache';

type RateLimitOptions = {
  interval: number; // Time window in ms
  uniqueTokenPerInterval: number; // Max tokens per window
};

export function rateLimit(options: RateLimitOptions) {
  const tokenCache = new LRUCache({
    max: options.uniqueTokenPerInterval,
    ttl: options.interval,
  });

  return {
    check: async (request: NextRequest, limit: number): Promise<{
      success: boolean;
      limit: number;
      remaining: number;
      reset: number;
    }> => {
      const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'unknown';
      const tokenCount = (tokenCache.get(ip) as number[]) || [0];

      if (tokenCount[0] === 0) {
        tokenCache.set(ip, tokenCount);
      }

      tokenCount[0] += 1;

      const currentUsage = tokenCount[0];
      const isRateLimited = currentUsage >= limit;

      return {
        success: !isRateLimited,
        limit,
        remaining: isRateLimited ? 0 : limit - currentUsage,
        reset: Date.now() + options.interval,
      };
    },
  };
}

// Different limits for different endpoints
export const equipmentListLimit = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

export const equipmentUploadLimit = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 100,
});

export const equipmentAnalyticsLimit = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 50,
});
```

**Step 2:** Apply rate limiting
```typescript
// src/app/api/equipment/route.ts
import { equipmentListLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  // Rate limit: 100 requests per minute per IP
  const rateLimitResult = await equipmentListLimit.check(request, 100);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          'Retry-After': '60',
        }
      }
    );
  }

  // Enforce max page size
  const per_page = Math.min(parseInt(searchParams.get('per_page') || '20'), 100);

  // Existing logic...
}
```

---

### 🟠 HIGH-004: Sensitive Data Exposure in API Responses
**Severity:** HIGH
**CWE-200:** Exposure of Sensitive Information to an Unauthorized Actor
**CVSS Score:** 7.5 (High)

#### Description
Equipment APIs return sensitive financial and business data without role-based filtering:
- Rental costs and pricing
- Supplier information
- Internal inventory numbers
- Purchase dates and warranty info
- Financial analytics

#### Vulnerable Endpoints
- `GET /api/equipment` - Returns `rental_cost_per_day`, `purchase_date`
- `GET /api/equipment/analytics` - Full financial breakdown
- `GET /api/equipment/[id]` - Detailed pricing information

#### Example Exposure
```json
// Response contains sensitive data visible to all roles
{
  "id": "123",
  "name": "Fusion Splicer",
  "rental_cost_per_day": 150.00,
  "purchase_date": "2024-01-15",
  "supplier_name": "Acme Corp",
  "warranty_until": "2026-01-15",
  "rental_price_per_day_eur": 150.00
}
```

#### Remediation

**Step 1:** Role-based response filtering
```typescript
// src/lib/response-filter.ts
export function filterEquipmentByRole(equipment: any, userRole: string) {
  const publicFields = [
    'id', 'name', 'type', 'category', 'inventory_no',
    'status', 'current_location', 'description'
  ];

  const financialFields = [
    'rental_cost_per_day', 'purchase_date', 'warranty_until',
    'rental_price_per_day_eur', 'purchase_price_eur', 'supplier_name'
  ];

  // viewer role: only public fields
  if (userRole === 'viewer') {
    return Object.keys(equipment)
      .filter(key => publicFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = equipment[key];
        return obj;
      }, {} as any);
  }

  // crew, worker: public + basic operational fields
  if (['crew', 'worker'].includes(userRole)) {
    return Object.keys(equipment)
      .filter(key => !financialFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = equipment[key];
        return obj;
      }, {} as any);
  }

  // admin, pm, foreman: full access
  return equipment;
}
```

**Step 2:** Apply filtering in endpoints
```typescript
// src/app/api/equipment/route.ts
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const user = authResult;

  // Fetch equipment...

  // Filter response based on role
  const filteredEquipment = transformedEquipment.map(item =>
    filterEquipmentByRole(item, user.role)
  );

  return NextResponse.json({
    items: filteredEquipment,
    total: count || 0,
    // ...
  });
}
```

---

### 🟠 HIGH-005: Missing CSRF Protection on State-Changing Operations
**Severity:** HIGH
**CWE-352:** Cross-Site Request Forgery (CSRF)
**CVSS Score:** 7.1 (High)

#### Description
All POST, PUT, DELETE operations lack CSRF token validation. Vulnerable to cross-site attacks.

#### Affected Operations
- POST /api/equipment (create)
- DELETE /api/equipment/[id] (delete)
- POST /api/equipment/reservations (create)
- DELETE /api/equipment/documents/[id] (delete)
- PUT /api/resources/equipment-assignments (modify)

#### Attack Scenario
```html
<!-- Attacker's malicious page -->
<form action="https://victim-cometa.com/api/equipment/123" method="POST">
  <input type="hidden" name="_method" value="DELETE">
</form>
<script>document.forms[0].submit();</script>

<!-- Victim visits page while logged in -> equipment gets deleted -->
```

#### Remediation

**Step 1:** Implement CSRF token middleware
```typescript
// src/lib/csrf.ts
import { randomBytes } from 'crypto';

const CSRF_TOKEN_LENGTH = 32;
const CSRF_HEADER = 'x-csrf-token';

export function generateCSRFToken(): string {
  return randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

export function verifyCSRFToken(request: NextRequest): boolean {
  // Skip for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return true;
  }

  const tokenFromHeader = request.headers.get(CSRF_HEADER);
  const tokenFromCookie = request.cookies.get('csrf_token')?.value;

  if (!tokenFromHeader || !tokenFromCookie) {
    return false;
  }

  // Constant-time comparison
  return timingSafeEqual(
    Buffer.from(tokenFromHeader),
    Buffer.from(tokenFromCookie)
  );
}
```

**Step 2:** Add to authentication flow
```typescript
// src/lib/api-auth.ts
export async function requireAuth(request: NextRequest, allowedRoles: string[] = []) {
  // Verify CSRF for state-changing operations
  if (!verifyCSRFToken(request)) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    );
  }

  // Continue with auth...
}
```

---

## Medium Severity Findings

### 🟡 MEDIUM-001: Insufficient Input Validation
**Severity:** MEDIUM
**CWE-20:** Improper Input Validation

#### Description
Many endpoints lack comprehensive input validation using schemas (Zod).

#### Examples
- `/api/equipment/route.ts` POST - No validation on `category`, `type_details`
- `/api/equipment/usage/route.ts` POST - Limited validation (only hours check)
- `/api/resources/rental-equipment/route.ts` POST - No validation on dates

#### Remediation
Implement Zod schemas for all request bodies:

```typescript
// src/lib/validations/equipment.ts
import { z } from 'zod';

export const createEquipmentUsageSchema = z.object({
  equipment_id: z.string().uuid(),
  usage_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hours_used: z.number().min(0).max(24),
  assignment_id: z.string().uuid().optional(),
  work_entry_id: z.string().uuid().optional(),
  notes: z.string().max(500).optional(),
  logged_by_user_id: z.string().uuid().optional(),
});
```

---

### 🟡 MEDIUM-002: Weak Error Handling Leaks System Information
**Severity:** MEDIUM
**CWE-209:** Generation of Error Message Containing Sensitive Information

#### Description
Error messages expose internal details like database errors, file paths, and stack traces.

#### Examples
```typescript
// Bad: Exposes database error details
if (equipmentError) {
  console.error("Supabase error:", equipmentError);
  return NextResponse.json(
    { error: "Failed to fetch equipment from database" },
    { status: 500 }
  );
}
```

#### Remediation
```typescript
// Good: Generic error with logging
if (equipmentError) {
  console.error("[EQUIP-001] Supabase error:", equipmentError, {
    userId: user.id,
    timestamp: new Date().toISOString()
  });

  return NextResponse.json(
    {
      error: "Unable to retrieve equipment",
      errorCode: "EQUIP-001"
    },
    { status: 500 }
  );
}
```

---

### 🟡 MEDIUM-003: Reservation Conflict Detection Bypass
**Severity:** MEDIUM
**CWE-367:** Time-of-check Time-of-use (TOCTOU) Race Condition

#### Description
`/api/equipment/reservations/route.ts` has race condition vulnerability. Conflict check happens BEFORE insertion, allowing simultaneous requests to create overlapping reservations.

#### Vulnerable Code (Lines 160-249)
```typescript
// Check conflicts (TOCTOU vulnerability)
const { data: conflicts } = await supabase.rpc('check_equipment_reservation_conflicts', {
  p_equipment_id: body.equipment_id,
  p_reserved_from: body.reserved_from,
  p_reserved_until: body.reserved_until,
});

// Time gap here - another request can insert between check and insert!

// Create reservation
const { data: reservation } = await supabase
  .from('equipment_reservations')
  .insert({ ... });
```

#### Remediation
Use database-level constraints (already implemented with GIST exclusion constraint on line 273), but also implement optimistic locking:

```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Rely on database constraint
    const { data: reservation, error: insertError } = await supabase
      .from('equipment_reservations')
      .insert({
        equipment_id: body.equipment_id,
        project_id: body.project_id || null,
        reserved_by_user_id: body.reserved_by_user_id,
        reserved_from: body.reserved_from,
        reserved_until: body.reserved_until,
        notes: body.notes || null,
        is_active: true,
      })
      .select()
      .single();

    // Let database handle conflict via exclusion constraint
    if (insertError) {
      if (insertError.code === '23P01') { // GIST exclusion violation
        // Fetch conflicting reservation for user feedback
        const { data: conflicts } = await supabase
          .from('equipment_reservations')
          .select(`
            reserved_from,
            reserved_until,
            project:project_id (name),
            reserved_by:reserved_by_user_id (first_name, last_name)
          `)
          .eq('equipment_id', body.equipment_id)
          .eq('is_active', true)
          .gte('reserved_until', body.reserved_from)
          .lte('reserved_from', body.reserved_until)
          .limit(1);

        const conflict = conflicts?.[0];
        return NextResponse.json(
          {
            error: 'Reservation conflict',
            message: conflict
              ? `Equipment is already reserved from ${new Date(conflict.reserved_from).toLocaleString()} to ${new Date(conflict.reserved_until).toLocaleString()}`
              : 'Equipment is already reserved for this time period',
            conflict: conflict || null
          },
          { status: 409 }
        );
      }

      throw insertError;
    }

    return NextResponse.json({ success: true, reservation }, { status: 201 });
  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json(
      { error: 'Failed to create equipment reservation' },
      { status: 500 }
    );
  }
}
```

---

### 🟡 MEDIUM-004: Insufficient Logging and Audit Trail
**Severity:** MEDIUM
**CWE-778:** Insufficient Logging

#### Description
Critical operations lack audit logging:
- Equipment deletions
- Document deletions
- Assignment modifications
- Reservation cancellations

#### Remediation
Implement comprehensive audit logging:

```typescript
// src/lib/audit-log.ts
export async function logAuditEvent(
  user: AuthUser,
  action: string,
  resource: string,
  resourceId: string,
  details?: any
) {
  await supabase.from('activity_logs').insert({
    user_id: user.id,
    action,
    resource,
    resource_id: resourceId,
    details: JSON.stringify(details),
    ip_address: request.ip || 'unknown',
    user_agent: request.headers.get('user-agent') || 'unknown',
    timestamp: new Date().toISOString(),
  });
}

// Usage in DELETE endpoint
export async function DELETE(request: NextRequest, { params }) {
  const user = await requireAuth(request);
  const { id } = await params;

  // Get equipment details before deletion
  const { data: equipment } = await supabase
    .from('equipment')
    .select('*')
    .eq('id', id)
    .single();

  // Perform deletion...

  // Log the action
  await logAuditEvent(
    user,
    'DELETE',
    'equipment',
    id,
    { equipment_name: equipment.name, reason: 'soft_delete' }
  );

  return NextResponse.json({ success: true });
}
```

---

## Low Severity Findings

### 🟢 LOW-001: Hardcoded Bucket Names
**Severity:** LOW
**CWE-798:** Use of Hard-coded Credentials

#### Description
Storage bucket names are hardcoded instead of using environment variables consistently.

**File:** `/src/app/api/equipment/documents/[id]/route.ts` (Line 15)
```typescript
const BUCKET_NAME = 'equipment-documents'; // Hardcoded!
```

**File:** `/src/app/api/equipment/documents/route.ts` (Line 20)
```typescript
const BUCKET_NAME = process.env.SUPABASE_PROJECT_DOCUMENTS_BUCKET || 'project-documents';
```

#### Remediation
Use environment variables consistently:
```typescript
const BUCKET_NAME = process.env.SUPABASE_EQUIPMENT_DOCUMENTS_BUCKET || 'equipment-documents';
```

---

### 🟢 LOW-002: Missing Security Headers
**Severity:** LOW
**CWE-693:** Protection Mechanism Failure

#### Description
API responses lack security headers (X-Content-Type-Options, X-Frame-Options, etc.)

#### Remediation
Add security headers middleware:
```typescript
// src/middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}
```

---

### 🟢 LOW-003: Overly Permissive CORS (If Configured)
**Severity:** LOW
**CWE-942:** Overly Permissive Cross-domain Whitelist

#### Description
If CORS is enabled, ensure it's properly restricted to trusted origins.

#### Remediation
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://cometa.example.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type,Authorization,X-CSRF-Token' },
        ],
      },
    ];
  },
};
```

---

## Remediation Roadmap

### Phase 1: Critical (Immediate - Day 1-2)
**PRIORITY: STOP DEPLOYMENT UNTIL COMPLETED**

1. ✅ **Implement Authentication** (CRITICAL-001)
   - Create `api-auth.ts` middleware
   - Apply `requireAuth()` to ALL Equipment API routes
   - Test with valid and invalid tokens

2. ✅ **Fix SQL Injection** (CRITICAL-002)
   - Implement input validation with Zod
   - Sanitize all search parameters
   - Validate UUID arrays

3. ✅ **Add File Upload Validation** (HIGH-002)
   - Install `file-type` package
   - Implement `validateFileUpload()` function
   - Apply to documents endpoint

### Phase 2: High Priority (Day 3-5)

4. ✅ **Implement IDOR Protection** (HIGH-001)
   - Create `verifyEquipmentAccess()` helper
   - Apply ownership checks to GET/PUT/DELETE endpoints

5. ✅ **Add Rate Limiting** (HIGH-003)
   - Implement `rate-limit.ts` middleware
   - Apply to all endpoints with appropriate limits

6. ✅ **Implement CSRF Protection** (HIGH-005)
   - Add CSRF token generation/verification
   - Integrate with authentication flow

7. ✅ **Role-Based Response Filtering** (HIGH-004)
   - Create `filterEquipmentByRole()` function
   - Apply to all GET endpoints

### Phase 3: Medium Priority (Day 6-10)

8. ✅ **Comprehensive Input Validation** (MEDIUM-001)
   - Create Zod schemas for all request bodies
   - Apply validation to POST/PUT endpoints

9. ✅ **Improve Error Handling** (MEDIUM-002)
   - Implement generic error messages
   - Add structured logging with error codes

10. ✅ **Fix Reservation Race Condition** (MEDIUM-003)
    - Rely on database exclusion constraint
    - Remove redundant pre-check

11. ✅ **Implement Audit Logging** (MEDIUM-004)
    - Create audit log table/system
    - Log all critical operations

### Phase 4: Low Priority (Day 11-14)

12. ✅ **Configuration Hardening** (LOW-001, LOW-003)
    - Move hardcoded values to environment variables
    - Configure CORS properly

13. ✅ **Add Security Headers** (LOW-002)
    - Implement security headers middleware

### Phase 5: Testing & Validation (Day 15-20)

14. ✅ **Security Testing**
    - Penetration testing
    - Automated security scanning (OWASP ZAP, Burp Suite)
    - Code review

15. ✅ **Performance Testing**
    - Load testing with rate limits
    - Database query optimization

---

## Testing Recommendations

### Automated Security Testing

```bash
# Install OWASP ZAP CLI
docker pull owasp/zap2docker-stable

# Run baseline scan
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t http://localhost:3000/api/equipment

# Run full scan (after authentication implemented)
docker run -t owasp/zap2docker-stable zap-full-scan.py \
  -t http://localhost:3000 \
  -c zap.conf
```

### Manual Testing Checklist

**Authentication Tests:**
- [ ] Unauthenticated requests return 401
- [ ] Invalid tokens return 401
- [ ] Expired tokens are rejected
- [ ] Role-based access is enforced

**Authorization Tests:**
- [ ] Users cannot access other users' equipment
- [ ] Viewers cannot see financial data
- [ ] Non-admin cannot delete equipment

**Input Validation Tests:**
- [ ] SQL injection attempts are blocked
- [ ] XSS payloads are sanitized
- [ ] File upload restrictions work
- [ ] Invalid UUIDs are rejected

**Rate Limiting Tests:**
- [ ] 429 returned after limit exceeded
- [ ] Rate limit headers are present
- [ ] Limits reset after time window

---

## Risk Matrix

| Finding | Severity | Exploitability | Business Impact | Priority |
|---------|----------|----------------|-----------------|----------|
| CRITICAL-001: No Authentication | Critical | Easy | Severe | P0 |
| CRITICAL-002: SQL Injection | Critical | Moderate | Severe | P0 |
| HIGH-001: IDOR | High | Easy | High | P1 |
| HIGH-002: File Upload | High | Moderate | High | P1 |
| HIGH-003: No Rate Limiting | High | Easy | Moderate | P1 |
| HIGH-004: Data Exposure | High | Easy | Moderate | P1 |
| HIGH-005: CSRF | High | Moderate | Moderate | P1 |
| MEDIUM-001: Input Validation | Medium | Moderate | Moderate | P2 |
| MEDIUM-002: Error Handling | Medium | Moderate | Low | P2 |
| MEDIUM-003: Race Condition | Medium | Hard | Moderate | P2 |
| MEDIUM-004: Insufficient Logging | Medium | N/A | Low | P2 |
| LOW-001: Hardcoded Values | Low | Hard | Low | P3 |
| LOW-002: Missing Headers | Low | Hard | Low | P3 |
| LOW-003: CORS | Low | Moderate | Low | P3 |

---

## Compliance Impact

### GDPR Violations
- **Article 5(1)(f):** Lack of authentication violates integrity and confidentiality
- **Article 32:** Inadequate technical security measures
- **Article 33:** Data breach notification may be required if exploitation occurs

### Recommendations
- Conduct GDPR compliance audit after implementing security fixes
- Document security measures in GDPR documentation
- Implement data breach response plan

---

## Conclusion

The Equipment API endpoints have **CRITICAL security vulnerabilities** that pose immediate risk to the application and business. The lack of authentication is the most severe issue, allowing unauthorized access to all equipment data, documents, and financial information.

**IMMEDIATE ACTIONS REQUIRED:**
1. **STOP** any deployment of these endpoints to production
2. **IMPLEMENT** authentication and authorization on ALL API routes (Day 1-2)
3. **FIX** SQL injection vulnerabilities (Day 1-2)
4. **VALIDATE** file uploads properly (Day 2-3)
5. **TEST** thoroughly before re-deploying

Estimated time to reach acceptable security posture: **10-14 business days** with dedicated development resources.

---

**Report Prepared By:** Security Specialist Agent
**Date:** 2025-10-29
**Next Review:** After Phase 1 completion (2 days)

---

## Appendix A: References

- OWASP Top 10 2021: https://owasp.org/Top10/
- OWASP API Security Top 10: https://owasp.org/API-Security/
- CWE Top 25: https://cwe.mitre.org/top25/
- Next.js Security Best Practices: https://nextjs.org/docs/authentication
- Supabase Security Guide: https://supabase.com/docs/guides/auth

## Appendix B: Code Review Summary

**Total Files Reviewed:** 13
**Total Lines of Code:** ~2,100
**Critical Issues Found:** 2
**High Issues Found:** 5
**Medium Issues Found:** 4
**Low Issues Found:** 3

**Authentication Coverage:** 0% (0/13 files)
**Input Validation Coverage:** 15% (2/13 files)
**Authorization Checks:** 0% (0/13 files)
**Rate Limiting:** 0% (0/13 files)

# COMETA Fiber Optic Construction Management System - Project Structure Analysis

## Project Overview

**COMETA** is a hybrid Fiber Optic Construction Management System that combines:
- **Modern Frontend**: Next.js 15.5.3 with React 19.1.0 (primary development)
- **Backend**: Fully migrated from FastAPI microservices to pure Supabase PostgreSQL
- **Legacy Apps**: Streamlit-based admin and worker interfaces (migration in progress)

**Current Status**: Migration from FastAPI to pure Supabase completed. Database optimized with 24 unused tables removed (33% reduction from 73 to 49 tables).

---

## 1. Overall Project Structure

### Root Directory Layout
```
cometa-frontend-nextjs/
├── src/                          # Primary source code
├── public/                       # Static assets
├── database/                     # Database migrations and schemas
├── sql/                          # Raw SQL migration files
├── e2e/                          # Playwright E2E tests
├── scripts/                      # Utility scripts
├── .claude/                      # Claude Code configuration & plans
├── .taskmaster/                  # Task Master AI integration
├── .env.example                  # Environment template
├── next.config.ts               # Next.js configuration
├── tsconfig.json                # TypeScript configuration
├── vitest.config.ts             # Unit test configuration
├── playwright.config.ts         # E2E test configuration
├── package.json                 # Dependencies & scripts
└── CLAUDE.md                    # Development guidelines
```

### Key Supporting Directories
- **`.claude/`**: Claude Code agents, commands, and implementation plans
- **`.taskmaster/`**: Task Master AI for project task tracking and management
- **`database/migrations/`**: Database schema migration files
- **`sql/migrations/`**: Raw SQL for database updates
- **`scripts/`**: Utility scripts (storage init, DB cleanup, inspection)

---

## 2. Frontend Architecture (Next.js)

### 2.1 App Router Structure (`src/app/`)

```
src/app/
├── layout.tsx                              # Root layout with providers
├── page.tsx                                # Landing/redirect page
├── (auth)/                                 # Auth group (separate layout)
│   ├── layout.tsx
│   └── login/
│       └── page.tsx
├── (dashboard)/                            # Main app group
│   ├── layout.tsx                          # Dashboard layout
│   └── dashboard/
│       ├── page.tsx                        # Dashboard home
│       ├── projects/                       # Project management
│       │   ├── page.tsx
│       │   ├── [id]/
│       │   │   └── page.tsx               # Project details
│       │   └── new/
│       │       └── page.tsx               # Create project
│       ├── work-entries/                   # Work tracking
│       │   ├── page.tsx
│       │   ├── [id]/
│       │   └── new/
│       ├── teams/                          # Team management
│       │   ├── page.tsx
│       │   ├── [id]/
│       │   └── new/
│       ├── materials/                      # Material management
│       │   ├── page.tsx
│       │   ├── [id]/
│       │   ├── inventory/
│       │   ├── allocate/
│       │   ├── order/
│       │   ├── orders/
│       │   ├── new/
│       │   └── suppliers/
│       ├── equipment/                      # Equipment tracking
│       │   ├── page.tsx
│       │   ├── [id]/
│       │   ├── assignments/
│       │   └── new/
│       ├── vehicles/                       # Vehicle management
│       │   ├── page.tsx
│       │   ├── [id]/
│       │   └── new/
│       ├── financial/                      # Financial overview
│       ├── reports/                        # Analytics
│       ├── calendar/                       # Schedule management
│       ├── activities/                     # Activity logs
│       ├── documents/                      # Document management
│       ├── houses/                         # Housing units
│       ├── geospatial/                     # Map & geo features
│       ├── notifications/                  # Notifications
│       └── settings/                       # System settings
└── api/                                    # 40+ API routes
```

### 2.2 API Routes Structure (`src/app/api/`)

**Organized by domain:**
- `auth/` - Authentication endpoints
- `projects/` - Project CRUD operations
- `projects-optimized/` - Optimized queries
- `projects-simple/` - Simplified endpoints
- `work-entries/` - Work entry management
- `materials/` - Material CRUD
- `material-orders/` - Material ordering
- `material-allocations/` - Resource allocation
- `equipment/` - Equipment management
- `vehicles/` - Vehicle tracking
- `teams/` - Team management
- `crews/` - Crew operations
- `financial/` - Financial transactions
- `activities/` - Activity logging
- `suppliers/` - Supplier management
- `documents/` - Document storage
- `housing-units/` - Housing data
- `houses/` - Housing locations
- `calendar/` - Calendar events
- `notifications/` - Push notifications
- `reports/` - Report generation
- `geospatial/` - Geo-spatial queries
- `zone-layout/` - Zone management
- `upload/` - File uploads
- `storage/` - Storage operations

### 2.3 API Route Pattern

Example from `src/app/api/projects/route.ts`:
```typescript
// Direct Supabase connection in Next.js API routes
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  // Query Supabase directly (no FastAPI gateway anymore)
  const { data: projects, error, count } = await supabase
    .from('projects')
    .select(`...columns...`, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + per_page - 1);
}
```

---

## 3. Component Architecture (`src/components/`)

### Component Organization

```
src/components/
├── ui/                              # shadcn/ui components
│   ├── button.tsx
│   ├── dialog.tsx
│   ├── form.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── table.tsx
│   └── ...other-ui-components...
├── layout/                          # Layout components
│   ├── sidebar.tsx
│   ├── header.tsx
│   ├── navigation.tsx
│   └── footer.tsx
├── lists/                           # List/table components
├── maps/                            # Map components (Leaflet)
├── teams/                           # Team-specific components
├── documents/                       # Document management
├── notifications/                   # Notification components
├── features/
│   ├── project-preparation/        # Project prep features
│   ├── user-management/            # User admin features
│   └── work-stages/                # Work stage features
├── project-preparation/            # Project setup components
├── debug/                           # Debug utilities
└── Other component files (cards, etc.)
```

### Key Component Types
- **UI Components**: shadcn/ui wrappers for Radix UI primitives
- **Feature Components**: Domain-specific business logic
- **Layout Components**: Navigation, sidebar, page structure
- **List/Table Components**: Data display with sorting/filtering
- **Map Components**: Leaflet map integration

---

## 4. State Management

### 4.1 Server State (TanStack Query)

**Location**: `src/lib/providers.tsx`

Configuration:
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,          // 5-minute cache
      gcTime: 10 * 60 * 1000,            // 10-minute garbage collection
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      // Smart retry strategy based on HTTP status
      retry: (failureCount, error) => {...}
    },
    mutations: {
      retry: (failureCount, error) => {...},
      networkMode: 'online'
    }
  }
});
```

**Query Keys**: `src/lib/query-keys/`
- `activities.ts` - Activity queries
- `materials.ts` - Material queries
- `projects.ts` - Project queries
- `index.ts` - Main query key factory

### 4.2 Client State (Zustand)

Used for:
- UI state (modals, sidebars, filters)
- User preferences
- Local cache before API calls

### 4.3 Custom Hooks (`src/hooks/`)

**Data fetching hooks** (TanStack Query-based):
- `use-projects.ts` - Project data
- `use-work-entries.ts` - Work entries
- `use-materials.ts` - Material management
- `use-equipment.ts` - Equipment tracking
- `use-teams.ts` - Team management
- `use-crews.ts` - Crew operations
- `use-financial.ts` - Financial data
- `use-activities.ts` - Activity logs

**Material-specific hooks** (`src/hooks/materials/`):
- `use-materials.ts`
- `use-material-orders.ts`
- `use-material-allocations.ts`
- `use-material-consumption.ts`
- `use-supplier-materials.ts`
- `use-material-project-operations.ts`
- `use-unified-warehouse.ts`

**Utility hooks**:
- `use-auth.ts` - Authentication
- `use-notifications.ts` - Notifications
- `use-toast.ts` - Toast messages
- `use-document.ts` - Document management
- `use-calendar.ts` - Calendar events

---

## 5. Database Integration

### 5.1 Supabase Configuration

**Location**: `src/lib/supabase.ts`

```typescript
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
```

**Storage Buckets**:
- `project-photos` - Project images
- `work-photos` - Work documentation
- `project-documents` - Project files
- `house-documents` - Housing data
- `user-avatars` - User profile pictures
- `reports` - Generated reports

### 5.2 Database Connection

**Server-side**: Direct PostgreSQL via `pg` package
- `src/lib/db-client.ts` - Database client
- `src/lib/db-pool.ts` - Connection pooling

**File Validation**:
- Max file size: 10MB
- Batch uploads: max 5 files
- Allowed types: Images, Documents, Spreadsheets, Plans

### 5.3 Database Schema (49 Active Tables)

**Core Entities**:
- `projects` - Main project records
- `cabinets` - Network distribution points
- `segments` - Cable routes
- `cuts` - Excavation sections
- `work_entries` - Work logs with GPS/photos

**Teams & People**:
- `crews` - Team groups
- `crew_members` - Team assignments
- `users` - System users
- `user_roles` - Role definitions

**Materials & Equipment**:
- `materials` - Material catalog
- `material_allocations` - Resource tracking
- `material_orders` - Purchase orders
- `suppliers` - Supplier companies
- `supplier_materials` - Pricing/availability
- `equipment` - Equipment inventory
- `vehicle_assignments` - Vehicle usage

**Financial**:
- `costs` - Cost records
- `transactions` - Financial transactions

**Other**:
- `activities` - Activity logging
- `documents` - Document storage
- `house_contacts` - Contact info
- And more domain-specific tables

**Migration Status**: 24 unused tables removed (2025-09-30) for 33% schema reduction

---

## 6. Core Libraries & Frameworks

### Frontend Libraries
```json
{
  "next": "15.5.3",                      // React framework
  "react": "19.1.0",                     // UI library
  "react-dom": "19.1.0",
  "@tanstack/react-query": "5.89.0",     // Server state
  "zustand": "5.0.8",                    // Client state
  "@hookform/resolvers": "5.2.2",        // Form validation
  "react-hook-form": "7.63.0",           // Form management
  "zod": "4.1.9",                        // Schema validation
  "tailwindcss": "3.4.17",               // Styling
  "@radix-ui/*": "latest",               // UI components
  "lucide-react": "0.544.0",             // Icons
  "date-fns": "4.1.0",                   // Date utilities
  "recharts": "3.2.1"                    // Charts
}
```

### Backend/Data Libraries
```json
{
  "@supabase/supabase-js": "2.58.0",    // Supabase client
  "pg": "8.16.3",                        // PostgreSQL driver
  "jsonwebtoken": "9.0.2",               // JWT handling
  "socket.io-client": "4.8.1"            // Real-time updates
}
```

### Maps & Geospatial
```json
{
  "leaflet": "1.9.4",                    // Map library
  "react-leaflet": "5.0.0"               // React bindings
}
```

### Internationalization
```json
{
  "next-intl": "3.26.0"                  // i18n for Next.js
}
```

### Testing
```json
{
  "vitest": "3.2.4",                     // Unit tests
  "@testing-library/react": "16.3.0",
  "@playwright/test": "1.55.0",          // E2E tests
  "msw": "2.11.3"                        // API mocking
}
```

---

## 7. Testing Setup

### 7.1 Unit Testing (Vitest)

**Configuration**: `vitest.config.ts`
- Environment: jsdom
- Setup file: `src/__tests__/setup.ts`
- Coverage thresholds: 80% for all metrics
- Test timeout: 10 seconds
- Pool: threads (1-4 threads)

**Test Structure**:
```
src/__tests__/
├── components/           # Component tests
├── integration/          # Integration tests
│   └── real-db/         # Real database tests
├── lib/                  # Library tests
├── mocks/               # Mock setup
├── utils/               # Utility tests
└── performance/         # Performance tests
```

**Commands**:
```bash
npm run test              # Watch mode
npm run test:run         # Single run
npm run test:coverage    # With coverage
npm run test:real-db     # Against real database
```

### 7.2 E2E Testing (Playwright)

**Configuration**: `playwright.config.ts`
- Browsers: Chrome, Firefox, Safari
- Mobile: Pixel 5, iPhone 12
- Viewport: 1280x720
- Screenshots on failure
- Video on failure
- Trace on retry

**Test Directory**: `e2e/`

**Commands**:
```bash
npm run test:e2e         # Headless
npm run test:e2e:headed  # With browser UI
npm run test:e2e:debug   # Debug mode
```

---

## 8. Configuration Files

### 8.1 Next.js Configuration

**File**: `next.config.ts`
```typescript
{
  serverExternalPackages: [],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',  // For large uploads
    },
  },
  compress: true,
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}
```

### 8.2 TypeScript Configuration

**File**: `tsconfig.json`
- Target: ES2017
- Strict mode: enabled
- Module: esnext
- Path alias: `@/*` → `./src/*`
- Incremental compilation

### 8.3 Environment Variables

**Key Variables**:
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Storage Buckets
SUPABASE_PROJECT_PHOTOS_BUCKET=project-photos
SUPABASE_WORK_PHOTOS_BUCKET=work-photos
SUPABASE_PROJECT_DOCUMENTS_BUCKET=project-documents
SUPABASE_HOUSE_DOCUMENTS_BUCKET=house-documents
SUPABASE_USER_AVATARS_BUCKET=user-avatars
SUPABASE_REPORTS_BUCKET=reports

# Database
DATABASE_URL=postgresql://...
PGHOST=...
PGPORT=...

# Application
NEXTJS_PORT=3000
DEBUG_MODE=false
```

---

## 9. Type System (`src/types/`)

### Core Types

**User Types**:
```typescript
type UserRole = 'admin' | 'pm' | 'foreman' | 'crew' | 'viewer' | 'worker';
type Language = 'ru' | 'en' | 'de' | 'uz' | 'tr';
interface User {
  id: UUID;
  first_name: string;
  last_name: string;
  role: UserRole;
  lang_pref: Language;
  skills?: string[];
  pin_code?: string;
}
```

**Project Types**:
```typescript
type ProjectStatus = 'draft' | 'active' | 'waiting_invoice' | 'closed';
interface Project {
  id: UUID;
  name: string;
  customer?: string;
  city?: string;
  total_length_m: number;
  base_rate_per_m: number;
  status: ProjectStatus;
}
```

**Infrastructure Types**:
- `Cabinet` - Network distribution points
- `Segment` - Cable routes with dimensions
- `Cut` - Excavation sections
- Surface types: asphalt, concrete, pavers, green
- Work areas: roadway, sidewalk, driveway, green

**Work Types**:
```typescript
type WorkMethod = 'mole' | 'hand' | 'excavator' | 'trencher' | 'documentation';
type PhotoLabel = 'before' | 'during' | 'after' | 'instrument' | 'other';
```

### Type Files
- `index.ts` - Main types
- `project-preparation.ts` - Project setup types
- `work-stages.ts` - Work stage definitions
- `calendar.ts` - Calendar/schedule types
- `upload.ts` - File upload types

---

## 10. Validation & Schemas

**Location**: `src/lib/validations/`

**Files**:
- `user.ts` - User validation schemas (Zod)
- `crew-validation.ts` - Crew-related validation

**Pattern**:
```typescript
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  pin_code: z.string().regex(/^\d{4,6}$/),
  // ... other fields
});

type UserInput = z.infer<typeof userSchema>;
```

---

## 11. Authentication

### 11.1 Authentication Flow

**Location**: `src/lib/auth.ts`

- PIN-based authentication (4-6 digits)
- NextAuth 4.24.11 integration
- Token storage and management
- Role-based access control

**Test Users**:
- `admin@cometa.de` - Full access
- `pm@cometa.de` - Project manager
- `foreman@cometa.de` - Team lead
- `worker@cometa.de` - Field worker
- `viewer@cometa.de` - Read-only

### 11.2 Authorization

**Hook**: `src/hooks/use-auth.ts`
- Token management
- User storage
- Logout functionality
- Permissions checking

---

## 12. Internationalization

**Library**: `next-intl` 3.26.0

**Location**: `src/lib/i18n/`

**Supported Languages**:
- German (de) - Default admin
- Russian (ru) - Default worker
- English (en)
- Uzbek (uz)
- Turkish (tr)

---

## 13. Performance Optimization

**Location**: `src/lib/performance/`

**Monitoring**: 
- Cache size monitoring
- Query performance tracking
- Performance metrics collection

**TanStack Query Optimizations**:
- Smart caching (5-min stale time)
- Selective retry strategies
- Network-aware fetching
- Garbage collection (10-min)

---

## 14. Database Migrations

**Location**: `database/migrations/`

**Files**:
- `001_create_meetings_tables.sql` - Meeting tables
- `001_create_project_soil_types.sql` - Soil types
- `002_update_material_orders_dates.sql` - Date updates

**Migration Tools**:
- `src/lib/migrations/migration-cli.ts` - Migration CLI
- SQL migration files for schema changes

---

## 15. Utility Libraries

**Key Files**:
- `src/lib/utils.ts` - Common utilities (cn, etc.)
- `src/lib/api-client.ts` - Centralized API client
- `src/lib/schema-validator.ts` - Schema validation helper
- `src/lib/supabase-optimized-queries.ts` - Optimized queries
- `src/lib/upload-utils.ts` - File upload utilities
- `src/lib/document-storage.ts` - Document handling
- `src/lib/document-expiration.ts` - Document lifecycle

---

## 16. Scripting & Automation

**Location**: `scripts/`

**Available Scripts**:
- `init-storage.ts` - Initialize Supabase storage buckets
- `cleanup-database.ts` - Clean up database
- `inspect-database.ts` - Inspect schema and data

**Run via**:
```bash
npm run init:storage      # Initialize storage
npm run cleanup:db        # Cleanup database
npm run inspect:db        # Inspect database
```

---

## 17. Development Tools

### 17.1 Claude Code Integration

**Location**: `.claude/`

- **Agents**: Custom AI agents for development tasks
- **Commands**: Slash commands for CLI workflows
- **Implementation Plans**: Saved plans from pre-implementation analysis

### 17.2 Task Master AI

**Location**: `.taskmaster/`

- Task tracking and management
- Complexity analysis
- Task parsing from PRD documents
- AI-powered task breakdown

---

## 18. Legacy Streamlit Apps (Migration Target)

**Not included in this Next.js repo** but referenced:
- Admin app: Port 8501
- Worker app: Port 8502
- Python 3.11+ with Streamlit 1.48+
- Being gradually migrated to Next.js

---

## 19. Key Development Patterns

### 19.1 API Route Pattern

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { data, error, count } = await supabase
      .from('table')
      .select('*', { count: 'exact' });
    
    if (error) throw error;
    
    return NextResponse.json({ items: data, total: count });
  } catch (error) {
    return NextResponse.json({ error: 'message' }, { status: 500 });
  }
}
```

### 19.2 Hook Pattern (TanStack Query)

```typescript
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await fetch('/api/projects');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}
```

### 19.3 Component Pattern

```typescript
'use client';

import { useProjects } from '@/hooks/use-projects';

export function ProjectsList() {
  const { data, isLoading, error } = useProjects();

  if (isLoading) return <Skeleton />;
  if (error) return <Error />;

  return <div>{/* render items */}</div>;
}
```

---

## 20. Git Workflow

**Branch Strategy**:
- `main` - Production (stable, don't touch)
- `dev` - Development (all changes here)

**Commit Pattern**:
```bash
git commit -m "feat: description

Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## 21. Critical Workflows (From CLAUDE.md)

### Before Starting Any Task
1. **MANDATORY**: Use `pre-implementation-planner` agent
2. Create comprehensive implementation plan
3. Document changes, edge cases, testing strategy
4. NEVER start coding without planning

### After Every Completed Task
1. Make git commit with descriptive message
2. Run `git pull origin dev` to sync
3. Verify no conflicts
4. NEVER batch multiple tasks before committing

---

## Summary Statistics

| Aspect | Count/Details |
|--------|--------------|
| API Routes | 40+ organized by domain |
| React Components | 100+ (UI, Layout, Features) |
| Custom Hooks | 40+ (data fetching + utilities) |
| TypeScript Interfaces | 50+ domain types |
| Database Tables | 49 active (optimized from 73) |
| Supported Languages | 5 (de, ru, en, uz, tr) |
| User Roles | 6 (admin, pm, foreman, crew, viewer, worker) |
| Storage Buckets | 6 (photos, documents, avatars, reports) |
| Test Suites | Unit (Vitest) + E2E (Playwright) |
| Build Tool | Next.js with Turbopack |

---

## Key Takeaways

1. **Pure Supabase Migration**: No longer uses FastAPI - direct Supabase PostgreSQL from Next.js API routes
2. **Modern Stack**: Next.js 15, React 19, TypeScript, TanStack Query, Zustand
3. **Comprehensive Testing**: Vitest for units, Playwright for E2E, MSW for mocking
4. **Strong Type Safety**: Full TypeScript strict mode, Zod validation
5. **Performance-Focused**: Smart caching, selective retries, network-aware fetching
6. **Modular Architecture**: Organized by domain (projects, materials, equipment, etc.)
7. **Development Tools**: Claude Code integration, Task Master AI, implementation planning
8. **Hybrid System**: Next.js is primary frontend; legacy Streamlit apps being migrated

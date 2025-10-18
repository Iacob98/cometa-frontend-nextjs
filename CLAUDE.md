# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 CRITICAL WORKFLOW RULES 🚨

**BEFORE STARTING ANY DEVELOPMENT TASK:**
1. 🔴 **MANDATORY**: Use `pre-implementation-planner` agent for EVERY task before writing code
2. 🔴 **MANDATORY**: Create comprehensive implementation plan across database, API, and frontend
3. 🔴 **MANDATORY**: Document all changes, edge cases, and testing strategy
4. ✅ **NEVER** start coding without running pre-implementation-planner first

**AFTER EVERY COMPLETED TASK:**
1. ✅ **ALWAYS** make a git commit with descriptive message
2. ✅ **ALWAYS** run `git pull origin dev` to sync with remote
3. ✅ **ALWAYS** verify no conflicts before continuing
4. ✅ **NEVER** batch multiple completed tasks before committing

**WHY:** Pre-implementation planning prevents bugs, ensures consistency across the stack, and catches issues before coding. Post-task commits prevent losing work and ensure continuous synchronization.

## Project Overview

**COMETA** is a Fiber Optic Construction Management System with hybrid architecture combining legacy Streamlit apps and modern Next.js/Supabase for fiber optic cable installation project management. **Migration completed**: Fully migrated from FastAPI microservices to pure Supabase implementation.

## Tech Stack

### **NEXTJS** Modern Frontend (Primary Development Focus)
- **Frontend**: Next.js 15.5.3, React 19.1.0, TanStack Query 5.89.0, Zustand 5.0.8
- **UI/Styling**: shadcn/ui (Radix), Tailwind CSS 3.4.17, Lucide React icons
- **Authentication**: NextAuth 4.24.11, PIN-based authentication
- **Maps**: Leaflet maps, react-leaflet
- **i18n**: next-intl for internationalization
- **Testing**: Vitest + Playwright E2E, Testing Library React

### **SUPABASE** Backend (Migrated from FastAPI)
- **Database**: PostgreSQL 14 via Supabase (direct connection)
- **Migration Status**: ✅ **COMPLETED** - All FastAPI microservices migrated to pure Supabase
- **Architecture**: Next.js API Routes → Direct Supabase PostgreSQL queries
- **Database Optimization**: ✅ **COMPLETED** (2025-09-30) - Removed 24 unused tables (33% reduction)

### **LEGACY-STREAMLIT** (Migration in Progress)
- **Legacy Admin**: Python 3.11+ with Streamlit 1.48+ (admin_app, port 8501)
- **Legacy Worker**: Worker interface (worker_app, port 8502)
- **Package Manager**: UV (modern Python package manager)

### Infrastructure & Storage
- **Container**: Docker Compose orchestration
- **Database**: PostgreSQL (Supabase integration)
- **Storage**: Supabase buckets (photos, documents, avatars, reports)
- **Real-time**: Socket.io for live updates

## Commands

### Next.js Development (Primary)
```bash
# Start Next.js development server (recommended)
cd cometa-frontend-clean && npm run dev --turbopack

# Build for production
npm run build --turbopack

# Testing
npm run test        # Vitest unit tests
npm run test:e2e    # Playwright E2E tests
npm run lint        # ESLint code quality

# Type checking
npm run type-check  # TypeScript validation
```

### FastAPI Microservices
```bash
# Start all microservices via Docker
docker-compose up -d

# Individual service management
docker-compose logs auth-service
docker-compose logs gateway
docker-compose restart material-service

# Health checks
curl http://localhost:8080/health  # Gateway
curl http://localhost:8001/health  # Auth service
```

### Legacy Streamlit (Migration Target)
```bash
# LEGACY: Pre-startup cleanup (when needed)
pkill -f streamlit
lsof -ti:8501,8502 | xargs -r kill -9

# LEGACY: Start Streamlit apps
./start_all.sh      # Both admin (8501) + worker (8502)
./start_admin.sh    # Admin only
./start_worker.sh   # Worker only
```

### Version Control Workflow
```bash
# 🚨 CRITICAL: BRANCH STRATEGY 🚨
# main = STABLE (don't touch without permission!)
# dev = DEVELOPMENT (all changes here)

# 1. Always work in dev branch
git checkout dev
git pull origin dev

# 2. Make changes and commit
git add .
git commit -m "feat: description of completed task

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# 3. Push to dev branch ONLY
git push origin dev

# 🚫 DON'T touch main without permission!
```

## Architecture

### Hybrid System Architecture

```mermaid
flowchart TB
    subgraph "Frontend Layer"
        NextJS[Next.js App<br/>⚡ Primary Frontend<br/>Modern React]
        StreamlitAdmin[LEGACY Admin<br/>Port 8501<br/>Migration Target]
        StreamlitWorker[LEGACY Worker<br/>Port 8502<br/>Migration Target]
    end

    subgraph "API Gateway Layer"
        Gateway[FastAPI Gateway<br/>Port 8080<br/>Microservice Router]
    end

    subgraph "Microservices"
        Auth[Auth Service<br/>Port 8001]
        Project[Project Service<br/>Port 8002]
        Work[Work Service<br/>Port 8003]
        Team[Team Service<br/>Port 8004]
        Material[Material Service<br/>Port 8005]
        Equipment[Equipment Service<br/>Port 8006]
        Activity[Activity Service<br/>Port 8011]
    end

    subgraph "Data Layer"
        DB[(PostgreSQL<br/>Port 5422)]
        Supabase[(Supabase Storage<br/>Files & Buckets)]
    end

    NextJS -->|HTTP/JSON API| Gateway
    StreamlitAdmin -->|Direct SQL| DB
    StreamlitWorker -->|Direct SQL| DB
    Gateway --> Auth
    Gateway --> Project
    Gateway --> Work
    Gateway --> Team
    Gateway --> Material
    Gateway --> Equipment
    Gateway --> Activity
    Auth --> DB
    Project --> DB
    Work --> DB
    Team --> DB
    Material --> DB
    Equipment --> DB
    Activity --> DB
    NextJS -->|File Storage| Supabase
```

### **NEXTJS** Frontend Architecture

**File Structure (App Router):**
```
src/app/
├── (dashboard)/dashboard/           # Main app routes
│   ├── projects/                   # Project management
│   │   ├── new/                   # Create new project
│   │   └── [id]/                  # Project details & edit
│   ├── work-entries/               # Work tracking
│   │   ├── new/                   # Create work entry
│   │   └── [id]/                  # Work entry details
│   ├── teams/                      # Team management
│   │   └── crews/                 # Crew assignments
│   ├── materials/                  # Material management
│   │   ├── inventory/             # Stock management
│   │   ├── order/                 # New material order
│   │   ├── orders/                # Order tracking
│   │   ├── allocate/              # Allocate to projects
│   │   └── suppliers/             # Supplier management
│   ├── equipment/                  # Equipment tracking
│   ├── vehicles/                   # Vehicle management
│   ├── houses/                     # Housing units
│   ├── financial/                  # Financial overview
│   ├── reports/                    # Analytics
│   ├── calendar/                   # Schedule management
│   ├── geospatial/                 # Map features
│   ├── documents/                  # Document management
│   ├── notifications/              # Notification center
│   ├── activities/                 # Activity logs
│   ├── settings/                   # System settings
│   └── page.tsx                    # Dashboard home
├── api/                           # 100+ API routes (~5734 LOC)
│   ├── auth/                      # Authentication & authorization
│   ├── projects/                  # Project CRUD operations
│   ├── work-entries/              # Work entry management
│   ├── materials/                 # Material management
│   │   ├── allocations/           # Material allocations
│   │   ├── orders/                # Material orders
│   │   ├── consume/               # Consume materials
│   │   └── warehouse/             # Warehouse operations
│   ├── equipment/                 # Equipment management
│   ├── vehicles/                  # Vehicle management & documents
│   ├── teams/                     # Team & crew management
│   ├── crews/                     # Crew operations
│   ├── users/                     # User management
│   ├── financial/                 # Financial summaries
│   ├── calendar/                  # Calendar events
│   ├── documents/                 # Document management
│   ├── notifications/             # Notification system
│   ├── activities/                # Activity logging
│   ├── suppliers/                 # Supplier management
│   ├── houses/                    # Housing units
│   ├── housing-units/             # Housing unit details
│   ├── geospatial/                # Geospatial features
│   ├── reports/                   # Report generation
│   ├── upload/                    # File upload handlers
│   ├── storage/                   # Storage bucket management
│   ├── resources/                 # Resource assignments
│   ├── project-preparation/       # Project preparation data
│   ├── zone-layout/               # Zone layout (cabinets/segments)
│   └── [other-endpoints]/         # Additional APIs
├── login/page.tsx                 # Authentication page
└── layout.tsx                     # Root layout
```

**Component Organization (76+ components):**
```
src/components/
├── ui/                            # shadcn/ui components
│   ├── button.tsx, dialog.tsx, form.tsx, table.tsx, etc.
├── features/                      # Business logic components
├── layout/                        # Layout components
├── lists/                         # List view components
├── maps/                          # Leaflet map components
├── documents/                     # Document management UI
├── vehicles/                      # Vehicle management UI
├── project-preparation/           # Project preparation forms
├── teams/                         # Team management UI
└── notifications/                 # Notification UI
```

**Custom Hooks (30+ hooks):**
```
src/hooks/
├── use-auth.ts                   # Authentication & permissions
├── use-projects.ts               # Project management
├── use-materials.ts              # Material operations (24KB)
├── use-equipment.ts              # Equipment tracking
├── use-vehicles.ts               # Vehicle management
├── use-teams.ts                  # Team operations
├── use-work-entries.ts           # Work entry tracking
├── use-documents.ts              # Document management
├── use-suppliers.ts              # Supplier operations
├── use-financial.ts              # Financial data
├── use-calendar.ts               # Calendar events
├── use-notifications.ts          # Notifications
├── use-geospatial.ts             # Map features
├── use-houses.ts                 # Housing units
├── use-housing-units.ts          # Housing unit details
├── use-vehicle-documents.ts      # Vehicle documents
├── materials/                    # Material-specific hooks
└── [other-hooks]/                # Additional hooks
```

**State Management:**
- **Server State**: TanStack Query (React Query) for API data
- **Client State**: Zustand for UI state and user preferences
- **Authentication**: NextAuth + custom hooks

**Key Utilities & Libraries:**
```
src/lib/
├── api-client.ts                 # API client (41KB - main HTTP layer)
├── supabase.ts                   # Supabase client configuration
├── db-pool.ts                    # PostgreSQL connection pool
├── db-client.ts                  # Database client utilities
├── document-storage.ts           # Document storage operations
├── vehicle-document-storage.ts   # Vehicle document handling
├── upload-utils.ts               # File upload utilities
├── supabase-buckets.ts           # Supabase Storage buckets
├── supabase-optimized-queries.ts # Optimized DB queries
├── schema-validator.ts           # Zod schema validation
├── performance-monitor.ts        # Performance monitoring
├── providers.tsx                 # React context providers
├── query-utils.ts                # TanStack Query utilities
├── document-expiration.ts        # Document expiry tracking
├── websocket-provider.tsx        # WebSocket real-time updates
├── query-keys/                   # Query key constants
├── validations/                  # Validation schemas
└── i18n/                         # Internationalization
```

**TypeScript Type Definitions:**
```
src/types/
├── index.ts                      # Main types (41KB - all entities)
│   ├── User, UserRole           # User & authentication types
│   ├── Project, ProjectStatus   # Project management types
│   ├── Cabinet, Segment, Cut    # Infrastructure hierarchy
│   ├── WorkEntry, StageDef      # Work tracking types
│   ├── Material, MaterialOrder  # Material management types
│   ├── Equipment, Vehicle       # Asset types
│   ├── Team, Crew, CrewMember   # Team organization types
│   ├── Document, File           # Document types
│   ├── Cost, Transaction        # Financial types
│   └── [50+ more types]         # Complete type system
├── calendar.ts                   # Calendar & meeting types
├── project-preparation.ts        # Project preparation types
├── upload.ts                     # File upload types
└── work-stages.ts                # Work stage definitions
```

**Codebase Statistics:**
- **API Routes**: 100+ endpoints (~5,734 lines of code)
- **React Components**: 76 component files
- **Custom Hooks**: 30+ hooks for state management
- **TypeScript Types**: 50+ entity types, 100+ interfaces
- **Database Tables**: 49 active tables (optimized 2025-09-30)
- **Supported Languages**: 5 (ru, en, de, uz, tr)
- **User Roles**: 6 (admin, pm, foreman, crew, viewer, worker)

**Data Fetching Pattern:**
```typescript
// TanStack Query with optimistic updates
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute cache
      retry: (failureCount, error) => {
        if (error instanceof Error && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 3;
      },
    },
  },
})
```

### Database Schema Hierarchy

**Database Status**: 49 active tables (optimized from 73 tables on 2025-09-30)
- **Removed**: 24 unused tables (33% reduction)
- **Active**: All remaining tables are actively used in the codebase
- **Performance**: Simplified schema for better migration and backup performance

**Entity Relationship Overview:**
```
Project (Main entity)
├── Infrastructure Hierarchy
│   ├── Cabinet (Distribution points)
│   │   └── Segment (Cable routes)
│   │       └── Cut (Excavation sections)
│   │           └── WorkEntry (Work logs with GPS/photos)
│   │               └── File (Photos: before/during/after)
│   └── HousingUnit (Residential buildings)
│
├── Project Preparation
│   ├── ProjectPreparationFacility (Site facilities)
│   ├── ProjectPreparationHousing (Worker housing)
│   ├── ProjectPreparationUtilityContact (Utility coordination)
│   ├── ProjectPreparationCost (Budget planning)
│   └── ProjectPreparationPlan (Planning documents)
│
├── Team Management
│   ├── Team (Organization teams)
│   │   └── Crew (Field crews)
│   │       └── CrewMember (Worker assignments)
│   └── User (Workers, managers, admins)
│
├── Material Management
│   ├── Material (Catalog of materials)
│   ├── MaterialAllocation (Project allocations)
│   ├── MaterialOrder (Purchase orders)
│   │   └── MaterialOrderBudget (Order budgets)
│   ├── MaterialTransaction (Stock movements)
│   ├── Supplier (Vendor companies)
│   └── SupplierMaterial (Supplier pricing)
│
├── Equipment & Vehicles
│   ├── Equipment (Tools & machinery)
│   │   ├── EquipmentAssignment (Equipment → Crew)
│   │   └── EquipmentMaintenance (Service records)
│   └── Vehicle (Fleet vehicles)
│       ├── VehicleAssignment (Vehicle → Crew)
│       └── VehicleDocument (Registration, insurance, etc.)
│
├── Financial
│   ├── Cost (Project costs)
│   └── Transaction (Financial transactions)
│
├── Documents & Files
│   ├── Document (Project documents)
│   │   └── DocumentCategory (Document types)
│   └── File (Supabase Storage files)
│
├── Meetings & Calendar
│   ├── Meeting (Project meetings)
│   ├── MeetingParticipant (Attendees)
│   └── CalendarEvent (Scheduled events)
│
├── Geospatial
│   ├── GeospatialFeature (Map features)
│   ├── GeoLayer (Map layers)
│   ├── GeoRoute (Planned routes)
│   └── GeoMeasurement (Distance measurements)
│
├── Project Metadata
│   ├── ProjectContact (Emergency contacts)
│   ├── ProjectSoilType (Ground conditions)
│   ├── ProjectConstraint (Site constraints)
│   └── ProjectReadiness (Readiness checklist)
│
└── Activity Tracking
    ├── Activity (User actions log)
    ├── ActivityLog (Legacy activity log)
    └── Notification (System notifications)
```

**Key Tables by Category:**

**Projects & Infrastructure (12 tables):**
- `projects`, `cabinets`, `segments`, `cuts`
- `project_contacts`, `project_soil_types`, `project_constraints`
- `project_readiness`, `housing_units`, `constraints`
- `project_activation`, `project_documents`

**Work & Operations (3 tables):**
- `work_entries`, `files`, `meetings`

**Teams & Users (5 tables):**
- `users`, `teams`, `crews`, `crew_members`, `meeting_participants`

**Materials (7 tables):**
- `materials`, `material_allocations`, `material_orders`
- `material_order_budget`, `material_transactions`
- `suppliers`, `supplier_materials`

**Equipment & Vehicles (6 tables):**
- `equipment`, `equipment_assignments`, `equipment_maintenance`
- `vehicles`, `vehicle_assignments`, `vehicle_documents`

**Financial (2 tables):**
- `costs`, `transactions`

**Documents (2 tables):**
- `documents`, `document_categories`

**Project Preparation (5 tables):**
- `project_preparation_facilities`, `project_preparation_housing`
- `project_preparation_utility_contacts`, `project_preparation_costs`
- `project_preparation_plans`

**Geospatial (4 tables):**
- `geospatial_features`, `geo_layers`, `geo_routes`, `geo_measurements`

**Activity & Notifications (3 tables):**
- `activities`, `activity_logs`, `notifications`

**Recently Removed Tables** (2025-09-30 cleanup):
- Legacy warehouse tables: `company_warehouse`, `company_warehouse_materials`
- Unused pricing system: `price_lists`, `price_rules`, `price_extras`
- Obsolete tracking: `vehicle_expenses`, `vehicle_tracking`, `worker_documents`
- Unused features: `rentals`, `resource_requests`, `resource_usage`, `hse_requirements`
- Legacy stages: `stage_defs`, `work_stages`, `cut_stages`, `material_stage_mapping`
- Other unused: `asset_assignments`, `document_reminders`, `house_contacts`, `house_docs`, `house_status`, `material_moves`, `offmass_lines`, `plan_view_confirms`, `project_files`, `stock_locations`

### Key Application Features

**1. Project Management**
- Create and manage fiber optic construction projects
- Project preparation workflows (facilities, housing, utility contacts, costs)
- Geospatial planning with Leaflet maps (cabinets → segments → cuts)
- Project status tracking: draft, active, waiting_invoice, closed
- Project readiness checklists and activation
- Project contacts, soil types, and site constraints

**2. Work Entry & Tracking**
- Field work entry with GPS coordinates
- Photo documentation (before/during/after)
- Multi-stage work process: marking, excavation, conduit, cable, splice, test, connect, backfill, surface
- Work methods: mole, hand, excavator, trencher, documentation
- Work approval workflow (submit → review → approve/reject)
- Real-time progress tracking by segment and cut

**3. Material Management**
- Material catalog with categories and pricing
- Project material allocation and tracking
- Material consumption logging with project association
- Stock level monitoring and low-stock alerts
- Purchase order management with suppliers
- Material transaction history (order, allocation, consumption, return)
- Supplier management with flexible pricing per material

**4. Equipment & Vehicle Management**
- Equipment catalog (tools, machinery)
- Vehicle fleet management with documents
- Assignment to crews and projects
- Maintenance scheduling and history
- Document expiration tracking (registration, insurance, inspection)
- Ownership tracking (owned vs. rented)
- Safety features (first aid kit, fire extinguisher, seats)

**5. Team & User Management**
- Role-based access control (admin, pm, foreman, crew, viewer, worker)
- Team and crew organization
- Crew member assignments to projects
- User skills tracking
- Multi-language support (Russian, English, German, Uzbek, Turkish)
- PIN-based authentication for field workers

**6. Financial Tracking**
- Project cost tracking and budgeting
- Transaction management
- Material order budgets
- Project preparation cost estimation
- Financial summaries and reports

**7. Document Management**
- Document upload and categorization
- Supabase Storage integration
- Document expiration tracking
- Vehicle document management
- Project plan storage
- Photo management with metadata

**8. Geospatial Features**
- Interactive Leaflet maps
- Custom geo layers and routes
- Distance measurements
- Geospatial feature annotations
- Cabinet and segment visualization
- GPS coordinate tracking

**9. Calendar & Meetings**
- Project calendar events
- Meeting scheduling and tracking
- Meeting participants management
- Event notifications

**10. Reporting & Analytics**
- Project progress reports
- Material usage analytics
- Equipment utilization reports
- Financial summaries
- Work entry statistics
- Custom report generation

**11. Activity Logging & Notifications**
- User action tracking
- System event logging
- Document expiration notifications
- Real-time notifications via WebSocket
- Notification preferences management

**12. Housing Management**
- Housing unit tracking (residential buildings)
- Connection status monitoring
- Building metadata (floors, units, addresses)

### Authentication System
- **PIN Code System**: 4-6 digit PIN codes for easy worker login
- **Role-Based Access**: admin, pm, foreman, crew, viewer, worker
- **Session Management**: NextAuth + Zustand for Next.js, Streamlit session state for legacy
- **Permissions**: Fine-grained access control per feature
- **Test Users** (Quick login):
  - admin@cometa.de (Admin - full access)
  - pm@cometa.de (Project Manager - approve/manage)
  - foreman@cometa.de (Foreman - team lead)
  - worker@cometa.de (Crew - field work)
  - viewer@cometa.de (Viewer - read-only)

### API Integration Patterns

**Modern Architecture (Primary): Next.js API Routes → Direct Supabase PostgreSQL**
```typescript
// Direct PostgreSQL query via pg pool
import { query } from '@/lib/db-pool';

export async function GET(request: NextRequest) {
  try {
    // Direct database query with parameterized SQL
    const result = await query(
      `SELECT p.*, u.first_name, u.last_name
       FROM projects p
       LEFT JOIN users u ON p.pm_user_id = u.id
       WHERE p.status = $1
       ORDER BY p.created_at DESC`,
      ['active']
    );

    return Response.json({ data: result.rows });
  } catch (error) {
    console.error('Database error:', error);
    return Response.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}
```

**Legacy Architecture (Deprecated): Next.js API Routes → FastAPI Gateway**
```typescript
// DEPRECATED: FastAPI microservice proxying (being phased out)
export async function GET(request: NextRequest) {
  const response = await fetch(`${GATEWAY_URL}/api/projects`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return Response.json(await response.json());
}
```

**API Architecture Evolution:**
- ✅ **Current (2025)**: Next.js API Routes → PostgreSQL (Supabase) - Direct DB access
- 🔄 **Transitional**: Next.js API Routes → FastAPI Gateway → PostgreSQL - Legacy microservices
- ❌ **Deprecated**: Streamlit → Direct PostgreSQL - Legacy admin interface

**Key API Route Categories:**

**Direct Database Access (Primary):**
- `GET|POST|PUT|DELETE /api/projects/*` - Project CRUD via PostgreSQL
- `GET|POST|PUT|DELETE /api/materials/*` - Material management via PostgreSQL
- `GET|POST|PUT|DELETE /api/equipment/*` - Equipment tracking via PostgreSQL
- `GET|POST|PUT|DELETE /api/vehicles/*` - Vehicle management via PostgreSQL
- `GET|POST|PUT|DELETE /api/work-entries/*` - Work logging via PostgreSQL
- `GET|POST|PUT|DELETE /api/teams/*` - Team management via PostgreSQL
- `GET|POST|PUT|DELETE /api/crews/*` - Crew operations via PostgreSQL
- `GET|POST|PUT|DELETE /api/users/*` - User management via PostgreSQL
- `GET|POST|PUT|DELETE /api/documents/*` - Document metadata via PostgreSQL

**Supabase Storage Integration:**
- `POST /api/upload/project-photos` - Photo upload to Supabase Storage
- `POST /api/upload/work-photos` - Work photo upload to Supabase Storage
- `GET /api/storage/buckets` - Bucket management

**Hybrid (Database + Business Logic):**
- `POST /api/materials/consume` - Material consumption with transaction logging
- `POST /api/work-entries/[id]/approve` - Work approval with status updates
- `GET /api/financial/summary` - Financial aggregation queries
- `GET /api/dashboard/stats` - Dashboard statistics

**Legacy FastAPI Gateway (Deprecated, Port 8080):**
- `POST|GET /api/auth/*` → Auth Service (Port 8001) - Being replaced by NextAuth
- Some complex queries still route through FastAPI microservices
- Gradual migration to direct PostgreSQL access in progress

## Context7 Integration for Codebase Understanding

### Using Context7 for Library Documentation

When working with this codebase, use Context7 to get up-to-date documentation for libraries and frameworks:

```typescript
// Before implementing features, research with Context7:

// 1. Next.js App Router patterns
// Use: resolve-library-id "next.js"
// Then: get-library-docs with Next.js library ID

// 2. TanStack Query best practices
// Use: resolve-library-id "tanstack query"
// Then: get-library-docs for data fetching patterns

// 3. shadcn/ui component usage
// Use: resolve-library-id "radix-ui"
// Then: get-library-docs for component APIs

// 4. Tailwind CSS classes and utilities
// Use: resolve-library-id "tailwindcss"
// Then: get-library-docs for styling patterns
```

### Context7 Workflow for Feature Development

**Before implementing any new feature:**

1. **Research Framework Patterns:**
   ```bash
   # Get Next.js best practices for the feature type
   resolve-library-id "next.js"
   get-library-docs "/vercel/next.js" --topic="app-router data-fetching"
   ```

2. **Check Component Library:**
   ```bash
   # Get shadcn/ui component documentation
   resolve-library-id "shadcn"
   get-library-docs "/shadcn/ui" --topic="form components"
   ```

3. **Understand State Management:**
   ```bash
   # Research TanStack Query patterns
   resolve-library-id "tanstack query"
   get-library-docs "/tanstack/query" --topic="mutations optimistic-updates"
   ```

### Context7 for Specific Technologies

**Key libraries to research with Context7:**

| Technology | Use Case | Context7 Query |
|------------|----------|----------------|
| Next.js 15 | App Router, API routes | `resolve-library-id "next.js"` |
| TanStack Query 5 | Data fetching, caching | `resolve-library-id "tanstack query"` |
| shadcn/ui | UI components | `resolve-library-id "shadcn"` |
| Tailwind CSS | Styling utilities | `resolve-library-id "tailwindcss"` |
| React Hook Form | Form validation | `resolve-library-id "react hook form"` |
| Zod | Schema validation | `resolve-library-id "zod"` |
| Leaflet | Map components | `resolve-library-id "leaflet"` |
| Zustand | Client state | `resolve-library-id "zustand"` |

### Context7 Research Pattern

```typescript
// Research workflow for new components:

// 1. Get library documentation
const libraryDocs = await context7.getLibraryDocs('/vercel/next.js', {
  topic: 'server-components data-fetching'
});

// 2. Research best practices for specific features
const componentDocs = await context7.getLibraryDocs('/shadcn/ui', {
  topic: 'form table components'
});

// 3. Check latest patterns and examples
const queryDocs = await context7.getLibraryDocs('/tanstack/query', {
  topic: 'mutations error-handling'
});
```

## Critical Development Patterns

### 🔴 MANDATORY: Pre-Implementation Planning

**ALWAYS use the pre-implementation-planner agent BEFORE starting any development work:**

```typescript
// Step 1: Launch pre-implementation-planner agent
// This agent will:
// - Analyze the entire stack (database, API, frontend)
// - Identify all files that need changes
// - Document edge cases and validation requirements
// - Create a comprehensive testing strategy
// - Generate a step-by-step implementation plan

// Example scenarios that REQUIRE pre-implementation-planner:
// ✅ "Add a new field to projects table"
// ✅ "Create a new API endpoint for material tracking"
// ✅ "Fix the facilities cost calculation bug"
// ✅ "Implement new feature for housing units"
// ✅ "Update the project creation form"
// ✅ "Refactor authentication logic"

// Step 2: Review the generated plan saved in .claude/implementation-plans/
// Step 3: Follow the plan exactly as documented
// Step 4: Create git commit with reference to the plan file

// NEVER skip this step - it prevents:
// ❌ Missing database migrations
// ❌ API/frontend mismatches
// ❌ Incomplete validation logic
// ❌ Missing error handling
// ❌ Untested edge cases
// ❌ Breaking existing functionality
```

### Next.js Data Fetching Pattern
```typescript
// Server Component for initial data
export default async function ProjectsPage() {
  const initialData = await getProjects();

  return (
    <div>
      <ProjectsList initialData={initialData} />
    </div>
  );
}

// Client Component with TanStack Query
'use client';
export function ProjectsList({ initialData }: Props) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: () => fetchProjects(),
    initialData,
    staleTime: 60 * 1000,
  });

  // Component logic
}
```

### Authentication Pattern
```typescript
// Check permissions in components
import { usePermissions } from '@/hooks/use-auth';

export function AdminOnlyComponent() {
  const { hasRole } = usePermissions();

  if (!hasRole('admin')) {
    return <div>Access denied</div>;
  }

  return <AdminInterface />;
}
```

### API Route Pattern
```typescript
// Next.js API route with error handling
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate with Zod
    const validatedData = schema.parse(body);

    // Call FastAPI microservice
    const response = await fetch(`${GATEWAY_URL}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return Response.json(await response.json());
  } catch (error) {
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Form Pattern with React Hook Form + Zod
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
});

export function ProjectForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Handle form submission with TanStack Query mutation
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </Form>
  );
}
```

## Security & Performance

### Security Patterns
```typescript
// Input validation with Zod
const requestSchema = z.object({
  email: z.string().email(),
  pin_code: z.string().regex(/^\d{4,6}$/),
});

// Sanitize database queries (avoid SQL injection)
const query = `
  SELECT * FROM users
  WHERE email = $1 AND pin_code = $2 AND is_active = true
`;
const result = await db.query(query, [email, pinCode]);
```

### Performance Optimizations
```typescript
// TanStack Query caching strategy
const { data } = useQuery({
  queryKey: ['projects', filters],
  queryFn: () => fetchProjects(filters),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
  keepPreviousData: true, // For pagination
});

// Next.js optimizations
export default function ProjectPage() {
  return (
    <Suspense fallback={<ProjectSkeleton />}>
      <ProjectContent />
    </Suspense>
  );
}
```

## Environment Configuration

### Required Environment Variables
```bash
# Database (PostgreSQL + Supabase)
DATABASE_URL=postgresql://postgres.{ref}:[password]@aws-1-eu-central-1.pooler.supabase.com:6543/postgres
PGHOST=aws-1-eu-central-1.pooler.supabase.com
PGPORT=6543
PGDATABASE=postgres
PGUSER=postgres.{ref}
PGPASSWORD=[password]

# Supabase Integration
NEXT_PUBLIC_SUPABASE_URL=https://{ref}.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon_key]

# Storage Buckets
SUPABASE_PROJECT_PHOTOS_BUCKET=project-photos
SUPABASE_WORK_PHOTOS_BUCKET=work-photos
SUPABASE_PROJECT_DOCUMENTS_BUCKET=project-documents
SUPABASE_HOUSE_DOCUMENTS_BUCKET=house-documents
SUPABASE_USER_AVATARS_BUCKET=user-avatars
SUPABASE_REPORTS_BUCKET=reports

# FastAPI Microservices
ENABLE_MICROSERVICES=true
DEBUG_MODE=false
GATEWAY_URL=http://localhost:8080

# Internationalization
ADMIN_DEFAULT_LANG=de
WORKER_DEFAULT_LANG=ru
```

## Testing Strategy

### Testing Commands
```bash
# Unit tests with Vitest
npm run test                 # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report

# E2E tests with Playwright
npm run test:e2e            # All E2E tests
npm run test:e2e:headed     # With browser UI
npm run test:e2e:debug      # Debug mode

# Linting and type checking
npm run lint                # ESLint
npm run type-check         # TypeScript
```

### Testing Patterns
```typescript
// Component testing with Vitest + Testing Library
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProjectsList } from './projects-list';

describe('ProjectsList', () => {
  it('renders projects correctly', () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <ProjectsList />
      </QueryClientProvider>
    );

    expect(screen.getByText('Projects')).toBeInTheDocument();
  });
});

// E2E testing with Playwright
import { test, expect } from '@playwright/test';

test('user can create a new project', async ({ page }) => {
  await page.goto('/dashboard/projects');
  await page.click('[data-testid="new-project-button"]');
  await page.fill('[data-testid="project-name"]', 'Test Project');
  await page.click('[data-testid="save-button"]');

  await expect(page.locator('[data-testid="project-list"]')).toContainText('Test Project');
});
```

## Migration Strategy (Streamlit → Next.js)

### Migration Priority
1. **High Priority**: Core functionality (projects, work entries, materials)
2. **Medium Priority**: Reporting, analytics, user management
3. **Low Priority**: Legacy utilities, administrative tools

### Migration Checklist
- [x] **Database Optimization**: Removed 24 unused tables (2025-09-30) ✅
- [x] **API Consolidation**: Cleaned up duplicate API routes (2025-09-30) ✅
- [ ] **API Authentication**: Unify PIN-based auth between Streamlit and FastAPI
- [ ] **Database Access**: Replace direct SQL with FastAPI calls
- [ ] **Session Management**: Migrate Streamlit session state to TanStack Query
- [ ] **File Uploads**: Standardize Supabase storage access
- [ ] **Internationalization**: Align next-intl with legacy translations

### Recent Optimizations (2025-09-30)

**Database Cleanup**:
- Removed 24 unused tables from Supabase (73 → 49 tables)
- Eliminated legacy warehouse system tables
- Removed unused pricing, tracking, and staging tables
- All deleted tables had 0 rows and 0 code references
- Created backups before deletion: `backups/tables_backup_20250930_081531.txt`

**API Consolidation**:
- Confirmed 3 duplicate API routes (already removed or unused)
- Verified no code references to legacy API endpoints
- API structure remains clean with ~100 active endpoints

**Impact**:
- 33% reduction in database complexity
- Improved migration and backup performance
- Enhanced schema readability
- Zero impact on functionality (all deleted tables were unused)

### Feature Parity Tracking
| Feature | Streamlit Status | Next.js Status | Priority |
|---------|------------------|----------------|----------|
| Project Management | ✅ Complete | ✅ Migrated | High |
| Work Entries | ✅ Complete | ✅ Migrated | High |
| Material Management | ✅ Complete | ✅ Migrated | High |
| Team Management | ✅ Complete | ✅ Migrated | High |
| Financial Tracking | ✅ Complete | ✅ Migrated | High |
| Reports & Analytics | ✅ Complete | 🚧 In Progress | Medium |
| Equipment Management | ✅ Complete | ✅ Migrated | Medium |
| User Administration | ✅ Complete | 🚧 Partial | Medium |
| Activity Logging | ✅ Complete | ✅ Migrated | Medium |

## Task Master AI Integration

**Import Task Master's development workflow commands and guidelines:**
@./.taskmaster/CLAUDE.md

### Task Master Usage with Next.js
```bash
# Initialize Task Master for Next.js features
task-master init

# Create tasks for component development
task-master add-task --prompt="Implement user settings page with role management"

# Track progress on features
task-master update-task --id=1 --prompt="Added basic layout and authentication check"

# Mark features complete
task-master set-status --id=1 --status=done
```

## Common Issues & Solutions

### Next.js Specific Issues

**TypeScript Errors:**
```typescript
// Fix: Proper type imports
import type { NextRequest } from 'next/server';
import type { User } from '@/types';

// Fix: Component prop types
interface Props {
  user: User;
  onUpdate: (user: User) => void;
}
```

**TanStack Query Issues:**
```typescript
// Fix: Proper error handling
const { data, error, isLoading } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  retry: (failureCount, error) => {
    // Don't retry on 4xx errors
    if (error?.status >= 400 && error?.status < 500) {
      return false;
    }
    return failureCount < 3;
  },
});
```

**Hydration Mismatches:**
```typescript
// Fix: Use dynamic imports for client-only components
import dynamic from 'next/dynamic';

const ClientOnlyComponent = dynamic(
  () => import('./client-component'),
  { ssr: false }
);
```

### Database Compatibility Issues
```typescript
// Fix: Proper UUID handling
import { z } from 'zod';

const uuidSchema = z.string().uuid();

// Fix: Decimal/numeric fields
const priceSchema = z.number().or(z.string()).pipe(z.coerce.number());
```

### FastAPI Integration Issues
```typescript
// Fix: Proper error handling from FastAPI
export async function POST(request: NextRequest) {
  try {
    const response = await fetch(`${GATEWAY_URL}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(await request.json()),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return Response.json(
        { error: errorData.detail || 'API error' },
        { status: response.status }
      );
    }

    return Response.json(await response.json());
  } catch (error) {
    return Response.json(
      { error: 'Network error' },
      { status: 500 }
    );
  }
}
```

## Database & API Optimization Reports

The following analysis reports provide detailed insights into database and API optimization:

### Available Reports

1. **DATABASE_ANALYSIS_REPORT.md** - Comprehensive database analysis
   - Complete table usage statistics
   - Identification of unused tables
   - Duplicate/similar table structures
   - Recommendations for optimization

2. **API_DUPLICATION_REPORT.md** - API route duplication analysis
   - Duplicate API endpoint detection
   - Legacy vs modern API comparison
   - Code quality analysis (Zod validation, error handling)
   - Consolidation recommendations

3. **CLEANUP_SUMMARY.md** - Optimization execution summary
   - Tables removed (24 tables, 33% reduction)
   - API consolidation results
   - Backup information
   - Before/after metrics

**How to use these reports**:
- Review before making database schema changes
- Check for similar patterns before creating new tables
- Verify table usage before deletion
- Track optimization progress over time

## Important Files & Quick Reference

### Configuration Files
- `package.json` - Dependencies, scripts, project metadata
- `.env.example` - Environment variable template
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind CSS setup
- `next.config.js` - Next.js configuration
- `playwright.config.ts` - E2E test configuration
- `vitest.config.ts` - Unit test configuration

### Database & API Documentation
- `DATABASE_ANALYSIS_REPORT.md` - Complete database analysis (73 → 49 tables)
- `API_DUPLICATION_REPORT.md` - API route analysis and consolidation
- `CLEANUP_SUMMARY.md` - Optimization results (2025-09-30)
- `database/migrations/` - SQL migration scripts
- `sql/migrations/` - Additional SQL migrations

### Core Type Definitions
- `src/types/index.ts` (41KB) - All entity types and interfaces
  - User, Project, Material, Equipment, Vehicle, Team, etc.
  - 50+ types, 100+ interfaces
- `src/types/calendar.ts` - Calendar and meeting types
- `src/types/project-preparation.ts` - Project preparation types
- `src/types/work-stages.ts` - Work stage definitions

### Critical Hooks (TanStack Query + Business Logic)
- `src/hooks/use-auth.ts` - Authentication & permissions
- `src/hooks/use-materials.ts` (24KB) - Material management state
- `src/hooks/use-projects.ts` - Project operations
- `src/hooks/use-equipment.ts` - Equipment tracking
- `src/hooks/use-vehicles.ts` - Vehicle management
- `src/hooks/use-work-entries.ts` - Work entry operations
- `src/hooks/use-teams.ts` - Team & crew management
- `src/hooks/use-documents.ts` - Document operations
- `src/hooks/use-suppliers.ts` - Supplier management

### Core Libraries
- `src/lib/api-client.ts` (41KB) - Main HTTP API client
- `src/lib/db-pool.ts` - PostgreSQL connection pool
- `src/lib/supabase.ts` - Supabase client setup
- `src/lib/document-storage.ts` - Document upload/download
- `src/lib/upload-utils.ts` - File upload utilities
- `src/lib/schema-validator.ts` - Zod validation schemas

### Key API Routes (Examples)
- `src/app/api/projects/route.ts` - Project CRUD
- `src/app/api/materials/route.ts` - Material management
- `src/app/api/equipment/route.ts` - Equipment operations
- `src/app/api/vehicles/route.ts` (637 LOC) - Vehicle management
- `src/app/api/work-entries/route.ts` - Work logging
- `src/app/api/teams/route.ts` - Team operations
- `src/app/api/upload/work-photos/route.ts` - Photo uploads

### Main Dashboard Pages
- `src/app/(dashboard)/dashboard/page.tsx` - Dashboard home
- `src/app/(dashboard)/dashboard/projects/page.tsx` - Projects list
- `src/app/(dashboard)/dashboard/materials/page.tsx` - Materials inventory
- `src/app/(dashboard)/dashboard/equipment/page.tsx` - Equipment tracking
- `src/app/(dashboard)/dashboard/vehicles/page.tsx` - Vehicle management
- `src/app/(dashboard)/dashboard/work-entries/page.tsx` - Work entries
- `src/app/(dashboard)/dashboard/teams/page.tsx` - Team management

### Testing Files
- `src/__tests__/` - Unit test directory
- `e2e/` - Playwright E2E tests
- `src/test/` - Test utilities and mocks

### AI & Development Tools
- `CLAUDE.md` - This file (AI development guidelines)
- `.taskmaster/CLAUDE.md` - Task Master AI integration
- `.taskmaster/tasks/tasks.json` - Task tracking database
- `.claude/implementation-plans/` - Implementation plan archives
- `.claude/agents/` - Custom Claude Code agents

## Best Practices Summary

### Development Workflow
1. **Pre-Implementation Planning**: ALWAYS use pre-implementation-planner agent before coding
2. **Context7 Research**: Research libraries and patterns before implementation
3. **Type Safety**: Use TypeScript strictly, validate with Zod schemas
4. **Performance**: Leverage Next.js optimizations and TanStack Query caching
5. **Testing**: Write tests for components and critical user flows
6. **Database Changes**: Always check DATABASE_ANALYSIS_REPORT.md before schema modifications
7. **Git Workflow**: Work in dev branch, commit after each task, pull before push

### Code Quality
1. **Consistent Patterns**: Follow established patterns for API routes, components, and state management
2. **Error Handling**: Implement proper error boundaries and fallbacks
3. **Accessibility**: Use semantic HTML and ARIA attributes
4. **Security**: Validate inputs, sanitize outputs, implement proper authentication

### Architecture Decisions
1. **API Design**: Direct PostgreSQL access via Next.js API routes (modern approach)
2. **State Management**: Use TanStack Query for server state, Zustand for client state
3. **Component Structure**: Build reusable components with proper TypeScript interfaces
4. **File Organization**: Follow Next.js App Router conventions for scalable structure
5. **Database**: Single source of truth in PostgreSQL (Supabase), avoid service duplication
6. **Storage**: Use Supabase Storage buckets for all file uploads (photos, documents)
7. **Authentication**: PIN-based NextAuth for simplicity and field worker accessibility

## Quick Start Guide

### For New Developers

**1. Environment Setup**
```bash
# Clone and install
git clone <repo-url>
cd cometa-frontend-nextjs
npm install

# Copy environment template
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development
npm run dev --turbopack
# Visit http://localhost:3000
```

**2. Key Directories to Know**
- `src/app/(dashboard)/dashboard/` - Main application pages
- `src/app/api/` - API route handlers (100+ endpoints)
- `src/components/` - React components (76 files)
- `src/hooks/` - Custom React hooks (30+ hooks)
- `src/types/` - TypeScript type definitions
- `src/lib/` - Utilities and helper functions

**3. Database Access**
```typescript
// Import the query function
import { query } from '@/lib/db-pool';

// Execute parameterized queries
const result = await query(
  'SELECT * FROM projects WHERE status = $1',
  ['active']
);
```

**4. Common Development Commands**
```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run lint         # ESLint code quality
npm run type-check   # TypeScript validation
npm run test         # Run Vitest unit tests
npm run test:e2e     # Run Playwright E2E tests
```

**5. Making Changes**
```bash
# Always work in dev branch
git checkout dev
git pull origin dev

# Make your changes...

# Commit with descriptive message
git add .
git commit -m "feat: your feature description

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to dev
git push origin dev
```

### Common Tasks & Patterns

**Adding a New Feature:**
1. Use pre-implementation-planner agent
2. Review generated plan in `.claude/implementation-plans/`
3. Update database schema if needed (check DATABASE_ANALYSIS_REPORT.md)
4. Create/update API routes in `src/app/api/`
5. Create/update hooks in `src/hooks/`
6. Create/update components in `src/components/`
7. Add types to `src/types/`
8. Write tests
9. Commit and push

**Adding a New Database Table:**
1. Check DATABASE_ANALYSIS_REPORT.md for similar tables
2. Create migration in `database/migrations/`
3. Add TypeScript types in `src/types/index.ts`
4. Create API routes for CRUD operations
5. Create custom hook for state management
6. Update relevant components

**Creating a New API Endpoint:**
1. Create `route.ts` in appropriate `src/app/api/` subdirectory
2. Use `query()` from `@/lib/db-pool` for database access
3. Implement proper error handling
4. Validate input with Zod schemas
5. Return standardized JSON responses
6. Add corresponding hook in `src/hooks/`

**Adding a New Page:**
1. Create `page.tsx` in `src/app/(dashboard)/dashboard/[feature]/`
2. Use server components for initial data fetching
3. Create client components for interactivity
4. Use appropriate hooks for data management
5. Follow existing layout patterns

### Project-Specific Conventions

**Naming Conventions:**
- Files: `kebab-case.tsx`, `kebab-case.ts`
- Components: `PascalCase`
- Functions/variables: `camelCase`
- Types/Interfaces: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Database tables: `snake_case`

**Import Order:**
1. React imports
2. Third-party libraries
3. Local components
4. Local hooks
5. Local utilities/lib
6. Types
7. Styles

**Component Structure:**
```typescript
'use client'; // If client component

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useProjects } from '@/hooks/use-projects';
import type { Project } from '@/types';

interface MyComponentProps {
  projectId: string;
}

export function MyComponent({ projectId }: MyComponentProps) {
  // Hooks
  const { data, isLoading } = useProjects();
  const [state, setState] = useState();

  // Event handlers
  const handleClick = () => {
    // ...
  };

  // Early returns
  if (isLoading) return <div>Loading...</div>;

  // Main render
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

---

**Last Updated**: 2025-10-18
**Database Tables**: 49 active (optimized 2025-09-30)
**API Endpoints**: 100+ routes
**Components**: 76 files
**Tech Stack**: Next.js 15.5.3, React 19.1.0, PostgreSQL (Supabase), TanStack Query 5.89.0
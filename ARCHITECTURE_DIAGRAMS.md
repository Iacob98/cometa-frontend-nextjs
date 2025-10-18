# COMETA Architecture & Data Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                                 │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Web Browser (React 19 + Next.js 15)                     │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │  Components (100+)                                  │ │   │
│  │  │  ├── UI Components (shadcn/ui)                     │ │   │
│  │  │  ├── Feature Components (domain-specific)          │ │   │
│  │  │  ├── Page Components (projects, materials, etc)    │ │   │
│  │  │  └── Map Components (Leaflet)                      │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │  State Management                                   │ │   │
│  │  │  ├── TanStack Query (Server State)                 │ │   │
│  │  │  │   └── 5min cache, smart retry, network-aware    │ │   │
│  │  │  └── Zustand (Client State)                        │ │   │
│  │  │      └── UI state, preferences                     │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │  Custom Hooks (40+)                                 │ │   │
│  │  │  ├── useProjects, useMaterials, useTeams...        │ │   │
│  │  │  └── useAuth, useNotifications, useToast...        │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/JSON
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     API LAYER (Next.js)                          │
│                                                                   │
│  API Routes (/api/*) - 40+ endpoints                            │
│  ├── Projects: /api/projects/*                                  │
│  ├── Materials: /api/materials/*, /api/material-orders/*        │
│  ├── Work: /api/work-entries/*                                  │
│  ├── Teams: /api/teams/*, /api/crews/*                          │
│  ├── Equipment: /api/equipment/*                                │
│  ├── Vehicles: /api/vehicles/*                                  │
│  ├── Financial: /api/financial/*, /api/transactions/*           │
│  ├── Auth: /api/auth/*                                          │
│  ├── Documents: /api/documents/*                                │
│  ├── Geo: /api/geospatial/*, /api/zone-layout/*                │
│  └── Support: /api/suppliers/*, /api/activities/*, etc.         │
│                                                                   │
│  Each route:                                                      │
│  ├── Receives NextRequest                                        │
│  ├── Queries Supabase directly                                   │
│  ├── Validates with Zod schemas                                  │
│  └── Returns NextResponse.json()                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                         Supabase JS SDK
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   DATA LAYER (Supabase)                          │
│                                                                   │
│  ┌───────────────────────────────────────┐                      │
│  │  PostgreSQL Database (49 Tables)      │                      │
│  │  ├── Projects                         │                      │
│  │  ├── Cabinets, Segments, Cuts         │                      │
│  │  ├── Work Entries                     │                      │
│  │  ├── Crews, Crew Members, Users       │                      │
│  │  ├── Materials, Orders, Allocations   │                      │
│  │  ├── Equipment, Vehicles              │                      │
│  │  ├── Financial (Costs, Transactions)  │                      │
│  │  ├── Activities, Documents            │                      │
│  │  └── Supporting tables...             │                      │
│  └───────────────────────────────────────┘                      │
│                                                                   │
│  ┌───────────────────────────────────────┐                      │
│  │  Storage Buckets (6 buckets)          │                      │
│  │  ├── project-photos                   │                      │
│  │  ├── work-photos                      │                      │
│  │  ├── project-documents                │                      │
│  │  ├── house-documents                  │                      │
│  │  ├── user-avatars                     │                      │
│  │  └── reports                          │                      │
│  └───────────────────────────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

## Request/Response Flow

```
1. USER INTERACTION
   ↓
2. React Component triggers data fetch
   ├── via custom hook (useProjects, etc)
   └── uses TanStack Query
   ↓
3. TanStack Query checks cache
   ├── If valid cache hit → Use cached data
   └── If stale/missing → Fetch from API
   ↓
4. Call Next.js API Route (/api/projects)
   ├── GET /api/projects?page=1&per_page=20
   └── Includes auth token
   ↓
5. Next.js API Route Handler
   ├── Parse query parameters
   ├── Create Supabase client
   └── Validate request with Zod
   ↓
6. Query Supabase Database
   ├── Execute SELECT with filters
   ├── Order results
   └── Paginate
   ↓
7. Process Results
   ├── Transform data
   ├── Add calculated fields
   └── Error handling
   ↓
8. Return Response
   ├── NextResponse.json({ items, total, page })
   └── Include cache headers
   ↓
9. TanStack Query Receives Response
   ├── Update cache
   ├── Set stale time (5 min)
   ├── Garbage collection (10 min)
   └── Notify subscribers
   ↓
10. Component Re-renders
    ├── Receives new data via hook
    ├── Displays UI
    └── User sees updated content
```

## Component Organization

```
src/components/
│
├── ui/                          # shadcn/ui primitives (Radix)
│   ├── button.tsx
│   ├── input.tsx
│   ├── form.tsx
│   ├── dialog.tsx
│   ├── select.tsx
│   ├── table.tsx
│   ├── sonner.tsx              # Toast notifications
│   └── ...20+ ui components...
│
├── layout/                      # App structure
│   ├── sidebar.tsx
│   ├── header.tsx
│   ├── navigation.tsx
│   └── footer.tsx
│
├── features/                    # Feature-specific
│   ├── project-preparation/
│   │   ├── resources.tsx
│   │   ├── zone-layout.tsx
│   │   └── facilities-management.tsx
│   ├── user-management/
│   └── work-stages/
│
├── project-preparation/         # Project setup components
│
├── maps/                        # Leaflet map components
│   ├── map.tsx
│   └── geo-features.tsx
│
├── lists/                       # Table/list components
│
├── teams/                       # Team-specific
│
├── documents/                   # Document management
│
├── notifications/               # Notification UI
│
└── debug/                       # Debug utilities
```

## State Management Flow

```
TanStack Query (Server State)
├── Query Keys Factory (src/lib/query-keys/)
│   ├── projects: ['projects', { filters }]
│   ├── materials: ['materials', { filters }]
│   └── ...
│
├── useQuery Hook
│   ├── queryKey → cache key
│   ├── queryFn → API call
│   ├── staleTime: 5 minutes
│   ├── gcTime: 10 minutes
│   └── retry strategy
│
├── Cache Management
│   ├── In-memory store
│   ├── DevTools (development)
│   └── Garbage collection
│
└── Auto-updates
    ├── On window focus
    ├── On network reconnect
    ├── On mutation
    └── On manual refetch

Zustand (Client State)
├── UI State
│   ├── Modal open/close
│   ├── Sidebar collapse
│   └── Filter selections
│
├── User Preferences
│   ├── Theme
│   ├── Language
│   └── Layout
│
└── Local Cache
    ├── Draft forms
    └── Temporary data
```

## Authentication Flow

```
1. Login Page
   ├── User enters PIN (4-6 digits)
   ├── Submit to /api/auth/login
   └── Backend verifies credentials
   
2. NextAuth Configuration
   ├── Strategy: PIN-based
   ├── Provider: Custom credentials
   └── Session: JWT token
   
3. Token Management
   ├── Stored in localStorage
   ├── Auto-refresh via NextAuth
   ├── Included in API requests
   └── Cleared on logout
   
4. Authorization
   ├── Role-based access control
   │   ├── admin - Full access
   │   ├── pm - Project management
   │   ├── foreman - Team lead
   │   ├── crew - Field work
   │   ├── worker - Basic access
   │   └── viewer - Read-only
   │
   └── Permission checking
       ├── In components (useAuth hook)
       ├── In API routes (middleware)
       └── In database (row-level security optional)
```

## File Upload Flow

```
1. File Selection
   ├── User selects file via Dropzone
   ├── Validate file size (max 10MB)
   ├── Validate file type
   └── Show loading indicator
   
2. Upload
   ├── Create FormData
   ├── POST /api/upload
   ├── Stream to Supabase Storage
   └── Get public URL
   
3. Storage Buckets
   ├── project-photos → Project images
   ├── work-photos → Work documentation
   ├── project-documents → Project files
   ├── house-documents → Housing data
   ├── user-avatars → Profile pictures
   └── reports → Generated reports
   
4. Database Reference
   ├── Store URL in database
   ├── Link to related entity
   └── Track uploaded_at timestamp
   
5. Display
   ├── Fetch public URL
   ├── Cache in TanStack Query
   ├── Display in UI
   └── Allow download/delete
```

## Domain Data Model

```
PROJECT HIERARCHY
└─ Project (fiber optic project)
   ├─ Cabinets (distribution points)
   │  └─ Segments (cable routes)
   │     └─ Cuts (excavation sections)
   │        └─ Work Entries (work logs with GPS)
   │           ├─ Photos (before/during/after)
   │           ├─ GPS Location
   │           └─ Crew Assignment
   │
   ├─ Teams/Crews
   │  ├─ Crew Members
   │  └─ Skills/Roles
   │
   ├─ Materials
   │  ├─ Allocations (what's used)
   │  ├─ Orders (what to buy)
   │  └─ Suppliers (where to buy)
   │
   ├─ Equipment
   │  └─ Assignments (which crew uses what)
   │
   ├─ Vehicles
   │  └─ Assignments (which crew uses what)
   │
   └─ Financial
      ├─ Costs
      └─ Transactions

WORK EXECUTION PIPELINE
1. Project Created (draft)
2. Project Activated (active)
3. Cabinets & Segments defined
4. Work Entries logged
   ├─ Stage-based work (marking, excavation, cable, splice, etc)
   ├─ GPS location tracked
   ├─ Photos documented
   └─ Crew assigned
5. Materials allocated/consumed
6. Equipment tracked
7. Costs tracked
8. Project completed/invoiced
```

## Development Workflow

```
BEFORE CODING (Mandatory)
│
├─ Pre-Implementation Planning
│  ├─ Analyze requirements
│  ├─ Check database schema
│  ├─ Plan API routes
│  ├─ Plan components
│  ├─ Identify edge cases
│  └─ Create test strategy
│
└─ Create Implementation Plan (saved to .claude/)

DURING DEVELOPMENT
│
├─ Create API route (/api/*)
│  ├─ Define request schema (Zod)
│  ├─ Query database (Supabase)
│  ├─ Return NextResponse.json()
│  └─ Test with curl/Postman
│
├─ Create custom hook (src/hooks/)
│  ├─ useQuery with cache config
│  ├─ Define query key
│  ├─ Handle loading/error states
│  └─ Export from index
│
├─ Create component (src/components/)
│  ├─ Use custom hook
│  ├─ Display data with shadcn UI
│  ├─ Handle interactions
│  └─ Add error boundary
│
├─ Create types (src/types/)
│  ├─ Add TypeScript interfaces
│  ├─ Update main index.ts
│  └─ Use in all layer
│
├─ Create tests
│  ├─ Unit tests (Vitest)
│  ├─ Integration tests
│  └─ E2E tests (Playwright)
│
└─ Create database migration (optional)
   ├─ SQL file in database/migrations/
   └─ Update schema docs

AFTER DEVELOPMENT (Mandatory)
│
├─ Git Commit
│  ├─ git add .
│  ├─ git commit -m "feat: ..."
│  └─ Reference implementation plan
│
├─ Git Sync
│  ├─ git pull origin dev
│  ├─ Resolve conflicts (if any)
│  └─ git push origin dev
│
└─ Post-deploy
   ├─ Run tests
   ├─ Check database migrations
   └─ Monitor errors
```

## Key Directories Quick Map

```
/src/
  /app/                    ← Pages & API routes (App Router)
  /api/                    ← API endpoints (40+)
  /components/             ← React components (100+)
  /hooks/                  ← Custom hooks (40+)
  /lib/                    ← Utilities & services
    /supabase.ts          ← Supabase config
    /auth.ts              ← Auth logic
    /providers.tsx        ← Query client setup
    /query-keys/          ← Cache keys
    /validations/         ← Zod schemas
  /types/                  ← TypeScript types
  /__tests__/              ← Test files

/database/
  /migrations/             ← SQL migrations

/e2e/                      ← Playwright E2E tests

/scripts/                  ← CLI utilities

/.claude/                  ← Claude Code config
/.taskmaster/              ← Task Master AI

Config Files:
  next.config.ts
  tsconfig.json
  vitest.config.ts
  playwright.config.ts
  package.json
  .env.example
```

## Performance Optimization Strategy

```
CACHING LAYER (TanStack Query)
├─ Cache Time: 5 minutes
│  └─ Data fresh for 5 min before marked stale
│
├─ Garbage Collection: 10 minutes
│  └─ Unused cache removed after 10 min
│
└─ Smart Prefetching
   ├─ Prefetch on route change
   ├─ Prefetch on hover
   └─ Prefetch related data

RETRY STRATEGY
├─ Client Errors (4xx): No retry (except 408)
├─ Server Errors (5xx): Max 2 retries
├─ Timeouts (408/504): Up to 3 retries
└─ Exponential Backoff: 2^n * 1000ms + jitter

NETWORK OPTIMIZATION
├─ Refetch on window focus: Disabled
├─ Refetch on mount: Enabled
├─ Refetch on reconnect: Enabled
└─ Network mode: Online only (no offline queue)

API OPTIMIZATION
├─ Pagination (20 items/page)
├─ Filtering on server-side
├─ Select only needed fields
└─ Batch operations where possible

DATABASE QUERIES
├─ Optimized query structure
├─ Use indexes on foreign keys
├─ Avoid N+1 queries
└─ Implement connection pooling
```


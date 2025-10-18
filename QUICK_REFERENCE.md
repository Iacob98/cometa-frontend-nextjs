# COMETA Project - Quick Reference Guide

## Core Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | Next.js | 15.5.3 |
| | React | 19.1.0 |
| | TypeScript | 5 |
| **UI Framework** | shadcn/ui + Radix UI | Latest |
| **Styling** | Tailwind CSS | 3.4.17 |
| **State (Server)** | TanStack Query | 5.89.0 |
| **State (Client)** | Zustand | 5.0.8 |
| **Forms** | React Hook Form + Zod | 7.63.0 + 4.1.9 |
| **Backend** | Supabase (PostgreSQL) | Direct |
| **Maps** | Leaflet + react-leaflet | 1.9.4 + 5.0.0 |
| **i18n** | next-intl | 3.26.0 |
| **Testing** | Vitest + Playwright | 3.2.4 + 1.55.0 |
| **Auth** | NextAuth | 4.24.11 |

## Project Root Files

```
├── next.config.ts           # Next.js 10mb upload limit, TS/ESLint disabled for builds
├── tsconfig.json            # TS strict mode, @/* path alias
├── vitest.config.ts         # jsdom, 80% coverage threshold
├── playwright.config.ts     # Chrome, Firefox, Safari + mobile
├── package.json             # 60+ dependencies
├── CLAUDE.md                # Development guidelines
├── .env.example             # Environment template
└── PROJECT_STRUCTURE_ANALYSIS.md  # This analysis
```

## Directory Tree Quick Reference

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth routes (separate layout)
│   ├── (dashboard)/         # Dashboard routes
│   ├── api/                 # 40+ API endpoints
│   ├── layout.tsx           # Root layout + providers
│   └── page.tsx             # Home/redirect
├── components/              # 100+ React components
│   ├── ui/                  # shadcn/ui
│   ├── layout/              # Sidebar, header, nav
│   ├── features/            # Feature-specific
│   ├── maps/                # Leaflet maps
│   └── ...
├── hooks/                   # 40+ custom hooks
│   ├── use-projects.ts
│   ├── use-materials.ts
│   ├── materials/           # Material-specific hooks
│   └── ...
├── lib/                     # Utilities & services
│   ├── supabase.ts          # Supabase config
│   ├── auth.ts              # Auth utilities
│   ├── providers.tsx        # Query client setup
│   ├── query-keys/          # TanStack Query keys
│   ├── validations/         # Zod schemas
│   ├── api/                 # API helpers
│   └── ...
├── types/                   # TypeScript types
│   ├── index.ts             # Main types
│   ├── project-preparation.ts
│   ├── work-stages.ts
│   └── ...
└── __tests__/               # Tests
    ├── components/
    ├── integration/
    ├── lib/
    └── ...

database/                    # DB migrations
sql/                         # Raw SQL files
e2e/                         # Playwright tests
scripts/                     # CLI scripts
.claude/                     # Claude Code config
.taskmaster/                 # Task Master AI
```

## Key Files Reference

### Configuration & Setup
- `src/lib/supabase.ts` - Supabase client, storage buckets, file config
- `src/lib/providers.tsx` - TanStack Query config, Zustand setup
- `src/lib/auth.ts` - Auth validation, role-based access control

### API Layer
- `src/app/api/projects/route.ts` - Example API route pattern
- `src/app/api/materials/route.ts` - Material CRUD
- `src/app/api/*/route.ts` - 40+ domain-organized endpoints

### State Management
- `src/hooks/use-projects.ts` - Example TanStack Query hook
- `src/lib/query-keys/projects.ts` - Query key factory
- `src/lib/providers.tsx` - QueryClient configuration

### Validation
- `src/lib/validations/user.ts` - Zod user schema
- `src/lib/validations/crew-validation.ts` - Crew schema

### Types
- `src/types/index.ts` - All core types (User, Project, Material, etc.)

## Start Development

### Setup
```bash
npm install
cp .env.example .env.local
# Add Supabase credentials to .env.local
```

### Development
```bash
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build
npm run type-check       # Type checking
npm run lint             # ESLint
```

### Testing
```bash
npm run test             # Watch mode
npm run test:run         # Single run
npm run test:coverage    # Coverage report
npm run test:e2e         # E2E tests
npm run test:e2e:headed  # E2E with browser
```

## Domain Organization

### API Routes by Domain
- **Authentication**: `/api/auth/*`
- **Projects**: `/api/projects/*` (+ optimized, simple variants)
- **Work**: `/api/work-entries/*`
- **Materials**: `/api/materials/*`, `/api/material-orders/*`, `/api/material-allocations/*`
- **Equipment**: `/api/equipment/*`
- **Teams**: `/api/teams/*`, `/api/crews/*`
- **Financial**: `/api/financial/*`, `/api/transactions/*`
- **Documents**: `/api/documents/*`
- **Support**: `/api/suppliers/*`, `/api/activities/*`, `/api/notifications/*`
- **Geo**: `/api/geospatial/*`, `/api/zone-layout/*`

### Pages by Domain
- `/dashboard/projects` - Project list & management
- `/dashboard/work-entries` - Work tracking
- `/dashboard/materials` - Material management (with inventory, orders, suppliers)
- `/dashboard/equipment` - Equipment tracking
- `/dashboard/teams` - Team management
- `/dashboard/vehicles` - Vehicle tracking
- `/dashboard/financial` - Financial overview
- `/dashboard/reports` - Analytics
- `/dashboard/calendar` - Schedule
- `/dashboard/documents` - Document management
- `/dashboard/houses` - Housing data
- `/dashboard/activities` - Activity logs

## Important Patterns

### Custom Hook Pattern
```typescript
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}
```

### API Route Pattern
```typescript
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('table')
      .select('*');
    return NextResponse.json({ items: data });
  } catch (error) {
    return NextResponse.json({ error: 'message' }, { status: 500 });
  }
}
```

### Component Pattern
```typescript
'use client';
import { useProjects } from '@/hooks/use-projects';

export function Component() {
  const { data, isLoading, error } = useProjects();
  return <div>{/* JSX */}</div>;
}
```

## Database Info

### Connection
- **Type**: PostgreSQL via Supabase
- **Direct from Next.js**: API routes use `@supabase/supabase-js`
- **Tables**: 49 active (optimized from 73)
- **Migrations**: In `database/migrations/`

### Storage Buckets
- `project-photos`
- `work-photos`
- `project-documents`
- `house-documents`
- `user-avatars`
- `reports`

### Key Tables
- projects, cabinets, segments, cuts, work_entries
- crews, crew_members, users
- materials, material_orders, material_allocations, suppliers
- equipment, vehicles
- costs, transactions
- activities, documents

## Authentication

### Type
- PIN-based (4-6 digits)
- NextAuth 4.24.11
- Token in localStorage

### Test Users
- `admin@cometa.de` (admin)
- `pm@cometa.de` (pm)
- `foreman@cometa.de` (foreman)
- `worker@cometa.de` (crew)
- `viewer@cometa.de` (viewer)

### Roles
- admin, pm, foreman, crew, viewer, worker

## Languages Supported

- German (de) - Default for admin
- Russian (ru) - Default for workers
- English (en)
- Uzbek (uz)
- Turkish (tr)

## Key Performance Settings

- **Cache Time**: 5 minutes (queries), 10 minutes (garbage collection)
- **Max File Size**: 10MB
- **Max Batch Upload**: 5 files
- **Retry Strategy**: Smart (don't retry 4xx, limited 5xx)
- **Retry Delay**: Exponential backoff with jitter

## Environment Variables (Essential)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

# Database (if using direct connection)
DATABASE_URL=postgresql://user:pass@host:port/db
PGHOST=host
PGPORT=5432

# Application
NEXTJS_PORT=3000
DEBUG_MODE=false
```

## Testing Commands

```bash
# Unit tests
npm run test                # Watch
npm run test:run           # Single run
npm run test:coverage      # With coverage
npm run test:real-db       # Against real database

# E2E tests
npm run test:e2e           # Headless
npm run test:e2e:headed    # With browser
npm run test:e2e:debug     # Debug mode
```

## Git Workflow

```bash
# Always work in dev
git checkout dev
git pull origin dev

# Make changes and commit
git add .
git commit -m "feat: description"

# Push to dev only
git push origin dev
```

## Important Notes

1. **Fully Migrated**: No more FastAPI microservices - pure Supabase
2. **Modern Stack**: Latest versions of Next.js, React, TypeScript
3. **Type Safe**: Strict TypeScript + Zod validation
4. **Well Tested**: Unit + E2E tests with good coverage
5. **Well Organized**: Domain-driven structure
6. **Performance**: Smart caching and retry strategies
7. **Development Ready**: Claude Code + Task Master AI integration
8. **Legacy Migration**: Streamlit apps being replaced by Next.js (ongoing)

## File Sizes

- Total source code: ~50K lines
- Main analysis: 23KB
- Core dependencies: 60+
- API routes: 40+
- Components: 100+
- Hooks: 40+
- Types: 50+

## Useful Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Production build

# Database
npm run init:storage          # Initialize storage buckets
npm run cleanup:db            # Clean database
npm run inspect:db            # Inspect database

# Testing
npm run test                  # Unit tests
npm run test:e2e              # E2E tests
npm run test:coverage         # Coverage report

# Code Quality
npm run lint                  # Linting
npm run type-check            # Type checking
```

## Quick Finding Guide

| Need | Location |
|------|----------|
| Create new component | `src/components/` |
| Create new hook | `src/hooks/` |
| Add API endpoint | `src/app/api/` |
| Add database migration | `database/migrations/` |
| Add test | `src/__tests__/` |
| Add type | `src/types/index.ts` |
| Add validation | `src/lib/validations/` |
| Modify auth | `src/lib/auth.ts` |
| Modify state | `src/lib/providers.tsx` |
| Configure Supabase | `src/lib/supabase.ts` |
| Query keys | `src/lib/query-keys/` |

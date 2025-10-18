# COMETA Project Structure & Architecture Analysis

This directory contains comprehensive documentation of the COMETA Fiber Optic Construction Management System project structure and architecture.

## Generated Documentation Files

### 1. **PROJECT_STRUCTURE_ANALYSIS.md** (23 KB)
Complete project structure analysis including:
- Overall directory organization
- Frontend architecture (Next.js App Router)
- Component architecture
- State management (TanStack Query + Zustand)
- Database integration
- Core libraries & frameworks
- Testing setup
- Configuration files
- Type system
- Authentication system
- Internationalization
- Performance optimization
- Development patterns

**Use this for:** Understanding the complete project layout and how all pieces fit together.

---

### 2. **QUICK_REFERENCE.md** (10 KB)
Quick lookup guide with:
- Tech stack summary table
- Directory tree overview
- Key files reference
- Quick development commands
- Domain organization (APIs & Pages)
- Important patterns (Hooks, API routes, Components)
- Database info
- Authentication details
- Quick finding guide for common tasks

**Use this for:** Quick lookups while developing, finding where to create new features.

---

### 3. **ARCHITECTURE_DIAGRAMS.md** (18 KB)
Visual representations of system architecture:
- System architecture diagram (Client → API → Database)
- Request/response flow diagram
- Component organization tree
- State management flow
- Authentication flow
- File upload flow
- Domain data model
- Development workflow
- Directory quick map
- Performance optimization strategy

**Use this for:** Understanding how data flows through the system and architecture decisions.

---

## Quick Start Guide

### Setup
```bash
npm install
cp .env.example .env.local
# Add your Supabase credentials to .env.local
npm run dev
```

### Common Commands
```bash
npm run dev              # Start development server
npm run build            # Production build
npm run test             # Run unit tests
npm run test:e2e         # Run E2E tests
npm run type-check       # Type checking
npm run lint             # Linting
```

### Creating New Features

**1. Create API Endpoint** (`src/app/api/your-domain/route.ts`)
```typescript
export async function GET(request: NextRequest) {
  const { data, error } = await supabase
    .from('table')
    .select('*');
  return NextResponse.json({ items: data });
}
```

**2. Create Custom Hook** (`src/hooks/use-your-domain.ts`)
```typescript
export function useYourData() {
  return useQuery({
    queryKey: ['your-domain'],
    queryFn: async () => {
      const res = await fetch('/api/your-domain');
      return res.json();
    },
  });
}
```

**3. Create Component** (`src/components/your-component.tsx`)
```typescript
'use client';
import { useYourData } from '@/hooks/use-your-domain';

export function YourComponent() {
  const { data, isLoading, error } = useYourData();
  return <div>{/* JSX */}</div>;
}
```

**4. Create Type** (update `src/types/index.ts`)
```typescript
export interface YourType {
  id: UUID;
  name: string;
  // ... other fields
}
```

**5. Create Validation** (`src/lib/validations/your-domain.ts`)
```typescript
import { z } from 'zod';

export const yourSchema = z.object({
  name: z.string().min(1),
  // ... other validations
});
```

---

## Project Statistics

| Aspect | Count/Details |
|--------|--------------|
| **Frontend Framework** | Next.js 15.5.3 |
| **React Version** | 19.1.0 |
| **TypeScript** | Strict mode |
| **API Routes** | 40+ organized by domain |
| **React Components** | 100+ |
| **Custom Hooks** | 40+ |
| **TypeScript Interfaces** | 50+ |
| **Database Tables** | 49 active (optimized from 73) |
| **Storage Buckets** | 6 |
| **Supported Languages** | 5 (de, ru, en, uz, tr) |
| **User Roles** | 6 (admin, pm, foreman, crew, viewer, worker) |
| **Testing Frameworks** | Vitest (unit) + Playwright (E2E) |
| **State Management** | TanStack Query (server) + Zustand (client) |

---

## Core Technology Stack

### Frontend
- **Framework**: Next.js 15.5.3 with App Router
- **UI Library**: React 19.1.0
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS 3.4.17
- **UI Components**: shadcn/ui (Radix primitives)
- **Icons**: Lucide React

### State Management
- **Server State**: TanStack Query 5.89.0
  - 5-minute cache time
  - 10-minute garbage collection
  - Smart retry strategy
  - Network-aware caching
- **Client State**: Zustand 5.0.8

### Forms & Validation
- **Form Management**: React Hook Form 7.63.0
- **Schema Validation**: Zod 4.1.9
- **Resolver**: @hookform/resolvers 5.2.2

### Maps & Geo
- **Map Library**: Leaflet 1.9.4
- **React Bindings**: react-leaflet 5.0.0

### Backend & Database
- **Database**: PostgreSQL via Supabase (direct connection)
- **Authentication**: NextAuth 4.24.11
- **API Pattern**: Next.js API Routes → Supabase queries
- **Real-time**: Socket.io client 4.8.1

### Internationalization
- **Library**: next-intl 3.26.0
- **Supported**: German, Russian, English, Uzbek, Turkish

### Testing
- **Unit Tests**: Vitest 3.2.4 + Testing Library
- **E2E Tests**: Playwright 1.55.0
- **API Mocking**: MSW 2.11.3
- **Coverage**: 80% threshold

---

## Key Architectural Decisions

### 1. **Pure Supabase Backend**
- Migrated from FastAPI microservices
- Direct PostgreSQL queries from Next.js API routes
- No middleware layer
- Reduced complexity, improved performance

### 2. **App Router Organization**
- Grouped routes: `(auth)` and `(dashboard)`
- Domain-organized API routes
- Follows Next.js best practices

### 3. **TanStack Query for Data**
- Automatic caching and synchronization
- Reduces loading states and refetching
- Perfect for server state management

### 4. **Zod for Validation**
- TypeScript-first schema validation
- Type inference from schemas
- Runtime validation on API routes

### 5. **shadcn/ui for Components**
- Headless UI based on Radix
- Fully customizable with Tailwind
- Copy-paste component library

---

## Database Schema (49 Tables)

### Core Project Hierarchy
- `projects` - Main project records
- `cabinets` - Network distribution points
- `segments` - Cable routes
- `cuts` - Excavation sections
- `work_entries` - Work logs with GPS and photos

### Teams & People
- `crews`, `crew_members`, `users`, `user_roles`

### Materials & Resources
- `materials`, `material_orders`, `material_allocations`
- `suppliers`, `supplier_materials`
- `equipment`, `vehicle_assignments`

### Financial Tracking
- `costs`, `transactions`

### Other Domains
- `activities`, `documents`, `house_contacts`, and more

**Status**: 24 unused tables removed (2025-09-30) for 33% schema reduction

---

## Storage Infrastructure

### Supabase Storage Buckets
1. **project-photos** - Project images and diagrams
2. **work-photos** - Field documentation (before/during/after)
3. **project-documents** - Project-related files
4. **house-documents** - Housing/unit documentation
5. **user-avatars** - User profile pictures
6. **reports** - Generated reports and exports

**File Limits**: 10 MB max, 5 files per batch

---

## Authentication & Authorization

### Authentication Type
- **PIN-based**: 4-6 digit codes
- **Provider**: NextAuth 4.24.11
- **Storage**: localStorage with auto-refresh

### User Roles
1. **admin** - Full system access
2. **pm** - Project management
3. **foreman** - Team lead
4. **crew** - Field worker
5. **worker** - Basic access
6. **viewer** - Read-only access

### Test Credentials
- `admin@cometa.de` (admin)
- `pm@cometa.de` (pm)
- `foreman@cometa.de` (foreman)
- `worker@cometa.de` (crew)
- `viewer@cometa.de` (viewer)

---

## Performance Optimization

### Caching Strategy
- **Query Cache**: 5 minutes stale time
- **Garbage Collection**: 10 minutes
- **Refetch**: On mount and network reconnect

### Retry Strategy
- **4xx Errors**: No retry (except 408)
- **5xx Errors**: Max 2 retries
- **Timeouts**: Up to 3 retries
- **Backoff**: Exponential with jitter

### API Optimization
- Pagination (20 items/page)
- Server-side filtering
- Field selection
- Batch operations

---

## Development Workflow

### Before Coding (Mandatory)
1. Use pre-implementation planner agent
2. Create comprehensive implementation plan
3. Document all changes and edge cases
4. Plan testing strategy

### During Development
1. Create API route with Zod validation
2. Create custom hook with TanStack Query
3. Create component using hook and shadcn/ui
4. Add types to `src/types/index.ts`
5. Write tests (unit + E2E)
6. Create database migration if needed

### After Development (Mandatory)
1. Git commit with descriptive message
2. `git pull origin dev` to sync
3. `git push origin dev`
4. Verify no conflicts

---

## Directory Reference

```
src/
├── app/                 # Next.js App Router pages & API routes
├── components/          # React components (100+)
├── hooks/               # Custom hooks (40+)
├── lib/                 # Utilities & services
├── types/               # TypeScript type definitions
└── __tests__/          # Test files

database/               # Database migrations
e2e/                    # Playwright E2E tests
scripts/                # CLI utilities
.claude/                # Claude Code configuration
.taskmaster/            # Task Master AI integration
```

---

## Important Files

| File | Purpose |
|------|---------|
| `src/lib/supabase.ts` | Supabase client config |
| `src/lib/auth.ts` | Auth logic |
| `src/lib/providers.tsx` | Query client setup |
| `src/types/index.ts` | Core types |
| `next.config.ts` | Next.js config |
| `tsconfig.json` | TypeScript config |
| `CLAUDE.md` | Development guidelines |

---

## Integration with Development Tools

### Claude Code
- `.claude/` directory contains agents and commands
- `.claude/implementation-plans/` stores pre-implementation plans
- Automatically loads context from `CLAUDE.md`

### Task Master AI
- `.taskmaster/` directory contains task tracking
- PRD parsing and task breakdown
- Complexity analysis and task management

---

## Common Issues & Solutions

### TypeScript Errors
- Check `src/types/index.ts` for missing types
- Use type inference from Zod schemas

### Caching Issues
- Use `queryClient.invalidateQueries()` after mutations
- Check TanStack Query DevTools in dev mode

### API Errors
- Verify Supabase credentials in `.env.local`
- Check API route validation with Zod
- Review Supabase storage bucket permissions

### Component Issues
- Ensure `'use client'` for client components
- Use dynamic import for SSR-unfriendly components
- Check for hydration mismatches

---

## Next Steps for New Contributors

1. **Read** `PROJECT_STRUCTURE_ANALYSIS.md` for comprehensive overview
2. **Reference** `QUICK_REFERENCE.md` for quick lookups
3. **Review** `ARCHITECTURE_DIAGRAMS.md` for data flow
4. **Explore** example files:
   - `src/app/api/projects/route.ts` (API pattern)
   - `src/hooks/use-projects.ts` (Hook pattern)
   - `src/components/ui/button.tsx` (Component pattern)
5. **Follow** workflow in `CLAUDE.md`
6. **Use** pre-implementation planner for new tasks

---

## Additional Resources

### Existing Analysis Reports
- `DATABASE_ANALYSIS_REPORT.md` - Detailed schema analysis
- `API_ROUTES_ANALYSIS_REPORT.md` - API endpoint documentation
- `STATE_MANAGEMENT_ANALYSIS_REPORT.md` - State management deep dive
- `MATERIALS_SYSTEM_ANALYSIS_REPORT.md` - Materials module details

### External Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TanStack Query Documentation](https://tanstack.com/query)
- [Supabase Documentation](https://supabase.com/docs)
- [Zod Documentation](https://zod.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## Support & Questions

For questions about:
- **Architecture**: See `ARCHITECTURE_DIAGRAMS.md`
- **Structure**: See `PROJECT_STRUCTURE_ANALYSIS.md`
- **Quick lookups**: See `QUICK_REFERENCE.md`
- **Development**: See `CLAUDE.md` in project root

---

Generated: October 16, 2025
Last Updated: October 16, 2025

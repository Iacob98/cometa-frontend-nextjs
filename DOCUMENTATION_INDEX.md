# COMETA Project Documentation Index

Generated: October 16, 2025

## Documentation Files Overview

This folder contains comprehensive analysis of the COMETA Fiber Optic Construction Management System codebase.

### 4 Main Documentation Files

#### 1. ANALYSIS_DOCUMENTATION_README.md (12 KB)
**Start here for overview**

- Quick start guide
- Project statistics summary
- Core tech stack overview
- Key architectural decisions
- Authentication & authorization summary
- Performance optimization overview
- Common issues & solutions
- Next steps for new contributors

#### 2. PROJECT_STRUCTURE_ANALYSIS.md (23 KB)
**Detailed reference for complete architecture**

- Overall project structure
- Frontend architecture (Next.js App Router)
- Component architecture
- State management (TanStack Query + Zustand)
- Database integration
- Core libraries & frameworks
- Testing setup (Vitest + Playwright)
- Configuration files
- Type system
- Authentication
- Internationalization
- Performance optimization
- Database migrations
- Utility libraries
- Scripting & automation
- Development tools (Claude Code + Task Master)
- Critical workflows

#### 3. QUICK_REFERENCE.md (10 KB)
**For rapid lookups while developing**

- Tech stack quick table
- Directory tree quick reference
- Key files reference
- Development setup & commands
- Domain organization (APIs & Pages)
- Important patterns (Hooks, API routes, Components)
- Database info & tables
- Authentication details
- Languages supported
- Performance settings
- Environment variables
- Testing commands
- Git workflow
- Quick finding guide

#### 4. ARCHITECTURE_DIAGRAMS.md (18 KB)
**Visual representations of system design**

- System architecture diagram (Client → API → Database)
- Request/response flow diagram
- Component organization tree
- State management flow diagrams
- Authentication flow diagram
- File upload flow diagram
- Domain data model hierarchy
- Development workflow
- Directory quick map
- Performance optimization strategy

---

## How to Use This Documentation

### For New Team Members
1. Read: `ANALYSIS_DOCUMENTATION_README.md` (overview)
2. Skim: `QUICK_REFERENCE.md` (get familiar with structure)
3. Study: `ARCHITECTURE_DIAGRAMS.md` (understand data flow)
4. Reference: `PROJECT_STRUCTURE_ANALYSIS.md` (for details)

### For Quick Lookups
- Use: `QUICK_REFERENCE.md`
- Find location, patterns, commands quickly

### For Understanding Architecture
- Use: `ARCHITECTURE_DIAGRAMS.md`
- Understand how data flows through system

### For In-Depth Technical Reference
- Use: `PROJECT_STRUCTURE_ANALYSIS.md`
- Deep dive into any specific component

### For Implementation Details
- Refer to project's own `CLAUDE.md`
- Check `.claude/implementation-plans/` for specific tasks

---

## Key Statistics at a Glance

| Aspect | Details |
|--------|---------|
| Frontend Framework | Next.js 15.5.3 |
| React Version | 19.1.0 |
| Language | TypeScript 5 (strict) |
| API Routes | 40+ organized by domain |
| Components | 100+ |
| Custom Hooks | 40+ |
| Type Definitions | 50+ |
| Database Tables | 49 (optimized from 73) |
| Storage Buckets | 6 |
| Languages | 5 (de, ru, en, uz, tr) |
| User Roles | 6 (admin, pm, foreman, crew, viewer, worker) |
| State Management | TanStack Query (server) + Zustand (client) |
| Testing | Vitest (unit) + Playwright (E2E) |

---

## Quick Navigation Guide

### I need to find...

#### Where to create a new feature
See: `QUICK_REFERENCE.md` → "Quick Finding Guide"

#### How the authentication works
See: `ARCHITECTURE_DIAGRAMS.md` → "Authentication Flow"

#### Database schema
See: `PROJECT_STRUCTURE_ANALYSIS.md` → "Database Integration"

#### API patterns
See: `PROJECT_STRUCTURE_ANALYSIS.md` → "Key Development Patterns"

#### State management setup
See: `PROJECT_STRUCTURE_ANALYSIS.md` → "State Management"

#### Component organization
See: `ARCHITECTURE_DIAGRAMS.md` → "Component Organization"

#### Testing setup
See: `PROJECT_STRUCTURE_ANALYSIS.md` → "Testing Setup"

#### Development commands
See: `QUICK_REFERENCE.md` → "Start Development"

#### Tech stack details
See: `ANALYSIS_DOCUMENTATION_README.md` → "Core Technology Stack"

#### File locations
See: `QUICK_REFERENCE.md` → "Directory Tree Quick Reference"

---

## Project Structure (Quick Version)

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Login pages
│   ├── (dashboard)/       # Main app
│   └── api/               # 40+ API endpoints
├── components/            # 100+ React components
├── hooks/                 # 40+ custom hooks
├── lib/                   # Utilities & services
├── types/                 # TypeScript definitions
└── __tests__/            # Tests

database/                  # DB migrations
e2e/                       # Playwright tests
scripts/                   # CLI utilities
.claude/                   # Claude Code config
.taskmaster/               # Task Master AI
```

---

## Technology Stack (Quick Version)

### Frontend
- Next.js 15.5.3 + React 19.1.0
- TypeScript 5, Tailwind CSS
- shadcn/ui components

### State Management
- TanStack Query (server state)
- Zustand (client state)

### Backend
- Supabase PostgreSQL
- Direct queries from Next.js API routes
- 49 active tables

### Testing
- Vitest (unit tests)
- Playwright (E2E tests)

---

## Key Features

- Project management with planning & tracking
- Work entry logging with GPS & photos
- Material management (inventory, orders, suppliers)
- Equipment & vehicle tracking
- Team/crew management
- Financial tracking
- Calendar & scheduling
- Document management
- Real-time updates
- Multi-language support (5 languages)
- Role-based access control (6 roles)

---

## Getting Started

### Setup
```bash
npm install
cp .env.example .env.local
npm run dev  # localhost:3000
```

### Common Commands
```bash
npm run build              # Production build
npm run test               # Unit tests
npm run test:e2e           # E2E tests
npm run type-check         # Type checking
npm run lint               # Linting
```

---

## Development Workflow (Key Points)

1. **Before Coding**: Use pre-implementation planner (mandatory)
2. **During Development**: 
   - Create API route (with Zod validation)
   - Create custom hook (with TanStack Query)
   - Create component (with shadcn/ui)
   - Add types & tests
3. **After Development**: 
   - Commit with descriptive message
   - Pull from dev to sync
   - Push to dev branch

---

## Migration Status

**Completed**:
- FastAPI to Supabase (direct queries)
- Database optimization (33% reduction)
- API consolidation
- Frontend modernization

**In Progress**:
- Streamlit to Next.js migration

---

## Support & Questions

For specific topics, see:
- **Architecture decisions**: `ARCHITECTURE_DIAGRAMS.md`
- **Complete structure**: `PROJECT_STRUCTURE_ANALYSIS.md`
- **Quick lookups**: `QUICK_REFERENCE.md`
- **Overview**: `ANALYSIS_DOCUMENTATION_README.md`
- **Development rules**: Project's `CLAUDE.md`

---

## External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TanStack Query Docs](https://tanstack.com/query)
- [Supabase Docs](https://supabase.com/docs)
- [Zod Documentation](https://zod.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

## Additional Analysis Reports

Also available in the project:
- `DATABASE_ANALYSIS_REPORT.md` - Schema analysis
- `API_ROUTES_ANALYSIS_REPORT.md` - Endpoint docs
- `STATE_MANAGEMENT_ANALYSIS_REPORT.md` - Deep dive
- `MATERIALS_SYSTEM_ANALYSIS_REPORT.md` - Materials details

---

**Generated**: October 16, 2025  
**Documentation Version**: 1.0  
**Last Updated**: October 16, 2025

Total Documentation: 63 KB of comprehensive analysis

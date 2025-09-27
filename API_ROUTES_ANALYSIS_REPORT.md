# API Routes Complexity Analysis Report

## Summary of Changes

I've analyzed the API routes and updated the inventory with accurate complexity scores, database table mappings, and corrected migration statuses based on actual code patterns.

## Migration Status Updates

### ✅ MIGRATED Routes (Pure Supabase Implementation)
- `/api/auth/login` - Pure Supabase with JWT authentication (Complexity: 5)
- `/api/users` - Pure Supabase with pagination, filtering (Complexity: 5)
- `/api/work-entries` - Pure Supabase with complex filtering (Complexity: 6)
- `/api/equipment` - Previously marked as HYBRID, now MIGRATED (Complexity: 7)

### 🔄 HYBRID Routes (FastAPI with Supabase Fallback)
- `/api/projects` - FastAPI primary, Supabase fallback (Complexity: 7)

### ⚠️ FULL_FASTAPI Routes (Still Dependent)
- `/api/teams/crews` - Direct FastAPI forwarding only (Complexity: 4)
- `/api/teams/crews/:id` - Direct FastAPI forwarding only (Complexity: 4)
- `/api/activities` - Direct FastAPI forwarding only (Complexity: 4)

### 🚨 COMPLEX_DB Routes (Raw SQL via Docker)
- `/api/materials/orders` - Complex joins, business logic (Complexity: 9)
- `/api/users/:id/documents` - File uploads, multiple operations (Complexity: 10)
- `/api/materials/warehouse` - Complex warehouse calculations (Complexity: 8)

## Complexity Scoring Analysis

### Scoring Methodology
- **1-2**: Simple CRUD operations, single table
- **3-4**: Basic filtering, pagination, simple joins
- **5-6**: Multiple operations, validation, file handling
- **7-8**: Complex queries, multiple table joins, business logic
- **9-10**: File uploads, raw SQL, complex business calculations

### High Complexity Routes (8-10)
1. **`/api/users/:id/documents`** (10) - File uploads + complex SQL joins + status calculations
2. **`/api/materials/orders`** (9) - Complex joins across 5 tables + business logic
3. **`/api/materials/warehouse`** (8) - Complex inventory calculations + warehouse logic
4. **`/api/dashboard/stats`** (8) - Multiple aggregations across 5+ tables

### Medium Complexity Routes (5-7)
- Routes with multiple table operations, filtering, and business logic
- Examples: `/api/equipment` (7), `/api/projects` (7), `/api/resources/project/:id` (7)

## Database Table Mappings

### Most Used Tables
- **users** - 6 routes (authentication, profiles, documents)
- **projects** - 15 routes (core project management)
- **materials** - 12 routes (inventory management)
- **equipment** - 8 routes (asset tracking)
- **work_entries** - 4 routes (time tracking)

### Complex Multi-Table Operations
- `/api/materials/orders` uses 5 tables: `material_orders`, `supplier_materials`, `suppliers`, `projects`, `users`
- `/api/resources/project/:id` uses 4 tables: `equipment`, `vehicles`, `equipment_assignments`, `vehicle_assignments`
- `/api/dashboard/stats` aggregates from 5+ tables: `projects`, `work_entries`, `users`, `materials`, `equipment`

## Migration Priority Recommendations

### P1 (Critical - FastAPI Dependent)
- 3 routes still require FastAPI microservices
- `/api/teams/crews` and related routes for team management
- `/api/activities` for activity logging

### P2 (Important - Hybrid Routes)
- 1 route using hybrid pattern
- `/api/projects` - Consider full migration to Supabase

### P3 (Complex - Raw SQL Routes)
- 6 routes using complex patterns requiring careful migration
- Focus on `/api/materials/orders`, `/api/users/:id/documents`, `/api/materials/warehouse`
- These need comprehensive testing due to business logic complexity

### P4 (Standard - Supabase Only)
- 86 routes already migrated or using Supabase patterns
- Low risk, focus on optimization and performance

## Key Findings

### Migration Success
- **90% of routes** (86/96) are already migrated or use Supabase
- **Only 3 routes** still require FastAPI microservices
- **4 routes** are fully migrated since last analysis

### Complexity Distribution
- **High (8-10)**: 4 routes (4%)
- **Medium (5-7)**: 28 routes (29%)
- **Low (1-4)**: 64 routes (67%)

### Technical Debt Areas
1. **Raw SQL Usage**: 3 routes use `docker exec` with raw SQL - security and maintenance concerns
2. **File Upload Complexity**: Document routes need Supabase Storage integration
3. **Business Logic**: Complex calculation routes need careful testing

## Recommendations

### Immediate Actions
1. **Complete P1 migration** - Focus on the 3 remaining FastAPI routes
2. **Refactor COMPLEX_DB routes** - Replace raw SQL with proper Supabase queries
3. **Optimize hybrid routes** - Decide on full Supabase migration for `/api/projects`

### Performance Optimization
1. **Add caching** for dashboard stats and complex aggregation routes
2. **Implement pagination** consistently across all list endpoints
3. **Add database indexes** for frequently queried table combinations

### Security Improvements
1. **Replace raw SQL** with parameterized Supabase queries
2. **Implement proper input validation** for all file upload routes
3. **Add authentication checks** consistently across all routes

The migration is 90% complete with only 3 critical routes remaining dependent on FastAPI microservices.
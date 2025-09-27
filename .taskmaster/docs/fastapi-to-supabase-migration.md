# COMETA FastAPI to Supabase Migration PRD

## Executive Summary

**Objective**: Complete migration from FastAPI microservices architecture to Next.js API Routes + Supabase, eliminating 7 FastAPI services and simplifying the system to a single Next.js application with direct Supabase integration.

**Business Impact**:
- Reduce operational complexity (7 services → 1 app)
- Improve performance (remove HTTP hop overhead)
- Simplify deployment and maintenance
- Reduce infrastructure costs

**Timeline**: 2-3 weeks for complete migration and testing

## Current State Analysis

### FastAPI Infrastructure (TO REMOVE)
- **Services**: 7 microservices (auth, project, work, team, material, equipment, activity)
- **Gateway**: API Gateway on port 8080 routing requests
- **Database**: Direct PostgreSQL connections via SQLAlchemy
- **Deployment**: Docker Compose with complex networking
- **Maintenance**: Multiple codebases with duplicated logic

### Next.js API Routes (CURRENT TARGET)
- **Routes**: 87 existing API endpoints in `src/app/api/`
- **Pattern**: Hybrid approach (FastAPI first → Supabase fallback)
- **Database**: Supabase client for PostgreSQL access
- **Issues**: Timeouts and complexity from dual approach

### Database State
- **Tables**: 69 tables fully migrated to Supabase
- **Schema**: Complete fiber optic construction management schema
- **Data**: Real production projects and test data available
- **Access**: Row Level Security (RLS) policies configured

## Migration Strategy

### Phase 1: API Route Analysis & Planning (Priority: CRITICAL)

**Goal**: Complete analysis of all 87 API routes to understand current patterns and plan migration approach.

**Deliverables**:
1. Complete inventory of all API routes with status
2. Categorization by complexity and FastAPI dependency
3. Database table mapping for each route
4. Migration priority matrix
5. Testing strategy for each route category

**Routes to Analyze**:
```
AUTHENTICATION (3 routes):
- /api/auth/login
- /api/auth/register
- /api/auth/skills

CORE RESOURCES (15 routes):
- /api/projects (+ [id] variants)
- /api/users (+ [id] variants)
- /api/equipment (+ [id] variants)
- /api/materials (+ [id] variants)
- /api/work-entries (+ [id] variants)

MANAGEMENT (25 routes):
- /api/crews/* (crew management)
- /api/teams/crews/* (team structures)
- /api/suppliers/* (supplier relationships)
- /api/houses/* (project locations)
- /api/activities/* (activity logging)

OPERATIONS (20 routes):
- /api/materials/orders/* (material ordering)
- /api/materials/allocations/* (resource allocation)
- /api/equipment/assignments/* (equipment tracking)
- /api/vehicles/* (vehicle management)
- /api/resources/* (unified resource management)

SPECIALIZED (24 routes):
- /api/project-preparation/* (project setup)
- /api/zone-layout/* (technical layouts)
- /api/financial/* (cost tracking)
- /api/reports/* (reporting system)
- /api/documents/* (document management)
- /api/upload/* (file handling)
```

### Phase 2: Core Resource Migration (Priority: HIGH)

**Goal**: Migrate the 15 most critical API routes that form the backbone of the system.

**Routes Priority Order**:
1. **Projects API** (`/api/projects/*`) - Already partially migrated
2. **Users API** (`/api/users/*`) - User management and authentication
3. **Equipment API** (`/api/equipment/*`) - Recently fixed, needs completion
4. **Materials API** (`/api/materials/*`) - Resource management core
5. **Work Entries API** (`/api/work-entries/*`) - Core workflow tracking

**Migration Pattern**:
```typescript
// FROM: Hybrid FastAPI + Supabase
try {
  const response = await fetch(`${GATEWAY_URL}/api/projects`);
  if (response.ok) return response.json();
} catch (error) {
  // Fallback to Supabase
  const { data } = await supabase.from('projects').select('*');
  return data;
}

// TO: Pure Supabase
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .order('created_at', { ascending: false });

if (error) throw new Error('Database query failed');
return data;
```

**Quality Gates**:
- All CRUD operations work correctly
- Error handling matches original behavior
- Response format maintained for frontend compatibility
- Performance equal or better than FastAPI version

### Phase 3: Management Systems Migration (Priority: MEDIUM)

**Goal**: Migrate crew management, supplier relationships, and activity tracking systems.

**Focus Areas**:
1. **Crew Management** - Team formation and member assignments
2. **Supplier Integration** - Material sourcing and procurement
3. **Activity Logging** - System usage and audit trails
4. **House/Location Management** - Project site management

**Database Schema Alignment**:
- Verify all required tables exist and have correct structure
- Update any column name mismatches (like equipment table)
- Ensure foreign key relationships are properly maintained
- Validate data types match API expectations

### Phase 4: Operations & Workflows (Priority: MEDIUM)

**Goal**: Migrate complex operational workflows including material ordering, resource allocation, and equipment tracking.

**Complex Workflows**:
1. **Material Ordering Process** - Multi-step workflow with approvals
2. **Resource Allocation** - Complex business logic for assignment
3. **Equipment Tracking** - Real-time status updates and maintenance
4. **Vehicle Management** - Location tracking and assignment

**Business Logic Preservation**:
- Maintain all validation rules from FastAPI services
- Preserve transaction atomicity where needed
- Keep permission models intact
- Maintain audit trail functionality

### Phase 5: Specialized Systems (Priority: LOW)

**Goal**: Migrate remaining specialized functionality including reporting, document management, and file uploads.

**Advanced Features**:
1. **Project Preparation** - Complex project setup workflows
2. **Zone Layout Management** - Technical drawing and cable routing
3. **Financial Reporting** - Cost analysis and budget tracking
4. **Document Management** - File upload/storage via Supabase Storage
5. **Advanced Reports** - Analytics and business intelligence

### Phase 6: Testing & Validation (Priority: CRITICAL)

**Goal**: Comprehensive testing with real data to ensure system reliability.

**Testing Strategy**:
1. **API Contract Testing** - Verify all endpoints return expected data formats
2. **Database Integration Testing** - Test all CRUD operations
3. **Performance Testing** - Measure response times vs FastAPI baseline
4. **Error Handling Testing** - Verify graceful error responses
5. **Integration Testing** - Test frontend-backend integration
6. **Load Testing** - Verify system handles expected traffic

**Real Data Testing Requirements**:
- Create realistic test projects with full data sets
- Test material ordering workflows with actual suppliers
- Verify equipment tracking with real device data
- Test user management with different role permissions
- Validate financial calculations with real project costs

**Automated Test Suite**:
```typescript
// Example test structure
describe('Projects API Migration', () => {
  test('GET /api/projects returns projects list', async () => {
    const response = await fetch('/api/projects');
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('items');
    expect(data).toHaveProperty('total');
  });

  test('POST /api/projects creates new project', async () => {
    const project = {
      name: 'Test Fiber Project',
      customer: 'Test Customer',
      city: 'Test City'
    };
    const response = await fetch('/api/projects', {
      method: 'POST',
      body: JSON.stringify(project)
    });
    expect(response.status).toBe(201);
  });
});
```

### Phase 7: FastAPI Infrastructure Removal (Priority: HIGH)

**Goal**: Safely remove all FastAPI infrastructure after successful migration.

**Cleanup Tasks**:
1. **Remove FastAPI Services**:
   - Delete `/fastapi_services/` directory
   - Remove Docker Compose FastAPI configurations
   - Update documentation to remove FastAPI references

2. **Environment Cleanup**:
   - Remove `GATEWAY_URL` environment variable
   - Remove FastAPI-related Docker images
   - Update deployment scripts

3. **Code Cleanup**:
   - Remove all `fetch(GATEWAY_URL)` calls from API routes
   - Remove FastAPI timeout handling code
   - Simplify error handling to Supabase-only patterns
   - Update TypeScript types to remove FastAPI-specific interfaces

4. **Documentation Updates**:
   - Update README to reflect new architecture
   - Remove FastAPI setup instructions
   - Update API documentation
   - Create migration notes for future reference

**Verification**:
- All API routes work without FastAPI services running
- No references to `GATEWAY_URL` in codebase
- Docker Compose works without FastAPI services
- Performance metrics show improvement or no degradation

## Success Criteria

### Technical Success
- [ ] All 87 API routes migrated to pure Supabase
- [ ] No FastAPI dependencies remaining in codebase
- [ ] All automated tests passing
- [ ] Performance equal or better than FastAPI version
- [ ] Error handling maintains user experience quality

### Business Success
- [ ] System supports all current business workflows
- [ ] Data integrity maintained throughout migration
- [ ] User experience unchanged or improved
- [ ] Deployment complexity significantly reduced
- [ ] Infrastructure costs reduced

### Quality Metrics
- [ ] API response time < 200ms for simple queries
- [ ] 99.9% uptime during migration period
- [ ] Zero data loss incidents
- [ ] All security policies maintained
- [ ] Full test coverage for migrated routes

## Risk Management

### Technical Risks
- **Data consistency during migration** - Mitigate with thorough testing and rollback plans
- **Performance degradation** - Monitor response times and optimize queries
- **Complex business logic errors** - Preserve all validation rules and business logic
- **Frontend compatibility issues** - Maintain API contracts and response formats

### Operational Risks
- **Extended downtime** - Plan migration in phases with minimal service interruption
- **User workflow disruption** - Maintain UI consistency and user training
- **Data backup and recovery** - Full database backups before major changes

### Rollback Strategy
- Maintain FastAPI services until full migration verification
- Database rollback scripts for schema changes
- Frontend rollback to previous API integration patterns
- Monitoring dashboards to detect issues quickly

## Timeline & Resources

### Week 1: Analysis & Planning
- Days 1-2: Complete API route analysis
- Days 3-4: Create detailed migration plans
- Day 5: Set up testing infrastructure and Documentation Agent

### Week 2: Core Migration
- Days 1-3: Migrate core resources (projects, users, equipment, materials)
- Days 4-5: Testing and validation of core functionality

### Week 3: Advanced Migration
- Days 1-2: Migrate management and operational systems
- Days 3-4: Migrate specialized systems and workflows
- Day 5: Comprehensive testing and performance validation

### Week 4: Cleanup & Verification
- Days 1-2: Remove FastAPI infrastructure
- Days 3-4: Final testing and documentation
- Day 5: Production deployment and monitoring

## Monitoring & Validation

### Real-time Monitoring
- API response time monitoring
- Error rate tracking
- Database query performance
- User session success rates

### Migration Progress Tracking
- TaskMaster integration for task completion tracking
- Documentation Agent for automatic progress documentation
- Git branch strategy for incremental migration
- Regular stakeholder updates

This PRD provides the complete roadmap for migrating from FastAPI microservices to a streamlined Next.js + Supabase architecture while maintaining system reliability and user experience.
# COMETA API Router System Migration - Product Requirements Document

## Project Overview

**Project Name**: COMETA Next.js API Router System Critical Migration
**Version**: 1.0
**Date**: September 26, 2025
**Status**: CRITICAL - Immediate Action Required

### Executive Summary

The COMETA platform has critical database routing failures where Next.js API routers are accessing non-existent database tables and fields. This migration will fix all 47 identified critical issues to restore full system functionality.

## Problem Statement

### Current Issues

1. **47 Critical Database Mismatches** - API routers reference non-existent tables/fields
2. **Complete API Failures** - Activities, Transactions, Crews endpoints broken
3. **Field Name Mismatches** - Equipment, Auth, Vehicles have wrong field names
4. **No Validation System** - No checks to prevent future schema mismatches

### Business Impact

- **System Downtime**: Critical APIs returning 500 errors
- **Data Integrity**: Inconsistent data access patterns
- **Development Velocity**: Developers blocked by broken APIs
- **User Experience**: Features unavailable due to backend failures

## Objectives

### Primary Goals

1. **Fix all 47 identified critical routing issues**
2. **Restore 100% API functionality**
3. **Implement schema validation system**
4. **Create comprehensive documentation**

### Success Metrics

- ✅ Zero 500 errors from database schema mismatches
- ✅ All API endpoints return valid responses
- ✅100% test coverage for fixed endpoints
- ✅ Automated schema validation in place

## Technical Requirements

### Phase 1: Critical API Fixes (24 hours)

#### 1.1 Activities API Migration

**Current Issue**: References non-existent `activities` table
**Solution**: Migrate to `activity_logs` table

**Tasks**:

- Update table reference from `activities` → `activity_logs`
- Fix field mappings:
  - `object_type` → `entity_type`
  - `object_id` → `entity_id`
  - `metadata` → `extra_data`
- Update all related queries and filters
- Add proper validation for activity_type enum

#### 1.2 Crews API Field Corrections

**Current Issue**: Wrong field names causing query failures
**Solution**: Map to correct database fields

**Tasks**:

- Fix field mappings:
  - `leader_user_id` → `foreman_user_id`
  - Add missing `project_id` handling
  - Remove non-existent `created_at`, `updated_at` references
- Update crew member relationships
- Fix foreign key constraints

#### 1.3 Equipment API Field Alignment

**Current Issue**: Multiple field name mismatches
**Solution**: Align with actual schema

**Tasks**:

- Fix field mappings:
  - `rental_cost_per_day` → `rental_price_per_day_eur`
  - `purchase_date` → Remove (doesn't exist)
  - `warranty_until` → Remove (doesn't exist)
  - `description` → Remove (doesn't exist)
  - `is_active` → Remove (doesn't exist)
- Update filtering logic
- Fix status enum validation

#### 1.4 Auth API User Field Fixes

**Current Issue**: Wrong user field references
**Solution**: Use correct field names

**Tasks**:

- Fix field mapping: `language_preference` → `lang_pref`
- Update user query selectors
- Fix JWT token payload fields

### Phase 2: Major System Fixes (48 hours)

#### 2.1 Transactions API Replacement

**Current Issue**: `transactions` table doesn't exist
**Solution**: Create proper financial tracking system

**Tasks**:

- Analyze requirements for transaction functionality
- Map to existing tables (`costs`, `material_orders`, `rental_expenses`)
- Create unified financial API
- Implement proper aggregation logic

#### 2.2 Vehicles API Corrections

**Current Issue**: Some field mismatches
**Solution**: Align with vehicle schema

**Tasks**:

- Verify all field mappings
- Fix any remaining field name issues
- Update assignment relationships

#### 2.3 Materials API Relationship Fixes

**Current Issue**: Incorrect foreign key relationships
**Solution**: Fix joins and references

**Tasks**:

- Fix material allocation relationships
- Correct supplier material mappings
- Update order tracking logic

### Phase 3: System Hardening (72 hours)

#### 3.1 Schema Validation System

**Requirements**:

- Automatic schema validation before queries
- TypeScript type generation from database schema
- Runtime validation for API requests
- Schema change detection and alerts

#### 3.2 Comprehensive Testing

**Requirements**:

- Unit tests for all fixed endpoints
- Integration tests with real database
- Performance testing for complex queries
- Error handling validation

#### 3.3 Documentation and Monitoring

**Requirements**:

- Complete API documentation
- Database schema documentation
- Runtime monitoring and alerting
- Developer guidelines for schema changes

## Database Schema Reference

### Existing Tables (Verified)

```sql
✅ users (id, first_name, last_name, email, phone, role, is_active, lang_pref, pin_code)
✅ projects (id, name, customer, city, status, total_length_m, base_rate_per_m, pm_user_id)
✅ crews (id, project_id, name, foreman_user_id, status, description)
✅ crew_members (crew_id, user_id, role_in_crew, active_from, active_to)
✅ equipment (id, type, name, inventory_no, owned, status, purchase_price_eur, rental_price_per_day_eur, rental_price_per_hour_eur, current_location)
✅ equipment_assignments (id, equipment_id, project_id, cabinet_id, crew_id, from_ts, to_ts, is_permanent, rental_cost_per_day)
✅ vehicles (id, plate_number, type, brand, model, owned, status, purchase_price_eur, rental_price_per_day_eur, current_location)
✅ vehicle_assignments (id, vehicle_id, project_id, crew_id, from_ts, to_ts, is_permanent, rental_cost_per_day)
✅ materials (id, name, unit, sku, description, default_price_eur, purchase_price_eur, current_stock_qty)
✅ material_allocations (id, material_id, project_id, crew_id, allocated_qty, used_qty, allocation_date, status, allocated_by)
✅ material_orders (id, project_id, supplier_material_id, quantity, unit_price_eur, total_cost_eur, status, order_date, ordered_by)
✅ work_entries (id, project_id, cabinet_id, segment_id, crew_id, user_id, date, stage_code, meters_done_m, approved)
✅ activity_logs (id, user_id, activity_type, description, project_id, entity_type, entity_id, extra_data, ip_address, user_agent, created_at)
✅ houses (id, project_id, cabinet_id, address, house_number, connection_type, method, status, contact_name, contact_phone)
✅ suppliers (id, name, contact_info, address, company_name, contact_person, phone, email, is_active)
✅ worker_documents (id, user_id, category_id, document_type, file_url, status, created_at, uploaded_by)
```

### Non-Existent Tables (To Fix)

```sql
❌ activities → Use activity_logs
❌ transactions → Use costs/material_orders/rental_expenses
```

## Implementation Priority Matrix

### P1 - Critical (0-24h)

1. Activities API (blocks activity logging)
2. Crews API (blocks team management)
3. Equipment API (blocks resource management)
4. Auth API (blocks user authentication)

### P2 - High (24-48h)

1. Transactions API (blocks financial tracking)
2. Vehicles API (blocks vehicle management)
3. Materials API relationships (blocks inventory)

### P3 - Medium (48-72h)

1. Schema validation system
2. Comprehensive testing
3. Documentation updates
4. Monitoring implementation

## Risk Assessment

### High Risk

- **Data Corruption**: Incorrect field mappings could corrupt data
- **Downtime**: API fixes require careful deployment
- **User Impact**: Critical features unavailable during migration

### Mitigation Strategies

- **Staged Deployment**: Fix and test one API at a time
- **Data Backup**: Full database backup before changes
- **Rollback Plan**: Keep old API versions as fallback
- **Testing**: Extensive testing in staging environment

## Resource Requirements

### Development Team

- **Senior Backend Developer**: Lead migration effort
- **Database Specialist**: Schema validation and optimization
- **QA Engineer**: Comprehensive testing
- **DevOps Engineer**: Deployment and monitoring

### Timeline

- **Week 1**: P1 Critical fixes (Activities, Crews, Equipment, Auth)
- **Week 2**: P2 High priority (Transactions, Vehicles, Materials)
- **Week 3**: P3 System hardening (Validation, Testing, Documentation)

## Acceptance Criteria

### Functional Requirements

- [ ] All 47 identified issues fixed
- [ ] Zero 500 errors from schema mismatches
- [ ] All API endpoints return valid responses
- [ ] Data consistency maintained across all operations

### Non-Functional Requirements

- [ ] API response times under 500ms
- [ ] 99.9% uptime during migration
- [ ] Zero data loss during migration
- [ ] Full backward compatibility maintained

### Quality Requirements

- [ ] 100% test coverage for fixed endpoints
- [ ] Automated schema validation in place
- [ ] Complete documentation updated
- [ ] Monitoring and alerting configured

## Success Metrics

### Technical Metrics

- **Error Rate**: 0% 500 errors from schema issues
- **Response Time**: <500ms for all endpoints
- **Test Coverage**: 100% for critical paths
- **Schema Validation**: 100% coverage

### Business Metrics

- **Feature Availability**: 100% of features functional
- **User Experience**: Zero failed operations due to backend issues
- **Development Velocity**: No developer blockers from API issues
- **System Reliability**: 99.9% uptime maintained

## Conclusion

This migration is critical for restoring full COMETA platform functionality. The systematic approach ensures all database routing issues are resolved while implementing safeguards against future schema mismatches.

**Next Steps**: Use TaskMaster AI to generate detailed implementation tasks from this PRD.

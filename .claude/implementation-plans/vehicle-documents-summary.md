# Vehicle Documents System - Quick Reference

## Overview
Complete vehicle documents management system for German vehicle documentation (TÜV, Insurance, Registration, etc.) with expiry tracking and visual warnings.

## File Locations

### Database
- `/database/migrations/003_create_vehicle_documents.sql` - Database migration
- `/sql/create-vehicle-documents-bucket.sql` - Supabase storage setup

### Backend (API Routes)
```
/src/app/api/vehicles/
├── [id]/documents/
│   ├── route.ts                              # GET (list), POST (upload)
│   └── [documentId]/
│       ├── route.ts                          # GET, PUT, DELETE
│       ├── download/route.ts                 # Download file
│       └── view/route.ts                     # View in browser
└── documents/expiring/route.ts               # Expiring warnings API
```

### Frontend (Components)
```
/src/components/vehicles/
├── vehicle-documents-dialog.tsx              # Main dialog (based on worker-documents-dialog.tsx)
├── vehicle-document-card.tsx                 # Document card with actions
├── vehicle-document-upload.tsx               # Upload component (based on document-upload.tsx)
└── vehicle-expiry-warnings.tsx               # Dashboard warnings widget
```

### Utilities
- `/src/lib/vehicle-document-storage.ts` - Storage helpers (upload, download, delete, status calc)

### Types
- `/src/types/index.ts` - Add VehicleDocumentType, VehicleDocument, VehicleDocumentsResponse

## German Document Types

| Type | German Name | English | Requires Expiry | Color |
|------|-------------|---------|----------------|-------|
| `fahrzeugschein` | Fahrzeugschein (Teil I) | Registration Certificate | No | Blue |
| `fahrzeugbrief` | Fahrzeugbrief (Teil II) | Vehicle Title | No | Purple |
| `tuv` | TÜV / HU | Technical Inspection | **Yes** | Green |
| `versicherung` | Versicherung | Insurance | **Yes** | Red |
| `au` | AU (Abgasuntersuchung) | Emissions Test | **Yes** | Orange |
| `wartung` | Wartungsnachweis | Service Records | No | Cyan |
| `sonstiges` | Sonstiges | Other | No | Gray |

## Database Schema

```sql
CREATE TABLE vehicle_documents (
    id UUID PRIMARY KEY,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    document_number VARCHAR(100),
    issuing_authority VARCHAR(255),
    issue_date DATE,
    expiry_date DATE,
    notes TEXT,
    is_verified BOOLEAN DEFAULT false,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Indexes**:
- `vehicle_id` (fast lookups by vehicle)
- `document_type` (filter by type)
- `expiry_date` (expiring documents query)
- `created_at` (sort by upload date)

## Storage Structure

```
vehicle-documents/
└── {vehicle_id}/
    ├── fahrzeugschein/
    ├── fahrzeugbrief/
    ├── tuv/
    ├── versicherung/
    ├── au/
    ├── wartung/
    └── sonstiges/
```

## Status Calculation Logic

```typescript
if (!expiryDate) return 'no_expiry';
if (daysUntilExpiry < 0) return 'expired' (critical);
if (daysUntilExpiry <= 30) return 'expiring_soon' (critical);
if (daysUntilExpiry <= 60) return 'expiring_soon' (warning);
return 'active' (none);
```

## Key Features

### Document Management
- [x] Multi-file upload with drag & drop
- [x] Document type classification (7 German types)
- [x] Metadata: number, authority, issue/expiry dates, notes
- [x] Preview documents (PDF, images)
- [x] Download documents
- [x] Edit metadata (not file itself)
- [x] Delete documents with confirmation

### Expiry Tracking
- [x] Calculate days until expiry
- [x] Visual status badges (expired/expiring/active)
- [x] Warning levels (none/warning/critical)
- [x] Dashboard warnings widget
- [x] Filter by status (all/active/expiring/expired)

### Integration
- [x] Documents button in vehicles table
- [x] Document count badge
- [x] Expired documents indicator
- [x] Optional: Documents section in vehicle form

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/vehicles/[id]/documents` | List all documents |
| POST | `/api/vehicles/[id]/documents` | Upload new document |
| GET | `/api/vehicles/[id]/documents/[docId]` | Get document details |
| PUT | `/api/vehicles/[id]/documents/[docId]` | Update metadata |
| DELETE | `/api/vehicles/[id]/documents/[docId]` | Delete document |
| GET | `/api/vehicles/[id]/documents/[docId]/download` | Download file |
| GET | `/api/vehicles/[id]/documents/[docId]/view` | View file inline |
| GET | `/api/vehicles/documents/expiring` | Get expiring docs |

## Implementation Phases

### Phase 1: Database (Day 1)
1. Create migration SQL
2. Setup Supabase bucket
3. Add TypeScript types

### Phase 2: Storage (Day 1-2)
4. Create storage utilities
5. Test upload/download/delete

### Phase 3: API (Day 2-3)
6. Create all API routes
7. Test with Postman

### Phase 4: Frontend (Day 3-4)
8. Create upload component
9. Create document card
10. Create documents dialog

### Phase 5: Integration (Day 4-5)
11. Add to vehicles page
12. Add expiry warnings
13. Optional: Add to edit form

### Phase 6: Testing (Day 5-6)
14. Write unit/integration/E2E tests
15. Manual testing

### Phase 7: Deploy (Day 6-7)
16. Documentation
17. Production deployment

## Testing Checklist

### Unit Tests
- [ ] Status calculation logic
- [ ] Storage utilities
- [ ] Date validation

### Integration Tests
- [ ] Upload document API
- [ ] Download document API
- [ ] Update metadata API
- [ ] Delete document API

### E2E Tests
- [ ] Upload document flow
- [ ] View document
- [ ] Edit metadata
- [ ] Delete document
- [ ] Expiry warnings display

### Manual Tests
- [ ] Large file upload (50MB)
- [ ] Multi-file upload (10 files)
- [ ] Different file types (PDF, JPG, PNG)
- [ ] Expiry date calculations
- [ ] Status badges display
- [ ] Mobile responsiveness
- [ ] Browser compatibility

## Edge Cases Handled

1. **File Upload**
   - Max 50MB per file
   - Only PDF and images allowed
   - Duplicate files with unique names
   - Concurrent uploads

2. **Validation**
   - Document type required
   - Expiry required for TÜV/Insurance/AU
   - Date validation (issue < expiry)
   - File size/type validation

3. **Security**
   - Authentication required
   - RLS policies on storage
   - File validation
   - SQL injection prevention

4. **Performance**
   - Indexed queries
   - Pagination for large lists
   - Lazy loading
   - Optimized storage paths

## Similar Existing Patterns

**Based on User Documents System**:
- `/src/components/documents/worker-documents-dialog.tsx` → `vehicle-documents-dialog.tsx`
- `/src/components/documents/document-upload.tsx` → `vehicle-document-upload.tsx`
- `/src/lib/document-storage.ts` → `vehicle-document-storage.ts`
- `/src/app/api/users/[id]/documents/` → `/src/app/api/vehicles/[id]/documents/`

**Key Differences**:
1. Categories: German vehicle types vs. worker document categories
2. Expiry tracking: More critical for vehicles (TÜV, Insurance)
3. Storage structure: Organized by vehicle_id instead of user_id
4. Integration: Vehicles table vs. Teams page

## Quick Start Commands

```bash
# 1. Run database migration
psql -h your-db-host -U postgres -d cometa < database/migrations/003_create_vehicle_documents.sql

# 2. Create storage bucket (run in Supabase SQL Editor)
cat sql/create-vehicle-documents-bucket.sql

# 3. Install dependencies (if needed)
npm install react-dropzone

# 4. Start development
npm run dev

# 5. Test upload
# Navigate to /dashboard/vehicles
# Click documents button on any vehicle
# Upload test file
```

## Deployment Checklist

- [ ] Database migration executed on production
- [ ] Storage bucket created on production
- [ ] Storage policies configured
- [ ] Environment variables set
- [ ] API routes tested on staging
- [ ] Components tested on staging
- [ ] E2E tests pass
- [ ] Production deployment
- [ ] Smoke tests on production
- [ ] Monitor for errors

## Support & Resources

- **Full Plan**: `/claude/implementation-plans/vehicle-documents-system.md`
- **User Docs Pattern**: `/src/components/documents/worker-documents-dialog.tsx`
- **Upload Pattern**: `/src/components/documents/document-upload.tsx`
- **Vehicle Types**: German KFZ standards (TÜV, HU, AU)
- **Supabase Docs**: https://supabase.com/docs/guides/storage

---

**Estimated Time**: 6-7 days
**Complexity**: Medium-High
**Dependencies**: Supabase Storage, react-dropzone, existing vehicles table

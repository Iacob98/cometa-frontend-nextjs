# Testing Guide: Soil Types & Contacts Features

## Overview
This document provides a comprehensive testing guide for the newly implemented soil types and contacts features in the project creation and project details pages.

## Features Implemented

### 1. Project Soil Types
- **Location**: Project Creation Form & Project Details Page
- **Functionality**:
  - Add multiple soil types with pricing per meter
  - Specify quantity in meters
  - Add notes for each soil type
  - View total cost calculation
  - Delete soil types
- **Database Table**: `project_soil_types`
- **API Endpoints**: `/api/projects/[id]/soil-types`

### 2. Project Contacts
- **Location**: Project Creation Form & Project Details Page
- **Functionality**:
  - Add multiple contacts
  - Required fields: First Name, Last Name
  - Optional fields: Department, Phone, Email, Position
  - Delete contacts
  - Primary contact indicator
- **Database Table**: `project_contacts`
- **API Endpoints**: `/api/projects/[id]/contacts`

## Testing Checklist

### Phase 1: Project Creation Form Testing

#### Soil Types Section
- [ ] Navigate to `/dashboard/projects/new`
- [ ] Scroll to "Project Scope (Soil Types)" section
- [ ] Click "Add Soil Type" button
- [ ] Enter soil type data:
  - Soil Type Name: "Sand"
  - Price per Meter: "12.50"
  - Quantity: "500"
  - Notes: "High-quality construction sand"
- [ ] Verify validation for required fields (name, price)
- [ ] Click "Add Soil Type" again to add second type:
  - Soil Type Name: "Clay"
  - Price per Meter: "18.00"
  - Quantity: "300"
- [ ] Test remove button on one of the soil types
- [ ] Add it back
- [ ] Verify all entered data persists

#### Contacts Section
- [ ] Scroll to "Project Contacts" section
- [ ] Click "Add Contact" button
- [ ] Enter contact data:
  - First Name: "John"
  - Last Name: "Smith"
  - Department: "Engineering"
  - Position: "Project Coordinator"
  - Phone: "+49 30 12345678"
  - Email: "john.smith@example.com"
- [ ] Verify validation for required fields (first name, last name)
- [ ] Verify email validation
- [ ] Click "Add Contact" again to add second contact:
  - First Name: "Maria"
  - Last Name: "Mueller"
  - Department: "Operations"
  - Phone: "+49 30 87654321"
- [ ] Test remove button on one contact
- [ ] Add it back
- [ ] Verify all entered data persists

#### Form Submission
- [ ] Fill in all required project fields (name, status, location, etc.)
- [ ] Ensure 2 soil types and 2 contacts are added
- [ ] Click "Create Project" button
- [ ] Verify successful redirect to project details page
- [ ] Note the project ID for Phase 2 testing

### Phase 2: Project Details Page Testing

#### Soil Types Display
- [ ] Navigate to the newly created project details page
- [ ] Locate "Soil Types" card in the Overview tab
- [ ] Verify all soil types from creation are displayed
- [ ] Check table columns: Soil Type, Price/Meter, Quantity (m), Total Cost, Notes
- [ ] Verify total cost calculation is correct
- [ ] Verify badge showing count of soil types

#### Add Soil Type from Details Page
- [ ] Click "Add Soil Type" button
- [ ] Enter new soil type:
  - Soil Type Name: "Rock"
  - Price per Meter: "25.00"
  - Quantity: "150"
  - Notes: "Hard rock excavation"
- [ ] Click "Add Soil Type" in dialog
- [ ] Verify toast notification appears
- [ ] Verify new soil type appears in table
- [ ] Verify badge count incremented
- [ ] Verify total cost recalculated

#### Delete Soil Type
- [ ] Click delete button (trash icon) on one soil type
- [ ] Verify toast notification appears
- [ ] Verify soil type removed from table
- [ ] Verify badge count decremented
- [ ] Verify total cost recalculated

#### Contacts Display
- [ ] Locate "Project Contacts" card in the Overview tab
- [ ] Verify all contacts from creation are displayed
- [ ] Check table columns: Name, Department, Position, Phone, Email
- [ ] Verify icons display correctly (briefcase, phone, mail)
- [ ] Verify badge showing count of contacts
- [ ] Check if primary contact badge is shown (if applicable)

#### Add Contact from Details Page
- [ ] Click "Add Contact" button
- [ ] Enter new contact:
  - First Name: "Anna"
  - Last Name: "Schmidt"
  - Department: "Finance"
  - Position: "Budget Manager"
  - Phone: "+49 30 11223344"
  - Email: "anna.schmidt@example.com"
- [ ] Click "Add Contact" in dialog
- [ ] Verify toast notification appears
- [ ] Verify new contact appears in table
- [ ] Verify badge count incremented

#### Delete Contact
- [ ] Click delete button (trash icon) on one contact
- [ ] Verify toast notification appears
- [ ] Verify contact removed from table
- [ ] Verify badge count decremented

### Phase 3: API Endpoint Testing

#### Soil Types API
```bash
# Get soil types for a project
curl -s "http://localhost:3000/api/projects/{PROJECT_ID}/soil-types"

# Add a soil type
curl -s "http://localhost:3000/api/projects/{PROJECT_ID}/soil-types" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "soil_type_name": "Gravel",
    "price_per_meter": 15.00,
    "quantity_meters": 200,
    "notes": "Construction gravel"
  }'

# Delete a soil type
curl -s "http://localhost:3000/api/projects/{PROJECT_ID}/soil-types?soil_type_id={SOIL_TYPE_ID}" \
  -X DELETE
```

#### Contacts API
```bash
# Get contacts for a project
curl -s "http://localhost:3000/api/projects/{PROJECT_ID}/contacts"

# Add a contact
curl -s "http://localhost:3000/api/projects/{PROJECT_ID}/contacts" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Thomas",
    "last_name": "Weber",
    "department": "Construction",
    "position": "Site Manager",
    "phone": "+49 30 99887766",
    "email": "thomas.weber@example.com"
  }'

# Delete a contact
curl -s "http://localhost:3000/api/projects/{PROJECT_ID}/contacts?contact_id={CONTACT_ID}" \
  -X DELETE
```

### Phase 4: Edge Cases & Error Handling

#### Validation Testing
- [ ] Try creating soil type without name (should fail)
- [ ] Try creating soil type without price (should fail)
- [ ] Try creating soil type with negative price (should fail)
- [ ] Try creating contact without first name (should fail)
- [ ] Try creating contact without last name (should fail)
- [ ] Try creating contact with invalid email format (should fail)
- [ ] Try creating soil type with price = 0 (should fail)

#### Empty State Testing
- [ ] Create a project without soil types or contacts
- [ ] Verify "No soil types defined yet" message displays
- [ ] Verify "No contacts added yet" message displays
- [ ] Verify "Add Soil Type" and "Add Contact" buttons are still visible
- [ ] Add items to verify transition from empty to populated state

#### Data Persistence Testing
- [ ] Create project with soil types and contacts
- [ ] Navigate away from project details page
- [ ] Navigate back to project details page
- [ ] Verify all soil types and contacts are still present
- [ ] Refresh the page
- [ ] Verify data persists after refresh

#### Loading State Testing
- [ ] Navigate to project details page
- [ ] Observe loading states for soil types and contacts cards
- [ ] Verify "Loading..." messages display briefly

### Phase 5: Database Verification

```sql
-- Check project_soil_types table
SELECT * FROM project_soil_types
WHERE project_id = '{PROJECT_ID}'
ORDER BY created_at;

-- Check project_contacts table
SELECT * FROM project_contacts
WHERE project_id = '{PROJECT_ID}'
ORDER BY created_at;

-- Verify foreign key constraints
SELECT
  pst.id,
  pst.soil_type_name,
  pst.price_per_meter,
  pst.quantity_meters,
  p.name as project_name
FROM project_soil_types pst
JOIN projects p ON p.id = pst.project_id
WHERE pst.project_id = '{PROJECT_ID}';

-- Verify contacts with project
SELECT
  pc.id,
  pc.first_name,
  pc.last_name,
  pc.department,
  pc.phone,
  pc.email,
  p.name as project_name
FROM project_contacts pc
JOIN projects p ON p.id = pc.project_id
WHERE pc.project_id = '{PROJECT_ID}';
```

## Expected Results

### Success Criteria
1. ✅ All soil types added during project creation are stored in database
2. ✅ All contacts added during project creation are stored in database
3. ✅ Soil types display correctly in project details page with accurate calculations
4. ✅ Contacts display correctly in project details page with all fields
5. ✅ Add functionality works from project details page for both features
6. ✅ Delete functionality works from project details page for both features
7. ✅ Validation prevents invalid data entry
8. ✅ Toast notifications provide user feedback for all actions
9. ✅ Badge counts update correctly
10. ✅ Total cost calculation is accurate for soil types

### UI/UX Verification
- Forms are responsive and intuitive
- Icons enhance visual clarity
- Loading states prevent confusion
- Error messages are clear and helpful
- Empty states guide users to action
- Delete actions are reversible (with confirmation via toast)

## Test Data Examples

### Sample Soil Types
1. Sand - €12.50/m - 500m - "High-quality construction sand"
2. Clay - €18.00/m - 300m - "Dense clay layer"
3. Rock - €25.00/m - 150m - "Hard rock excavation"
4. Gravel - €15.00/m - 400m - "Construction gravel"

### Sample Contacts
1. John Smith - Engineering - Project Coordinator - +49 30 12345678 - john.smith@example.com
2. Maria Mueller - Operations - Site Supervisor - +49 30 87654321 - maria.mueller@example.com
3. Anna Schmidt - Finance - Budget Manager - +49 30 11223344 - anna.schmidt@example.com
4. Thomas Weber - Construction - Site Manager - +49 30 99887766 - thomas.weber@example.com

## Known Limitations

1. **Bulk Operations**: Currently, items must be added/deleted one at a time
2. **Edit Functionality**: No in-place editing - must delete and re-add to modify
3. **Sorting**: Tables display in creation order (by created_at)
4. **Filtering**: No search or filter functionality yet
5. **Validation**: Email validation is basic format check only

## Future Enhancements

1. Add edit functionality for soil types and contacts
2. Implement bulk import/export
3. Add search and filter capabilities
4. Enhanced validation (phone number formats, email verification)
5. Soil type templates or presets
6. Contact role management
7. Activity logging for changes
8. Export to CSV/PDF functionality

## Implementation Files

### Database
- `database/migrations/001_create_project_soil_types.sql`

### API Routes
- `src/app/api/projects/[id]/soil-types/route.ts`
- `src/app/api/projects/[id]/contacts/route.ts`

### Components
- `src/components/project-soil-types-card.tsx`
- `src/components/project-contacts-card.tsx`

### Pages
- `src/app/(dashboard)/dashboard/projects/new/page.tsx` (updated)
- `src/app/(dashboard)/dashboard/projects/[id]/page.tsx` (updated)

## Conclusion

This feature implementation adds critical project management capabilities for tracking soil types with pricing and project contacts. The implementation follows Next.js best practices with proper validation, error handling, and user feedback.

**Testing Status**: ✅ Ready for manual testing
**Deployment Status**: ✅ Committed and pushed to dev branch
**Documentation Status**: ✅ Complete

---
*Last Updated: 2025-10-07*
*Created by: Claude Code*

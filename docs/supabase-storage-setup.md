# COMETA Supabase Storage Setup Guide

This document explains how to set up the Supabase Storage buckets and policies for the COMETA file upload system.

## Overview

The COMETA system uses 6 storage buckets for different types of files:

1. **project-photos** - Project construction photos and progress images
2. **work-photos** - Work entry photos showing completed work
3. **project-documents** - Project documents, plans, and technical files
4. **house-documents** - House-specific documents and certificates
5. **user-avatars** - User profile pictures (public bucket)
6. **reports** - Generated reports and analytics files

## Bucket Configuration

### Project Photos (`project-photos`)
- **Access**: Private
- **Size Limit**: 10MB per file
- **File Types**: JPEG, PNG, WebP, GIF
- **Folder Structure**: `projects/{project_id}/{category}/{date}/`
- **Example**: `projects/abc123/before/2024-01-15/`

### Work Photos (`work-photos`)
- **Access**: Private
- **Size Limit**: 10MB per file
- **File Types**: JPEG, PNG, WebP, GIF
- **Folder Structure**: `work-entries/{work_entry_id}/{timestamp}/`
- **Example**: `work-entries/we456/2024-01-15T10:30:00Z/`

### Project Documents (`project-documents`)
- **Access**: Private
- **Size Limit**: 50MB per file
- **File Types**: PDF, DOC, DOCX, XLS, XLSX, DWG, DXF
- **Folder Structure**: `projects/{project_id}/{document_type}/`
- **Example**: `projects/abc123/plans/`

### House Documents (`house-documents`)
- **Access**: Private
- **Size Limit**: 10MB per file
- **File Types**: PDF, DOC, DOCX, JPEG, PNG
- **Folder Structure**: `houses/{project_id}/{house_id}/`
- **Example**: `houses/abc123/house_001/`

### User Avatars (`user-avatars`)
- **Access**: Public
- **Size Limit**: 2MB per file
- **File Types**: JPEG, PNG, WebP
- **Folder Structure**: `users/{user_id}/`
- **Example**: `users/user789/`

### Reports (`reports`)
- **Access**: Private
- **Size Limit**: 25MB per file
- **File Types**: PDF, XLS, XLSX, CSV
- **Folder Structure**: `reports/{report_type}/{date}/`
- **Example**: `reports/financial/2024-01-15/`

## Access Control (RLS Policies)

### Project Photos & Documents
- **View**: Project manager, crew members, admins, PMs
- **Upload**: Project manager, crew members, admins, PMs, foremen
- **Update/Delete**: Project manager, admins, PMs only

### Work Photos
- **View**: Work entry creator, project crew members, foremen, PMs, admins
- **Upload**: Work entry creator, crew members, foremen, PMs, admins
- **Update/Delete**: Work entry creator, foremen, PMs, admins

### House Documents
- **View**: Project manager, project crew members, PMs, admins
- **Upload/Update/Delete**: Project manager, PMs, admins only

### User Avatars
- **View**: Public (anyone can view)
- **Upload/Update/Delete**: Owner only (except admins can manage all)

### Reports
- **View/Upload/Update**: Admins and PMs only
- **Delete**: Admins only

## Setup Instructions

### 1. Prerequisites
- Supabase project with authentication set up
- Users table with role column (admin, pm, foreman, crew, viewer, worker)
- Projects, crews, crew_members, work_entries, housing_units tables

### 2. Run the Setup SQL
Execute the SQL script in your Supabase SQL Editor:

```bash
# Copy the SQL from sql/setup-storage-buckets.sql
# Paste and run in Supabase SQL Editor
```

### 3. Verify Setup
After running the SQL, verify that:

1. All 6 buckets are created:
```sql
SELECT name, public, file_size_limit
FROM storage.buckets
WHERE name IN ('project-photos', 'work-photos', 'project-documents', 'house-documents', 'user-avatars', 'reports');
```

2. RLS is enabled:
```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'storage' AND tablename = 'objects';
```

3. Policies are created:
```sql
SELECT policyname, permissive, cmd
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects';
```

### 4. Test Access
Test that the policies work correctly:

1. Create a test user with different roles
2. Try accessing files from different buckets
3. Verify permissions work as expected

## Usage in Code

### Import the Configuration
```typescript
import { BUCKET_CONFIGS, createBucket, validateFileForBucket, generateFolderPath } from '@/lib/supabase-buckets'
```

### Validate Files
```typescript
const validation = validateFileForBucket(file, 'project-photos')
if (!validation.isValid) {
  console.error('Validation errors:', validation.errors)
}
```

### Generate Folder Paths
```typescript
const folderPath = generateFolderPath('project-photos', {
  projectId: 'abc123',
  category: 'progress',
  date: '2024-01-15'
})
// Result: "projects/abc123/progress/2024-01-15/"
```

### Upload Files
```typescript
import { uploadFile } from '@/lib/upload-utils'

const result = await uploadFile(file, {
  bucketName: 'project-photos',
  folder: folderPath,
  fileName: 'progress-image.jpg'
})
```

## Security Considerations

1. **Authentication Required**: All private buckets require valid user authentication
2. **Role-Based Access**: Access is controlled by user roles in the database
3. **File Validation**: File types and sizes are validated at both client and server level
4. **Secure Naming**: File names are generated securely to prevent conflicts
5. **Audit Trail**: All file operations should be logged for security auditing

## Troubleshooting

### Common Issues

1. **Access Denied**:
   - Check user authentication
   - Verify user role in database
   - Ensure RLS policies are enabled

2. **File Too Large**:
   - Check bucket configuration file size limits
   - Verify client-side validation

3. **Invalid File Type**:
   - Check allowed MIME types for the bucket
   - Ensure proper file type validation

4. **Bucket Not Found**:
   - Verify bucket was created successfully
   - Check bucket name spelling

### Debug Queries

Check user permissions:
```sql
SELECT id, email, role FROM users WHERE id = auth.uid();
```

Check project assignments:
```sql
SELECT p.id, p.name, pm_user_id
FROM projects p
WHERE pm_user_id = auth.uid();
```

Check crew assignments:
```sql
SELECT c.project_id, cm.user_id
FROM crews c
JOIN crew_members cm ON c.id = cm.crew_id
WHERE cm.user_id = auth.uid();
```

## Next Steps

After setting up the buckets:

1. Create API endpoints for file upload (Task #10.3)
2. Build UI components for file management
3. Implement file preview and download functionality
4. Set up file cleanup and maintenance tasks
5. Add monitoring and analytics for storage usage
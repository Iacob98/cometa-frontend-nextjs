-- Migration: Add Supabase Storage fields to documents table
-- Description: Adds file_url and file_path fields to track files in Supabase Storage
-- Date: 2025-10-30

-- Add storage path fields to documents table
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS file_path TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_documents_file_path ON documents(file_path);
CREATE INDEX IF NOT EXISTS idx_documents_project_id_active ON documents(project_id, is_active);

-- Add comment for documentation
COMMENT ON COLUMN documents.file_url IS 'Public URL from Supabase Storage (may be signed URL)';
COMMENT ON COLUMN documents.file_path IS 'Full path in Supabase Storage bucket: projects/{projectId}/{documentType}s/{filename}';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const per_page = parseInt(searchParams.get('per_page') || '20');
    const offset = (page - 1) * per_page;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Get documents from the documents table (all, no pagination here)
    const { data: documents, error: documentsError } = await supabase
      .from('documents')
      .select(`
        id,
        filename,
        original_filename,
        file_type,
        file_size,
        document_type,
        description,
        upload_date,
        uploaded_by,
        is_active,
        uploader:users!documents_uploaded_by_fkey(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('project_id', projectId)
      .eq('is_active', true)
      .order('upload_date', { ascending: false });

    // Get project plans as well
    const { data: projectPlans, error: plansError } = await supabase
      .from('project_plans')
      .select(`
        id,
        filename,
        file_path,
        file_url,
        file_size,
        plan_type,
        description,
        created_at
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (documentsError) {
      console.error('Documents query error:', documentsError);
    }

    if (plansError) {
      console.error('Project plans query error:', plansError);
    }

    // Transform documents for frontend compatibility
    const transformedDocuments = (documents || []).map(doc => ({
      id: doc.id,
      project_id: projectId,
      document_type: doc.document_type,
      file_name: doc.original_filename || doc.filename,
      file_path: `/documents/${doc.document_type}s/${doc.filename}`,
      file_size: doc.file_size,
      uploaded_at: doc.upload_date,
      uploaded_by: doc.uploader?.email || null,
      notes: doc.description || '',
      status: doc.is_active ? 'active' : 'inactive',
      uploaded_by_name: doc.uploader ? `${doc.uploader.first_name} ${doc.uploader.last_name}` : 'Unknown',
      uploader_email: doc.uploader?.email || null,
      source: 'documents'
    }));

    // Transform project plans to match document format
    const transformedPlans = (projectPlans || []).map(plan => ({
      id: plan.id,
      project_id: projectId,
      document_type: 'plan',
      file_name: plan.filename,
      file_path: `/api/project-preparation/plans/${plan.id}/download`,
      file_size: plan.file_size,
      uploaded_at: plan.created_at,
      uploaded_by: null,
      notes: plan.description || '',
      status: 'active',
      uploaded_by_name: 'User',
      uploader_email: null,
      source: 'plans',
      plan_type: plan.plan_type
    }));

    // Combine both document sources
    const allDocuments = [...transformedDocuments, ...transformedPlans]
      .sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime())
      .slice(offset, offset + per_page);

    // Get total count for pagination (documents + plans)
    const { count: documentsCount, error: countError } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .eq('is_active', true);

    const { count: plansCount, error: plansCountError } = await supabase
      .from('project_plans')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId);

    if (countError) {
      console.error('Documents count query error:', countError);
    }

    if (plansCountError) {
      console.error('Plans count query error:', plansCountError);
    }

    const totalCount = (documentsCount || 0) + (plansCount || 0);

    // Calculate summary counts from combined data
    const documentCounts = {
      document_count: totalCount,
      active_count: allDocuments.filter(d => d.status === 'active').length,
      pending_count: allDocuments.filter(d => d.status === 'pending').length,
      plans_count: allDocuments.filter(d => d.document_type === 'plan').length,
      permits_count: allDocuments.filter(d => d.document_type === 'permit').length,
      reports_count: allDocuments.filter(d => d.document_type === 'report').length,
      photos_count: allDocuments.filter(d => d.document_type === 'photo').length
    };

    // Create categories for frontend compatibility
    const categories = [
      {
        id: 'plans',
        name: 'Plans',
        count: documentCounts.plans_count,
        color: '#3b82f6'
      },
      {
        id: 'permits',
        name: 'Permits',
        count: documentCounts.permits_count,
        color: '#22c55e'
      },
      {
        id: 'reports',
        name: 'Reports',
        count: documentCounts.reports_count,
        color: '#f59e0b'
      },
      {
        id: 'photos',
        name: 'Photos',
        count: documentCounts.photos_count,
        color: '#8b5cf6'
      },
      {
        id: 'total',
        name: 'Total',
        count: documentCounts.document_count,
        color: '#6b7280'
      }
    ];

    return NextResponse.json({
      documents: allDocuments,
      summary: documentCounts,
      categories: categories,
      pagination: {
        page,
        per_page,
        total: totalCount,
        total_pages: Math.ceil(totalCount / per_page)
      }
    });
  } catch (error) {
    console.error('Project documents API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const { document_type, file_name, file_size, uploaded_by, notes } = body;

    if (!document_type || !file_name) {
      return NextResponse.json(
        { error: 'Document type and file name are required' },
        { status: 400 }
      );
    }

    // Create document in database
    const { data: newDocument, error: insertError } = await supabase
      .from('documents')
      .insert({
        project_id: projectId,
        filename: file_name.replace(/[^a-zA-Z0-9.-]/g, '_'), // Sanitize filename
        original_filename: file_name,
        file_type: file_name.split('.').pop()?.toLowerCase() || 'unknown',
        file_size: file_size || 0,
        document_type: document_type,
        description: notes || null,
        uploaded_by: uploaded_by || null,
        is_active: true
      })
      .select(`
        id,
        filename,
        original_filename,
        file_type,
        file_size,
        document_type,
        description,
        upload_date,
        uploaded_by,
        is_active
      `)
      .single();

    if (insertError) {
      console.error('Document creation error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create document in database' },
        { status: 500 }
      );
    }

    // Transform for frontend compatibility
    const transformedDocument = {
      id: newDocument.id,
      project_id: projectId,
      document_type: newDocument.document_type,
      file_name: newDocument.original_filename,
      file_path: `/documents/${newDocument.document_type}s/${newDocument.filename}`,
      file_size: newDocument.file_size,
      uploaded_at: newDocument.upload_date,
      uploaded_by: uploaded_by,
      notes: newDocument.description || '',
      status: newDocument.is_active ? 'active' : 'inactive',
      uploaded_by_name: 'Current User',
      uploader_email: uploaded_by
    };

    return NextResponse.json({
      message: 'Document uploaded successfully',
      document: transformedDocument
    }, { status: 201 });
  } catch (error) {
    console.error('Project documents POST error:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Validation schema for updates (all fields optional)
const UpdateDocumentSchema = z.object({
  project_id: z.string().uuid("Invalid project ID").optional(),
  filename: z.string().min(1).optional(),
  original_filename: z.string().optional(),
  file_type: z.string().optional(),
  file_size: z.number().positive().optional(),
  document_type: z.string().optional(),
  category_id: z.string().uuid("Invalid category ID").optional(),
  description: z.string().optional(),
  uploaded_by: z.string().uuid("Invalid user ID").optional(),
  is_active: z.boolean().optional()
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    const { data: document, error } = await supabase
      .from("documents")
      .select(
        `
        id,
        project_id,
        filename,
        original_filename,
        file_type,
        file_size,
        document_type,
        category_id,
        description,
        upload_date,
        uploaded_by,
        is_active,
        created_at,
        updated_at,
        projects(id, name, city),
        document_categories(id, code, name_de, name_ru, name_en),
        users:users!documents_uploaded_by_fkey(id, first_name, last_name, email),
        project_documents(id, note, created_at),
        house_documents(id, house_id, houses(id, address, house_number))
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: "Document not found" },
          { status: 404 }
        );
      }
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch document from database" },
        { status: 500 }
      );
    }

    // Enhanced response data
    const project = Array.isArray(document.projects) ? document.projects[0] : document.projects;
    const category = Array.isArray(document.document_categories) ? document.document_categories[0] : document.document_categories;
    const uploader = Array.isArray(document.users) ? document.users[0] : document.users;

    const enhancedDocument = {
      ...document,
      project_name: project?.name || "No Project",
      project_city: project?.city || "Unknown City",
      category_name: category?.name_en || category?.name_de || "Uncategorized",
      category_code: category?.code || null,
      uploader_name: uploader ? `${uploader.first_name} ${uploader.last_name}` : "Unknown User",
      uploader_email: uploader?.email || null,
      file_size_mb: document.file_size ? (document.file_size / (1024 * 1024)).toFixed(2) : null,
      upload_date_formatted: document.upload_date ? new Date(document.upload_date).toLocaleDateString() : null,
      project_documents_count: document.project_documents?.length || 0,
      house_documents_count: document.house_documents?.length || 0
    };

    return NextResponse.json(enhancedDocument);
  } catch (error) {
    console.error("Document GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    // Validate request body
    const validationResult = UpdateDocumentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Check if document exists
    const { data: existingDoc, error: checkError } = await supabase
      .from("documents")
      .select("id, project_id, filename, is_active")
      .eq("id", id)
      .single();

    if (checkError || !existingDoc) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Verify project exists if being updated
    if (validatedData.project_id && validatedData.project_id !== existingDoc.project_id) {
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("id, name")
        .eq("id", validatedData.project_id)
        .single();

      if (projectError || !projectData) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }
    }

    // Verify category exists if being updated
    if (validatedData.category_id) {
      const { data: category, error: categoryError } = await supabase
        .from("document_categories")
        .select("id, code")
        .eq("id", validatedData.category_id)
        .single();

      if (categoryError || !category) {
        return NextResponse.json(
          { error: "Document category not found" },
          { status: 404 }
        );
      }
    }

    // Verify user exists if being updated
    if (validatedData.uploaded_by) {
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("id, first_name, last_name")
        .eq("id", validatedData.uploaded_by)
        .single();

      if (userError || !user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }
    }

    // Check for duplicate filename if being updated
    const updatedProjectId = validatedData.project_id || existingDoc.project_id;
    const updatedFilename = validatedData.filename || existingDoc.filename;

    if (updatedProjectId && updatedFilename &&
        (validatedData.project_id !== existingDoc.project_id || validatedData.filename !== existingDoc.filename)) {
      const { data: duplicateDoc, error: duplicateError } = await supabase
        .from("documents")
        .select("id")
        .eq("project_id", updatedProjectId)
        .eq("filename", updatedFilename)
        .eq("is_active", true)
        .neq("id", id)
        .maybeSingle();

      if (duplicateError) {
        console.error("Duplicate check error:", duplicateError);
        return NextResponse.json(
          { error: "Failed to check for duplicate document" },
          { status: 500 }
        );
      }

      if (duplicateDoc) {
        return NextResponse.json(
          { error: "Document with this filename already exists in the project" },
          { status: 409 }
        );
      }
    }

    // Build update data (only include provided fields)
    const updateData: any = {};
    const allowedFields = [
      'project_id', 'filename', 'original_filename', 'file_type', 'file_size',
      'document_type', 'category_id', 'description', 'uploaded_by', 'is_active'
    ];

    for (const field of allowedFields) {
      if (validatedData[field as keyof typeof validatedData] !== undefined) {
        updateData[field] = validatedData[field as keyof typeof validatedData];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Add updated timestamp
    updateData.updated_at = new Date().toISOString();

    // Update document
    const { data: updatedDoc, error } = await supabase
      .from("documents")
      .update(updateData)
      .eq("id", id)
      .select(
        `
        id,
        project_id,
        filename,
        original_filename,
        file_type,
        file_size,
        document_type,
        category_id,
        description,
        upload_date,
        uploaded_by,
        is_active,
        created_at,
        updated_at,
        projects(id, name, city),
        document_categories(id, code, name_de, name_ru, name_en),
        users:users!documents_uploaded_by_fkey(id, first_name, last_name, email)
      `
      )
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json(
        { error: "Failed to update document" },
        { status: 500 }
      );
    }

    // Enhanced response data
    const project = Array.isArray(updatedDoc.projects) ? updatedDoc.projects[0] : updatedDoc.projects;
    const category = Array.isArray(updatedDoc.document_categories) ? updatedDoc.document_categories[0] : updatedDoc.document_categories;
    const uploader = Array.isArray(updatedDoc.users) ? updatedDoc.users[0] : updatedDoc.users;

    const enhancedDocument = {
      ...updatedDoc,
      project_name: project?.name || "No Project",
      project_city: project?.city || "Unknown City",
      category_name: category?.name_en || category?.name_de || "Uncategorized",
      category_code: category?.code || null,
      uploader_name: uploader ? `${uploader.first_name} ${uploader.last_name}` : "Unknown User",
      uploader_email: uploader?.email || null,
      file_size_mb: updatedDoc.file_size ? (updatedDoc.file_size / (1024 * 1024)).toFixed(2) : null
    };

    return NextResponse.json({
      message: "Document updated successfully",
      document: enhancedDocument
    });
  } catch (error) {
    console.error("Document PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    // Check if document exists
    const { data: existingDoc, error: checkError } = await supabase
      .from("documents")
      .select("id, filename, document_type, is_active")
      .eq("id", id)
      .single();

    if (checkError || !existingDoc) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Check if document has dependencies
    const { count: projectDocCount, error: projectDocError } = await supabase
      .from("project_documents")
      .select("*", { count: "exact", head: true })
      .eq("document_id", id);

    if (projectDocError) {
      console.error("Project documents check error:", projectDocError);
      return NextResponse.json(
        { error: "Failed to check document dependencies" },
        { status: 500 }
      );
    }

    const { count: houseDocCount, error: houseDocError } = await supabase
      .from("house_documents")
      .select("*", { count: "exact", head: true })
      .eq("document_id", id);

    if (houseDocError) {
      console.error("House documents check error:", houseDocError);
      return NextResponse.json(
        { error: "Failed to check document dependencies" },
        { status: 500 }
      );
    }

    const totalDependencies = (projectDocCount || 0) + (houseDocCount || 0);

    if (totalDependencies > 0) {
      // Soft delete - mark as inactive instead of hard delete
      const { error: softDeleteError } = await supabase
        .from("documents")
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (softDeleteError) {
        console.error("Supabase soft delete error:", softDeleteError);
        return NextResponse.json(
          { error: "Failed to deactivate document" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: "Document deactivated due to dependencies",
        details: `Document has ${totalDependencies} associated record(s). It has been marked as inactive instead of deleted.`,
        deleted_document: {
          id: existingDoc.id,
          filename: existingDoc.filename,
          document_type: existingDoc.document_type,
          status: "deactivated"
        }
      });
    } else {
      // Hard delete - no dependencies
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Supabase delete error:", error);
        return NextResponse.json(
          { error: "Failed to delete document" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: "Document deleted successfully",
        deleted_document: {
          id: existingDoc.id,
          filename: existingDoc.filename,
          document_type: existingDoc.document_type,
          status: "deleted"
        }
      });
    }
  } catch (error) {
    console.error("Document DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
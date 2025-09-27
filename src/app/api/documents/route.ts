import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Validation schema for document metadata
const DocumentSchema = z.object({
  project_id: z.string().uuid("Invalid project ID").optional(),
  filename: z.string().min(1, "Filename is required"),
  original_filename: z.string().optional(),
  file_type: z.string().optional(),
  file_size: z.number().positive().optional(),
  document_type: z.string().default('general'),
  category_id: z.string().uuid("Invalid category ID").optional(),
  description: z.string().optional(),
  uploaded_by: z.string().uuid("Invalid user ID").optional(),
  is_active: z.boolean().default(true)
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const per_page = parseInt(searchParams.get("per_page") || "20");
    const offset = (page - 1) * per_page;
    const project_id = searchParams.get("project_id");
    const document_type = searchParams.get("document_type");
    const category_id = searchParams.get("category_id");
    const file_type = searchParams.get("file_type");
    const uploaded_by = searchParams.get("uploaded_by");
    const search = searchParams.get("search");
    const is_active = searchParams.get("is_active");
    const date_from = searchParams.get("date_from");
    const date_to = searchParams.get("date_to");

    let query = supabase
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
        users:users!documents_uploaded_by_fkey(id, first_name, last_name, email)
      `,
        { count: "exact" }
      )
      .order("upload_date", { ascending: false })
      .range(offset, offset + per_page - 1);

    // Apply filters
    if (project_id) {
      query = query.eq("project_id", project_id);
    }

    if (document_type) {
      query = query.eq("document_type", document_type);
    }

    if (category_id) {
      query = query.eq("category_id", category_id);
    }

    if (file_type) {
      query = query.eq("file_type", file_type);
    }

    if (uploaded_by) {
      query = query.eq("uploaded_by", uploaded_by);
    }

    if (is_active !== null) {
      query = query.eq("is_active", is_active === "true");
    }

    if (date_from) {
      query = query.gte("upload_date", date_from);
    }

    if (date_to) {
      query = query.lte("upload_date", date_to);
    }

    if (search) {
      query = query.or(
        `filename.ilike.%${search}%,original_filename.ilike.%${search}%,description.ilike.%${search}%,document_type.ilike.%${search}%`
      );
    }

    const { data: documents, error, count } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch documents from database" },
        { status: 500 }
      );
    }

    // Enhance data with calculated fields
    const enhancedDocuments = (documents || []).map(doc => {
      const project = Array.isArray(doc.projects) ? doc.projects[0] : doc.projects;
      const category = Array.isArray(doc.document_categories) ? doc.document_categories[0] : doc.document_categories;
      const uploader = Array.isArray(doc.users) ? doc.users[0] : doc.users;

      return {
        ...doc,
        project_name: project?.name || "No Project",
        project_city: project?.city || "Unknown City",
        category_name: category?.name_en || category?.name_de || "Uncategorized",
        category_code: category?.code || null,
        uploader_name: uploader ? `${uploader.first_name} ${uploader.last_name}` : "Unknown User",
        uploader_email: uploader?.email || null,
        file_size_mb: doc.file_size ? (doc.file_size / (1024 * 1024)).toFixed(2) : null,
        upload_date_formatted: doc.upload_date ? new Date(doc.upload_date).toLocaleDateString() : null
      };
    });

    // Calculate summary statistics
    const documentTypeCounts = enhancedDocuments.reduce((acc, doc) => {
      acc[doc.document_type] = (acc[doc.document_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const fileTypeCounts = enhancedDocuments.reduce((acc, doc) => {
      if (doc.file_type) {
        acc[doc.file_type] = (acc[doc.file_type] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const totalSize = enhancedDocuments.reduce((sum, doc) => sum + (doc.file_size || 0), 0);

    return NextResponse.json({
      items: enhancedDocuments,
      total: count || 0,
      page,
      per_page,
      total_pages: Math.ceil((count || 0) / per_page),
      summary: {
        document_type_counts: documentTypeCounts,
        file_type_counts: fileTypeCounts,
        total_size_bytes: totalSize,
        total_size_mb: (totalSize / (1024 * 1024)).toFixed(2),
        active_documents: enhancedDocuments.filter(doc => doc.is_active).length,
        inactive_documents: enhancedDocuments.filter(doc => !doc.is_active).length
      }
    });
  } catch (error) {
    console.error("Documents API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body with Zod
    const validationResult = DocumentSchema.safeParse(body);
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

    // Verify project exists if project_id is provided
    if (validatedData.project_id) {
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("id, name")
        .eq("id", validatedData.project_id)
        .single();

      if (projectError || !project) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }
    }

    // Verify category exists if category_id is provided
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

    // Verify user exists if uploaded_by is provided
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

    // Check for duplicate filename in the same project (if both are provided)
    if (validatedData.project_id && validatedData.filename) {
      const { data: existingDoc, error: duplicateError } = await supabase
        .from("documents")
        .select("id")
        .eq("project_id", validatedData.project_id)
        .eq("filename", validatedData.filename)
        .eq("is_active", true)
        .maybeSingle();

      if (duplicateError) {
        console.error("Duplicate check error:", duplicateError);
        return NextResponse.json(
          { error: "Failed to check for duplicate document" },
          { status: 500 }
        );
      }

      if (existingDoc) {
        return NextResponse.json(
          { error: "Document with this filename already exists in the project" },
          { status: 409 }
        );
      }
    }

    // Create document record in Supabase
    const documentData = {
      ...validatedData,
      upload_date: new Date().toISOString()
    };

    const { data: document, error } = await supabase
      .from("documents")
      .insert([documentData])
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
      console.error("Supabase error creating document:", error);
      return NextResponse.json(
        { error: "Failed to create document record in database" },
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
      file_size_mb: document.file_size ? (document.file_size / (1024 * 1024)).toFixed(2) : null
    };

    return NextResponse.json({
      message: "Document created successfully",
      document: enhancedDocument
    }, { status: 201 });

  } catch (error) {
    console.error("Create document error:", error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
}
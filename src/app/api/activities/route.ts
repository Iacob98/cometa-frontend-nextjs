import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse pagination parameters
    const page = parseInt(searchParams.get("page") || "1");
    const per_page = parseInt(searchParams.get("per_page") || "50");
    const offset = (page - 1) * per_page;

    // Parse filtering parameters
    const activity_type = searchParams.get("activity_type");
    const user_id = searchParams.get("user_id");
    const project_id = searchParams.get("project_id");
    const object_type = searchParams.get("object_type");
    const search = searchParams.get("search");

    // Build the main query with related data - FIXED: Use activity_logs table
    let query = supabase
      .from("activity_logs")
      .select(
        `
        id,
        user_id,
        project_id,
        action,
        entity_type,
        entity_id,
        details,
        ip_address,
        user_agent,
        created_at,
        user:users(
          id,
          first_name,
          last_name,
          email,
          role
        ),
        project:projects(
          id,
          name,
          status
        )
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + per_page - 1);

    // Apply filters - FIXED: Use correct field names
    if (activity_type) {
      query = query.eq("action", activity_type);
    }

    if (user_id) {
      query = query.eq("user_id", user_id);
    }

    if (project_id) {
      query = query.eq("project_id", project_id);
    }

    if (object_type) {
      // FIXED: object_type → entity_type
      query = query.eq("entity_type", object_type);
    }

    if (search) {
      // FIXED: Search in action field since description doesn't exist
      query = query.ilike("action", `%${search}%`);
    }

    const { data: activities, error, count } = await query;

    if (error) {
      console.error("Supabase activities query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch activities" },
        { status: 500 }
      );
    }

    // Calculate pagination info
    const total_pages = Math.ceil((count || 0) / per_page);

    // Format response to match expected structure
    const response = {
      activities: activities || [],
      total: count || 0,
      page,
      per_page,
      total_pages,
      has_next: page < total_pages,
      has_prev: page > 1,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Activities API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // FIXED: Validate required fields - use action field from activity_logs
    if (!body.user_id || !body.action) {
      return NextResponse.json(
        { error: "user_id and action are required" },
        { status: 400 }
      );
    }

    // Validate activity_type against allowed values
    const allowedActivityTypes = [
      "project",
      "work_entry",
      "material",
      "equipment",
      "user",
      "document",
      "auth",
    ];
    if (!allowedActivityTypes.includes(body.activity_type)) {
      return NextResponse.json(
        {
          error:
            "Invalid activity_type. Must be one of: " +
            allowedActivityTypes.join(", "),
        },
        { status: 400 }
      );
    }

    // Extract client IP and User-Agent
    const forwarded = request.headers.get("x-forwarded-for");
    const ip_address = forwarded
      ? forwarded.split(",")[0]
      : request.headers.get("x-real-ip") || null;
    const user_agent = request.headers.get("user-agent") || null;

    // FIXED: Create activity data object with correct field mappings for activity_logs
    const activityData = {
      user_id: body.user_id,
      project_id: body.project_id || null,
      action: body.action,
      entity_type: body.object_type || body.entity_type || null, // FIXED: object_type → entity_type
      entity_id: body.object_id || body.entity_id || null, // FIXED: object_id → entity_id
      details: body.details || body.metadata || null, // FIXED: use details field from schema
      ip_address,
      user_agent,
    };

    // FIXED: Insert new activity into activity_logs table
    const { data: activity, error } = await supabase
      .from("activity_logs")
      .insert([activityData])
      .select(
        `
        id,
        user_id,
        project_id,
        action,
        entity_type,
        entity_id,
        details,
        ip_address,
        user_agent,
        created_at,
        user:users(
          id,
          first_name,
          last_name,
          email,
          role
        ),
        project:projects(
          id,
          name,
          status
        )
      `
      )
      .single();

    if (error) {
      console.error("Supabase activity creation error:", error);
      return NextResponse.json(
        { error: "Failed to create activity log" },
        { status: 500 }
      );
    }

    // Return the created activity log
    return NextResponse.json(
      {
        message: "Activity log created successfully",
        activity,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Activities POST API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

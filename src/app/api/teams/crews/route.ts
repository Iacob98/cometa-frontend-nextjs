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
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // FIXED: Build the main query with related data using correct field names (no project_id in crews)
    let query = supabase
      .from("crews")
      .select(
        `
        id,
        name,
        leader_user_id,
        status,
        description,
        leader:users!crews_leader_user_id_fkey(
          id,
          first_name,
          last_name,
          email,
          role
        ),
        crew_members(
          crew_id,
          user_id,
          role,
          joined_at,
          left_at,
          is_active,
          user:users(
            id,
            first_name,
            last_name,
            email,
            role
          )
        )
      `,
        { count: "exact" }
      )
      .eq("crew_members.is_active", true)
      .order("name", { ascending: true })
      .range(offset, offset + per_page - 1);

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: crews, error, count } = await query;

    if (error) {
      console.error("Supabase crews query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch crews" },
        { status: 500 }
      );
    }

    // Calculate pagination info
    const total_pages = Math.ceil((count || 0) / per_page);

    // Format response to match expected structure
    const response = {
      crews: crews || [],
      pagination: {
        total: count || 0,
        page,
        per_page,
        total_pages,
        has_next: page < total_pages,
        has_prev: page > 1,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Teams/crews API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: "Crew name is required" },
        { status: 400 }
      );
    }

    // FIXED: Create crew data object with correct field names (no project_id field)
    const crewData = {
      name: body.name,
      description: body.description || null,
      status: body.status || "active",
      leader_user_id: body.leader_user_id || body.foreman_user_id || null,
    };

    // FIXED: Insert new crew with correct field references (no project_id field)
    const { data: crew, error: crewError } = await supabase
      .from("crews")
      .insert([crewData])
      .select(
        `
        id,
        name,
        leader_user_id,
        status,
        description,
        leader:users!crews_leader_user_id_fkey(
          id,
          first_name,
          last_name,
          email,
          role
        )
      `
      )
      .single();

    if (crewError) {
      console.error("Supabase crew creation error:", crewError);
      return NextResponse.json(
        { error: "Failed to create crew" },
        { status: 500 }
      );
    }

    // FIXED: If initial members are provided, add them with correct field structure
    if (body.members && Array.isArray(body.members) && crew) {
      const memberData = body.members.map((member: any) => ({
        crew_id: crew.id,
        user_id: member.user_id,
        role: member.role || "member",
        is_active: true
      }));

      const { error: membersError } = await supabase
        .from("crew_members")
        .insert(memberData);

      if (membersError) {
        console.error("Supabase crew members creation error:", membersError);
        // Don't fail the whole operation, just log the error
      }
    }

    // Return the created crew with success status
    return NextResponse.json(
      {
        message: "Crew created successfully",
        crew,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Teams/crews POST API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

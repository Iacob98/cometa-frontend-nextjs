import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const project_id = searchParams.get("project_id");

    if (!project_id) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Fetch cabinets from database
    const { data: cabinets, error } = await supabase
      .from('cabinets')
      .select(`
        id,
        project_id,
        code,
        name,
        address,
        geom_point,
        created_at,
        updated_at
      `)
      .eq('project_id', project_id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase cabinets query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch cabinets from database' },
        { status: 500 }
      );
    }

    // Transform data for frontend compatibility
    const transformedCabinets = (cabinets || []).map(cabinet => ({
      id: cabinet.id,
      code: cabinet.code || '',
      name: cabinet.name || '',
      address: cabinet.address || '',
      notes: '', // Add notes field if needed
      segment_count: 0, // Will be calculated separately if needed
      total_length: 0, // Will be calculated separately if needed
      status: 'active' // Default status
    }));

    return NextResponse.json(transformedCabinets);
  } catch (error) {
    console.error("Zone layout cabinets API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cabinets" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { project_id, code, name, address, notes } = body;

    if (!project_id || !code || !name) {
      return NextResponse.json(
        { error: "Project ID, code, and name are required" },
        { status: 400 }
      );
    }

    // Create cabinet in database
    const { data: newCabinet, error } = await supabase
      .from('cabinets')
      .insert({
        project_id,
        code,
        name,
        address: address || null,
        geom_point: null // Can be set later when coordinates are available
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase cabinet creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create cabinet in database' },
        { status: 500 }
      );
    }

    const response = {
      success: true,
      cabinet_id: newCabinet.id,
      message: "Cabinet created successfully",
      cabinet: {
        id: newCabinet.id,
        code: newCabinet.code,
        name: newCabinet.name,
        address: newCabinet.address,
        created_at: newCabinet.created_at
      }
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Zone layout cabinets POST error:", error);
    return NextResponse.json(
      { error: "Failed to create cabinet" },
      { status: 500 }
    );
  }
}

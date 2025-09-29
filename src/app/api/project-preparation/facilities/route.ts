import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CreateFacilitySchema = z.object({
  project_id: z.string().uuid(),
  type: z.string().min(1, "Type is required"),
  supplier_id: z.string().uuid().optional(),
  rent_daily_eur: z.number().positive("Rent must be positive"),
  service_freq: z.string().optional(),
  status: z.enum(['planned', 'active', 'completed']).default('planned'),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  location_text: z.string().optional(),
});

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

    // Fetch facilities from real database
    console.log('Fetching facilities from database for project:', project_id);

    const { data: facilities, error } = await supabase
      .from('facilities')
      .select(`
        id,
        project_id,
        supplier_id,
        type,
        rent_daily_eur,
        service_freq,
        status,
        start_date,
        end_date,
        location_text,
        created_at,
        updated_at,
        suppliers!supplier_id (
          id,
          name
        )
      `)
      .eq('project_id', project_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error fetching facilities:', error);
      // Return empty array if table doesn't exist yet
      return NextResponse.json([]);
    }

    // Transform the data to include supplier_name for easier frontend consumption
    const transformedFacilities = (facilities || []).map(facility => ({
      ...facility,
      supplier_name: facility.suppliers?.name || null,
      suppliers: undefined // Remove nested object to clean up response
    }));

    console.log(`Found ${transformedFacilities?.length || 0} facilities for project ${project_id}`);
    return NextResponse.json(transformedFacilities);
  } catch (error) {
    console.error("Facilities API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch facilities" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = CreateFacilitySchema.safeParse(body);
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

    // Verify project exists
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name')
      .eq('id', validatedData.project_id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Create facility in real database
    console.log('Creating facility in database:', validatedData);

    const { data: facility, error } = await supabase
      .from('facilities')
      .insert([{
        project_id: validatedData.project_id,
        supplier_id: validatedData.supplier_id,
        type: validatedData.type,
        rent_daily_eur: validatedData.rent_daily_eur,
        service_freq: validatedData.service_freq,
        status: validatedData.status,
        start_date: validatedData.start_date,
        end_date: validatedData.end_date,
        location_text: validatedData.location_text
      }])
      .select(`
        id,
        project_id,
        supplier_id,
        type,
        rent_daily_eur,
        service_freq,
        status,
        start_date,
        end_date,
        location_text,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      console.error('Database error creating facility:', error);

      // If table doesn't exist, show helpful message
      if (error.message?.includes("does not exist") || error.code === 'PGRST204') {
        return NextResponse.json({
          error: "Facilities table needs to be created",
          message: "Please run the SQL migration in Supabase Dashboard",
          sql_file: "./database/facilities-migration-with-drop.sql",
          dashboard_url: `https://supabase.com/dashboard/project/${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}/sql`
        }, { status: 503 });
      }

      return NextResponse.json(
        { error: 'Failed to create facility in database', details: error.message },
        { status: 500 }
      );
    }

    console.log('Facility created successfully:', facility);

    const response = {
      success: true,
      message: "Facility created successfully",
      facility_id: facility.id,
      facility: facility
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Facilities POST error:", error);
    return NextResponse.json(
      { error: "Failed to create facility" },
      { status: 500 }
    );
  }
}

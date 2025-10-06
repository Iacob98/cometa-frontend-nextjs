import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CreateHousingUnitSchema = z.object({
  project_id: z.string().uuid(),
  address: z.string().min(1, "Address is required"),
  rooms_total: z.number().int().positive("Number of rooms must be positive"),
  beds_total: z.number().int().positive("Number of beds must be positive"),
  occupied_beds: z.number().int().min(0, "Occupied beds cannot be negative").optional().default(0),
  rent_daily_eur: z.number().positive("Daily rent must be positive"),
  status: z.enum(['available', 'occupied', 'checked_out', 'maintenance']).default('available'),
  advance_payment: z.number().optional(),
  check_in_date: z.string().optional(),
  check_out_date: z.string().optional(),
  owner_first_name: z.string().optional(),
  owner_last_name: z.string().optional(),
  owner_phone: z.string().optional(),
}).refine((data) => data.occupied_beds <= data.beds_total, {
  message: "Occupied beds cannot exceed total beds",
  path: ["occupied_beds"],
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

    // Fetch housing units from database - using new rental housing columns
    const { data: housingUnits, error } = await supabase
      .from('housing_units')
      .select(`
        id,
        project_id,
        address,
        rooms_total,
        beds_total,
        occupied_beds,
        rent_daily_eur,
        advance_payment,
        check_in_date,
        check_out_date,
        status,
        owner_first_name,
        owner_last_name,
        owner_phone,
        created_at,
        updated_at
      `)
      .eq('project_id', project_id)
      .not('address', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error fetching housing units:', error);
      return NextResponse.json(
        { error: 'Failed to fetch housing units from database' },
        { status: 500 }
      );
    }

    // Return housing units directly - no transformation needed with new columns
    return NextResponse.json(housingUnits || []);
  } catch (error) {
    console.error("Project preparation housing API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch housing units" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = CreateHousingUnitSchema.safeParse(body);
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

    // Use new rental housing columns directly
    const insertData = {
      project_id: validatedData.project_id,
      address: validatedData.address,
      rooms_total: validatedData.rooms_total,
      beds_total: validatedData.beds_total,
      occupied_beds: validatedData.occupied_beds || 0,
      rent_daily_eur: validatedData.rent_daily_eur,
      status: validatedData.status,
      advance_payment: validatedData.advance_payment,
      check_in_date: validatedData.check_in_date,
      check_out_date: validatedData.check_out_date,
      owner_first_name: validatedData.owner_first_name,
      owner_last_name: validatedData.owner_last_name,
      owner_phone: validatedData.owner_phone,
    };

    // Create housing unit in database
    const { data: housingUnit, error } = await supabase
      .from('housing_units')
      .insert([insertData])
      .select(`
        id,
        project_id,
        address,
        rooms_total,
        beds_total,
        occupied_beds,
        rent_daily_eur,
        advance_payment,
        check_in_date,
        check_out_date,
        status,
        owner_first_name,
        owner_last_name,
        owner_phone,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      console.error('Database error creating housing unit:', error);
      return NextResponse.json(
        { error: 'Failed to create housing unit in database' },
        { status: 500 }
      );
    }

    // Return housing unit directly - no transformation needed with new columns
    const response = {
      success: true,
      message: "Housing unit created successfully",
      housing_unit_id: housingUnit.id,
      housing_unit: housingUnit
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Project preparation housing POST error:", error);
    return NextResponse.json(
      { error: "Failed to create housing unit" },
      { status: 500 }
    );
  }
}

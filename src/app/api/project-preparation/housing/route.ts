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
  rent_daily_eur: z.number().positive("Daily rent must be positive"),
  status: z.enum(['available', 'occupied', 'maintenance']).default('available'),
  advance_payment: z.number().optional(),
  check_in_date: z.string().optional(),
  check_out_date: z.string().optional(),
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

    // Fetch housing units from database - mapping from existing schema
    const { data: housingUnits, error } = await supabase
      .from('housing_units')
      .select(`
        id,
        project_id,
        house_id,
        unit_number,
        unit_type,
        floor,
        room_count,
        area_sqm,
        contact_person,
        contact_phone,
        access_instructions,
        installation_notes,
        status,
        created_at,
        updated_at,
        houses(id, street, city, house_number, postal_code)
      `)
      .eq('project_id', project_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error fetching housing units:', error);
      return NextResponse.json(
        { error: 'Failed to fetch housing units from database' },
        { status: 500 }
      );
    }

    // Transform data to match our expected format
    const transformedUnits = (housingUnits || []).map(unit => {
      let additionalData = {};
      try {
        additionalData = JSON.parse(unit.installation_notes || '{}');
      } catch (e) {
        // ignore parsing errors
      }

      const houseInfo = Array.isArray(unit.houses) ? unit.houses[0] : unit.houses;
      const addressParts = [
        houseInfo?.street,
        houseInfo?.house_number,
        houseInfo?.city,
        houseInfo?.postal_code
      ].filter(Boolean);

      return {
        id: unit.id,
        project_id: unit.project_id,
        address: additionalData.address || (addressParts.length > 0 ? addressParts.join(', ') : unit.unit_number || 'N/A'),
        rooms_total: unit.room_count || 0,
        beds_total: additionalData.beds_total || (unit.area_sqm ? Math.floor(unit.area_sqm / 10) : 0),
        rent_daily_eur: additionalData.rent_daily_eur || 0,
        status: unit.status === 'completed' ? 'available' :
                unit.status === 'in_progress' ? 'occupied' : 'available',
        advance_payment: additionalData.advance_payment,
        check_in_date: additionalData.check_in_date,
        check_out_date: additionalData.check_out_date,
        created_at: unit.created_at,
        updated_at: unit.updated_at
      };
    });

    return NextResponse.json(transformedUnits);
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

    // Map simplified data to existing schema
    const insertData = {
      project_id: validatedData.project_id,
      unit_number: `Unit-${Date.now()}`, // Generate a unique unit number
      unit_type: 'apartment', // default type
      room_count: validatedData.rooms_total,
      area_sqm: validatedData.beds_total * 10, // rough estimate: beds * 10 sqm
      status: validatedData.status === 'available' ? 'pending' :
              validatedData.status === 'occupied' ? 'in_progress' : 'pending',
      // Store additional fields as notes for now
      installation_notes: JSON.stringify({
        address: validatedData.address,
        rent_daily_eur: validatedData.rent_daily_eur,
        beds_total: validatedData.beds_total,
        advance_payment: validatedData.advance_payment,
        check_in_date: validatedData.check_in_date,
        check_out_date: validatedData.check_out_date
      })
    };

    // Create housing unit in database
    const { data: housingUnit, error } = await supabase
      .from('housing_units')
      .insert([insertData])
      .select(`
        id,
        project_id,
        unit_number,
        room_count,
        area_sqm,
        status,
        installation_notes
      `)
      .single();

    if (error) {
      console.error('Database error creating housing unit:', error);
      return NextResponse.json(
        { error: 'Failed to create housing unit in database' },
        { status: 500 }
      );
    }

    // Transform response to match expected format
    let additionalData = {};
    try {
      additionalData = JSON.parse(housingUnit.installation_notes || '{}');
    } catch (e) {
      // ignore parsing errors
    }

    const transformedUnit = {
      id: housingUnit.id,
      project_id: housingUnit.project_id,
      address: additionalData.address || housingUnit.unit_number || 'N/A',
      rooms_total: housingUnit.room_count || 0,
      beds_total: additionalData.beds_total || Math.floor((housingUnit.area_sqm || 0) / 10),
      rent_daily_eur: additionalData.rent_daily_eur || 0,
      status: housingUnit.status === 'pending' ? 'available' :
              housingUnit.status === 'in_progress' ? 'occupied' : 'available',
      advance_payment: additionalData.advance_payment,
      check_in_date: additionalData.check_in_date,
      check_out_date: additionalData.check_out_date
    };

    const response = {
      success: true,
      message: "Housing unit created successfully",
      housing_unit_id: housingUnit.id,
      housing_unit: transformedUnit
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

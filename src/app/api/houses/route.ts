import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const project_id = searchParams.get('project_id');
    const page = parseInt(searchParams.get('page') || '1');
    const per_page = parseInt(searchParams.get('per_page') || '50');
    const offset = (page - 1) * per_page;

    let query = supabase
      .from('houses')
      .select(`
        id,
        project_id,
        cabinet_id,
        house_number,
        street,
        city,
        postal_code,
        latitude,
        longitude,
        apartment_count,
        floor_count,
        connection_type,
        method,
        house_type,
        status,
        planned_connection_date,
        actual_connection_date,
        contact_email,
        owner_first_name,
        owner_last_name,
        owner_phone,
        notes,
        created_at,
        updated_at,
        project:projects(
          id,
          name
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + per_page - 1);

    if (project_id) {
      query = query.eq('project_id', project_id);
    }

    const { data: houses, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch houses' },
        { status: 500 }
      );
    }

    // Transform data to match frontend interface
    const transformedHouses = (houses || []).map((house: any) => ({
      ...house,
      address: [house.street, house.city, house.postal_code].filter(Boolean).join(', '),
      coordinates_lat: house.latitude,
      coordinates_lng: house.longitude,
      contact_name: [house.owner_first_name, house.owner_last_name].filter(Boolean).join(' '),
      contact_phone: house.owner_phone,
    }));

    return NextResponse.json({
      items: transformedHouses,
      total: count || 0,
      page,
      per_page,
      total_pages: Math.ceil((count || 0) / per_page)
    });
  } catch (error) {
    console.error('Houses API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      project_id,
      cabinet_id,
      address,
      house_number,
      apartment_count,
      floor_count,
      connection_type,
      method,
      house_type,
      planned_connection_date,
      contact_name,
      contact_phone,
      contact_email,
      coordinates_lat,
      coordinates_lng,
      notes
    } = body;

    // Validation
    if (!project_id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    if (!connection_type) {
      return NextResponse.json(
        { error: 'Connection type is required' },
        { status: 400 }
      );
    }

    if (!method) {
      return NextResponse.json(
        { error: 'Installation method is required' },
        { status: 400 }
      );
    }

    // Parse address (if it's a single string, use it as street)
    let street = address;
    let city = null;
    let postal_code = null;

    // Split contact_name into first_name and last_name if provided
    let owner_first_name = null;
    let owner_last_name = null;
    if (contact_name) {
      const nameParts = contact_name.trim().split(/\s+/);
      owner_first_name = nameParts[0] || null;
      owner_last_name = nameParts.slice(1).join(' ') || null;
    }

    // Create house
    const houseData = {
      project_id,
      cabinet_id: cabinet_id || null,
      house_number: house_number || null,
      street,
      city,
      postal_code,
      latitude: coordinates_lat || null,
      longitude: coordinates_lng || null,
      apartment_count: apartment_count || 1,
      floor_count: floor_count || null,
      connection_type,
      method,
      house_type: house_type || null,
      status: 'pending',
      planned_connection_date: planned_connection_date || null,
      actual_connection_date: null,
      contact_email: contact_email || null,
      owner_first_name,
      owner_last_name,
      owner_phone: contact_phone || null,
      notes: notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Creating house with data:', houseData);

    const { data: house, error } = await supabase
      .from('houses')
      .insert([houseData])
      .select(`
        id,
        project_id,
        cabinet_id,
        house_number,
        street,
        city,
        postal_code,
        latitude,
        longitude,
        apartment_count,
        floor_count,
        connection_type,
        method,
        house_type,
        status,
        planned_connection_date,
        actual_connection_date,
        contact_email,
        owner_first_name,
        owner_last_name,
        owner_phone,
        notes,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      console.error('Supabase error creating house:', error);
      return NextResponse.json(
        { error: `Failed to create house: ${error.message}` },
        { status: 500 }
      );
    }

    // Transform response to match frontend interface
    const transformedHouse = {
      ...house,
      address: [house.street, house.city, house.postal_code].filter(Boolean).join(', '),
      coordinates_lat: house.latitude,
      coordinates_lng: house.longitude,
      contact_name: [house.owner_first_name, house.owner_last_name].filter(Boolean).join(' '),
      contact_phone: house.owner_phone,
    };

    return NextResponse.json(transformedHouse, { status: 201 });
  } catch (error) {
    console.error('Create house error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

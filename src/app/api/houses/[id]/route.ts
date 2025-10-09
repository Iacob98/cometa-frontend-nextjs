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
    const { id: houseId } = await params;

    if (!houseId) {
      return NextResponse.json(
        { error: 'House ID is required' },
        { status: 400 }
      );
    }

    // Get house data from database
    const { data: house, error } = await supabase
      .from('houses')
      .select(`
        id,
        project_id,
        street,
        city,
        postal_code,
        house_number,
        apartment_count,
        floor_count,
        connection_type,
        method,
        house_type,
        status,
        planned_connection_date,
        actual_connection_date,
        owner_first_name,
        owner_last_name,
        owner_phone,
        contact_email,
        latitude,
        longitude,
        notes,
        created_at,
        updated_at,
        project:projects!houses_project_id_fkey(
          id,
          name,
          customer
        )
      `)
      .eq('id', houseId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'House not found' },
          { status: 404 }
        );
      }
      console.error('Supabase house query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch house data' },
        { status: 500 }
      );
    }

    return NextResponse.json(house);

  } catch (error) {
    console.error('House API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch house' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: houseId } = await params;
    const data = await request.json();

    if (!houseId) {
      return NextResponse.json(
        { error: 'House ID is required' },
        { status: 400 }
      );
    }

    // Parse address if it's a single string
    let street = data.street || data.address || null;
    let city = data.city || null;
    let postal_code = data.postal_code || null;

    // Validate required fields
    if (!street) {
      return NextResponse.json(
        { error: 'Street/Address is required' },
        { status: 400 }
      );
    }

    // Update house in database
    const { data: updatedHouse, error } = await supabase
      .from('houses')
      .update({
        project_id: data.project_id,
        street,
        city,
        postal_code,
        house_number: data.house_number || null,
        apartment_count: data.apartment_count || 1,
        floor_count: data.floor_count || 1,
        connection_type: data.connection_type || 'full',
        method: data.method || 'trench',
        house_type: data.house_type || 'residential',
        status: data.status || 'created',
        planned_connection_date: data.planned_connection_date || null,
        actual_connection_date: data.actual_connection_date || null,
        owner_first_name: data.owner_first_name || null,
        owner_last_name: data.owner_last_name || null,
        owner_phone: data.owner_phone || data.contact_phone || null,
        contact_email: data.contact_email || null,
        latitude: data.latitude || data.coordinates_lat || null,
        longitude: data.longitude || data.coordinates_lng || null,
        notes: data.notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', houseId)
      .select(`
        id,
        project_id,
        street,
        city,
        postal_code,
        house_number,
        apartment_count,
        floor_count,
        connection_type,
        method,
        house_type,
        status,
        planned_connection_date,
        actual_connection_date,
        owner_first_name,
        owner_last_name,
        owner_phone,
        contact_email,
        latitude,
        longitude,
        notes,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'House not found' },
          { status: 404 }
        );
      }
      console.error('Supabase house update error:', error);
      return NextResponse.json(
        { error: 'Failed to update house in database' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedHouse);

  } catch (error) {
    console.error('Update house API error:', error);
    return NextResponse.json(
      { error: 'Failed to update house' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: houseId } = await params;

    if (!houseId) {
      return NextResponse.json(
        { error: 'House ID is required' },
        { status: 400 }
      );
    }

    // Check if house has any dependencies before deletion
    const { data: dependencies, error: depError } = await supabase
      .from('facilities')
      .select('id')
      .eq('house_id', houseId)
      .limit(1);

    if (depError) {
      console.error('Dependency check error:', depError);
      return NextResponse.json(
        { error: 'Failed to check house dependencies' },
        { status: 500 }
      );
    }

    if (dependencies && dependencies.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete house with existing facilities' },
        { status: 409 }
      );
    }

    // Delete house from database
    const { error } = await supabase
      .from('houses')
      .delete()
      .eq('id', houseId);

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'House not found' },
          { status: 404 }
        );
      }
      console.error('Supabase house deletion error:', error);
      return NextResponse.json(
        { error: 'Failed to delete house from database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'House deleted successfully',
      deleted_id: houseId
    });

  } catch (error) {
    console.error('Delete house API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete house' },
      { status: 500 }
    );
  }
}
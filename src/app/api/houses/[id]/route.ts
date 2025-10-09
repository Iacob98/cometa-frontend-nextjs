import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key for server-side operations to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
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

    console.log('PUT /api/houses/[id] - House ID:', houseId);
    console.log('PUT /api/houses/[id] - Request data:', JSON.stringify(data, null, 2));

    if (!houseId) {
      return NextResponse.json(
        { error: 'House ID is required' },
        { status: 400 }
      );
    }

    // First, check if the house exists
    const { data: existingHouse, error: fetchError } = await supabase
      .from('houses')
      .select('id, project_id')
      .eq('id', houseId)
      .single();

    if (fetchError || !existingHouse) {
      console.error('House not found:', fetchError);
      return NextResponse.json(
        { error: 'House not found' },
        { status: 404 }
      );
    }

    // Build update data - only include fields that are safe to update
    const updateData: any = {};

    // Handle address field - supports both old (address) and new (street/city/postal) schemas
    if (data.address !== undefined) {
      // Map address to street for new schema compatibility
      updateData.street = data.address;
    }
    if (data.street !== undefined) {
      updateData.street = data.street;
    }
    if (data.city !== undefined) {
      updateData.city = data.city;
    }
    if (data.postal_code !== undefined) {
      updateData.postal_code = data.postal_code;
    }

    // Basic house information
    if (data.house_number !== undefined) {
      updateData.house_number = data.house_number;
    }
    if (data.apartment_count !== undefined) {
      updateData.apartment_count = data.apartment_count;
    }
    if (data.floor_count !== undefined) {
      updateData.floor_count = data.floor_count;
    }
    if (data.connection_type !== undefined) {
      updateData.connection_type = data.connection_type;
    }
    if (data.method !== undefined) {
      updateData.method = data.method;
    }
    if (data.house_type !== undefined) {
      updateData.house_type = data.house_type;
    }
    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    // Dates - skip work_started_at and work_completed_at as they don't exist in schema
    if (data.planned_connection_date !== undefined) {
      updateData.planned_connection_date = data.planned_connection_date;
    }
    if (data.actual_connection_date !== undefined) {
      updateData.actual_connection_date = data.actual_connection_date;
    }

    // Contact information - support both schemas
    if (data.owner_first_name !== undefined) {
      updateData.owner_first_name = data.owner_first_name;
    }
    if (data.owner_last_name !== undefined) {
      updateData.owner_last_name = data.owner_last_name;
    }
    if (data.contact_name !== undefined) {
      // Old schema: contact_name
      updateData.contact_name = data.contact_name;
    }
    if (data.owner_phone !== undefined) {
      updateData.owner_phone = data.owner_phone;
    }
    if (data.contact_phone !== undefined) {
      // Old schema: contact_phone
      updateData.contact_phone = data.contact_phone;
      // Also set owner_phone for new schema
      if (updateData.owner_phone === undefined) {
        updateData.owner_phone = data.contact_phone;
      }
    }
    if (data.contact_email !== undefined) {
      updateData.contact_email = data.contact_email;
    }

    // Coordinates - support both schemas
    if (data.latitude !== undefined) {
      updateData.latitude = data.latitude;
    }
    if (data.coordinates_lat !== undefined && updateData.latitude === undefined) {
      updateData.latitude = data.coordinates_lat;
    }
    if (data.longitude !== undefined) {
      updateData.longitude = data.longitude;
    }
    if (data.coordinates_lng !== undefined && updateData.longitude === undefined) {
      updateData.longitude = data.coordinates_lng;
    }

    // Notes
    if (data.notes !== undefined) {
      updateData.notes = data.notes;
    }

    // Always update the timestamp
    updateData.updated_at = new Date().toISOString();

    // Log what we're about to update
    console.log('Supabase update data (filtered):', JSON.stringify(updateData, null, 2));

    // Perform the update
    const { data: updatedHouse, error } = await supabase
      .from('houses')
      .update(updateData)
      .eq('id', houseId)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Supabase house update error:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'House not found' },
          { status: 404 }
        );
      }
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
    // Check housing_units (apartments)
    const { data: housingUnits, error: housingUnitsError } = await supabase
      .from('housing_units')
      .select('id')
      .eq('house_id', houseId)
      .limit(1);

    if (housingUnitsError) {
      console.error('Housing units check error:', housingUnitsError);
      // Continue with deletion even if check fails (table might not exist)
    }

    if (housingUnits && housingUnits.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete house with existing housing units (apartments)' },
        { status: 409 }
      );
    }

    // Check house_documents
    const { data: documents, error: documentsError } = await supabase
      .from('house_documents')
      .select('id')
      .eq('house_id', houseId)
      .limit(1);

    if (documentsError) {
      console.error('Documents check error:', documentsError);
      // Continue with deletion even if check fails
    }

    if (documents && documents.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete house with existing documents. Please delete documents first.' },
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
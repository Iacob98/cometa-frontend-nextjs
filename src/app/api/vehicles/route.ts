import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const per_page = parseInt(searchParams.get('per_page') || '20');
    const offset = (page - 1) * per_page;
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const available_only = searchParams.get('available_only') === 'true';
    const project_id = searchParams.get('project_id');

    // Build the query for vehicles with assignments
    let query = supabase
      .from('vehicles')
      .select(`
        id,
        brand,
        model,
        plate_number,
        type,
        status,
        rental_cost_per_day,
        fuel_type,
        year_manufactured,
        description,
        is_active,
        tipper_type,
        max_weight_kg,
        comment,
        created_at,
        updated_at,
        vehicle_assignments(
          id,
          project_id,
          crew_id,
          user_id,
          from_ts,
          to_ts,
          is_permanent,
          rental_cost_per_day,
          notes,
          created_at,
          project:projects(id, name, city),
          crew:crews(id, name),
          user:users(id, first_name, last_name, email)
        )
      `, { count: 'exact' })
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + per_page - 1);

    // Apply filters
    if (status === 'available' || available_only) {
      // For "available" status, get vehicles that do NOT have any active assignments

      // First, get all vehicle IDs with active assignments
      const { data: activeAssignments } = await supabase
        .from('vehicle_assignments')
        .select('vehicle_id')
        .eq('is_active', true);

      const assignedVehicleIds = activeAssignments?.map(a => a.vehicle_id) || [];

      // Filter out vehicles that have active assignments
      if (assignedVehicleIds.length > 0) {
        query = query.not('id', 'in', `(${assignedVehicleIds.join(',')})`);
      }
    } else if (status) {
      // For other statuses, use direct filtering
      query = query.eq('status', status);
    }

    if (type) {
      query = query.eq('type', type);
    }

    if (search) {
      query = query.or(`brand.ilike.%${search}%,model.ilike.%${search}%,plate_number.ilike.%${search}%`);
    }

    const { data: vehicles, error, count } = await query;

    if (error) {
      console.error('Supabase vehicles query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch vehicles data' },
        { status: 500 }
      );
    }

    // Fetch document statistics for all vehicles
    const vehicleIds = (vehicles || []).map((v: any) => v.id);
    let documentStats: Record<string, { count: number; expired: number; expiring: number }> = {};

    if (vehicleIds.length > 0) {
      const { data: documents } = await supabase
        .from('vehicle_documents')
        .select('vehicle_id, expiry_date')
        .in('vehicle_id', vehicleIds);

      // Group by vehicle_id and calculate stats
      documents?.forEach((doc: any) => {
        if (!documentStats[doc.vehicle_id]) {
          documentStats[doc.vehicle_id] = { count: 0, expired: 0, expiring: 0 };
        }
        documentStats[doc.vehicle_id].count++;

        // Calculate expiry status from expiry_date
        if (doc.expiry_date) {
          const now = new Date();
          const expiry = new Date(doc.expiry_date);
          const daysUntilExpiry = Math.floor(
            (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysUntilExpiry < 0) {
            documentStats[doc.vehicle_id].expired++;
          } else if (daysUntilExpiry <= 60) {
            documentStats[doc.vehicle_id].expiring++;
          }
        }
      });
    }

    // Format response to ensure proper structure for frontend
    const formattedVehicles = (vehicles || []).map((vehicle: any) => {
      // Filter current assignments (active assignments)
      const currentAssignments = (vehicle.vehicle_assignments || []).filter((assignment: any) => {
        if (!assignment.to_ts) return true; // Permanent or ongoing assignments
        return new Date(assignment.to_ts) > new Date(); // Future end date
      });

      // Find current assignment for project filter
      let currentAssignment = null;
      if (currentAssignments.length > 0) {
        currentAssignment = currentAssignments[0];
      }

      // Skip if project filter doesn't match current assignment
      if (project_id && (!currentAssignment || currentAssignment.project_id !== project_id)) {
        return null;
      }

      // Get document statistics for this vehicle
      const vehicleDocStats = documentStats[vehicle.id] || { count: 0, expired: 0, expiring: 0 };

      return {
        id: vehicle.id,
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        plate_number: vehicle.plate_number,
        type: vehicle.type || 'transporter',
        status: vehicle.status || 'available',
        rental_cost_per_day: Number(vehicle.rental_cost_per_day) || 0,
        fuel_type: vehicle.fuel_type || 'diesel',
        year_manufactured: vehicle.year_manufactured,
        description: vehicle.description || '',
        is_active: vehicle.is_active,
        owned: vehicle.owned !== undefined ? vehicle.owned : true,
        rental_price_per_day_eur: Number(vehicle.rental_price_per_day_eur || vehicle.rental_cost_per_day) || 0,
        current_location: vehicle.current_location || '',
        tipper_type: vehicle.tipper_type || 'kein Kipper',
        max_weight_kg: vehicle.max_weight_kg ? Number(vehicle.max_weight_kg) : null,
        comment: vehicle.comment || null,
        full_name: `${vehicle.brand || ''} ${vehicle.model || ''} (${vehicle.plate_number})`.trim(),
        age: vehicle.year_manufactured ? new Date().getFullYear() - vehicle.year_manufactured : null,
        current_assignment: currentAssignment ? {
          id: currentAssignment.id,
          project_id: currentAssignment.project_id,
          crew_id: currentAssignment.crew_id,
          user_id: currentAssignment.user_id,
          from_ts: currentAssignment.from_ts,
          to_ts: currentAssignment.to_ts,
          is_permanent: currentAssignment.is_permanent,
          rental_cost_per_day: Number(currentAssignment.rental_cost_per_day) || 0,
          notes: currentAssignment.notes || '',
          project: currentAssignment.project ? {
            id: currentAssignment.project.id,
            name: currentAssignment.project.name,
            city: currentAssignment.project.city
          } : null,
          crew: currentAssignment.crew ? {
            id: currentAssignment.crew.id,
            name: currentAssignment.crew.name
          } : null,
          assigned_user: currentAssignment.user ? {
            id: currentAssignment.user.id,
            name: `${currentAssignment.user.first_name} ${currentAssignment.user.last_name}`,
            email: currentAssignment.user.email
          } : null,
          duration_days: currentAssignment.to_ts ?
            Math.ceil((new Date(currentAssignment.to_ts).getTime() - new Date(currentAssignment.from_ts).getTime()) / (1000 * 60 * 60 * 24)) : null
        } : null,
        assignments_count: vehicle.vehicle_assignments?.length || 0,
        documents_count: vehicleDocStats.count,
        documents_expired: vehicleDocStats.expired,
        documents_expiring_soon: vehicleDocStats.expiring,
        created_at: vehicle.created_at,
        updated_at: vehicle.updated_at
      };
    }).filter(vehicle => vehicle !== null); // Remove filtered out vehicles

    // Calculate summary statistics
    const totalVehicles = count || 0;
    const statusCounts = {
      available: 0,
      in_use: 0,
      maintenance: 0,
      broken: 0
    };

    const typeCounts = {
      car: 0,
      truck: 0,
      van: 0,
      trailer: 0
    };

    formattedVehicles.forEach((vehicle: any) => {
      if (statusCounts.hasOwnProperty(vehicle.status)) {
        statusCounts[vehicle.status as keyof typeof statusCounts]++;
      }
      if (typeCounts.hasOwnProperty(vehicle.type)) {
        typeCounts[vehicle.type as keyof typeof typeCounts]++;
      }
    });

    const averageRentalCost = formattedVehicles.length > 0 ?
      formattedVehicles.reduce((sum: number, v: any) => sum + v.rental_cost_per_day, 0) / formattedVehicles.length : 0;

    const averageAge = formattedVehicles.filter((v: any) => v.age !== null).length > 0 ?
      formattedVehicles.filter((v: any) => v.age !== null).reduce((sum: number, v: any) => sum + v.age, 0) /
      formattedVehicles.filter((v: any) => v.age !== null).length : 0;

    return NextResponse.json({
      vehicles: formattedVehicles,
      pagination: {
        page,
        per_page,
        total: project_id ? formattedVehicles.length : totalVehicles,
        total_pages: Math.ceil((project_id ? formattedVehicles.length : totalVehicles) / per_page)
      },
      summary: {
        total_vehicles: project_id ? formattedVehicles.length : totalVehicles,
        status_counts: statusCounts,
        type_counts: typeCounts,
        assigned_vehicles: formattedVehicles.filter((v: any) => v.current_assignment).length,
        available_vehicles: statusCounts.available,
        average_rental_cost: Math.round(averageRentalCost * 100) / 100,
        average_age: Math.round(averageAge * 10) / 10
      }
    });
  } catch (error) {
    console.error('Vehicles API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      brand,
      model,
      plate_number,
      type = 'transporter',
      status = 'available',
      rental_cost_per_day = 0,
      fuel_type = 'diesel',
      year_manufactured,
      description = '',
      tipper_type = 'kein Kipper',
      max_weight_kg,
      comment
    } = body;

    // Validate required fields
    if (!plate_number) {
      return NextResponse.json(
        { error: 'Plate number is required' },
        { status: 400 }
      );
    }

    if (!tipper_type) {
      return NextResponse.json(
        { error: 'Tipper type is required' },
        { status: 400 }
      );
    }

    // Validate enum values
    const validStatuses = ['available', 'in_use', 'maintenance', 'broken'];
    const validTypes = ['pkw', 'lkw', 'transporter', 'pritsche', 'anhänger', 'excavator', 'other'];
    const validFuelTypes = ['diesel', 'petrol', 'electric', 'hybrid'];
    const validTipperTypes = ['Kipper', 'kein Kipper'];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    if (!validFuelTypes.includes(fuel_type)) {
      return NextResponse.json(
        { error: `Invalid fuel type. Must be one of: ${validFuelTypes.join(', ')}` },
        { status: 400 }
      );
    }

    if (!validTipperTypes.includes(tipper_type)) {
      return NextResponse.json(
        { error: `Invalid tipper type. Must be one of: ${validTipperTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate max_weight_kg if provided
    if (max_weight_kg !== undefined && max_weight_kg !== null) {
      const weight = Number(max_weight_kg);
      if (isNaN(weight) || weight < 0 || weight > 100000) {
        return NextResponse.json(
          { error: 'Invalid max weight. Must be between 0 and 100,000 kg' },
          { status: 400 }
        );
      }
    }

    // Check for duplicate plate number
    const { data: existingVehicle } = await supabase
      .from('vehicles')
      .select('id')
      .eq('plate_number', plate_number)
      .single();

    if (existingVehicle) {
      return NextResponse.json(
        { error: 'Vehicle with this plate number already exists' },
        { status: 409 }
      );
    }

    // Create new vehicle
    const { data: newVehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .insert({
        brand: brand || '',
        model: model || '',
        plate_number,
        type,
        status,
        rental_cost_per_day: Number(rental_cost_per_day),
        fuel_type,
        year_manufactured: year_manufactured ? parseInt(year_manufactured) : null,
        description,
        is_active: true,
        tipper_type,
        max_weight_kg: max_weight_kg ? Number(max_weight_kg) : null,
        comment: comment || null
      })
      .select(`
        id,
        brand,
        model,
        plate_number,
        type,
        status,
        rental_cost_per_day,
        fuel_type,
        year_manufactured,
        description,
        is_active,
        tipper_type,
        max_weight_kg,
        comment,
        created_at,
        updated_at
      `)
      .single();

    if (vehicleError) {
      console.error('Supabase vehicle creation error:', vehicleError);
      return NextResponse.json(
        { error: 'Failed to create vehicle' },
        { status: 500 }
      );
    }

    // Format response
    const formattedVehicle = {
      id: newVehicle.id,
      brand: newVehicle.brand || '',
      model: newVehicle.model || '',
      plate_number: newVehicle.plate_number,
      type: newVehicle.type,
      status: newVehicle.status,
      rental_cost_per_day: Number(newVehicle.rental_cost_per_day),
      fuel_type: newVehicle.fuel_type,
      year_manufactured: newVehicle.year_manufactured,
      description: newVehicle.description || '',
      is_active: newVehicle.is_active,
      tipper_type: newVehicle.tipper_type,
      max_weight_kg: newVehicle.max_weight_kg ? Number(newVehicle.max_weight_kg) : null,
      comment: newVehicle.comment || null,
      owned: newVehicle.owned !== undefined ? newVehicle.owned : true,
      rental_price_per_day_eur: Number(newVehicle.rental_price_per_day_eur || newVehicle.rental_cost_per_day) || 0,
      current_location: newVehicle.current_location || '',
      fuel_consumption_l_100km: Number(newVehicle.fuel_consumption_l_100km) || 0,
      full_name: `${newVehicle.brand || ''} ${newVehicle.model || ''} (${newVehicle.plate_number})`.trim(),
      age: newVehicle.year_manufactured ? new Date().getFullYear() - newVehicle.year_manufactured : null,
      current_assignment: null,
      assignments_count: 0,
      created_at: newVehicle.created_at,
      updated_at: newVehicle.updated_at
    };

    return NextResponse.json({
      message: 'Vehicle created successfully',
      vehicle: formattedVehicle
    }, { status: 201 });
  } catch (error) {
    console.error('Vehicles POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create vehicle' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      brand,
      model,
      type,
      status,
      rental_cost_per_day,
      fuel_type,
      year_manufactured,
      description,
      owned,
      rental_price_per_day_eur,
      current_location,
      fuel_consumption_l_100km,
      tipper_type,
      max_weight_kg,
      comment
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Vehicle ID is required' },
        { status: 400 }
      );
    }

    // Validate tipper_type if provided
    if (tipper_type !== undefined) {
      const validTipperTypes = ['Kipper', 'kein Kipper'];
      if (!validTipperTypes.includes(tipper_type)) {
        return NextResponse.json(
          { error: `Invalid tipper type. Must be one of: ${validTipperTypes.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Validate type if provided
    if (type !== undefined) {
      const validTypes = ['pkw', 'lkw', 'transporter', 'pritsche', 'anhänger', 'excavator', 'other'];
      if (!validTypes.includes(type)) {
        return NextResponse.json(
          { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Validate max_weight_kg if provided
    if (max_weight_kg !== undefined && max_weight_kg !== null) {
      const weight = Number(max_weight_kg);
      if (isNaN(weight) || weight < 0 || weight > 100000) {
        return NextResponse.json(
          { error: 'Invalid max weight. Must be between 0 and 100,000 kg' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (brand !== undefined) updateData.brand = brand;
    if (model !== undefined) updateData.model = model;
    if (type !== undefined) updateData.type = type;
    if (status !== undefined) updateData.status = status;
    if (rental_cost_per_day !== undefined) updateData.rental_cost_per_day = Number(rental_cost_per_day);
    if (fuel_type !== undefined) updateData.fuel_type = fuel_type;
    if (year_manufactured !== undefined) updateData.year_manufactured = year_manufactured ? parseInt(year_manufactured) : null;
    if (description !== undefined) updateData.description = description;
    if (owned !== undefined) updateData.owned = owned;
    if (rental_price_per_day_eur !== undefined) updateData.rental_price_per_day_eur = Number(rental_price_per_day_eur);
    if (current_location !== undefined) updateData.current_location = current_location;
    if (fuel_consumption_l_100km !== undefined) updateData.fuel_consumption_l_100km = Number(fuel_consumption_l_100km);
    if (tipper_type !== undefined) updateData.tipper_type = tipper_type;
    if (max_weight_kg !== undefined) updateData.max_weight_kg = max_weight_kg ? Number(max_weight_kg) : null;
    if (comment !== undefined) updateData.comment = comment;

    // Update vehicle
    const { data: updatedVehicle, error: updateError } = await supabase
      .from('vehicles')
      .update(updateData)
      .eq('id', id)
      .select(`
        id,
        brand,
        model,
        plate_number,
        type,
        status,
        rental_cost_per_day,
        fuel_type,
        year_manufactured,
        description,
        is_active,
        owned,
        rental_price_per_day_eur,
        current_location,
        fuel_consumption_l_100km,
        tipper_type,
        max_weight_kg,
        comment,
        created_at,
        updated_at
      `)
      .single();

    if (updateError) {
      console.error('Supabase vehicle update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update vehicle' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Vehicle updated successfully',
      vehicle: updatedVehicle
    });
  } catch (error) {
    console.error('Vehicles PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update vehicle' },
      { status: 500 }
    );
  }
}
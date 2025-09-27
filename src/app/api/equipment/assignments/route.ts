import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';

// Simple file-based storage for demo purposes
interface Assignment {
  id: string;
  resource_type: 'equipment' | 'vehicle';
  equipment_id?: string;
  vehicle_id?: string;
  crew_id: string;
  project_id?: string;
  assigned_at: string;
  returned_at?: string;
  daily_rental_cost?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

const ASSIGNMENTS_FILE = join(process.cwd(), 'temp_assignments.json');

// Supabase client - prefer this for production, fallback to file for development
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function loadAssignments(): Assignment[] {
  try {
    if (existsSync(ASSIGNMENTS_FILE)) {
      const data = readFileSync(ASSIGNMENTS_FILE, 'utf-8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error loading assignments:', error);
    return [];
  }
}

function saveAssignments(assignments: Assignment[]) {
  try {
    writeFileSync(ASSIGNMENTS_FILE, JSON.stringify(assignments, null, 2));
  } catch (error) {
    console.error('Error saving assignments:', error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const per_page = parseInt(searchParams.get('per_page') || '20');
    const active_only = searchParams.get('active_only') === 'true';
    const crew_id = searchParams.get('crew_id');
    const equipment_id = searchParams.get('equipment_id');
    const project_id = searchParams.get('project_id');
    const assignment_id = searchParams.get('assignment_id');

    // Try to get from Supabase first, fallback to file storage
    try {
      let query = supabase
        .from('equipment_assignments')
        .select(`
          id,
          equipment_id,
          project_id,
          crew_id,
          from_ts,
          to_ts,
          is_permanent,
          rental_cost_per_day,
          notes,
          created_at,
          equipment:equipment_id (
            name,
            type,
            inventory_no
          ),
          project:project_id (
            name
          ),
          crew:crew_id (
            name
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters to Supabase query
      if (active_only) {
        query = query.is('to_ts', null);
      }

      if (crew_id) {
        query = query.eq('crew_id', crew_id);
      }

      if (equipment_id) {
        query = query.eq('equipment_id', equipment_id);
      }

      if (project_id) {
        query = query.eq('project_id', project_id);
      }

      if (assignment_id) {
        query = query.eq('id', assignment_id);
      }

      // Add pagination
      const offset = (page - 1) * per_page;
      query = query.range(offset, offset + per_page - 1);

      const { data: assignments, error, count } = await query;

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      // Transform to match our API format
      const transformedAssignments = (assignments || []).map(assignment => ({
        id: assignment.id,
        resource_type: 'equipment',
        equipment_id: assignment.equipment_id,
        project_id: assignment.project_id,
        crew_id: assignment.crew_id,
        assigned_at: assignment.from_ts,
        returned_at: assignment.to_ts,
        daily_rental_cost: assignment.rental_cost_per_day,
        notes: assignment.notes,
        created_at: assignment.created_at,
        updated_at: assignment.created_at, // Use created_at as fallback for updated_at
        equipment_name: assignment.equipment?.name,
        project_name: assignment.project?.name,
        crew_name: assignment.crew?.name,
        // Add full equipment object for compatibility
        equipment: assignment.equipment ? {
          name: assignment.equipment.name,
          type: assignment.equipment.type,
          inventory_no: assignment.equipment.inventory_no
        } : null
      }));

      return NextResponse.json({
        items: transformedAssignments,
        page,
        per_page,
        total: count || transformedAssignments.length,
        total_pages: Math.ceil((count || transformedAssignments.length) / per_page)
      });

    } catch (supabaseError) {
      console.warn('Supabase error, falling back to file storage:', supabaseError);

      // Fallback to file storage
      let assignments = loadAssignments();

      // Apply filters
      if (active_only) {
        assignments = assignments.filter(assignment => !assignment.returned_at);
      }

      if (crew_id) {
        assignments = assignments.filter(assignment => assignment.crew_id === crew_id);
      }

      if (equipment_id) {
        assignments = assignments.filter(assignment => assignment.equipment_id === equipment_id);
      }

      if (project_id) {
        assignments = assignments.filter(assignment => assignment.project_id === project_id);
      }

      if (assignment_id) {
        assignments = assignments.filter(assignment => assignment.id === assignment_id);
      }

      // Sort by created_at descending
      const sortedAssignments = assignments.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      // Paginate
      const offset = (page - 1) * per_page;
      const paginatedAssignments = sortedAssignments.slice(offset, offset + per_page);

      return NextResponse.json({
        items: paginatedAssignments,
        page,
        per_page,
        total: assignments.length,
        total_pages: Math.ceil(assignments.length / per_page)
      });
    }
  } catch (error) {
    console.error('Equipment assignments API error:', error);
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
      resource_type,
      equipment_id,
      vehicle_id,
      crew_id,
      project_id,
      assigned_at,
      returned_at,
      daily_rental_cost,
      notes
    } = body;

    // Validate required fields
    if (!crew_id) {
      return NextResponse.json(
        { error: 'Crew is required' },
        { status: 400 }
      );
    }

    if (!resource_type || (resource_type !== 'equipment' && resource_type !== 'vehicle')) {
      return NextResponse.json(
        { error: 'Resource type must be either "equipment" or "vehicle"' },
        { status: 400 }
      );
    }

    if (resource_type === 'equipment' && !equipment_id) {
      return NextResponse.json(
        { error: 'Equipment ID is required when resource type is equipment' },
        { status: 400 }
      );
    }

    if (resource_type === 'vehicle' && !vehicle_id) {
      return NextResponse.json(
        { error: 'Vehicle ID is required when resource type is vehicle' },
        { status: 400 }
      );
    }

    if (!assigned_at) {
      return NextResponse.json(
        { error: 'Assignment start date is required' },
        { status: 400 }
      );
    }

    // Validate equipment availability before creating assignment
    if (resource_type === 'equipment') {
      try {
        // Check equipment inventory and current assignments
        const { data: equipment, error: equipmentError } = await supabase
          .from('equipment')
          .select('id, name')
          .eq('id', equipment_id)
          .single();

        if (equipmentError || !equipment) {
          console.warn('Equipment not found in Supabase, checking file storage for validation');
          // Fallback to file storage validation
          const existingAssignments = loadAssignments();
          const activeAssignments = existingAssignments.filter(
            assignment =>
              assignment.equipment_id === equipment_id &&
              !assignment.returned_at // Active assignments
          );

          // Default to quantity of 1 for file storage
          const availableQuantity = 1;

          if (activeAssignments.length >= availableQuantity) {
            return NextResponse.json(
              {
                error: `Equipment is not available. ${activeAssignments.length}/${availableQuantity} units are already assigned. Return existing assignment first or add more inventory.`
              },
              { status: 400 }
            );
          }
        } else {
          // Get current active assignments for this equipment
          const { data: activeAssignments, error: assignmentsError } = await supabase
            .from('equipment_assignments')
            .select('id, crew_id')
            .eq('equipment_id', equipment_id)
            .is('to_ts', null); // Active assignments (no end date)

          if (assignmentsError) {
            console.warn('Could not check assignments in Supabase, checking file storage');
            // Fallback to file storage validation
            const existingAssignments = loadAssignments();
            const activeFileAssignments = existingAssignments.filter(
              assignment =>
                assignment.equipment_id === equipment_id &&
                !assignment.returned_at // Active assignments
            );

            if (activeFileAssignments.length >= 1) {
              return NextResponse.json(
                {
                  error: `Equipment "${equipment.name}" is already assigned. Only 1 equipment per crew allowed. End existing assignment first.`
                },
                { status: 400 }
              );
            }
          } else {
            const currentAssignments = activeAssignments?.length || 0;
            const availableQuantity = 1; // 1 equipment = 1 crew rule

            if (currentAssignments >= availableQuantity) {
              return NextResponse.json(
                {
                  error: `Equipment "${equipment.name}" is already assigned. Only 1 equipment per crew allowed. End existing assignment first.`
                },
                { status: 400 }
              );
            }
          }
        }
      } catch (validationError) {
        console.warn('Equipment validation error, proceeding with assignment:', validationError);
      }
    }

    // Try to save to Supabase first, fallback to file storage
    try {
      // For equipment assignments, save to equipment_assignments table
      if (resource_type === 'equipment') {
        const assignmentData = {
          equipment_id,
          crew_id,
          project_id: project_id || null,
          from_ts: new Date(assigned_at).toISOString(),
          to_ts: returned_at ? new Date(returned_at).toISOString() : null,
          is_permanent: !returned_at,
          rental_cost_per_day: daily_rental_cost ? parseFloat(daily_rental_cost.toString()) : null,
          notes: notes || null
        };

        const { data: newAssignment, error } = await supabase
          .from('equipment_assignments')
          .insert([assignmentData])
          .select()
          .single();

        if (error) {
          console.error('Supabase insert error:', error);
          throw error;
        }

        console.log(`✅ Created equipment assignment in Supabase:`, {
          assignmentId: newAssignment.id,
          crewId: crew_id,
          equipmentId: equipment_id,
          projectId: project_id
        });

        return NextResponse.json({
          message: 'Equipment assignment created successfully',
          assignment: {
            id: newAssignment.id,
            resource_type: 'equipment',
            equipment_id: newAssignment.equipment_id,
            crew_id: newAssignment.crew_id,
            project_id: newAssignment.project_id,
            assigned_at: newAssignment.from_ts,
            returned_at: newAssignment.to_ts,
            daily_rental_cost: newAssignment.rental_cost_per_day,
            notes: newAssignment.notes,
            created_at: newAssignment.created_at,
            updated_at: newAssignment.updated_at
          }
        }, { status: 201 });
      } else {
        // For vehicles, still use file storage for now
        throw new Error('Vehicle assignments not supported in Supabase yet');
      }

    } catch (supabaseError) {
      console.warn('Supabase error, falling back to file storage:', supabaseError);

      // Validate equipment availability in file storage for equipment
      if (resource_type === 'equipment') {
        const existingAssignments = loadAssignments();
        const activeAssignments = existingAssignments.filter(
          assignment =>
            assignment.equipment_id === equipment_id &&
            !assignment.returned_at // Active assignments
        );

        // Default to quantity of 1 for file storage (since we can't check Supabase)
        const availableQuantity = 1;

        if (activeAssignments.length >= availableQuantity) {
          return NextResponse.json(
            {
              error: `Equipment is not available. ${activeAssignments.length}/${availableQuantity} units are already assigned. Return existing assignment first or add more inventory.`
            },
            { status: 400 }
          );
        }
      }

      // Fallback to file storage
      const assignmentId = `assignment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const newAssignment: Assignment = {
        id: assignmentId,
        resource_type,
        crew_id,
        assigned_at: new Date(assigned_at).toISOString(),
        daily_rental_cost: daily_rental_cost ? parseFloat(daily_rental_cost.toString()) : undefined,
        notes: notes || undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add resource ID based on type
      if (resource_type === 'equipment') {
        newAssignment.equipment_id = equipment_id;
      } else {
        newAssignment.vehicle_id = vehicle_id;
      }

      // Add optional fields
      if (project_id) {
        newAssignment.project_id = project_id;
      }

      if (returned_at) {
        newAssignment.returned_at = new Date(returned_at).toISOString();
      }

      // Save to file storage
      const assignments = loadAssignments();
      assignments.push(newAssignment);
      saveAssignments(assignments);

      console.log(`✅ Created ${resource_type} assignment:`, {
        assignmentId: newAssignment.id,
        crewId: crew_id,
        resourceId: resource_type === 'equipment' ? equipment_id : vehicle_id,
        projectId: project_id
      });

      return NextResponse.json({
        message: `${resource_type.charAt(0).toUpperCase() + resource_type.slice(1)} assignment created successfully`,
        assignment: newAssignment
      }, { status: 201 });
    }
  } catch (error) {
    console.error('Equipment assignment POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create assignment' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, assignment_id, returned_at } = body;

    if (action === 'return' && assignment_id) {
      const returnDate = returned_at ? new Date(returned_at).toISOString() : new Date().toISOString();

      // Try to update in Supabase first
      try {
        const { data: updatedAssignment, error } = await supabase
          .from('equipment_assignments')
          .update({ to_ts: returnDate })
          .eq('id', assignment_id)
          .select()
          .single();

        if (error) {
          throw error;
        }

        console.log(`✅ Equipment returned in Supabase:`, {
          assignmentId: assignment_id,
          returnedAt: returnDate
        });

        return NextResponse.json({
          message: 'Equipment returned successfully',
          assignment: {
            id: updatedAssignment.id,
            returned_at: updatedAssignment.to_ts
          }
        });

      } catch (supabaseError) {
        console.warn('Supabase error, falling back to file storage:', supabaseError);

        // Fallback to file storage
        const assignments = loadAssignments();
        const assignmentIndex = assignments.findIndex(a => a.id === assignment_id);

        if (assignmentIndex === -1) {
          return NextResponse.json(
            { error: 'Assignment not found' },
            { status: 404 }
          );
        }

        assignments[assignmentIndex].returned_at = returnDate;
        assignments[assignmentIndex].updated_at = new Date().toISOString();
        saveAssignments(assignments);

        console.log(`✅ Equipment returned in file storage:`, {
          assignmentId: assignment_id,
          returnedAt: returnDate
        });

        return NextResponse.json({
          message: 'Equipment returned successfully',
          assignment: {
            id: assignment_id,
            returned_at: returnDate
          }
        });
      }
    }

    return NextResponse.json(
      { error: 'Invalid action or missing assignment_id' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Equipment assignment PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update assignment' },
      { status: 500 }
    );
  }
}
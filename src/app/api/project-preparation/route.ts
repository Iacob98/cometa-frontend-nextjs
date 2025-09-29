import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service role client for bypassing RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Get project basic info from Supabase
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        customer,
        city,
        address,
        contact_24h,
        start_date,
        end_date_plan,
        status,
        total_length_m,
        base_rate_per_m,
        pm_user_id,
        manager:users!projects_pm_user_id_fkey(
          id,
          first_name,
          last_name
        )
      `)
      .eq('id', projectId)
      .single();

    if (projectError) {
      if (projectError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }
      console.error('Supabase project query error:', projectError);
      return NextResponse.json(
        { error: 'Failed to fetch project data' },
        { status: 500 }
      );
    }

    // Get real preparation data from database
    const [facilitiesResult, housingResult, plansResult, utilityContactsResult] = await Promise.all([
      // Get facilities
      supabase
        .from('facilities')
        .select(`
          id,
          name,
          type,
          floor,
          access_info,
          contact_info,
          notes,
          created_at
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false }),

      // Get housing units
      supabase
        .from('housing_units')
        .select(`
          id,
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
          created_at
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false }),

      // Get project plans
      supabase
        .from('project_plans')
        .select(`
          id,
          title,
          description,
          plan_type,
          filename,
          file_size,
          file_url,
          file_path,
          uploaded_at
        `)
        .eq('project_id', projectId)
        .order('uploaded_at', { ascending: false }),

      // Get utility contacts
      supabase
        .from('utility_contacts')
        .select(`
          id,
          kind,
          organization,
          contact_person,
          phone,
          email,
          notes,
          created_at
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
    ]);

    // Check for errors
    if (facilitiesResult.error) {
      console.error('Facilities query error:', facilitiesResult.error);
    }
    if (housingResult.error) {
      console.error('Housing query error:', housingResult.error);
    }
    if (plansResult.error) {
      console.error('Plans query error:', plansResult.error);
    }
    if (utilityContactsResult.error) {
      console.error('Utility contacts query error:', utilityContactsResult.error);
    }

    // Calculate completion percentage based on real data
    const totalItems = (facilitiesResult.data?.length || 0) +
                      (housingResult.data?.length || 0) +
                      (plansResult.data?.length || 0) +
                      (utilityContactsResult.data?.length || 0);

    const completedHousing = housingResult.data?.filter(h => h.status === 'completed').length || 0;
    const completionPercentage = totalItems > 0 ? Math.round((completedHousing / totalItems) * 100) : 0;

    const preparationData = {
      project: {
        ...project,
        manager_name: project.manager ? `${project.manager.first_name} ${project.manager.last_name}` : null,
      },
      preparation: {
        phase: completionPercentage > 75 ? 'ready' : completionPercentage > 25 ? 'planning' : 'initial',
        completion_percentage: completionPercentage,
        facilities: facilitiesResult.data || [],
        housing: housingResult.data || [],
        plans: plansResult.data || [],
        utility_contacts: utilityContactsResult.data || []
      },
      steps_summary: {
        utility_contacts: utilityContactsResult.data?.length || 0,
        facilities: facilitiesResult.data?.length || 0,
        housing_units: housingResult.data?.length || 0,
        plans: plansResult.data?.length || 0,
        crews: 0, // TODO: Add crews count when available
        materials: 0, // TODO: Add materials count when available
        equipment: 0 // TODO: Add equipment count when available
      }
    };

    return NextResponse.json(preparationData);
  } catch (error) {
    console.error('Project preparation API error:', error);
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
    const { project_id, item_type, data } = body;

    if (!project_id || !item_type || !data) {
      return NextResponse.json(
        { error: 'Project ID, item type, and data are required' },
        { status: 400 }
      );
    }

    let result;
    let error;

    // Create different types of preparation items based on type
    switch (item_type) {
      case 'facility':
        ({ data: result, error } = await supabase
          .from('facilities')
          .insert({
            project_id,
            name: data.name,
            type: data.type || 'apartment',
            floor: data.floor,
            access_info: data.access_info,
            contact_info: data.contact_info,
            notes: data.notes
          })
          .select()
          .single());
        break;

      case 'housing_unit':
        ({ data: result, error } = await supabase
          .from('housing_units')
          .insert({
            project_id,
            unit_number: data.unit_number,
            unit_type: data.unit_type || 'apartment',
            floor: data.floor,
            room_count: data.room_count,
            area_sqm: data.area_sqm,
            contact_person: data.contact_person,
            contact_phone: data.contact_phone,
            access_instructions: data.access_instructions,
            installation_notes: data.installation_notes,
            status: data.status || 'pending'
          })
          .select()
          .single());
        break;

      case 'utility_contact':
        ({ data: result, error } = await supabase
          .from('utility_contacts')
          .insert({
            project_id,
            kind: data.kind,
            organization: data.organization,
            contact_person: data.contact_person,
            phone: data.phone,
            email: data.email,
            notes: data.notes
          })
          .select()
          .single());
        break;

      case 'project_plan':
        ({ data: result, error } = await supabase
          .from('project_plans')
          .insert({
            project_id,
            title: data.title,
            description: data.description,
            plan_type: data.plan_type,
            filename: data.filename,
            file_size: data.file_size,
            file_url: data.file_url,
            file_path: data.file_path
          })
          .select()
          .single());
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid item type. Must be one of: facility, housing_unit, utility_contact, project_plan' },
          { status: 400 }
        );
    }

    if (error) {
      console.error(`Supabase ${item_type} creation error:`, error);
      return NextResponse.json(
        { error: `Failed to create ${item_type} in database` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `${item_type.replace('_', ' ')} added successfully`,
      item: result,
      type: item_type
    }, { status: 201 });
  } catch (error) {
    console.error('Project preparation POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create preparation item' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { project_id, status, reason } = body;

    if (!project_id || !status) {
      return NextResponse.json(
        { error: 'Project ID and status are required' },
        { status: 400 }
      );
    }

    // Validate status values
    const validStatuses = ['draft', 'planning', 'active', 'paused', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Update project status
    const { data: updatedProject, error } = await supabase
      .from('projects')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', project_id)
      .select(`
        id,
        name,
        status,
        updated_at
      `)
      .single();

    if (error) {
      console.error('Supabase project status update error:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to update project status' },
        { status: 500 }
      );
    }

    // Log status change (optional - could add to activity log table)
    console.log(`Project ${project_id} status changed to ${status}`, reason ? `Reason: ${reason}` : '');

    return NextResponse.json({
      message: 'Project status updated successfully',
      project: updatedProject,
      previous_status: status, // You could track this if needed
      reason
    });
  } catch (error) {
    console.error('Project preparation PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update project status' },
      { status: 500 }
    );
  }
}
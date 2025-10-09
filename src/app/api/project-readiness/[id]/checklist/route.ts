import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Default checklist items based on frontend categories
const DEFAULT_CHECKLIST_ITEMS = [
  // Documentation category
  { title: 'Project plans uploaded', description: 'Upload all necessary project plans and technical drawings', category: 'documentation', required: true },
  { title: 'Utility contact information complete', description: 'Add contact information for all utility companies', category: 'documentation', required: true },
  { title: 'Building permits obtained', description: 'Obtain all necessary building and construction permits', category: 'documentation', required: false },
  { title: 'Safety documentation complete', description: 'Complete all safety and HSE documentation', category: 'documentation', required: false },

  // Resources category
  { title: 'Team assignments complete', description: 'Assign crews and team members to the project', category: 'resources', required: true },
  { title: 'Equipment allocation finalized', description: 'Allocate necessary equipment to the project', category: 'resources', required: true },
  { title: 'Material inventory sufficient', description: 'Ensure sufficient material inventory is allocated', category: 'resources', required: true },
  { title: 'Subcontractors confirmed', description: 'Confirm subcontractor agreements and schedules', category: 'resources', required: false },

  // Infrastructure category
  { title: 'Zone layout confirmed', description: 'Confirm cabinet locations and zone layout', category: 'infrastructure', required: true },
  { title: 'Cabinet locations defined', description: 'Define all cabinet locations in the project area', category: 'infrastructure', required: true },
  { title: 'House connections mapped', description: 'Map all house connections and fiber routes', category: 'infrastructure', required: true },
  { title: 'Network segments planned', description: 'Plan network segments between cabinets', category: 'infrastructure', required: false },

  // Approvals category
  { title: 'Management approval obtained', description: 'Obtain management approval for project initiation', category: 'approvals', required: true },
  { title: 'Customer agreements signed', description: 'Sign all customer and stakeholder agreements', category: 'approvals', required: false },
  { title: 'Regulatory clearances complete', description: 'Complete all regulatory clearances and compliance checks', category: 'approvals', required: false },
  { title: 'Budget authorization confirmed', description: 'Confirm budget authorization and financial approval', category: 'approvals', required: true },
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Check if project exists
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Fetch existing checklist items
    const { data: checklistItems, error: checklistError } = await supabase
      .from('project_checklist_items')
      .select('*')
      .eq('project_id', projectId)
      .order('order_index', { ascending: true });

    if (checklistError) {
      console.error('Failed to fetch checklist items:', checklistError);
      return NextResponse.json(
        { error: 'Failed to fetch checklist items' },
        { status: 500 }
      );
    }

    // If no checklist items exist, generate default ones
    if (!checklistItems || checklistItems.length === 0) {
      const defaultItems = DEFAULT_CHECKLIST_ITEMS.map((item, index) => ({
        project_id: projectId,
        ...item,
        order_index: index,
        action_required: item.required ? 'Complete this required item' : null
      }));

      // Insert default checklist items
      const { data: insertedItems, error: insertError } = await supabase
        .from('project_checklist_items')
        .insert(defaultItems)
        .select('*');

      if (insertError) {
        console.error('Failed to create default checklist:', insertError);
        // Return empty array if we can't create defaults
        return NextResponse.json([]);
      }

      // Format and return the newly created items
      const formattedItems = (insertedItems || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.category,
        required: item.required,
        completed: item.completed,
        completed_date: item.completed_date,
        action_required: item.action_required
      }));

      return NextResponse.json(formattedItems);
    }

    // Format existing checklist items
    const formattedItems = checklistItems.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      required: item.required,
      completed: item.completed,
      completed_date: item.completed_date ? new Date(item.completed_date).toISOString() : null,
      action_required: item.action_required
    }));

    return NextResponse.json(formattedItems);

  } catch (error) {
    console.error('Project checklist API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project checklist' },
      { status: 500 }
    );
  }
}
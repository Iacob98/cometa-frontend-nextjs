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
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Feature ID is required' },
        { status: 400 }
      );
    }

    const { data: feature, error } = await supabase
      .from('geospatial_features')
      .select(`
        id,
        type,
        geometry,
        properties,
        project_id,
        entity_type,
        entity_id,
        created_at,
        updated_at,
        created_by
      `)
      .eq('id', id)
      .single();

    if (error || !feature) {
      return NextResponse.json(
        { error: 'Feature not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(feature);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch geospatial feature' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Feature ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (body.type !== undefined) updateData.type = body.type;
    if (body.geometry !== undefined) updateData.geometry = body.geometry;
    if (body.properties !== undefined) updateData.properties = body.properties;
    if (body.project_id !== undefined) updateData.project_id = body.project_id;
    if (body.entity_type !== undefined) updateData.entity_type = body.entity_type;
    if (body.entity_id !== undefined) updateData.entity_id = body.entity_id;

    const { data: feature, error } = await supabase
      .from('geospatial_features')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json(
        { error: 'Failed to update geospatial feature' },
        { status: 500 }
      );
    }

    return NextResponse.json(feature);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to update geospatial feature' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Feature ID is required' },
        { status: 400 }
      );
    }

    // Check if feature exists first
    const { data: existingFeature, error: checkError } = await supabase
      .from('geospatial_features')
      .select('id, type, entity_type')
      .eq('id', id)
      .single();

    if (checkError || !existingFeature) {
      return NextResponse.json(
        { error: 'Geospatial feature not found' },
        { status: 404 }
      );
    }

    // Delete the feature
    const { error } = await supabase
      .from('geospatial_features')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete geospatial feature' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Geospatial feature (${existingFeature.type}) deleted successfully`
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete geospatial feature' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/work-stages
 *
 * Returns the canonical list of work stages used in fiber optic construction.
 * These stage codes MUST match the database values in work_entries.stage_code column.
 *
 * CANONICAL SOURCE: PostgreSQL work_entries table
 * Verified stage codes: stage_1_marking, stage_2_excavation, stage_3_conduit,
 *                      stage_4_cable, stage_5_splice, stage_6_test, stage_9_backfill
 */
export async function GET(request: NextRequest) {
  try {
    // Canonical work stages - matches database exactly
    const stages = [
      {
        code: 'stage_1_marking',
        name: 'Marking',
        description: 'Cable route marking and site preparation',
        order: 1,
        requires_gps: true,
        requires_photos: true,
        typical_duration_hours: 2,
      },
      {
        code: 'stage_2_excavation',
        name: 'Excavation',
        description: 'Digging trenches for cable installation',
        order: 2,
        requires_gps: true,
        requires_photos: true,
        typical_duration_hours: 4,
      },
      {
        code: 'stage_3_conduit',
        name: 'Conduit Installation',
        description: 'Installing protective conduit for cables',
        order: 3,
        requires_gps: true,
        requires_photos: true,
        typical_duration_hours: 3,
      },
      {
        code: 'stage_4_cable',
        name: 'Cable Installation',
        description: 'Installing fiber optic cables through conduit',
        order: 4,
        requires_gps: true,
        requires_photos: true,
        typical_duration_hours: 6,
      },
      {
        code: 'stage_5_splice',
        name: 'Cable Splicing',
        description: 'Splicing fiber optic connections',
        order: 5,
        requires_gps: true,
        requires_photos: true,
        typical_duration_hours: 3,
      },
      {
        code: 'stage_6_test',
        name: 'Signal Testing',
        description: 'Testing signal quality and connectivity',
        order: 6,
        requires_gps: true,
        requires_photos: false,
        typical_duration_hours: 2,
      },
      {
        code: 'stage_9_backfill',
        name: 'Backfilling',
        description: 'Filling trenches after cable installation',
        order: 9,
        requires_gps: true,
        requires_photos: true,
        typical_duration_hours: 3,
      },
    ];

    return NextResponse.json({
      stages,
      total: stages.length,
      message: 'Work stages retrieved successfully',
    });
  } catch (error) {
    console.error('Work stages API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch work stages' },
      { status: 500 }
    );
  }
}

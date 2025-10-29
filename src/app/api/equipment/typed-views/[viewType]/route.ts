/**
 * Typed Equipment Views API
 * GET: Fetch equipment with type-specific columns
 *
 * Available views:
 * - power_tools: Power tool specific fields (watts, voltage, battery, etc.)
 * - fusion_splicers: Fusion splicer fields (calibration, splice loss, etc.)
 * - otdrs: OTDR fields (wavelength, dynamic range, etc.)
 * - safety_gear: Safety gear fields (size, certification, inspection dates)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase-server';
import { requireEquipmentPermission } from '@/lib/auth-middleware';

import { createClient } from '@supabase/supabase-js';
import type {
  PowerToolView,
  FusionSplicerView,
  OTDRView,
  SafetyGearView,
  PaginatedResponse,
} from '@/types/equipment-enhanced';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type ViewType = 'power_tools' | 'fusion_splicers' | 'otdrs' | 'safety_gear';
type TypedView = PowerToolView | FusionSplicerView | OTDRView | SafetyGearView;

const VIEW_NAMES: Record<ViewType, string> = {
  power_tools: 'v_equipment_power_tools',
  fusion_splicers: 'v_equipment_fusion_splicers',
  otdrs: 'v_equipment_otdrs',
  safety_gear: 'v_equipment_safety_gear',
};

// GET /api/equipment/typed-views/[viewType]
export async function GET(
  request: NextRequest,
  {
  // 🔒 SECURITY: Require view permission
  const authResult = await requireEquipmentPermission(request, 'view');
  if (authResult instanceof NextResponse) return authResult;

  try {
    const supabase = getSupabaseServerClient();
params }: { params: Promise<{ viewType: ViewType }> }
) {
  try {
    const { viewType } = await params;

    // Validate view type
    if (!VIEW_NAMES[viewType]) {
      return NextResponse.json(
        { error: `Invalid view type: ${viewType}. Must be one of: power_tools, fusion_splicers, otdrs, safety_gear` },
        { status: 400 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const owned = searchParams.get('owned');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const per_page = parseInt(searchParams.get('per_page') || '20');

    // Query the appropriate view
    const viewName = VIEW_NAMES[viewType];

    // Build query - note: we query the view directly, not the equipment table
    let query = supabase
      .from(viewName)
      .select('*', { count: 'exact' })
      .order('name', { ascending: true });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (owned !== null && owned !== undefined) {
      query = query.eq('owned', owned === 'true');
    }

    // Search filter (searches across name, inventory_no, brand, model)
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,inventory_no.ilike.%${search}%,brand.ilike.%${search}%,model.ilike.%${search}%`
      );
    }

    // Pagination
    const offset = (page - 1) * per_page;
    query = query.range(offset, offset + per_page - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error(`Supabase error fetching ${viewType}:`, error);
      return NextResponse.json(
        { error: `Failed to fetch ${viewType} equipment` },
        { status: 500 }
      );
    }

    const response: PaginatedResponse<TypedView> = {
      items: (data || []) as TypedView[],
      total: count || 0,
      page,
      per_page,
      total_pages: Math.ceil((count || 0) / per_page),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching typed equipment view:', error);
    return NextResponse.json(
      { error: 'Failed to fetch typed equipment view' },
      { status: 500 }
    );
  }
}

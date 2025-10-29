/**
 * Equipment Reservation Detail API
 * DELETE: Cancel/delete reservation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase-server';
import { requireEquipmentPermission } from '@/lib/auth-middleware';



// DELETE /api/equipment/reservations/[id] - Cancel reservation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 🔒 SECURITY: Require reserve permission
  const authResult = await requireEquipmentPermission(request, 'reserve');
  if (authResult instanceof NextResponse) return authResult;

  try {
    const supabase = getSupabaseServerClient();
    const { id } = params;

    // Check if reservation exists
    const { data: existing, error: checkError } = await supabase
      .from('equipment_reservations')
      .select('id, is_active')
      .eq('id', id)
      .single();

    if (checkError || !existing) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }

    // Soft delete (set is_active = false)
    const { data: updated, error: updateError } = await supabase
      .from('equipment_reservations')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, is_active')
      .single();

    if (updateError) {
      console.error('Error cancelling reservation:', updateError);
      return NextResponse.json(
        { error: 'Failed to cancel equipment reservation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Reservation cancelled successfully',
      reservation_id: updated.id,
    });
  } catch (error) {
    console.error('Error deleting equipment reservation:', error);
    return NextResponse.json(
      { error: 'Failed to delete equipment reservation' },
      { status: 500 }
    );
  }
}

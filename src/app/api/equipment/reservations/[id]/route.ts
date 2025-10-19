/**
 * Equipment Reservation Detail API
 * DELETE: Cancel/delete reservation
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-pool';

// DELETE /api/equipment/reservations/[id] - Cancel reservation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if reservation exists and is active
    const checkQuery = `
      SELECT id, is_active
      FROM equipment_reservations
      WHERE id = $1
    `;
    const checkResult = await query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }

    // Soft delete (set is_active = false)
    const deleteQuery = `
      UPDATE equipment_reservations
      SET is_active = false, updated_at = NOW()
      WHERE id = $1
      RETURNING id, is_active
    `;
    const deleteResult = await query(deleteQuery, [id]);

    return NextResponse.json({
      success: true,
      message: 'Reservation cancelled successfully',
      reservation_id: deleteResult.rows[0].id,
    });
  } catch (error) {
    console.error('Error deleting equipment reservation:', error);
    return NextResponse.json(
      { error: 'Failed to delete equipment reservation' },
      { status: 500 }
    );
  }
}

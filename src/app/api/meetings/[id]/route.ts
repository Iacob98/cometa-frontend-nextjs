import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { UpdateMeetingRequest } from '@/types/calendar'

/**
 * GET /api/meetings/[id]
 * Fetch a single meeting by ID
 */
export async function GET(
  request: NextRequest,
  context: RouteContext<'/api/meetings/[id]'>
) {
  try {
    const { id } = await context.params
    const supabase = await createClient()

    const { data: meeting, error } = await supabase
      .from('meetings')
      .select(`
        *,
        projects (id, name),
        users!meetings_created_by_fkey (id, full_name, email),
        meeting_participants (
          id,
          user_id,
          response_status,
          users (id, full_name, email, avatar_url)
        )
      `)
      .eq('id', id)
      .single()

    if (error || !meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }

    return NextResponse.json({ meeting })
  } catch (error) {
    console.error('Error in GET /api/meetings/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/meetings/[id]
 * Update a meeting
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext<'/api/meetings/[id]'>
) {
  try {
    const { id } = await context.params
    const supabase = await createClient()
    const body: UpdateMeetingRequest = await request.json()

    // Build update object (only include provided fields)
    const updates: any = {}
    if (body.title !== undefined) updates.title = body.title
    if (body.description !== undefined) updates.description = body.description
    if (body.meeting_date !== undefined) updates.meeting_date = body.meeting_date
    if (body.meeting_time !== undefined) updates.meeting_time = body.meeting_time
    if (body.duration_minutes !== undefined) updates.duration_minutes = body.duration_minutes
    if (body.meeting_type !== undefined) updates.meeting_type = body.meeting_type
    if (body.project_id !== undefined) updates.project_id = body.project_id
    if (body.location !== undefined) updates.location = body.location
    if (body.notes !== undefined) updates.notes = body.notes
    if (body.status !== undefined) updates.status = body.status

    // Update meeting
    const { data: meeting, error: updateError } = await supabase
      .from('meetings')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (updateError || !meeting) {
      console.error('Error updating meeting:', updateError)
      return NextResponse.json({ error: 'Failed to update meeting' }, { status: 500 })
    }

    // Update participants if provided
    if (body.participant_ids) {
      // Remove existing participants
      await supabase.from('meeting_participants').delete().eq('meeting_id', id)

      // Add new participants
      if (body.participant_ids.length > 0) {
        const participants = body.participant_ids.map((userId) => ({
          meeting_id: id,
          user_id: userId,
          response_status: 'pending',
        }))

        await supabase.from('meeting_participants').insert(participants)
      }
    }

    // Fetch the complete updated meeting
    const { data: completeMeeting } = await supabase
      .from('meetings')
      .select(`
        *,
        projects (id, name),
        users!meetings_created_by_fkey (id, full_name, email),
        meeting_participants (
          id,
          user_id,
          response_status,
          users (id, full_name, email, avatar_url)
        )
      `)
      .eq('id', id)
      .single()

    return NextResponse.json({ meeting: completeMeeting })
  } catch (error) {
    console.error('Error in PUT /api/meetings/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/meetings/[id]
 * Delete a meeting
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext<'/api/meetings/[id]'>
) {
  try {
    const { id } = await context.params
    const supabase = await createClient()

    // Delete meeting (participants will be deleted automatically due to CASCADE)
    const { error } = await supabase.from('meetings').delete().eq('id', id)

    if (error) {
      console.error('Error deleting meeting:', error)
      return NextResponse.json({ error: 'Failed to delete meeting' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/meetings/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

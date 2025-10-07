import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { CreateMeetingRequest, Meeting } from '@/types/calendar'

// Service role client for accessing all data
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * GET /api/meetings
 * Fetch all meetings with optional filters
 * Query params: project_id, start_date, end_date, meeting_type, status
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const projectId = searchParams.get('project_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const meetingType = searchParams.get('meeting_type')
    const status = searchParams.get('status')

    let query = supabase
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
      .order('meeting_date', { ascending: false })
      .order('meeting_time', { ascending: true })

    // Apply filters
    if (projectId) {
      query = query.eq('project_id', projectId)
    }
    if (startDate) {
      query = query.gte('meeting_date', startDate)
    }
    if (endDate) {
      query = query.lte('meeting_date', endDate)
    }
    if (meetingType) {
      query = query.eq('meeting_type', meetingType)
    }
    if (status) {
      query = query.eq('status', status)
    }

    const { data: meetings, error } = await query

    if (error) {
      console.error('Error fetching meetings:', error)
      return NextResponse.json({ error: 'Failed to fetch meetings' }, { status: 500 })
    }

    return NextResponse.json({ meetings })
  } catch (error) {
    console.error('Error in GET /api/meetings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/meetings
 * Create a new meeting
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateMeetingRequest = await request.json()

    // Validate required fields
    if (!body.title || !body.meeting_date || !body.meeting_type) {
      return NextResponse.json(
        { error: 'title, meeting_date, and meeting_type are required' },
        { status: 400 }
      )
    }

    // Get current user (for created_by)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Create meeting
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .insert({
        title: body.title,
        description: body.description,
        meeting_date: body.meeting_date,
        meeting_time: body.meeting_time,
        duration_minutes: body.duration_minutes || 60,
        meeting_type: body.meeting_type,
        project_id: body.project_id,
        location: body.location,
        notes: body.notes,
        created_by: user?.id,
        status: 'scheduled',
      })
      .select()
      .single()

    if (meetingError) {
      console.error('Error creating meeting:', meetingError)
      return NextResponse.json({ error: 'Failed to create meeting' }, { status: 500 })
    }

    // Add participants if provided
    if (body.participant_ids && body.participant_ids.length > 0) {
      const participants = body.participant_ids.map((userId) => ({
        meeting_id: meeting.id,
        user_id: userId,
        response_status: 'pending',
      }))

      const { error: participantsError } = await supabase
        .from('meeting_participants')
        .insert(participants)

      if (participantsError) {
        console.error('Error adding participants:', participantsError)
        // Don't fail the request, just log the error
      }
    }

    // Fetch the complete meeting with relations
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
      .eq('id', meeting.id)
      .single()

    return NextResponse.json({ meeting: completeMeeting }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/meetings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

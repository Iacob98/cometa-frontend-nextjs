import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type {
  CalendarEvent,
  ProjectEvent,
  MaterialDeliveryEvent,
  HouseConnectionEvent,
  MeetingEvent,
  WorkEntryEvent,
  GetCalendarEventsRequest,
  EVENT_TYPE_COLORS,
} from '@/types/calendar'

// Service role client for accessing all data
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * GET /api/calendar/events
 * Fetch aggregated calendar events from all sources
 * Query params: start_date, end_date, event_types[], project_id
 */
export async function GET(request: NextRequest) {
  try {

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const eventTypesParam = searchParams.get('event_types')
    const projectId = searchParams.get('project_id')

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'start_date and end_date are required' },
        { status: 400 }
      )
    }

    // Parse event types filter
    const eventTypes = eventTypesParam ? eventTypesParam.split(',') : []
    const includeAllTypes = eventTypes.length === 0

    // Aggregate events from all sources
    const events: CalendarEvent[] = []

    // 1. Project Events (start dates and deadlines)
    if (includeAllTypes || eventTypes.includes('project_start') || eventTypes.includes('project_deadline')) {
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, start_date, end_date_plan, status')
        .or(`start_date.gte.${startDate},end_date_plan.gte.${startDate}`)
        .or(`start_date.lte.${endDate},end_date_plan.lte.${endDate}`)
        .order('start_date', { ascending: true })

      if (projectsError) {
        console.error('Error fetching projects:', projectsError)
      } else if (projects) {
        projects.forEach((project) => {
          // Project start event
          if (project.start_date && (includeAllTypes || eventTypes.includes('project_start'))) {
            const startEvent: ProjectEvent = {
              id: `project-start-${project.id}`,
              type: 'project_start',
              title: `${project.name} - Start`,
              description: `Project ${project.name} starts`,
              date: project.start_date,
              color: EVENT_TYPE_COLORS.project_start,
              project_id: project.id,
              project_name: project.name,
              project_status: project.status,
            }
            events.push(startEvent)
          }

          // Project deadline event
          if (project.end_date_plan && (includeAllTypes || eventTypes.includes('project_deadline'))) {
            const deadlineEvent: ProjectEvent = {
              id: `project-deadline-${project.id}`,
              type: 'project_deadline',
              title: `${project.name} - Deadline`,
              description: `Project ${project.name} deadline`,
              date: project.end_date_plan,
              color: EVENT_TYPE_COLORS.project_deadline,
              project_id: project.id,
              project_name: project.name,
              project_status: project.status,
            }
            events.push(deadlineEvent)
          }
        })
      }
    }

    // 2. Material Delivery Events
    if (includeAllTypes || eventTypes.includes('material_delivery')) {
      let query = supabase
        .from('material_orders')
        .select(`
          id,
          quantity,
          status,
          expected_delivery_date,
          actual_delivery_date,
          supplier,
          project_id,
          projects (id, name),
          materials (id, name, unit)
        `)
        .or(`expected_delivery_date.gte.${startDate},actual_delivery_date.gte.${startDate}`)
        .or(`expected_delivery_date.lte.${endDate},actual_delivery_date.lte.${endDate}`)

      if (projectId) {
        query = query.eq('project_id', projectId)
      }

      const { data: deliveries, error: deliveriesError } = await query

      if (deliveriesError) {
        console.error('Error fetching material deliveries:', deliveriesError)
      } else if (deliveries) {
        deliveries.forEach((delivery: any) => {
          const isDelivered = delivery.status === 'received'
          const displayDate = isDelivered ? delivery.actual_delivery_date : delivery.expected_delivery_date

          if (!displayDate) return

          const deliveryEvent: MaterialDeliveryEvent = {
            id: `material-delivery-${delivery.id}`,
            type: 'material_delivery',
            title: `Delivery: ${delivery.materials?.name || 'Material'}`,
            description: `${delivery.quantity} ${delivery.materials?.unit || 'units'} from ${delivery.supplier || 'supplier'}`,
            date: displayDate,
            color: EVENT_TYPE_COLORS.material_delivery,
            order_id: delivery.id,
            material_name: delivery.materials?.name || 'Unknown Material',
            quantity: delivery.quantity,
            supplier: delivery.supplier,
            is_delivered: isDelivered,
            expected_date: delivery.expected_delivery_date,
            actual_date: delivery.actual_delivery_date,
            project_id: delivery.project_id,
            project_name: delivery.projects?.name,
          }
          events.push(deliveryEvent)
        })
      }
    }

    // 3. House Connection Events
    if (includeAllTypes || eventTypes.includes('house_connection')) {
      let query = supabase
        .from('houses')
        .select(`
          id,
          house_number,
          street,
          city,
          planned_connection_date,
          actual_connection_date,
          status,
          project_id,
          projects (id, name),
          assigned_crew_id,
          crews (id, name)
        `)
        .or(`planned_connection_date.gte.${startDate},actual_connection_date.gte.${startDate}`)
        .or(`planned_connection_date.lte.${endDate},actual_connection_date.lte.${endDate}`)

      if (projectId) {
        query = query.eq('project_id', projectId)
      }

      const { data: houses, error: housesError } = await query

      if (housesError) {
        console.error('Error fetching house connections:', housesError)
      } else if (houses) {
        houses.forEach((house: any) => {
          const isCompleted = !!house.actual_connection_date
          const displayDate = isCompleted ? house.actual_connection_date : house.planned_connection_date

          if (!displayDate) return

          const address = [house.street, house.house_number, house.city].filter(Boolean).join(', ')

          const houseEvent: HouseConnectionEvent = {
            id: `house-connection-${house.id}`,
            type: 'house_connection',
            title: `House Connection: ${address}`,
            description: isCompleted ? 'Completed connection' : 'Planned connection',
            date: displayDate,
            color: EVENT_TYPE_COLORS.house_connection,
            house_id: house.id,
            house_address: address,
            planned_date: house.planned_connection_date,
            actual_date: house.actual_connection_date,
            is_completed: isCompleted,
            crew_id: house.assigned_crew_id,
            project_id: house.project_id,
            project_name: house.projects?.name,
          }
          events.push(houseEvent)
        })
      }
    }

    // 4. Meeting Events
    if (includeAllTypes || eventTypes.includes('meeting')) {
      let query = supabase
        .from('meetings')
        .select(`
          id,
          title,
          description,
          meeting_date,
          meeting_time,
          duration_minutes,
          meeting_type,
          location,
          status,
          project_id,
          projects (id, name),
          meeting_participants (count)
        `)
        .gte('meeting_date', startDate)
        .lte('meeting_date', endDate)

      if (projectId) {
        query = query.eq('project_id', projectId)
      }

      const { data: meetings, error: meetingsError } = await query

      if (meetingsError) {
        console.error('Error fetching meetings:', meetingsError)
      } else if (meetings) {
        meetings.forEach((meeting: any) => {
          const meetingEvent: MeetingEvent = {
            id: `meeting-${meeting.id}`,
            type: 'meeting',
            title: meeting.title,
            description: meeting.description,
            date: meeting.meeting_date,
            time: meeting.meeting_time,
            color: EVENT_TYPE_COLORS.meeting,
            meeting_id: meeting.id,
            meeting_type: meeting.meeting_type,
            location: meeting.location,
            duration_minutes: meeting.duration_minutes || 60,
            participants_count: meeting.meeting_participants?.[0]?.count || 0,
            meeting_status: meeting.status,
            project_id: meeting.project_id,
            project_name: meeting.projects?.name,
          }
          events.push(meetingEvent)
        })
      }
    }

    // 5. Work Entry Events
    if (includeAllTypes || eventTypes.includes('work_entry')) {
      let query = supabase
        .from('work_entries')
        .select(`
          id,
          work_date,
          hours_worked,
          description,
          project_id,
          projects (id, name),
          crew_id,
          crews (id, name)
        `)
        .gte('work_date', startDate)
        .lte('work_date', endDate)

      if (projectId) {
        query = query.eq('project_id', projectId)
      }

      const { data: workEntries, error: workEntriesError } = await query

      if (workEntriesError) {
        console.error('Error fetching work entries:', workEntriesError)
      } else if (workEntries) {
        workEntries.forEach((entry: any) => {
          const workEvent: WorkEntryEvent = {
            id: `work-entry-${entry.id}`,
            type: 'work_entry',
            title: `Work: ${entry.projects?.name || 'Project'}`,
            description: entry.description || `Work entry by ${entry.crews?.name || 'crew'}`,
            date: entry.work_date,
            color: EVENT_TYPE_COLORS.work_entry,
            work_entry_id: entry.id,
            crew_name: entry.crews?.name,
            hours_worked: entry.hours_worked,
            project_id: entry.project_id,
            project_name: entry.projects?.name,
          }
          events.push(workEvent)
        })
      }
    }

    // Sort events by date
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return NextResponse.json({
      events,
      total: events.length,
    })
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

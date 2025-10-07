import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  CalendarEvent,
  CalendarEventType,
  GetCalendarEventsRequest,
  Meeting,
  CreateMeetingRequest,
  UpdateMeetingRequest,
} from '@/types/calendar'

// Query Keys
export const calendarKeys = {
  all: ['calendar'] as const,
  events: (params: GetCalendarEventsRequest) => ['calendar', 'events', params] as const,
  meetings: (filters?: Record<string, string>) => ['calendar', 'meetings', filters] as const,
  meeting: (id: string) => ['calendar', 'meeting', id] as const,
}

// Fetch calendar events from all sources
export function useCalendarEvents(params: GetCalendarEventsRequest) {
  return useQuery({
    queryKey: calendarKeys.events(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        start_date: params.start_date,
        end_date: params.end_date,
      })

      if (params.event_types && params.event_types.length > 0) {
        searchParams.append('event_types', params.event_types.join(','))
      }

      if (params.project_id) {
        searchParams.append('project_id', params.project_id)
      }

      const response = await fetch(`/api/calendar/events?${searchParams}`)

      if (!response.ok) {
        throw new Error('Failed to fetch calendar events')
      }

      const data = await response.json()
      return data as { events: CalendarEvent[]; total: number }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Fetch all meetings
export function useMeetings(filters?: {
  project_id?: string
  start_date?: string
  end_date?: string
  meeting_type?: string
  status?: string
}) {
  return useQuery({
    queryKey: calendarKeys.meetings(filters),
    queryFn: async () => {
      const searchParams = new URLSearchParams()

      if (filters?.project_id) searchParams.append('project_id', filters.project_id)
      if (filters?.start_date) searchParams.append('start_date', filters.start_date)
      if (filters?.end_date) searchParams.append('end_date', filters.end_date)
      if (filters?.meeting_type) searchParams.append('meeting_type', filters.meeting_type)
      if (filters?.status) searchParams.append('status', filters.status)

      const response = await fetch(`/api/meetings?${searchParams}`)

      if (!response.ok) {
        throw new Error('Failed to fetch meetings')
      }

      const data = await response.json()
      return data as { meetings: Meeting[] }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Fetch single meeting
export function useMeeting(id: string) {
  return useQuery({
    queryKey: calendarKeys.meeting(id),
    queryFn: async () => {
      const response = await fetch(`/api/meetings/${id}`)

      if (!response.ok) {
        throw new Error('Failed to fetch meeting')
      }

      const data = await response.json()
      return data.meeting as Meeting
    },
    enabled: !!id,
  })
}

// Create meeting mutation
export function useCreateMeeting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateMeetingRequest) => {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create meeting')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate calendar events and meetings queries
      queryClient.invalidateQueries({ queryKey: calendarKeys.all })
    },
  })
}

// Update meeting mutation
export function useUpdateMeeting(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateMeetingRequest) => {
      const response = await fetch(`/api/meetings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update meeting')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate calendar events and meetings queries
      queryClient.invalidateQueries({ queryKey: calendarKeys.all })
      queryClient.invalidateQueries({ queryKey: calendarKeys.meeting(id) })
    },
  })
}

// Delete meeting mutation
export function useDeleteMeeting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/meetings/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete meeting')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate calendar events and meetings queries
      queryClient.invalidateQueries({ queryKey: calendarKeys.all })
    },
  })
}

// Helper function to format event date and time
export function formatEventDateTime(event: CalendarEvent): string {
  const date = new Date(event.date)
  const dateStr = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  if (event.time) {
    return `${dateStr} at ${event.time}`
  }

  return dateStr
}

// Helper function to get event type label
export function getEventTypeLabel(type: CalendarEventType): string {
  const labels: Record<CalendarEventType, string> = {
    project_start: 'Project Start',
    project_deadline: 'Project Deadline',
    material_delivery: 'Material Delivery',
    house_connection: 'House Connection',
    meeting: 'Meeting',
    work_entry: 'Work Entry',
  }

  return labels[type]
}

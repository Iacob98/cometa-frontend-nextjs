/**
 * Calendar Event Types for COMETA System
 * Aggregates all date-related events from various sources
 */

// Meeting Types
export type MeetingType = 'pm_meeting' | 'team_meeting' | 'client_meeting' | 'site_visit' | 'other'
export type MeetingStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
export type ParticipantResponseStatus = 'pending' | 'accepted' | 'declined' | 'tentative'

export interface MeetingParticipant {
  id: string
  meeting_id: string
  user_id: string
  user?: {
    id: string
    full_name: string
    email: string
    avatar_url?: string
  }
  response_status: ParticipantResponseStatus
  created_at: string
}

export interface Meeting {
  id: string
  title: string
  description?: string
  meeting_date: string // ISO date string
  meeting_time?: string // HH:MM format
  duration_minutes: number
  meeting_type: MeetingType
  project_id?: string
  project?: {
    id: string
    name: string
  }
  created_by?: string
  creator?: {
    id: string
    full_name: string
  }
  location?: string
  notes?: string
  status: MeetingStatus
  participants?: MeetingParticipant[]
  created_at: string
  updated_at: string
}

// Calendar Event Types (aggregated from all sources)
export type CalendarEventType =
  | 'project_start'
  | 'project_deadline'
  | 'material_delivery'
  | 'house_connection'
  | 'meeting'
  | 'work_entry'

export interface BaseCalendarEvent {
  id: string
  type: CalendarEventType
  title: string
  description?: string
  date: string // ISO date string
  time?: string // HH:MM format
  color: string // Hex color for display
  project_id?: string
  project_name?: string
}

// Project-related events
export interface ProjectEvent extends BaseCalendarEvent {
  type: 'project_start' | 'project_deadline'
  project_id: string
  project_name: string
  project_status?: string
}

// Material delivery events
export interface MaterialDeliveryEvent extends BaseCalendarEvent {
  type: 'material_delivery'
  order_id: string
  material_name: string
  quantity: number
  supplier?: string
  is_delivered: boolean
  expected_date: string
  actual_date?: string
}

// House connection events
export interface HouseConnectionEvent extends BaseCalendarEvent {
  type: 'house_connection'
  house_id: string
  house_address: string
  planned_date: string
  actual_date?: string
  is_completed: boolean
  crew_id?: string
}

// Meeting events
export interface MeetingEvent extends BaseCalendarEvent {
  type: 'meeting'
  meeting_id: string
  meeting_type: MeetingType
  location?: string
  duration_minutes: number
  participants_count: number
  meeting_status: MeetingStatus
}

// Work entry events
export interface WorkEntryEvent extends BaseCalendarEvent {
  type: 'work_entry'
  work_entry_id: string
  crew_name?: string
  work_type?: string
  hours_worked?: number
}

// Union type for all calendar events
export type CalendarEvent =
  | ProjectEvent
  | MaterialDeliveryEvent
  | HouseConnectionEvent
  | MeetingEvent
  | WorkEntryEvent

// Calendar view modes
export type CalendarViewMode = 'month' | 'week' | 'day' | 'agenda'

// Calendar filters
export interface CalendarFilters {
  event_types: CalendarEventType[]
  project_ids?: string[]
  date_from?: string
  date_to?: string
}

// API request/response types
export interface GetCalendarEventsRequest {
  start_date: string // ISO date
  end_date: string // ISO date
  event_types?: CalendarEventType[]
  project_id?: string
}

export interface GetCalendarEventsResponse {
  events: CalendarEvent[]
  total: number
}

// Create meeting request
export interface CreateMeetingRequest {
  title: string
  description?: string
  meeting_date: string
  meeting_time?: string
  duration_minutes?: number
  meeting_type: MeetingType
  project_id?: string
  location?: string
  notes?: string
  participant_ids?: string[]
}

// Update meeting request
export interface UpdateMeetingRequest extends Partial<CreateMeetingRequest> {
  status?: MeetingStatus
}

// Event color mapping
export const EVENT_TYPE_COLORS: Record<CalendarEventType, string> = {
  project_start: '#10b981', // green
  project_deadline: '#ef4444', // red
  material_delivery: '#f59e0b', // amber
  house_connection: '#3b82f6', // blue
  meeting: '#8b5cf6', // purple
  work_entry: '#6366f1', // indigo
}

// Event type labels
export const EVENT_TYPE_LABELS: Record<CalendarEventType, string> = {
  project_start: 'Project Start',
  project_deadline: 'Project Deadline',
  material_delivery: 'Material Delivery',
  house_connection: 'House Connection',
  meeting: 'Meeting',
  work_entry: 'Work Entry',
}

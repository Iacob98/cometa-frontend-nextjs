"use client"

import * as React from "react"
import { useState } from "react"
import { format, isToday, isSameDay, startOfMonth, endOfMonth } from "date-fns"
import { Calendar as CalendarIcon, Plus, Filter, Users, Briefcase, Clock, MapPin, Package, Home } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useCalendarEvents } from "@/hooks/use-calendar"
import { useQuery } from "@tanstack/react-query"
import type {
  CalendarEvent,
  CalendarEventType,
  EVENT_TYPE_COLORS,
  EVENT_TYPE_LABELS,
} from "@/types/calendar"
import type { Project } from "@/types"

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [filters, setFilters] = useState<{
    eventTypes: CalendarEventType[]
    projectId?: string
  }>({
    eventTypes: ['project_start', 'project_deadline', 'material_delivery', 'house_connection', 'meeting', 'work_entry'],
  })
  const [showFilters, setShowFilters] = useState(false)

  // Calculate date range for current month
  const currentDate = selectedDate || new Date()
  const startDate = format(startOfMonth(currentDate), 'yyyy-MM-dd')
  const endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd')

  // Fetch calendar events using new hook
  const { data, isLoading } = useCalendarEvents({
    start_date: startDate,
    end_date: endDate,
    event_types: filters.eventTypes.length > 0 ? filters.eventTypes : undefined,
    project_id: filters.projectId,
  })

  const events = data?.events || []

  // Fetch projects for filter
  const { data: projectsData } = useQuery({
    queryKey: ['projects-list'],
    queryFn: async (): Promise<Project[]> => {
      const response = await fetch('/api/projects')
      if (!response.ok) throw new Error('Failed to fetch projects')
      const data = await response.json()
      return data.projects || []
    }
  })

  const projects = projectsData || []

  // Get events for a specific date
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter(event => isSameDay(new Date(event.date), date))
  }

  // Get selected date events
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : []

  // Event type configuration with new types
  const eventTypeConfig = {
    project_start: {
      label: 'Начало проектов',
      color: 'bg-green-500',
      icon: Briefcase
    },
    project_deadline: {
      label: 'Дедлайны проектов',
      color: 'bg-red-500',
      icon: Clock
    },
    material_delivery: {
      label: 'Поставки материалов',
      color: 'bg-amber-500',
      icon: Package
    },
    house_connection: {
      label: 'Подключения домов',
      color: 'bg-blue-500',
      icon: Home
    },
    meeting: {
      label: 'Встречи',
      color: 'bg-purple-500',
      icon: Users
    },
    work_entry: {
      label: 'Рабочие записи',
      color: 'bg-indigo-500',
      icon: MapPin
    }
  }

  const renderEventCard = (event: CalendarEvent) => {
    const config = eventTypeConfig[event.type]
    const IconComponent = config?.icon || CalendarIcon

    return (
      <Card key={event.id} className="mb-2 cursor-pointer hover:shadow-md transition-shadow">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <div className={cn("w-3 h-3 rounded-full mt-1", config?.color || "bg-gray-500")} />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <IconComponent className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">{event.title}</span>
                {event.type === 'material_delivery' && event.type === event.type && 'is_delivered' in event && (
                  <Badge variant={event.is_delivered ? "default" : "secondary"}>
                    {event.is_delivered ? 'Доставлено' : 'Запланировано'}
                  </Badge>
                )}
                {event.type === 'house_connection' && event.type === event.type && 'is_completed' in event && (
                  <Badge variant={event.is_completed ? "default" : "secondary"}>
                    {event.is_completed ? 'Выполнено' : 'Запланировано'}
                  </Badge>
                )}
                {event.type === 'meeting' && event.type === event.type && 'meeting_status' in event && (
                  <Badge variant="secondary">
                    {event.meeting_status.replace('_', ' ')}
                  </Badge>
                )}
              </div>
              {event.description && (
                <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
              )}
              {event.project_name && (
                <p className="text-xs text-blue-600 mt-1">📁 {event.project_name}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {event.time ? `${format(new Date(event.date), 'MMM d')} at ${event.time}` : format(new Date(event.date), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Календарь</h1>
          <p className="text-muted-foreground">
            Отслеживайте проекты, поставки, подключения, встречи и рабочие записи
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4" />
            Фильтры
          </Button>
          <Button>
            <Plus className="h-4 w-4" />
            Добавить событие
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Фильтры</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Event Types */}
              <div>
                <label className="text-sm font-medium mb-2 block">Типы событий</label>
                <div className="space-y-2">
                  {Object.entries(eventTypeConfig).map(([type, config]) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={filters.eventTypes.includes(type as CalendarEventType)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFilters(prev => ({
                              ...prev,
                              eventTypes: [...prev.eventTypes, type as CalendarEventType]
                            }))
                          } else {
                            setFilters(prev => ({
                              ...prev,
                              eventTypes: prev.eventTypes.filter(t => t !== type)
                            }))
                          }
                        }}
                      />
                      <label htmlFor={type} className="text-sm flex items-center gap-2 cursor-pointer">
                        <div className={cn("w-3 h-3 rounded-full", config.color)} />
                        {config.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects */}
              <div>
                <label className="text-sm font-medium mb-2 block">Фильтр по проекту</label>
                <Select
                  value={filters.projectId || "all"}
                  onValueChange={(value) => setFilters(prev => ({
                    ...prev,
                    projectId: value === "all" ? undefined : value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Все проекты" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все проекты</SelectItem>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2 order-1 lg:order-1">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {selectedDate ? format(selectedDate, 'MMMM yyyy') : 'Calendar'}
              </CardTitle>
              <Badge variant="secondary">
                {events.length} событий в этом месяце
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-hidden">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border w-full mx-auto max-w-full"
                modifiers={{
                  hasEvents: (date) => getEventsForDate(date).length > 0,
                  today: isToday
                }}
                modifiersStyles={{
                  hasEvents: {
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    fontWeight: 'bold'
                  }
                }}
              />
            </div>

            {/* Event indicators legend */}
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium mb-2">Легенда</p>
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
                {Object.entries(eventTypeConfig).map(([type, config]) => (
                  <div key={type} className="flex items-center gap-1 text-xs">
                    <div className={cn("w-2 h-2 rounded-full flex-shrink-0", config.color)} />
                    <span className="truncate">{config.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events for Selected Date */}
        <Card className="order-2 lg:order-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg sm:text-xl">
              {selectedDate ? format(selectedDate, 'd MMMM yyyy') : 'Выберите дату'}
            </CardTitle>
            <CardDescription>
              {selectedDateEvents.length} {selectedDateEvents.length === 1 ? 'событие' : selectedDateEvents.length < 5 ? 'события' : 'событий'} запланировано
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-muted rounded-md" />
                  </div>
                ))}
              </div>
            ) : selectedDateEvents.length > 0 ? (
              <div className="space-y-2 max-h-[400px] lg:max-h-[600px] overflow-y-auto">
                {selectedDateEvents.map(renderEventCard)}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm sm:text-base">На эту дату событий не запланировано</p>
                <Button variant="outline" size="sm" className="mt-2">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Добавить событие</span>
                  <span className="sm:hidden">Добавить</span>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Все события в этом месяце</CardTitle>
          <CardDescription>
            Показано {events.length} событий за {format(currentDate, 'MMMM yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
              <TabsTrigger value="all">Все</TabsTrigger>
              <TabsTrigger value="meeting">Встречи</TabsTrigger>
              <TabsTrigger value="project_deadline">Дедлайны</TabsTrigger>
              <TabsTrigger value="material_delivery" className="hidden lg:block">Поставки</TabsTrigger>
              <TabsTrigger value="house_connection" className="hidden lg:block">Подключения</TabsTrigger>
              <TabsTrigger value="work_entry" className="hidden lg:block">Работы</TabsTrigger>
              <TabsTrigger value="project_start" className="hidden lg:block">Начало</TabsTrigger>
            </TabsList>

            {Object.entries(eventTypeConfig).map(([type, config]) => (
              <TabsContent key={type} value={type} className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {events
                    .filter(event => event.type === type)
                    .slice(0, 9)
                    .map(renderEventCard)}
                  {events.filter(event => event.type === type).length === 0 && (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      <p>No {config.label.toLowerCase()} this month</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}

            <TabsContent value="all" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.slice(0, 12).map(renderEventCard)}
                {events.length === 0 && (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    <p>В этом месяце нет событий</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

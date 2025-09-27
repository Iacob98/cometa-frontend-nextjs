/**
 * VIRTUALIZED PROJECT LIST COMPONENT
 *
 * Специализированный виртуализированный список для отображения проектов
 * Оптимизирован для больших списков проектов с rich content
 */

'use client';

import React, { useMemo, useCallback } from 'react';
import { VirtualizedList, VirtualizedListItem } from '@/components/ui/virtualized-list';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, MapPin, User, Euro, Clock, Settings } from 'lucide-react';

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold' | 'cancelled';
  start_date: string;
  end_date?: string;
  budget?: number;
  spent_amount?: number;
  progress_percentage?: number;
  location?: string;
  project_manager?: string;
  team_count?: number;
  priority?: 'high' | 'medium' | 'low';
  client?: string;
  tags?: string[];
}

interface VirtualizedProjectListProps {
  projects: Project[];
  height: number;
  loading?: boolean;
  onProjectClick?: (project: Project) => void;
  onProjectSelect?: (project: Project, selected: boolean) => void;
  selectedProjectIds?: Set<string>;
  searchable?: boolean;
  showActions?: boolean;
  onEditProject?: (project: Project) => void;
  onDeleteProject?: (project: Project) => void;
  emptyMessage?: string;
  className?: string;
}

// OPTIMIZATION: Status configuration memoized
const STATUS_CONFIG = {
  planning: { label: 'Planning', color: 'bg-blue-100 text-blue-800' },
  active: { label: 'Active', color: 'bg-green-100 text-green-800' },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800' },
  'on-hold': { label: 'On Hold', color: 'bg-yellow-100 text-yellow-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
} as const;

const PRIORITY_CONFIG = {
  high: { label: 'High', color: 'bg-red-100 text-red-800' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  low: { label: 'Low', color: 'bg-green-100 text-green-800' },
} as const;

// OPTIMIZATION: Memoized project card renderer
const ProjectCardRenderer = React.memo<{
  project: Project;
  index: number;
  onEditProject?: (project: Project) => void;
  onDeleteProject?: (project: Project) => void;
  showActions?: boolean;
}>(({ project, index, onEditProject, onDeleteProject, showActions = true }) => {
  // OPTIMIZATION: Memoized callbacks
  const handleEdit = useCallback(() => {
    onEditProject?.(project);
  }, [project, onEditProject]);

  const handleDelete = useCallback(() => {
    onDeleteProject?.(project);
  }, [project, onDeleteProject]);

  // OPTIMIZATION: Memoized status and priority configs
  const statusConfig = useMemo(() =>
    STATUS_CONFIG[project.status] || { label: project.status, color: 'bg-gray-100 text-gray-800' },
    [project.status]
  );

  const priorityConfig = useMemo(() =>
    project.priority ? PRIORITY_CONFIG[project.priority] : null,
    [project.priority]
  );

  // OPTIMIZATION: Memoized budget calculations
  const budgetInfo = useMemo(() => {
    if (!project.budget) return null;

    const spent = project.spent_amount || 0;
    const remaining = project.budget - spent;
    const spentPercentage = (spent / project.budget) * 100;

    return {
      spent,
      remaining,
      spentPercentage,
      isOverBudget: spent > project.budget,
    };
  }, [project.budget, project.spent_amount]);

  return (
    <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-gray-900 truncate">
              {project.name}
            </CardTitle>
            {project.client && (
              <CardDescription className="text-sm text-gray-600 mt-1">
                Client: {project.client}
              </CardDescription>
            )}
          </div>

          <div className="flex items-center space-x-2 ml-4">
            <Badge className={statusConfig.color}>
              {statusConfig.label}
            </Badge>
            {priorityConfig && (
              <Badge className={priorityConfig.color}>
                {priorityConfig.label}
              </Badge>
            )}
          </div>
        </div>

        {project.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {project.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Project Timeline */}
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Start: {new Date(project.start_date).toLocaleDateString()}</span>
            </div>
            {project.end_date && (
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                <span>End: {new Date(project.end_date).toLocaleDateString()}</span>
              </div>
            )}
            {project.location && (
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                <span className="truncate">{project.location}</span>
              </div>
            )}
          </div>

          {/* Project Details */}
          <div className="space-y-2">
            {project.project_manager && (
              <div className="flex items-center text-sm text-gray-600">
                <User className="w-4 h-4 mr-2" />
                <span className="truncate">PM: {project.project_manager}</span>
              </div>
            )}
            {project.team_count && (
              <div className="flex items-center text-sm text-gray-600">
                <User className="w-4 h-4 mr-2" />
                <span>Team: {project.team_count} members</span>
              </div>
            )}
            {budgetInfo && (
              <div className="flex items-center text-sm text-gray-600">
                <Euro className="w-4 h-4 mr-2" />
                <span className={budgetInfo.isOverBudget ? 'text-red-600' : ''}>
                  €{budgetInfo.spent.toLocaleString()} / €{project.budget.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {typeof project.progress_percentage === 'number' && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{project.progress_percentage}%</span>
            </div>
            <Progress value={project.progress_percentage} className="h-2" />
          </div>
        )}

        {/* Budget Progress */}
        {budgetInfo && (
          <div className="mt-3">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Budget Usage</span>
              <span className={budgetInfo.isOverBudget ? 'text-red-600 font-semibold' : ''}>
                {budgetInfo.spentPercentage.toFixed(1)}%
              </span>
            </div>
            <Progress
              value={Math.min(budgetInfo.spentPercentage, 100)}
              className={`h-2 ${budgetInfo.isOverBudget ? 'bg-red-100' : ''}`}
            />
            {budgetInfo.isOverBudget && (
              <p className="text-xs text-red-600 mt-1">
                Over budget by €{(budgetInfo.spent - project.budget).toLocaleString()}
              </p>
            )}
          </div>
        )}

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {project.tags.slice(0, 3).map((tag, tagIndex) => (
              <Badge key={tagIndex} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {project.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{project.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={handleEdit}
              className="text-xs"
            >
              <Settings className="w-3 h-3 mr-1" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDelete}
              className="text-xs"
            >
              Delete
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

ProjectCardRenderer.displayName = 'ProjectCardRenderer';

// OPTIMIZATION: Main virtualized project list component
export const VirtualizedProjectList = React.memo<VirtualizedProjectListProps>(({
  projects,
  height,
  loading = false,
  onProjectClick,
  onProjectSelect,
  selectedProjectIds,
  searchable = true,
  showActions = true,
  onEditProject,
  onDeleteProject,
  emptyMessage = 'No projects found',
  className = ''
}) => {
  // OPTIMIZATION: Transform projects to VirtualizedListItem format
  const listItems = useMemo<VirtualizedListItem[]>(() =>
    projects.map(project => ({
      id: project.id,
      title: project.name,
      subtitle: project.client || project.location,
      status: project.status,
      description: project.description,
      metadata: {
        project,
        priority: project.priority,
        actions: showActions ? [
          {
            label: 'Edit',
            onClick: () => onEditProject?.(project),
          },
          {
            label: 'Delete',
            onClick: () => onDeleteProject?.(project),
          },
        ] : undefined,
      },
    })),
    [projects, showActions, onEditProject, onDeleteProject]
  );

  // OPTIMIZATION: Memoized custom item renderer
  const renderProjectItem = useCallback((item: VirtualizedListItem, index: number) => {
    const project = item.metadata.project as Project;
    return (
      <ProjectCardRenderer
        project={project}
        index={index}
        onEditProject={onEditProject}
        onDeleteProject={onDeleteProject}
        showActions={showActions}
      />
    );
  }, [onEditProject, onDeleteProject, showActions]);

  // OPTIMIZATION: Memoized click handler
  const handleItemClick = useCallback((item: VirtualizedListItem) => {
    const project = item.metadata.project as Project;
    onProjectClick?.(project);
  }, [onProjectClick]);

  // OPTIMIZATION: Memoized select handler
  const handleItemSelect = useCallback((item: VirtualizedListItem, selected: boolean) => {
    const project = item.metadata.project as Project;
    onProjectSelect?.(project, selected);
  }, [onProjectSelect]);

  return (
    <VirtualizedList
      items={listItems}
      height={height}
      itemHeight={280} // Increased height for rich project content
      onItemClick={handleItemClick}
      onItemSelect={handleItemSelect}
      selectedIds={selectedProjectIds}
      searchable={searchable}
      searchPlaceholder="Search projects by name, client, location, or description..."
      renderCustomItem={renderProjectItem}
      emptyMessage={emptyMessage}
      loading={loading}
      className={className}
    />
  );
});

VirtualizedProjectList.displayName = 'VirtualizedProjectList';

export default VirtualizedProjectList;
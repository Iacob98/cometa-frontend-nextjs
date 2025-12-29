'use client';

import { useQuery } from '@tanstack/react-query';
import type { PhotoWithCoordinates } from '@/app/api/photos/with-coordinates/route';

export interface PhotoFilters {
  dateFrom?: string;
  dateTo?: string;
  label?: 'before' | 'during' | 'after' | 'all';
}

export interface PhotosWithCoordinatesResponse {
  photos: PhotoWithCoordinates[];
  total: number;
}

// Query keys
export const photoMarkerKeys = {
  all: ['photo-markers'] as const,
  withCoordinates: (projectId?: string, filters?: PhotoFilters) =>
    [...photoMarkerKeys.all, 'with-coordinates', projectId, filters] as const,
};

// Fetch photos with GPS coordinates
export function usePhotosWithCoordinates(
  projectId?: string,
  filters: PhotoFilters = {}
) {
  const searchParams = new URLSearchParams();

  if (projectId) {
    searchParams.append('project_id', projectId);
  }

  if (filters.dateFrom) {
    searchParams.append('date_from', filters.dateFrom);
  }

  if (filters.dateTo) {
    searchParams.append('date_to', filters.dateTo);
  }

  if (filters.label && filters.label !== 'all') {
    searchParams.append('label', filters.label);
  }

  return useQuery({
    queryKey: photoMarkerKeys.withCoordinates(projectId, filters),
    queryFn: async (): Promise<PhotosWithCoordinatesResponse> => {
      const response = await fetch(
        `/api/photos/with-coordinates?${searchParams.toString()}`
      );
      if (!response.ok) {
        throw new Error('Не удалось загрузить фото с координатами');
      }
      return response.json();
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Helper function to get label in Russian
export function getPhotoLabelText(label: string | null): string {
  switch (label) {
    case 'before':
      return 'До работ';
    case 'during':
      return 'Во время работ';
    case 'after':
      return 'После работ';
    case 'instrument':
      return 'Инструмент';
    case 'rejection':
      return 'Отклонение';
    default:
      return 'Другое';
  }
}

// Helper function to get marker color by label
export function getPhotoMarkerColor(label: string | null): string {
  switch (label) {
    case 'before':
      return '#3b82f6'; // blue-500
    case 'during':
      return '#eab308'; // yellow-500
    case 'after':
      return '#22c55e'; // green-500
    case 'rejection':
      return '#ef4444'; // red-500
    default:
      return '#6b7280'; // gray-500
  }
}

// Re-export type
export type { PhotoWithCoordinates };

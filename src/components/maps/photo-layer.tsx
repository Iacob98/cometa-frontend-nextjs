"use client";

import React, { useEffect, useMemo } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import {
  type PhotoWithCoordinates,
  getPhotoLabelText,
  getPhotoMarkerColor,
} from "@/hooks/use-photo-markers";
import { Camera, ExternalLink } from "lucide-react";

interface PhotoLayerProps {
  photos: PhotoWithCoordinates[];
  visible?: boolean;
  onPhotoClick?: (photo: PhotoWithCoordinates) => void;
  fitBounds?: boolean;
}

// Create custom camera icon with color based on photo label
const createPhotoIcon = (label: string | null) => {
  const color = getPhotoMarkerColor(label);

  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 28px;
        height: 28px;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
          <circle cx="12" cy="13" r="3"/>
        </svg>
      </div>
    `,
    className: "photo-marker",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

// Format date for display
const formatDate = (dateString: string | null): string => {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};

export function PhotoLayer({
  photos,
  visible = true,
  onPhotoClick,
  fitBounds = false,
}: PhotoLayerProps) {
  const map = useMap();

  // Filter out photos without valid coordinates
  const validPhotos = useMemo(() => {
    return photos.filter(
      (photo) =>
        photo.gps_lat &&
        photo.gps_lon &&
        !isNaN(photo.gps_lat) &&
        !isNaN(photo.gps_lon) &&
        photo.gps_lat >= -90 &&
        photo.gps_lat <= 90 &&
        photo.gps_lon >= -180 &&
        photo.gps_lon <= 180
    );
  }, [photos]);

  // Auto-fit map to photo bounds
  useEffect(() => {
    if (fitBounds && validPhotos.length > 0 && visible) {
      const bounds = L.latLngBounds([]);

      validPhotos.forEach((photo) => {
        bounds.extend([photo.gps_lat, photo.gps_lon]);
      });

      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      }
    }
  }, [validPhotos, map, fitBounds, visible]);

  if (!visible) return null;

  const handlePhotoClick = (photo: PhotoWithCoordinates) => {
    if (onPhotoClick) {
      onPhotoClick(photo);
    }
  };

  return (
    <>
      {validPhotos.map((photo) => (
        <Marker
          key={photo.id}
          position={[photo.gps_lat, photo.gps_lon]}
          icon={createPhotoIcon(photo.label)}
          eventHandlers={{
            click: () => handlePhotoClick(photo),
          }}
        >
          <Popup minWidth={280} maxWidth={320}>
            <div className="space-y-3">
              {/* Photo preview */}
              <div className="relative">
                <img
                  src={photo.url}
                  alt={photo.caption || "Фото"}
                  className="w-full h-48 object-cover rounded-lg"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder-image.png";
                    target.onerror = null;
                  }}
                />
                {/* Label badge */}
                <div
                  className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium text-white"
                  style={{ backgroundColor: getPhotoMarkerColor(photo.label) }}
                >
                  {getPhotoLabelText(photo.label)}
                </div>
              </div>

              {/* Photo info */}
              <div className="space-y-1 text-sm">
                {photo.caption && (
                  <p className="text-gray-700 font-medium">{photo.caption}</p>
                )}
                <div className="flex items-center gap-1 text-gray-500">
                  <Camera className="h-3 w-3" />
                  <span>{formatDate(photo.taken_at)}</span>
                </div>
                <div className="text-xs text-gray-400">
                  GPS: {photo.gps_lat.toFixed(6)}, {photo.gps_lon.toFixed(6)}
                </div>
              </div>

              {/* Link to work entry */}
              {photo.work_entry_id && (
                <a
                  href={`/dashboard/work-entries/${photo.work_entry_id}`}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  Открыть отчёт
                </a>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

export default PhotoLayer;

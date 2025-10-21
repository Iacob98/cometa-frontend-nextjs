"use client";

import { useState } from "react";
import { X, Download, ZoomIn, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface Photo {
  id: string;
  url: string;
  filename?: string | null;
  label?: string | null;
  gps_lat?: number | null;
  gps_lon?: number | null;
  created_at?: string;
}

interface PhotoGalleryProps {
  photos: Photo[];
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const handlePhotoClick = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  const handleClose = () => {
    setSelectedPhotoIndex(null);
  };

  const handlePrevious = () => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex > 0) {
      setSelectedPhotoIndex(selectedPhotoIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex < photos.length - 1) {
      setSelectedPhotoIndex(selectedPhotoIndex + 1);
    }
  };

  const handleDownload = async (photo: Photo) => {
    try {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = photo.filename || `photo-${photo.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download photo:', error);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (selectedPhotoIndex === null) return;

    switch (e.key) {
      case 'ArrowLeft':
        handlePrevious();
        break;
      case 'ArrowRight':
        handleNext();
        break;
      case 'Escape':
        handleClose();
        break;
    }
  };

  // Add keyboard event listener
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyDown as any);
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No photos uploaded for this work entry.
      </div>
    );
  }

  const selectedPhoto = selectedPhotoIndex !== null ? photos[selectedPhotoIndex] : null;

  return (
    <>
      {/* Photo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((photo, index) => (
          <div
            key={photo.id || index}
            className="group relative aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-primary"
            onClick={() => handlePhotoClick(index)}
          >
            <img
              src={photo.url}
              alt={photo.filename || `Work photo ${index + 1}`}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              onError={(e) => {
                console.error('Failed to load photo:', photo);
                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
              }}
            />

            {/* Overlay with zoom icon */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Photo metadata badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {photo.label && (
                <Badge variant="secondary" className="text-xs">
                  {photo.label}
                </Badge>
              )}
              {photo.gps_lat && photo.gps_lon && (
                <Badge variant="secondary" className="text-xs">
                  <MapPin className="h-2.5 w-2.5 mr-1" />
                  GPS
                </Badge>
              )}
            </div>

            {/* Download button */}
            <Button
              size="sm"
              variant="secondary"
              className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(photo);
              }}
            >
              <Download className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={selectedPhotoIndex !== null} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-black/95">
          <VisuallyHidden>
            <DialogTitle>
              Photo {selectedPhotoIndex !== null ? selectedPhotoIndex + 1 : ''} of {photos.length}
            </DialogTitle>
          </VisuallyHidden>
          {selectedPhoto && (
            <div className="relative w-full h-full flex flex-col">
              {/* Header */}
              <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm">
                    {selectedPhotoIndex! + 1} / {photos.length}
                  </span>
                  {selectedPhoto.label && (
                    <Badge variant="secondary">{selectedPhoto.label}</Badge>
                  )}
                  {selectedPhoto.gps_lat && selectedPhoto.gps_lon && (
                    <Badge variant="secondary">
                      <MapPin className="h-3 w-3 mr-1" />
                      {selectedPhoto.gps_lat.toFixed(6)}, {selectedPhoto.gps_lon.toFixed(6)}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={() => handleDownload(selectedPhoto)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                    onClick={handleClose}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Image */}
              <div className="flex-1 flex items-center justify-center p-4">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.filename || `Photo ${selectedPhotoIndex! + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              {/* Navigation Buttons */}
              {selectedPhotoIndex! > 0 && (
                <Button
                  size="lg"
                  variant="ghost"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12 rounded-full"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              )}

              {selectedPhotoIndex! < photos.length - 1 && (
                <Button
                  size="lg"
                  variant="ghost"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12 rounded-full"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              )}

              {/* Footer with metadata */}
              {selectedPhoto.created_at && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <p className="text-white text-sm text-center">
                    {new Date(selectedPhoto.created_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

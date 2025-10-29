"use client";

import { useState, useCallback } from "react";
import { Navigation, MapPin, Loader2, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface GPSCaptureProps {
  onLocationCapture: (location: { latitude: number; longitude: number; accuracy?: number }) => void;
  initialLatitude?: number | null;
  initialLongitude?: number | null;
}

interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: Date;
}

export function GPSCapture({ onLocationCapture, initialLatitude, initialLongitude }: GPSCaptureProps) {
  const [location, setLocation] = useState<GPSLocation | null>(
    initialLatitude && initialLongitude
      ? { latitude: initialLatitude, longitude: initialLongitude, timestamp: new Date() }
      : null
  );
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const captureLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("GPS is not supported by your browser");
      return;
    }

    setIsCapturing(true);
    setError(null);

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const capturedLocation: GPSLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(),
        };

        setLocation(capturedLocation);
        setIsCapturing(false);
        setError(null);

        // Notify parent component
        onLocationCapture({
          latitude: capturedLocation.latitude,
          longitude: capturedLocation.longitude,
          accuracy: capturedLocation.accuracy,
        });
      },
      (error) => {
        setIsCapturing(false);

        let errorMessage = "Unable to get your location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please enable location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
        }

        setError(errorMessage);
      },
      options
    );
  }, [onLocationCapture]);

  const clearLocation = useCallback(() => {
    setLocation(null);
    setError(null);
    onLocationCapture({ latitude: 0, longitude: 0, accuracy: undefined });
  }, [onLocationCapture]);

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">GPS Location</h3>
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">Optional</span>
            </div>
          </div>

          {/* Capture Button */}
          {!location && !isCapturing && (
            <Button
              type="button"
              onClick={captureLocation}
              variant="outline"
              className="w-full border-blue-300 hover:bg-blue-100"
              disabled={isCapturing}
            >
              <Navigation className="mr-2 h-4 w-4" />
              Capture Current Location
            </Button>
          )}

          {/* Capturing State */}
          {isCapturing && (
            <div className="flex items-center justify-center gap-3 py-4">
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
              <span className="text-sm text-blue-700">Acquiring GPS coordinates...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-md">
              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <p className="text-sm text-red-800">{error}</p>
                <Button
                  type="button"
                  onClick={captureLocation}
                  variant="outline"
                  size="sm"
                  className="border-red-300 hover:bg-red-100"
                >
                  <RefreshCw className="mr-2 h-3 w-3" />
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Success State */}
          {location && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">Location captured successfully</span>
              </div>

              {/* Coordinates Display */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-white border border-blue-200 rounded-md text-sm">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Latitude</div>
                  <div className="font-mono font-medium text-gray-900">
                    {location.latitude.toFixed(6)}°
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Longitude</div>
                  <div className="font-mono font-medium text-gray-900">
                    {location.longitude.toFixed(6)}°
                  </div>
                </div>
                {location.accuracy !== undefined && (
                  <div className="col-span-2">
                    <div className="text-xs text-gray-500 mb-1">Accuracy</div>
                    <div className="font-mono font-medium text-gray-900">
                      ±{Math.round(location.accuracy)} meters
                    </div>
                  </div>
                )}
                <div className="col-span-2">
                  <div className="text-xs text-gray-500 mb-1">Captured At</div>
                  <div className="font-mono text-xs text-gray-700">
                    {location.timestamp.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={captureLocation}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <RefreshCw className="mr-2 h-3 w-3" />
                  Recapture
                </Button>
                <Button
                  type="button"
                  onClick={clearLocation}
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-red-600 hover:bg-red-50"
                >
                  <XCircle className="mr-2 h-3 w-3" />
                  Clear
                </Button>
              </div>
            </div>
          )}

          {/* Help Text */}
          <p className="text-xs text-blue-600">
            Capturing GPS location helps verify where the work was performed.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle, MapPin } from "lucide-react";

interface GPSValidatorProps {
  classLatitude: number;
  classLongitude: number;
  classAccuracy?: number; // in meters
  onValidate: (matched: boolean, lat: number, lon: number) => void;
  onCancel?: () => void;
}

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export default function GPSValidator({
  classLatitude,
  classLongitude,
  classAccuracy = 50,
  onValidate,
  onCancel,
}: GPSValidatorProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [location, setLocation] = useState<LocationData | null>(null);
  const [matched, setMatched] = useState(false);
  const [distance, setDistance] = useState(0);

  const getLocation = async () => {
    try {
      setLoading(true);
      setError("");

      if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          const locationData = {
            latitude,
            longitude,
            accuracy,
            timestamp: Date.now(),
          };

          setLocation(locationData);

          // Calculate distance between student and class location
          const dist = calculateDistance(latitude, longitude, classLatitude, classLongitude);
          setDistance(dist);

          // Check if within acceptable range
          const isMatched = dist <= classAccuracy;
          setMatched(isMatched);

          if (!isMatched) {
            setError(
              `You are ${dist.toFixed(1)}m away from the class location. Maximum allowed distance: ${classAccuracy}m`
            );
          }
        },
        (err) => {
          switch (err.code) {
            case err.PERMISSION_DENIED:
              setError("Location permission denied. Please enable location access.");
              break;
            case err.POSITION_UNAVAILABLE:
              setError("Location information is unavailable.");
              break;
            case err.TIMEOUT:
              setError("Location request timed out.");
              break;
            default:
              setError("An error occurred while getting your location.");
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371000; // Earth's radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
        <MapPin className="w-6 h-6 text-accent" />
        GPS Validation
      </h2>

      <div className="mb-6 p-4 bg-background rounded-lg border border-border/50">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-foreground/60 font-medium">Class Location</p>
            <p className="text-foreground font-mono text-xs mt-1">
              {classLatitude.toFixed(4)}, {classLongitude.toFixed(4)}
            </p>
          </div>
          <div>
            <p className="text-foreground/60 font-medium">Allowed Range</p>
            <p className="text-foreground font-mono text-xs mt-1">{classAccuracy}m radius</p>
          </div>
        </div>
      </div>

      {!location ? (
        <div className="text-center py-6">
          <p className="text-foreground/70 mb-4">
            Click below to get your current location and verify you are in the class area
          </p>
          <Button
            onClick={getLocation}
            disabled={loading}
            className="bg-accent hover:bg-accent/90 text-foreground w-full"
          >
            {loading ? "Getting Location..." : "Get My Location"}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-background rounded-lg border border-border/50">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-foreground/60">Your Location</p>
                <p className="text-foreground font-mono text-xs mt-1">
                  {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </p>
              </div>
              <div>
                <p className="text-foreground/60">Distance</p>
                <p className="text-foreground font-mono text-xs mt-1">
                  {distance.toFixed(1)}m away
                </p>
              </div>
              <div>
                <p className="text-foreground/60">Accuracy</p>
                <p className="text-foreground font-mono text-xs mt-1">
                  ±{location.accuracy.toFixed(0)}m
                </p>
              </div>
              <div>
                <p className="text-foreground/60">Allowed</p>
                <p className="text-foreground font-mono text-xs mt-1">{classAccuracy}m</p>
              </div>
            </div>
          </div>

          {matched ? (
            <div className="p-4 bg-secondary/10 border border-secondary/20 rounded-lg flex gap-3">
              <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Location Verified</p>
                <p className="text-sm text-foreground/70">You are within the class area</p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Location Mismatch</p>
                <p className="text-sm text-destructive/80">You are too far from the class</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={() => onValidate(matched, location.latitude, location.longitude)}
              disabled={!location}
              className={`flex-1 ${matched ? "bg-secondary hover:bg-secondary/90" : "bg-destructive hover:bg-destructive/90"}`}
            >
              {matched ? "Continue" : "Retry Location"}
            </Button>
            <Button
              onClick={() => {
                setLocation(null);
                onCancel?.();
              }}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

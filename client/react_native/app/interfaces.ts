interface GeoPoint {
  latitude: number;
  longitude: number;
};

interface GeolocationCoords {
  latitude: number;
  longitude: number;
  altitude?: number | null;
  accuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

interface GeolocationResponse {
  coords: GeolocationCoords;
  timestamp: number;
}

interface GeolocationError {
  code: number; // 1 = PERMISSION_DENIED, 2 = POSITION_UNAVAILABLE, 3 = TIMEOUT
  message: string;
}
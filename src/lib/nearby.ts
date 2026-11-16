import { Institution } from '../types';

export interface NearbyInstitution {
  institution: Institution;
  distanceKm: number | null;
}

// Distancia entre dos puntos (fórmula haversine, en km).
export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Pide la ubicación del navegador. Devuelve null si el usuario lo rechaza
// o si el navegador no lo soporta.
export function getUserLocation(): Promise<{ lat: number; lon: number } | null> {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
  });
}

// Ordena las instituciones por distancia al usuario. Las que no tienen
// coordenadas van al final, sin distancia.
export function rankByDistance(
  institutions: Institution[],
  userLoc: { lat: number; lon: number } | null
): NearbyInstitution[] {
  return institutions
    .map((institution) => ({
      institution,
      distanceKm:
        userLoc && institution.latitude != null && institution.longitude != null
          ? haversineKm(userLoc.lat, userLoc.lon, Number(institution.latitude), Number(institution.longitude))
          : null,
    }))
    .sort((a, b) => {
      if (a.distanceKm == null && b.distanceKm == null) return 0;
      if (a.distanceKm == null) return 1;
      if (b.distanceKm == null) return -1;
      return a.distanceKm - b.distanceKm;
    });
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

// src/utils/useDistance.ts
import { useMap } from "react-leaflet";
import type { LatLngLike } from "./distance";
import { distanceMeters, formatDistance } from "./distance";

export function useDistance() {
  const map = useMap(); // Leaflet Map instance
  return {
    meters: (a: LatLngLike, b: LatLngLike) => distanceMeters(a, b, map),
    text: (a: LatLngLike, b: LatLngLike) =>
      formatDistance(distanceMeters(a, b, map)),
  };
}

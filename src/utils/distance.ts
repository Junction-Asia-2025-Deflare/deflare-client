// src/utils/distance.ts
import L from "leaflet";

export type LatLngLike = { lat: number; lng: number };

/** 두 좌표 간 거리(m). map.distance가 있으면 그걸 쓰고, 없으면 distanceTo로 폴백 */
export function distanceMeters(
  a: LatLngLike,
  b: LatLngLike,
  map?: L.Map | null
): number {
  const A = L.latLng(a.lat, a.lng);
  const B = L.latLng(b.lat, b.lng);

  // react-leaflet의 useMap()으로 받은 map이 있으면 우선 사용
  if (map && typeof (map as any).distance === "function") {
    return (map as any).distance(A, B); // meters
  }

  // 폴백: LatLng.distanceTo (동일하게 meters)
  return A.distanceTo(B);
}

/** 보기 좋은 문자열 (m / km) */
export function formatDistance(meters: number): string {
  return meters < 1000
    ? `${Math.round(meters)}m`
    : `${(meters / 1000).toFixed(1)}km`;
}

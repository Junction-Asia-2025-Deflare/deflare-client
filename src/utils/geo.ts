import L from "leaflet";
import type { LatLngExpression } from "leaflet";

export type LatLng = { lat: number; lng: number };

const R = 6378137; // meters

export function dLatDeg(meters: number): number {
  return (meters / R) * (180 / Math.PI);
}

/** 경도 델타(deg): 동/서로 m 이동 (위도 보정 必) */
export function dLngDeg(meters: number, atLatDeg: number): number {
  return (
    (meters / (R * Math.cos((atLatDeg * Math.PI) / 180))) * (180 / Math.PI)
  );
}

/** 중심/한변(m) → 위·경도 축에 정렬된 정사각형(Leaflet Polygon 좌표) */
export function squareFromCenter(
  center: LatLng,
  cellSizeM: number
): LatLngExpression[] {
  const half = cellSizeM / 2;
  const dLat = dLatDeg(half);
  const dLng = dLngDeg(half, center.lat);

  const nw = { lat: center.lat + dLat, lng: center.lng - dLng };
  const ne = { lat: center.lat + dLat, lng: center.lng + dLng };
  const se = { lat: center.lat - dLat, lng: center.lng + dLng };
  const sw = { lat: center.lat - dLat, lng: center.lng - dLng };

  return [
    [nw.lat, nw.lng],
    [ne.lat, ne.lng],
    [se.lat, se.lng],
    [sw.lat, sw.lng],
  ];
}

/** (선택) 실제 거리 확인용: 각 변 길이(m)를 콘솔에 출력 */
export function debugMeasureSquareEdges(poly: LatLngExpression[]): void {
  if (poly.length < 4) return;
  const pts = poly.map(([lat, lng]) => L.latLng(lat as number, lng as number));
  const d01 = pts[0].distanceTo(pts[1]);
  const d12 = pts[1].distanceTo(pts[2]);
  const d23 = pts[2].distanceTo(pts[3]);
  const d30 = pts[3].distanceTo(pts[0]);

  const r = (n: number) => Math.round(n * 10) / 10;
  // eslint-disable-next-line no-console
  console.log("[Square edges m]", r(d01), r(d12), r(d23), r(d30));
}

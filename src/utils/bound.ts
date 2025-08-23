import type { LatLngExpression } from "leaflet";
import type { FireCell } from "@/types/fire";

export function boundsToPolygonCoords(
  b: FireCell["bounds"]
): LatLngExpression[] {
  // 시계방향으로: TL → TR → BR → BL (마지막 점은 자동으로 닫힘)
  return [
    [b.top_left[0], b.top_left[1]],
    [b.top_right[0], b.top_right[1]],
    [b.bottom_right[0], b.bottom_right[1]],
    [b.bottom_left[0], b.bottom_left[1]],
  ];
}

export function collectAllLatLng(cells: FireCell[]) {
  const pts: [number, number][] = [];
  for (const c of cells) {
    const b = c.bounds;
    pts.push(b.top_left, b.top_right, b.bottom_right, b.bottom_left);
  }
  return pts.map(([lat, lng]) => ({ lat, lng }));
}

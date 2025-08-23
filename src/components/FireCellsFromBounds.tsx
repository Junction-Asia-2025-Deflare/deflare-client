// src/components/FireCellsFromBounds.tsx
import { Polygon } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import type { FireCell } from "@/types/ire";
import { boundsToPolygonCoords } from "@/utils/bound";

export default function FireCellsFromBounds({
  cells,
  stroke = "none",
  fill = "#ef4444",
  fillOpacity = 0.3,
}: {
  cells: FireCell[];
  stroke?: string;
  fill?: string;
  fillOpacity?: number;
}) {
  return (
    <>
      {cells.map((cell) => {
        const coords: LatLngExpression[] = boundsToPolygonCoords(cell.bounds);
        const key = `${cell.row}-${cell.col}`;
        return (
          <Polygon
            key={key}
            positions={coords}
            pathOptions={{
              color: stroke,
              weight: 2,
              fillColor: fill,
              fillOpacity,
            }}
          />
        );
      })}
    </>
  );
}

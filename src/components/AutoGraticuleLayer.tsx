import { useEffect, useMemo, useState } from "react";
import { Polyline, useMap } from "react-leaflet";
import L, { Point } from "leaflet";
import type { LatLngExpression } from "leaflet";

type Props = {
  stepMeters?: number; // 기본 1000m
  majorEvery?: number; // N칸마다 굵은 선 (기본 5km)
  minorColor?: string;
  majorColor?: string;
  minorWeight?: number;
  majorWeight?: number;
  // 얇은 선도 실선으로 => null/undefined (점선을 원하면 "4 6" 등)
  minorDash?: string | null;
  originLatLng?: { lat: number; lng: number }; // 격자 앵커 (기본 0,0)
  paneName?: string;
  opacity?: number;
  maxLines?: number;
};

export default function AutoGraticuleLayer({
  stepMeters = 1000,
  majorEvery = 5,
  minorColor = "#94a3b8",
  majorColor = "#64748b",
  minorWeight = 1,
  majorWeight = 1,
  minorDash = null, // ← 기본 실선
  originLatLng,
  paneName = "km-grid-pane",
  opacity = 0.7,
  maxLines = 240,
}: Props) {
  const map = useMap();
  const [lines, setLines] = useState<
    { pts: LatLngExpression[]; major: boolean }[]
  >([]);

  // 전용 pane (클릭 방해 X)
  useEffect(() => {
    if (!map.getPane(paneName)) {
      const p = map.createPane(paneName);
      p.style.zIndex = "350";
      p.style.pointerEvents = "none";
    }
    return () => map.getPane(paneName)?.remove();
  }, [map, paneName]);

  const recompute = useMemo(
    () => () => {
      const crs = L.CRS.EPSG3857; // WebMercator(단위: 미터)
      const b = map.getBounds();
      const nw = crs.project(b.getNorthWest());
      const se = crs.project(b.getSouthEast());

      const pad = 0.08; // 가장자리 살짝 넘게
      const dx = Math.abs(nw.x - se.x) * pad;
      const dy = Math.abs(nw.y - se.y) * pad;

      const minX = Math.min(nw.x, se.x) - dx;
      const maxX = Math.max(nw.x, se.x) + dx;
      const minY = Math.min(se.y, nw.y) - dy;
      const maxY = Math.max(se.y, nw.y) + dy;

      const step = stepMeters;
      const origin = originLatLng ? L.latLng(originLatLng) : L.latLng(0, 0);
      const o = crs.project(origin);

      // 원점 기준으로 step 정수배 위치에 '스냅' → 지도 고정
      const firstX = Math.floor((minX - o.x) / step) * step + o.x;
      const firstY = Math.floor((minY - o.y) / step) * step + o.y;

      const out: { pts: LatLngExpression[]; major: boolean }[] = [];
      let count = 0;

      // 세로선
      for (let x = firstX, i = 0; x <= maxX; x += step, i++) {
        const p1 = crs.unproject(new Point(x, minY));
        const p2 = crs.unproject(new Point(x, maxY));
        out.push({
          pts: [
            [p1.lat, p1.lng],
            [p2.lat, p2.lng],
          ],
          major: i % majorEvery === 0,
        });
        if (++count > maxLines) break;
      }
      // 가로선
      for (
        let y = firstY, j = 0;
        y <= maxY && count <= maxLines;
        y += step, j++
      ) {
        const p1 = crs.unproject(new Point(minX, y));
        const p2 = crs.unproject(new Point(maxX, y));
        out.push({
          pts: [
            [p1.lat, p1.lng],
            [p2.lat, p2.lng],
          ],
          major: j % majorEvery === 0,
        });
        count++;
      }

      setLines(out);
    },
    [map, stepMeters, originLatLng, majorEvery, maxLines]
  );

  useEffect(() => {
    recompute();
    map.on("moveend zoomend", recompute);
    return () => map.off("moveend zoomend", recompute);
  }, [map, recompute]);

  return (
    <>
      {lines.map((ln, i) => (
        <Polyline
          key={i}
          positions={ln.pts}
          pane={paneName}
          pathOptions={{
            color: ln.major ? majorColor : minorColor,
            weight: ln.major ? majorWeight : minorWeight,
            opacity,
            dashArray: ln.major ? undefined : minorDash ?? undefined, // 메이저=실선
          }}
        />
      ))}
    </>
  );
}

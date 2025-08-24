// src/components/SafePathLayer.tsx
import { Polyline, Marker } from "react-leaflet";
import { useEffect, useMemo } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import DestMarkerUrl from "@/assets/shelter-dest.svg?url"; // ✅ SVG를 URL로 임포트
import ArrMarkUrl from "@/assets/shelter-arr.svg?url";

type Props = {
  route: [number, number][]; // [[lat, lon], ...]
  start?: [number, number] | null; // [lat, lon]
  shelter?: { lat: number; lon: number; name?: string } | null;
};

export default function SafePathLayer({ route, start, shelter }: Props) {
  const map = useMap();

  // ✅ 목적지(대피소) 아이콘 세팅 (SVG 크기 37×50 기준)
  const destIcon = useMemo(
    () =>
      L.icon({
        iconUrl: DestMarkerUrl,
        iconSize: [37, 50],
        iconAnchor: [18, 50], // 아래 중앙이 기준점 (핀 끝이 좌표에 꽂히게)
      }),
    []
  );

  // ✅ 목적지(대피소) 아이콘 세팅 (SVG 크기 37×50 기준)
  const arriveIcon = useMemo(
    () =>
      L.icon({
        iconUrl: ArrMarkUrl,
        iconSize: [37, 50],
        iconAnchor: [18, 50], // 아래 중앙이 기준점 (핀 끝이 좌표에 꽂히게)
      }),
    []
  );

  const bounds = useMemo(() => {
    const pts: [number, number][] = [...route];
    if (start) pts.push(start);
    if (shelter) pts.push([Number(shelter.lat), Number(shelter.lon)]);
    return pts.length ? L.latLngBounds(pts) : null;
  }, [route, start, shelter]);

  useEffect(() => {
    if (bounds) map.fitBounds(bounds.pad(0.15));
  }, [bounds, map]);

  if (!route?.length) return null;

  return (
    <>
      <Polyline
        positions={route}
        pathOptions={{ color: "#39A909", weight: 7 }}
      />

      {start && (
        <Marker position={start} zIndexOffset={1000} icon={arriveIcon}></Marker>
      )}

      {shelter && (
        <Marker
          position={[Number(shelter.lat), Number(shelter.lon)]}
          icon={destIcon}
          zIndexOffset={1000}
        ></Marker>
      )}
    </>
  );
}

// src/components/ShelterMarkers.tsx
import { Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import type { Shelter } from "@/types/shelter";
import shelterMarkerUrl from "@/assets/shelter-marker.svg?url";
type Props = {
  shelters: Shelter[];
  showLabel?: boolean; // 이름 라벨 표시 여부
};

const shelterIcon = L.icon({
  iconUrl: shelterMarkerUrl,
  iconSize: [28, 28], // SVG 뷰포트에 맞춰 조절
  iconAnchor: [14, 28], // 하단 중앙이 기준점 (핀 모양일 때 추천)
  className: "shelter-marker",
});

export default function ShelterMarkers({ shelters, showLabel = false }: Props) {
  return (
    <>
      {shelters
        .filter((s) => Number.isFinite(s.lat) && Number.isFinite(s.lng))
        .map((s) => (
          <Marker
            key={s.id}
            position={[s.lat, s.lng]}
            icon={shelterIcon}
            zIndexOffset={100}
          >
            <Tooltip direction="bottom" offset={[0, -10]} opacity={0.95}>
              <div className="text-xs">
                <div className="font-semibold">{s.name}</div>
              </div>
            </Tooltip>
          </Marker>
        ))}
    </>
  );
}

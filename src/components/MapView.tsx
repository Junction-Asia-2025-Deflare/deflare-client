import { useState, useEffect, useRef, type PropsWithChildren } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import ShelterSheet from "@/components/ShelterSheet";
import L from "leaflet";
import RouteController from "./RouteController";
import type { LatLng } from "@/types/types";
import LocateControl from "./LocateControl";
import LocateTriggerButton from "./LocateTriggerButton";
import type { FireCell } from "@/types/fire";
import FireCellsFromBounds from "./FireCellsFromBounds";
import type { Shelter } from "@/types/shelter";
import { loadShelters } from "@/apis/api";
import ButtonFire from "@/assets/button-fire.png";
import SafePathLayer from "./SafePathLayer";
import ShelterMarkers from "./ShelterMarkers";
import ButtonOff from "@/assets/button-off.png";
import InfoBtnUrl from "@/assets/info-btn.svg?react";
import ExtremeUrl from "@/assets/dangeroutLevel/extreme.svg?react";
import Dot from "@/assets/dot.svg?react";
import GridUnitIcon from "@/assets/grid-unit-icon.svg?react";
import DotCircle from "@/assets/dot-circle.svg?react";
import DotCircleRed from "@/assets/dot-circle-red.svg?react";

export default function MapView({
  here,
  dest,
  cellsFromBounds,
  secondCellsFromBounds,
  safeRoute,
  safeStart,
  safeShelter,
  onNearestClick,
  // isFetchingSafe,
  isTextChange,
}: PropsWithChildren<{
  centers: LatLng[];
  cellSizeM: number;
  here: LatLng | null;
  dest: LatLng | null;
  onMapCreated?: (m: L.Map) => void;
  cellsFromBounds?: FireCell[];
  secondCellsFromBounds?: FireCell[];
  safeRoute?: [number, number][];
  safeStart?: [number, number] | null;
  safeShelter?: { lat: number; lon: number; name?: string } | null;
  onNearestClick?: () => void;
  isFetchingSafe?: boolean;
  setIsTextChagne?: () => void;
}>) {
  const [shelterList, setShelterList] = useState<Shelter[]>([]);
  const [showSecond, setShowSecond] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false); // ✅ info 모달 on/off

  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!secondCellsFromBounds?.length) setShowSecond(false);
  }, [secondCellsFromBounds]);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    let alive = true;
    (async () => {
      try {
        const res = await loadShelters();

        // 서버 응답 형태가 배열/객체일 수 있어 방어적으로 정규화
        const raw = Array.isArray(res) ? res : res?.shelters ?? res?.data ?? [];

        const list: Shelter[] = (raw ?? [])
          .map((s: any) => ({
            id: String(s.id ?? s.name ?? crypto.randomUUID()),
            name: s.name ?? "대피소",
            address: s.address ?? "",
            capacity: Number(s.capacity ?? 0),
            lat: Number(s.lat ?? s.latitude),
            lng: Number(s.lng ?? s.lon ?? s.longitude),
          }))
          .filter(
            (s: Shelter) => Number.isFinite(s.lat) && Number.isFinite(s.lng)
          );

        if (alive) setShelterList(list);
      } catch (e) {
        console.error("loadShelters() 실패:", e);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!showInfoModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowInfoModal(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showInfoModal]);

  return (
    <MapContainer
      center={[36.09120726015081, 129.3928798057884]}
      zoom={14}
      zoomControl={false}
      className="h-[calc(100dvh)] w-full"
    >
      <TileLayer
        attribution="© OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <div className="absolute flex flex-col items-end top-[10.5px] right-[14px] z-[1200]">
        <div className="relative flex flex-row">
          <div className="absolute right-[44px]">
            <ExtremeUrl />
          </div>
          <button
            type="button"
            onClick={() => setShowInfoModal((v) => !v)}
            aria-label="Open info"
            className="rounded-md"
          >
            <InfoBtnUrl />
          </button>
        </div>

        {showInfoModal && (
          <div className="flex flex-col gap-[3px]">
            <div className="flex flex-col p-[14px] top-[10.5px] right-[14px] z-[1200] bg-white rounded-[10px] mr-[10px] gap-[6px]">
              <div>
                <span className="text-sm font-semibold text-[#AEA6A3] whitespace-nowrap">
                  Wildfire Risk Level
                </span>
                <span>
                  <span className="flex flex-row text-sm font-semibold items-center gap-[6px] text-[#39A909]">
                    <Dot />
                    Low
                    <span className="text-[#323830] font-normal">0-50</span>
                  </span>
                </span>
                <span>
                  <span className="flex flex-row text-sm font-semibold items-center gap-[6px] text-[#F7BC0D]">
                    <Dot />
                    Moderate
                    <span className="text-[#323830] font-normal">51-65</span>
                  </span>
                </span>
                <span>
                  <span className="flex flex-row text-sm font-semibold items-center gap-[6px] text-[#FD7404]">
                    <Dot />
                    High
                    <span className="text-[#323830] font-normal">66-85</span>
                  </span>
                </span>
                <span>
                  <span className="flex flex-row text-sm font-semibold items-center gap-[6px] text-[#DC0D0D]">
                    <Dot />
                    Extreme
                    <span className="text-[#323830] font-normal">86-100</span>
                  </span>
                </span>
              </div>

              <div className="w-full border border-[rgba(174,166,163,0.5)]" />

              <div>
                <span className="text-sm font-semibold text-[#AEA6A3] whitespace-nowrap">
                  Map Legend
                </span>
                <span>
                  <span className="flex flex-row text-sm font-semibold items-center gap-[6px] text-[#323830]">
                    <DotCircleRed />
                    Current Fire Area
                  </span>
                </span>
                <span>
                  <span className="flex flex-row text-sm font-semibold items-center gap-[6px] text-[#323830]">
                    <DotCircle />
                    Wildfire Forecast(Next Day)
                  </span>
                </span>
                <span>
                  <span className="flex flex-row text-sm font-semibold items-center gap-[6px] text-[#323830]">
                    <GridUnitIcon />
                    Grid Unit
                    <span className="text-[#323830] font-normal">
                      1km × 1km
                    </span>
                  </span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 안전 경로 표시 */}
      {safeRoute?.length ? (
        <SafePathLayer
          route={safeRoute}
          start={safeStart ?? undefined}
          shelter={safeShelter ?? undefined}
        />
      ) : null}
      {/* 현재 위치 */}
      <LocateControl />
      <LocateTriggerButton />

      {/* 🔘 예측 레이어 토글 버튼 */}
      <button
        type="button"
        onClick={() => setShowSecond((v) => !v)}
        disabled={!secondCellsFromBounds?.length}
        className={`flex flex-row items-center gap-[6px] absolute right-6 bottom-[68.5px] z-[1300] rounded-full text-sm font-semibold border px-3 py-2 shadow
    ${
      showSecond
        ? "border-[#AEA6A380] text-[#AEA6A380]"
        : "bg-white border-[#F7BC0D80] text-black"
    }`}
        style={
          showSecond
            ? {
                background:
                  "linear-gradient(0deg, rgba(174, 166, 163, 0.3), rgba(174, 166, 163, 0.3)), #FFFFFF",
              }
            : { boxShadow: "0px 2px 20px rgba(247, 188, 13, 0.7)" }
        }
      >
        <img
          src={showSecond ? ButtonOff : ButtonFire}
          alt="Forecast"
          className="w-[12.99px] h-[14px]"
        />
        Forecast
      </button>

      {/* 기존 라우팅/경로 */}
      <RouteController here={here} dest={dest} />

      {/* 최단 경로 on/off */}
      <div
        onClick={onNearestClick}
        className="absolute left-1/2 -translate-x-1/2 flex flex-row gap-[6px] bottom-[126.5px] px-[14px] py-[10px] text-white border-2 border-white rounded-full bg-[#39A909] z-[1400] whitespace-nowrap"
      >
        <span className="font-bold">Nearest</span>
        {!isTextChange ? (
          <span>Shelter Name · -.-km</span>
        ) : (
          <span>Haksan Women’s Senior Center · 181m</span>
        )}
      </div>

      {/* 🔥 발화 폴리곤들 */}
      {cellsFromBounds?.length ? (
        <FireCellsFromBounds cells={cellsFromBounds} />
      ) : null}
      {showSecond && secondCellsFromBounds?.length ? (
        <FireCellsFromBounds cells={secondCellsFromBounds} fill="#F7BC0D" />
      ) : null}
      {shelterList.length > 0 && <ShelterMarkers shelters={shelterList} />}

      {/* 🏠 대피소 바텀시트 */}
      <ShelterSheet shelters={shelterList} here={here ?? undefined} />
    </MapContainer>
  );
}

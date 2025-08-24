import { useEffect, useMemo, useRef, useState } from "react";
import type { Shelter } from "@/types/shelter";
import L from "leaflet";
import { useMap } from "react-leaflet";
import { distanceMeters, formatDistance } from "@/utils/distance";
import Btn119 from "@/assets/btn119.svg";
import Btn112 from "@/assets/btn112.svg";
import Btn1339 from "@/assets/btn1339.svg";
import Btn3119 from "@/assets/btn3119.svg";

type Props = {
  shelters: Shelter[];
  // 현재 위치가 있으면 거리 표시
  here?: { lat: number; lng: number } | null;
};

const PEEK = 50; // 닫힘 높이(px)
const TOP_MARGIN = 20; // 열림 시 top-5 (≈ 20px)

export default function ShelterSheet({ shelters, here }: Props) {
  const [top, setTop] = useState<number>(() => window.innerHeight - PEEK);
  const [isDragging, setIsDragging] = useState(false); // ✅ 추가
  const openTop = TOP_MARGIN;
  const isOpen = Math.abs(top - openTop) < 2; // top이 openTop 근처면 '열림'으로 간주

  const closedTop = () => window.innerHeight - PEEK;

  const map = useMap();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null); // ✅ 추가

  const startY = useRef<number>(0);
  const startTop = useRef<number>(0);
  const dragging = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    const sc = scrollRef.current;
    if (el) {
      L.DomEvent.disableScrollPropagation(el);
      L.DomEvent.disableClickPropagation(el);
    }
    if (sc) {
      L.DomEvent.disableScrollPropagation(sc);
      L.DomEvent.disableClickPropagation(sc);
    }
  }, []);

  // 화면 리사이즈 시 위치 보정
  useEffect(() => {
    const onResize = () => {
      setTop((prev) => {
        const closed = closedTop();
        // 닫힘 범위 근처면 닫힘으로 보정, 열림이면 그대로 top=20 유지
        return prev > window.innerHeight / 2 ? closed : openTop;
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const clampTop = (t: number) => Math.min(Math.max(t, openTop), closedTop());

  const onPointerDown: React.PointerEventHandler = (e) => {
    dragging.current = true;
    setIsDragging(true);
    containerRef.current?.setPointerCapture(e.pointerId); // ✅ 이것만

    startY.current = e.clientY;
    startTop.current = top;
    document.body.style.userSelect = "none";
  };

  const onPointerMove: React.PointerEventHandler = (e) => {
    if (!dragging.current) return;
    const delta = e.clientY - startY.current;
    setTop(clampTop(startTop.current + delta));
  };

  const onPointerUp: React.PointerEventHandler = (e) => {
    if (!dragging.current) return;
    dragging.current = false;
    setIsDragging(false); // ✅ 추가
    document.body.style.userSelect = "";

    containerRef.current?.releasePointerCapture(e.pointerId); // ✅ 해제

    // 1/3 스냅 로직
    const open = openTop;
    const closed = closedTop();
    const range = closed - open; // 이동 가능 범위
    const threshold = range / 3; // 1/3 임계치
    const delta = top - startTop.current; // 아래로 양수, 위로 음수
    const startedOpen = startTop.current <= (open + closed) / 2;

    if (delta <= -threshold) setTop(open); // 위로 1/3 이상 → 열기
    else if (delta >= threshold) setTop(closed); // 아래로 1/3 이상 → 닫기
    else setTop(startedOpen ? open : closed); // 임계 미만 → 원래 상태
  };

  // 거리 계산(있을 때만)
  const items = useMemo(() => {
    if (!here) return shelters;

    const from = L.latLng(here.lat, here.lng);

    const toLatLng = (s: any) => ({
      lat: Number(s.lat ?? s.latitude),
      lng: Number(s.lng ?? s.longitude),
    });

    return shelters
      .map((s) => {
        const to = toLatLng(s);
        if (!Number.isFinite(to.lat) || !Number.isFinite(to.lng)) {
          return { ...s, distanceMeters: Infinity, distanceText: "-" };
        }
        const d = distanceMeters(from, to, map);
        return { ...s, distanceMeters: d, distanceText: formatDistance(d) };
      })
      .sort(
        (a: any, b: any) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0)
      );
  }, [shelters, here, map]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-x-0 bottom-0 z-[20000] rounded-t-2xl bg-white shadow-[0_-8px_24px_rgba(0,0,0,0.15)]"
      style={{ top }} // height는 top에 의해 자동: calc(100vh - top)
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* 핸들바 + 헤더 */}
      <div
        className="cursor-grab select-none px-[14px] pt-2"
        onPointerDown={onPointerDown}
        style={{ touchAction: "none" }} // ✅ 추가
      >
        <div
          className={`mx-auto h-[5px] w-9 rounded-full bg-[#AEA6A3]
    ${isDragging ? "cursor-grabbing" : ""}
    transition-all duration-200
    ${isDragging || isOpen ? "mb-[9px]" : "mb-[24px]"}
  `}
        />

        <div className="flex flex-row gap-[6px] text-sm font-semibold pt-[14px]">
          <span className="flex flex-row px-[10px] py-[6px] border text-[#DC0D0D] border-[#DC0D0D] rounded-full gap-[6px]">
            <img src={Btn119} />
            119
          </span>
          <span className="flex flex-row px-[10px] py-[6px] border text-[#0261f9] border-[#0261F9] rounded-full gap-[6px]">
            <img src={Btn112} />
            112
          </span>
          <span className="flex flex-row px-[10px] py-[6px] border text-[#39A909] border-[#39A909] rounded-full gap-[6px] whitespace-nowrap">
            <img src={Btn3119} />
            1688-3119
          </span>
          <span className="flex flex-row px-[10px] py-[6px] border text-[#74ABFF] border-[#74ABFF] rounded-full gap-[6px] whitespace-nowrap">
            <img src={Btn1339} />
            1339
          </span>
        </div>
      </div>

      {/* 콘텐츠 (스크롤) */}
      <div
        ref={scrollRef}
        className="h-[calc(100vh-20px-48px)] overflow-y-auto mt-[14px] px-3 pb-6"
        onWheelCapture={(e) => e.stopPropagation()}
        onTouchMoveCapture={(e) => e.stopPropagation()}
      >
        <ul className="space-y-2">
          {items.map((s) => (
            <li
              key={s.id}
              className="flex flex-col gap-2 rounded-[15px] border border-gray-200 p-4 hover:bg-gray-50"
            >
              <span className="flex items-center justify-between">
                <h4 className="text-xl font-bold text-[#323830]">{s.name}</h4>
              </span>
              <span>
                <h4 className="font-medium text-xs text-[#aea6a3]">
                  civil defense shelter
                </h4>
              </span>
              <div className="flex flex-row gap-[2px]">
                <span>
                  <h5 className="text-xs font-bold text-[#39A909]">
                    {s.distanceText ?? "-"}
                  </h5>
                </span>
                <span className="flex justify-center w-3 text-xs text-[#AEA6A3]">
                  ・
                </span>
                <span>
                  <h5 className="font-medium text-xs text-[#aea6a3]">
                    {s.address}
                  </h5>
                </span>
              </div>
            </li>
          ))}
          {items.length === 0 && (
            <li className="py-8 text-center text-sm text-gray-500">
              표시할 대피소가 없습니다.
            </li>
          )}
        </ul>
        <div className="h-10" />
      </div>
    </div>
  );
}

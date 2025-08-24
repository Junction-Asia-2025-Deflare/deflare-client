import { useEffect, useState } from "react";
import MapView from "@/components/MapView";
import type { LatLng } from "@/types/types";
import { getSafePath, initFire } from "@/apis/api";

export const SAFE_PATH_CACHE_KEY = "safe_path_cache_v1";

export default function Home() {
  const [here, setHere] = useState<LatLng | null>(null);
  const [cellsFromBounds, setCellsFromBounds] = useState<any[]>([]);
  const [secondCellsFromBounds, setSecondCellsFromBounds] = useState<any[]>([]);
  const [safeRoute, setSafeRoute] = useState<[number, number][]>([]);
  const [safeStart, setSafeStart] = useState<[number, number] | null>(null);
  const [safeShelter, setSafeShelter] = useState<{
    lat: number;
    lon: number;
    name?: string;
  } | null>(null);

  const [showSafe, setShowSafe] = useState(false);
  const [isFetchingSafe, setIsFetchingSafe] = useState(false);

  const [isTextChange, setIsTextChange] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setHere({
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
        });
      },
      (err) => console.error("Geolocation error:", err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await initFire();
        setCellsFromBounds(res.initial_state);
        setSecondCellsFromBounds(res.next_day_fires);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [here]);

  // 🔘 안전 경로 요청/토글 콜백 (Nearest 클릭 시 사용)
  const handleToggleSafePath = async () => {
    if (!here || isFetchingSafe) return;

    // 켜져 있으면 끄기
    if (showSafe) {
      setShowSafe(false);
      setSafeRoute([]);
      setSafeStart(null);
      setSafeShelter(null);
      return;
    }

    // 꺼져 있으면 불러오기
    setIsFetchingSafe(true);
    // try {
    //   const pathRes = await getSafePath(here.lat, here.lng); // ← 서버가 "가장 가까운 대피소"로 경로를 주는 경우
    //   setSafeRoute(pathRes.safe_path.route as [number, number][]);
    //   setSafeStart(pathRes.safe_path.start as [number, number]);
    //   const sh = pathRes.safe_path.shelter;
    //   setSafeShelter(
    //     sh ? { lat: Number(sh.lat), lon: Number(sh.lon), name: sh.name } : null
    //   );
    //   setShowSafe(true);
    // } catch (err) {
    //   console.error(err);
    // } finally {
    //   setIsFetchingSafe(false);
    // }
    try {
      setIsTextChange(true);
      const cached = localStorage.getItem(SAFE_PATH_CACHE_KEY);

      if (cached) {
        const sp = JSON.parse(cached); // { route, start, shelter, ts }
        setSafeRoute(sp.route as [number, number][]);
        setSafeStart(sp.start as [number, number]);
        setSafeShelter(
          sp.shelter
            ? {
                lat: Number(sp.shelter.lat),
                lon: Number(sp.shelter.lon),
                name: sp.shelter.name,
              }
            : null
        );
        setShowSafe(true);
        return;
      }
      // 캐시가 없으면 즉시 요청 (폴백)
      const pathRes = await getSafePath(here.lat, here.lng);
      const sp = pathRes.safe_path;
      setSafeRoute(sp.route as [number, number][]);
      setSafeStart(sp.start as [number, number]);
      setSafeShelter(
        sp.shelter
          ? {
              lat: Number(sp.shelter.lat),
              lon: Number(sp.shelter.lon),
              name: sp.shelter.name,
            }
          : null
      );

      // 받아온 것도 캐시해 두기
      localStorage.setItem(
        SAFE_PATH_CACHE_KEY,
        JSON.stringify({ ...sp, ts: Date.now() })
      );

      setShowSafe(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetchingSafe(false);
    }
  };

  return (
    <div className="relative">
      <MapView
        here={here}
        cellsFromBounds={cellsFromBounds}
        secondCellsFromBounds={secondCellsFromBounds}
        safeRoute={safeRoute}
        safeStart={safeStart}
        safeShelter={safeShelter}
        onNearestClick={handleToggleSafePath} // ← 클릭 콜백 전달
        isFetchingSafe={isFetchingSafe} // (선택) 로딩 표시용
        setIsTextChange={setIsTextChange}
        isTextChange={isTextChange}
      />
    </div>
  );
}

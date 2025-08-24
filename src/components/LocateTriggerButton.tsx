import { useState } from "react";
import { useMap } from "react-leaflet";
import MyLocationUrl from "@/assets/my-location.svg";
// import type { LatLng } from "@/types/types";
// import { getSafePath } from "@/apis/api";

export const SAFE_PATH_CACHE_KEY = "safe_path_cache_v1";

export default function LocateTriggerButton() {
  const map = useMap();
  const [loading, setLoading] = useState(false);

  const onClick = () => {
    setLoading(true);
    console.log(loading);
    const lc = (map as any).__locateCtrl;
    if (lc?.start) lc.start(); // locatecontrol 트리거
    else map.locate({ setView: true, enableHighAccuracy: true }); // 폴백
    setTimeout(() => setLoading(false), 300);
  };

  // const go = async () => {
  //   if (!map) return;
  //   setLoading(true);

  //   // 이동 끝나면 로딩 해제
  //   const off = () => {
  //     setLoading(false);
  //     map.off("moveend", off);
  //   };
  //   map.on("moveend", off);

  //   try {
  //     const center = here ?? {
  //       lat: map.getCenter().lat,
  //       lng: map.getCenter().lng,
  //     };
  //     const res = await getSafePath(center.lat, center.lng);
  //     const sp = res?.safe_path;
  //     if (sp?.route?.length) {
  //       localStorage.setItem(
  //         SAFE_PATH_CACHE_KEY,
  //         JSON.stringify({ ...sp, ts: Date.now() })
  //       );
  //     }
  //   } catch (e) {
  //     console.error("prefetch safe path failed:", e);
  //     // 실패해도 UX는 계속 (Nearest 클릭 시 폴백 fetch가 동작)
  //   }
  // };

  return (
    <button
      onClick={onClick}
      // onClick={go}
      className="absolute left-3 bottom-15 z-[1300] text-white hover:opacity-90"
    >
      <img src={MyLocationUrl} alt="내 위치" />
    </button>
  );
}

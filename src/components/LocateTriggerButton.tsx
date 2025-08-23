import { useState } from "react";
import { useMap } from "react-leaflet";
import MyLocationUrl from "@/assets/my-location.svg";

export default function LocateTriggerButton() {
  const map = useMap();
  const [loading, setLoading] = useState(false);

  const onClick = () => {
    setLoading(true);
    const lc = (map as any).__locateCtrl;
    if (lc?.start) lc.start(); // locatecontrol 트리거
    else map.locate({ setView: true, enableHighAccuracy: true }); // 폴백
    setTimeout(() => setLoading(false), 300);
  };

  return (
    <button
      onClick={onClick}
      className="absolute left-3 bottom-15 z-[1300] text-white hover:opacity-90"
    >
      <img src={MyLocationUrl} alt="내 위치" />
    </button>
  );
}

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

export default function LocateControl() {
  const map = useMap();

  useEffect(() => {
    let ctrl: L.Control | undefined;
    let fallbackMarker: L.CircleMarker | null = null;
    let fallbackCircle: L.Circle | null = null;

    (async () => {
      // await import("leaflet.locatecontrol/dist/L.Control.Locate.min.js");

      const locateFactory = (L.control as any)?.locate;
      if (!locateFactory) {
        console.error("leaflet.locatecontrol not attached to L");
        return;
      }

      const ACCENT = "#22c55e"; // 눈에 띄는 라임색

      ctrl = locateFactory({
        position: "topright",
        setView: "once",
        flyTo: true,
        showCompass: true,
        drawCircle: true,
        drawMarker: true,
        markerClass: L.CircleMarker,
        markerStyle: {
          color: "#111827", // 테두리(진회색)
          weight: 3,
          fillColor: ACCENT, // 채움색
          fillOpacity: 1,
          radius: 14,
        },
        circleStyle: {
          color: ACCENT,
          fillColor: ACCENT,
          fillOpacity: 0.12,
        },
        strings: { title: "내 위치 찾기", popup: "여기가 현재 위치" },
        locateOptions: {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 1000,
        },
      }) as L.Control;

      ctrl.addTo(map);

      // 성공 시 마커 보장 + 최상단으로
      const onFound = (e: L.LocationEvent) => {
        console.log("[Locate] locationfound", e);

        // 플러그인이 만든 마커가 있으면 앞으로
        const pluginMarker = (ctrl as any)?._marker;
        if (pluginMarker?.bringToFront) pluginMarker.bringToFront();

        const hasPluginMarker = !!pluginMarker;
        // 플러그인 마커가 없으면 폴백으로 직접 그림
        if (!hasPluginMarker) {
          if (fallbackMarker) map.removeLayer(fallbackMarker);
          if (fallbackCircle) map.removeLayer(fallbackCircle);

          fallbackMarker = L.circleMarker(e.latlng, {
            color: "#111827",
            weight: 3,
            fillColor: ACCENT,
            fillOpacity: 1,
            radius: 14,
          }).addTo(map);
          fallbackMarker.bringToFront();

          fallbackCircle = L.circle(e.latlng, {
            radius: e.accuracy ?? 50,
            color: ACCENT,
            fillColor: ACCENT,
            fillOpacity: 0.12,
          }).addTo(map);
        }
      };

      const onError = (err: any) => {
        console.warn("[Locate] locationerror", err);
      };

      map.on("locationfound", onFound);
      map.on("locationerror", onError);

      // 필요 시: 컨트롤 추가 직후 한 번 자동 시도
      // (원치 않으면 이 줄 주석)
      // (ctrl as any).start?.();

      // z-index가 카드에 가려지면 전역 CSS로:
      // .leaflet-top,.leaflet-bottom { z-index: 1200; }
    })();

    return () => {
      if (ctrl) map.removeControl(ctrl);
      if (fallbackMarker) map.removeLayer(fallbackMarker);
      if (fallbackCircle) map.removeLayer(fallbackCircle);
      map.off("locationfound");
      map.off("locationerror");
    };
  }, [map]);

  return null;
}

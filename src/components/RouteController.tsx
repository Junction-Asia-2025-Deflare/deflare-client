import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import type { LatLng } from "@/types/types";

export default function RouteController({
  here,
  dest,
}: {
  here: LatLng | null;
  dest: LatLng | null;
}) {
  const map = useMap();
  const controlRef = useRef<L.Routing.Control | null>(null);

  useEffect(() => {
    if (!here || !dest) {
      if (controlRef.current) {
        map.removeControl(controlRef.current);
        controlRef.current = null;
      }
      return;
    }
    const waypoints = [L.latLng(here), L.latLng(dest)];
    if (controlRef.current) {
      controlRef.current.setWaypoints(waypoints);
    } else {
      controlRef.current = L.Routing.control({
        waypoints,
        routeWhileDragging: false,
        addWaypoints: false,
        show: false,
        lineOptions: {
          styles: [{ color: "#2563eb", weight: 5, opacity: 0.9 }],
        },
        router: L.Routing.osrmv1({
          serviceUrl: "https://router.project-osrm.org/route/v1",
          profile: "driving",
        }),
        createMarker: (i, wp) =>
          L.marker(wp.latLng, { draggable: false }).bindPopup(
            i === 0 ? "출발" : "도착"
          ),
      }).addTo(map);
    }
    map.fitBounds(L.latLngBounds(waypoints).pad(0.2));
  }, [here, dest, map]);

  return null;
}

"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import useMapTheme from "@/hooks/useMapTheme";
import { NearbyPlace } from "@/hooks/useNearbyAccessiblePlaces";

interface Place {
  id: string;
  name: string;
  address: string;
  rating?: number;
  location: { lat: number; lng: number };
}

interface Props {
  places: Place[];
  center: { lat: number; lng: number };
  selectedPlaceId?: string;
  onPlaceSelect?: (id: string) => void;
  showRoute?: boolean;
  showAccessibility?: boolean;
  nearbyPlaces?: NearbyPlace[];
}

export default function AccessibleMap({
  places,
  center,
  selectedPlaceId,
  onPlaceSelect,
  showRoute = false,
  showAccessibility = false,
  nearbyPlaces = [],
}: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const nearbyLayerRef = useRef<L.LayerGroup | null>(null);
  const { theme } = useMapTheme();

  // Initialize or update map when theme or center changes
  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("accessible-map").setView([center.lat, center.lng], 14);
    } else {
      mapRef.current.setView([center.lat, center.lng]);
    }

    // Remove previous layers before re-adding (theme changes)
    mapRef.current.eachLayer((layer) => {
      mapRef.current?.removeLayer(layer);
    });

    // Select theme tile style
    const tileURL =
      theme === "dark"
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : theme === "high-contrast"
          ? "https://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png"
          : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    L.tileLayer(tileURL, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    }).addTo(mapRef.current);

    // Add route, places, and nearby markers
    renderMarkers();
    if (showRoute) renderRoute();
    if (showAccessibility) renderNearby();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, center.lat, center.lng]);

  // Render main place markers
  const renderMarkers = () => {
    if (!mapRef.current) return;

    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    places.forEach((p) => {
      const marker = L.marker([p.location.lat, p.location.lng]).addTo(mapRef.current!);
      marker.bindPopup(`<b>${p.name}</b><br>${p.address}`);
      marker.on("click", () => onPlaceSelect?.(p.id));
      markersRef.current[p.id] = marker;
    });
  };

  // Render route polyline
  const renderRoute = () => {
    if (!mapRef.current) return;
    if (routeLayerRef.current) routeLayerRef.current.remove();

    if (places.length > 1) {
      const latlngs = places.map((p) => [p.location.lat, p.location.lng]) as [number, number][];
      const polyline = L.polyline(latlngs, {
        color: "#3b82f6",
        weight: 4,
        opacity: 0.8,
        lineJoin: "round",
      }).addTo(mapRef.current);
      routeLayerRef.current = polyline;
      mapRef.current.fitBounds(polyline.getBounds(), { padding: [40, 40] });
    }
  };

  // Render dynamic nearby accessibility layer
  const renderNearby = () => {
    if (!mapRef.current) return;
    if (nearbyLayerRef.current) {
      nearbyLayerRef.current.clearLayers();
    } else {
      nearbyLayerRef.current = L.layerGroup().addTo(mapRef.current);
    }

    nearbyPlaces.forEach((p) => {
      const color =
        p.category === "toilets" ? "#3b82f6" : p.category === "parking" ? "#16a34a" : "#9333ea";

      const icon = L.divIcon({
        className: "custom-marker",
        html: `<div style="background:${color};
                width:10px;height:10px;
                border-radius:50%;
                box-shadow:0 0 4px ${color};"></div>`,
      });

      L.marker([p.lat, p.lng], { icon })
        .addTo(nearbyLayerRef.current!)
        .bindPopup(`<b>${p.name}</b><br>${p.address}<br>♿ Wheelchair: ${p.wheelchair}`);
    });
  };

  // Highlight selected marker
  useEffect(() => {
    if (selectedPlaceId && markersRef.current[selectedPlaceId]) {
      const marker = markersRef.current[selectedPlaceId];
      marker.openPopup();
      const { lat, lng } = marker.getLatLng();
      mapRef.current?.flyTo([lat, lng], 15, { duration: 0.7 });
      marker.getElement()?.classList.add("animate-bounce");
      setTimeout(() => marker.getElement()?.classList.remove("animate-bounce"), 1200);
    }
  }, [selectedPlaceId]);

  return (
    <div
      id="accessible-map"
      className="rounded-xl overflow-hidden border border-gray-200"
      style={{ height: "320px", width: "100%" }}
      aria-label="Map showing accessible locations and routes"
      role="application"
      tabIndex={0}
    />
  );
}

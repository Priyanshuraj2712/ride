import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const MapPicker = ({ initialPosition, onSelect }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // Validate coords
  const valid =
    initialPosition &&
    typeof initialPosition.lat === "number" &&
    typeof initialPosition.lng === "number";

  const center = valid
    ? [initialPosition.lng, initialPosition.lat]
    : [77.0266, 28.4595]; // Gurgaon fallback

  // ---------------------------
  // INIT MAP (Runs Once)
  // ---------------------------
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    if (!mapboxgl.accessToken) {
      console.error("❌ Missing Mapbox Token");
      return;
    }

    // Init Map
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center,
      zoom: 13,
    });

    // Add Marker
    markerRef.current = new mapboxgl.Marker({ draggable: true })
      .setLngLat(center)
      .addTo(mapRef.current);

    // Marker drag handler
    markerRef.current.on("dragend", () => {
      const c = markerRef.current.getLngLat();
      onSelect({ lat: c.lat, lng: c.lng });
    });

    // Map click handler
    mapRef.current.on("click", (e) => {
      markerRef.current.setLngLat(e.lngLat);
      onSelect({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    });

    // Cleanup
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // ---------------------------
  // UPDATE MARKER on prop change
  // ---------------------------
  useEffect(() => {
    if (!valid) return;
    if (!mapRef.current || !markerRef.current) return;

    const newPos = [initialPosition.lng, initialPosition.lat];

    markerRef.current.setLngLat(newPos);
    mapRef.current.flyTo({ center: newPos, zoom: 13 });
  }, [initialPosition]);

  return (
    <div className="w-full">
      <div
        ref={mapContainerRef}
        className="w-full h-72 rounded-lg shadow-md"
      ></div>
    </div>
  );
};

export default MapPicker;

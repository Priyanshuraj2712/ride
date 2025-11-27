import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { useParams } from "react-router-dom";
import axios from "../../services/api";
import socket from "../../services/socket";

mapboxgl.accessToken =
  "pk.eyJ1IjoicHJpeWFuc2h1MjJjc3UxMzYiLCJhIjoiY21paGRwbnkwMGczbTNkc2Z5N3hzNmZzYyJ9.14JOeApu8JQA2OVi1Yf4tA";

const LiveTracking = () => {
  const { id } = useParams(); // rideId
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  const driverMarkerRef = useRef(null);
  const passengerMarkerRef = useRef(null);

  const [ride, setRide] = useState(null);

  // -----------------------------
  // 1️⃣ Fetch Ride Details from Backend
  // -----------------------------
  useEffect(() => {
    const fetchRide = async () => {
      const token = localStorage.getItem("token");

      const res = await axios.get(`/api/rides/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRide(res.data.ride);
    };

    fetchRide();
  }, [id]);

  // -----------------------------
  // 2️⃣ Initialize Mapbox Map
  // -----------------------------
  useEffect(() => {
    if (!ride) return;

    const pickup = ride.pickup.coords.coordinates;      // [lng, lat]
    const destination = ride.destination.coords.coordinates;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/navigation-night-v1",
      center: pickup,
      zoom: 12,
    });

    // Add navigation zoom controls
    mapRef.current.addControl(new mapboxgl.NavigationControl());

    // Passenger Marker (Pickup)
    passengerMarkerRef.current = new mapboxgl.Marker({
      color: "green",
    })
      .setLngLat(pickup)
      .addTo(mapRef.current);

    // Driver Marker (initial)
    driverMarkerRef.current = new mapboxgl.Marker({
      color: "red",
    })
      .setLngLat(pickup)
      .addTo(mapRef.current);

    // Fit map to pickup + destination
    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend(pickup);
    bounds.extend(destination);
    mapRef.current.fitBounds(bounds, { padding: 80 });

    return () => mapRef.current.remove();
  }, [ride]);

  // -----------------------------
  // 3️⃣ Listen to Driver Location Updates (Socket.IO)
  // -----------------------------
  useEffect(() => {
    socket.on("driverLocationUpdate", (data) => {
      if (!driverMarkerRef.current) return;

      // Move driver marker
      driverMarkerRef.current.setLngLat([data.lng, data.lat]);

      // Smooth camera follow
      mapRef.current?.flyTo({
        center: [data.lng, data.lat],
        zoom: 14,
        speed: 1.2,
      });
    });

    return () => {
      socket.off("driverLocationUpdate");
    };
  }, []);

  if (!ride) return <p>Loading ride details...</p>;

  return (
    <div style={{ padding: "10px" }}>
      <h2>Live Tracking</h2>
      <p>Ride ID: {id}</p>

      <div
        ref={mapContainerRef}
        style={{
          height: "500px",
          width: "100%",
          borderRadius: "10px",
          marginTop: "10px",
        }}
      />
    </div>
  );
};

export default LiveTracking;

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { useParams } from "react-router-dom";
import axios from "../../services/api";
import socket from "../../services/socket";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

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

      try {
        if (id) {
          const res = await axios.get(`/api/rides/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setRide(res.data.ride);
          return;
        }

        // No id param: try to find passenger's current accepted/ongoing ride
        const res = await axios.get(`/api/rides/user/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const rides = res.data.rides || [];
        const active = rides.find((r) => r.status === "accepted" || r.status === "ongoing");
        if (active) {
          setRide(active);
        } else {
          setRide(null);
        }
      } catch (err) {
        console.error("Failed to load ride for tracking:", err);
        setRide(null);
      }
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

  if (ride === undefined) return <p>Loading ride details...</p>;
  if (ride === null)
    return (
      <div style={{ padding: 10 }}>
        <h2>Live Tracking</h2>
        <p>No active ride found to track.</p>
        <p>Open <a href="/passenger/rides">My Rides</a> and click "Track Ride" on a current ride.</p>
      </div>
    );

  return (
    <div style={{ padding: "10px" }}>
      <h2>Live Tracking</h2>
      <p>Ride ID: {id}</p>
      {/* Show OTPs to passenger so they can give start OTP to driver */}
      {ride.otpStart && (ride.status === 'accepted' || ride.status === 'ongoing') && (
        <p style={{ fontWeight: 'bold' }}>Start OTP: {ride.otpStart}</p>
      )}
      {ride.otpEnd && ride.status === 'ongoing' && (
        <p style={{ fontWeight: 'bold' }}>End OTP: {ride.otpEnd}</p>
      )}

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

import React, { useState, useEffect } from "react";
import axios from "../../services/api";
import socket from "../../services/socket";
import { useNavigate } from "react-router-dom";

const BookRide = () => {
  const navigate = useNavigate();

  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [rideType, setRideType] = useState("premium");
  const [loading, setLoading] = useState(false);
  const [rideId, setRideId] = useState(null);

  // Convert text locations to lat/lng
  const geocode = async (address) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      address
    )}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.length === 0) throw new Error("Location not found");

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };
  };

  useEffect(() => {
    socket.on("rideAssigned", (data) => {
      navigate(`/track/${data.rideId}`);
    });

    return () => {
      socket.off("rideAssigned");
    };
  }, []);

  const handleBook = async () => {
    if (!pickup || !destination)
      return alert("Enter pickup & destination");

    setLoading(true);

    try {
      // 1️⃣ Convert addresses to coordinates
      const pickupCoords = await geocode(pickup);
      const destCoords = await geocode(destination);

      // 2️⃣ Create payload for backend
      const payload = {
        rideType,
        totalSeats: 1,
        price: 200,
        pickup: {
          coords: {
            coordinates: [pickupCoords.lng, pickupCoords.lat],
          },
          address: pickup,
        },
        destination: {
          coords: {
            coordinates: [destCoords.lng, destCoords.lat],
          },
          address: destination,
        },
      };

      // 3️⃣ Call backend correct route: /api/rides/request
      const token = localStorage.getItem("token");

      const res = await axios.post("/api/rides/request", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const createdRide = res.data.ride;
      setRideId(createdRide._id);

      // 4️⃣ Notify driver via socket
      socket.emit("newRideRequest", createdRide);

      alert("Ride requested. Waiting for driver...");
    } catch (err) {
      console.error(err);
      alert("Failed to book ride: " + err.message);
    }

    setLoading(false);
  };

  return (
    <div className="book-ride-container">
      <h2>Book a Ride</h2>

      <input
        type="text"
        placeholder="Pickup Location"
        value={pickup}
        onChange={(e) => setPickup(e.target.value)}
      />

      <input
        type="text"
        placeholder="Destination"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
      />

      <select value={rideType} onChange={(e) => setRideType(e.target.value)}>
        <option value="premium">Premium</option>
        <option value="cab_sharing">Cab Sharing</option>
      </select>

      <button onClick={handleBook} disabled={loading}>
        {loading ? "Booking..." : "Book Ride"}
      </button>
    </div>
  );
};

export default BookRide;

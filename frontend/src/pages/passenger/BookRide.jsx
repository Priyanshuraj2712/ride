import React, { useEffect, useState } from "react";
import axios from "../../services/api";
import socket from "../../services/socket";
import LocationSearch from "../../components/LocationSearch";
import MapPicker from "../../components/MapPicker";
import { useNavigate } from "react-router-dom";

const BookRide = () => {
  const navigate = useNavigate();

  const [rideType, setRideType] = useState("premium");
  const [loading, setLoading] = useState(false);
  const [estimatedFare, setEstimatedFare] = useState(null);

  // Pickup
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupCoords, setPickupCoords] = useState(null);
  const [openPickupMap, setOpenPickupMap] = useState(false);

  // Destination
  const [destAddress, setDestAddress] = useState("");
  const [destCoords, setDestCoords] = useState(null);
  const [openDestMap, setOpenDestMap] = useState(false);

  // 🚀 Register passenger socket so rideAssigned works
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) socket.emit("registerPassenger", userId);
  }, []);

  // SOCKET - Passenger listens for ride assignment
  useEffect(() => {
    const handleRideAssigned = (data) => navigate(`/track/${data.rideId}`);

    socket.on("rideAssigned", handleRideAssigned);

    return () => socket.off("rideAssigned", handleRideAssigned);
  }, []);

  // 💰 Automatically calculate fare using backend estimate API
  useEffect(() => {
    const estimateFare = async () => {
      if (!pickupCoords || !destCoords) return;

      try {
        const token = localStorage.getItem("token");

        const payload = {
          pickup: {
            coords: {
              type: "Point",
              coordinates: [pickupCoords.lng, pickupCoords.lat],
            },
          },
          destination: {
            coords: {
              type: "Point",
              coordinates: [destCoords.lng, destCoords.lat],
            },
          },
          totalSeats: 1,
        };

        const res = await axios.post("/api/rides/estimate", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setEstimatedFare(res.data.fare);
      } catch (err) {
        console.error("Fare estimate failed", err);
      }
    };

    estimateFare();
  }, [pickupCoords, destCoords]);

  const handleBook = async () => {
    if (!pickupCoords || !destCoords)
      return alert("Please select pickup and destination.");

    if (!pickupAddress || !destAddress)
      return alert("Select valid pickup and destination using search.");

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const payload = {
        rideType,
        totalSeats: 1,
        price: estimatedFare || 200, // fallback
        pickup: {
          address: pickupAddress,
          coords: {
            type: "Point",
            coordinates: [pickupCoords.lng, pickupCoords.lat],
          },
        },
        destination: {
          address: destAddress,
          coords: {
            type: "Point",
            coordinates: [destCoords.lng, destCoords.lat],
          },
        },
      };

      await axios.post("/api/rides/request", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Ride request sent! Waiting for driver...");
    } catch (err) {
      console.error(err);
      alert("Booking failed: " + err.message);
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Book a Ride</h2>

      {/* Pickup Input */}
      <LocationSearch
        placeholder="Search Pickup Location"
        onSelect={(loc) => {
          setPickupAddress(loc.address);
          setPickupCoords({ lat: loc.lat, lng: loc.lng });
          setOpenPickupMap(true);
        }}
      />

      {openPickupMap && pickupCoords && (
        <MapPicker
          initialPosition={{ lat: pickupCoords.lat, lng: pickupCoords.lng }}
          onSelect={(coords) => {
            setPickupCoords(coords);
          }}
        />
      )}

      <br />

      {/* Destination */}
      <LocationSearch
        placeholder="Search Destination"
        onSelect={(loc) => {
          setDestAddress(loc.address);
          setDestCoords({ lat: loc.lat, lng: loc.lng });
          setOpenDestMap(true);
        }}
      />

      {openDestMap && destCoords && (
        <MapPicker
          initialPosition={{ lat: destCoords.lat, lng: destCoords.lng }}
          onSelect={(coords) => setDestCoords(coords)}
        />
      )}

      <br />

      {/* Ride Type */}
      <select
        value={rideType}
        onChange={(e) => setRideType(e.target.value)}
        style={{ padding: "10px", width: "200px" }}
      >
        <option value="premium">Premium</option>
        <option value="cab_sharing">Cab Sharing</option>
      </select>

      <br />

      {estimatedFare && (
        <p style={{ marginTop: "10px", fontWeight: "bold" }}>
          Estimated Fare: ₹{estimatedFare}
        </p>
      )}

      <br />

      <button
        onClick={handleBook}
        disabled={loading}
        style={{ padding: "12px 20px" }}
      >
        {loading ? "Booking..." : "Book Ride"}
      </button>
    </div>
  );
};

export default BookRide;

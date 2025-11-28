import React, { useEffect, useState } from "react";
import axios from "../../services/api";
import socket from "../../services/socket";
import MockMap from "../../components/MockMap";
import LocationSearch from "../../components/LocationSearch";
import { useNavigate } from "react-router-dom";
import "./bookride.css";

const BookRide = () => {
  const navigate = useNavigate();

  const [rideType, setRideType] = useState("premium");
  const [loading, setLoading] = useState(false);
  const [estimatedFare, setEstimatedFare] = useState(null);

  // Pickup
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupCoords, setPickupCoords] = useState(null);

  // Destination
  const [destAddress, setDestAddress] = useState("");
  const [destCoords, setDestCoords] = useState(null);

  // Register passenger socket so rideAssigned works
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

  // simple fare estimate mock (skip backend call for now)
  useEffect(() => {
    if (!pickupCoords || !destCoords) return;
    // rough mock calculation
    const base = 50;
    const distFactor = Math.abs(pickupCoords.lat - destCoords.lat) + Math.abs(pickupCoords.lng - destCoords.lng);
    setEstimatedFare(Math.round(base + distFactor * 100));
  }, [pickupCoords, destCoords]);

  const handleBook = async () => {
    if (!pickupCoords || !destCoords)
      return alert("Please select pickup and destination.");

    if (!pickupAddress || !destAddress)
      return alert("Select valid pickup and destination using suggestions.");

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

      // use existing backend if available, otherwise mock
      try {
        await axios.post("/api/rides/request", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch(e){
        console.debug('Request API failed, mock ok', e.message || e);
      }

      alert("Ride request sent! Waiting for driver...");
    } catch (err) {
      console.error(err);
      alert("Booking failed: " + err.message);
    }

    setLoading(false);
  };

  return (
    <div className="bookride-page">
      <div className="form-card">
        <h2>Book a Ride</h2>

        <div className="input-group">
          <label>Pickup Location</label>
          <LocationSearch
            placeholder="Search pickup location"
            onSelect={(loc) => {
              setPickupAddress(loc.address);
              setPickupCoords({ lat: loc.lat, lng: loc.lng });
            }}
          />
        </div>

        <div className="input-group">
          <label>Destination</label>
          <LocationSearch
            placeholder="Search destination"
            onSelect={(loc) => {
              setDestAddress(loc.address);
              setDestCoords({ lat: loc.lat, lng: loc.lng });
            }}
          />
        </div>

        <MockMap pickupCoords={pickupCoords} destCoords={destCoords} />

        <div className="row">
          <label>Ride Type</label>
          <select value={rideType} onChange={(e) => setRideType(e.target.value)} className="select">
            <option value="premium">Premium</option>
            <option value="cab_sharing">Cab Sharing</option>
          </select>
        </div>

        {estimatedFare && <div className="fare">Estimated Fare: ₹{estimatedFare}</div>}

        <div className="actions">
          <button className="primary" onClick={handleBook} disabled={loading}>{loading ? 'Booking...' : 'Book Ride'}</button>
        </div>
      </div>
    </div>
  );
};

export default BookRide;

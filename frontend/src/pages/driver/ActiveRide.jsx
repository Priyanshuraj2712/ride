import React, { useEffect, useState } from "react";
import DriverSidebar from "../../components/DriverSidebar";
import axios from "../../services/api";
import socket from "../../services/socket";
import "./driver.css";

const ActiveRide = () => {
  const [ride, setRide] = useState(null);
  const [otp, setOTP] = useState("");

  // Fetch active ride
  const loadActiveRide = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("/api/driver/active-ride", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRide(res.data.ride || null);
    } catch (err) {
      console.error(err);
      setRide(null);
    }
  };

  useEffect(() => {
    loadActiveRide();

    // If driver accepted a ride from popup → reload
    socket.on("rideAssignedToDriver", loadActiveRide);

    return () => {
      socket.off("rideAssignedToDriver", loadActiveRide);
    };
  }, []);

  // ----------------------
  // START RIDE
  // ----------------------
  const handleStartRide = async () => {
    if (!otp) return alert("Enter OTP");
    if (!ride?._id) return alert("Ride not found");

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "/api/rides/start",
        { rideId: ride._id, otp },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Ride started");
      setOTP("");
      loadActiveRide();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to start ride");
    }
  };

  // ----------------------
  // END RIDE
  // ----------------------
  const handleEndRide = async () => {
    if (!otp) return alert("Enter OTP");
    if (!ride?._id) return alert("Ride not found");

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "/api/rides/end",
        { rideId: ride._id, otp },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Ride completed");
      setRide(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to end ride");
    }
  };

  // ----------------------
  // SOS
  // ----------------------
  const handleSOS = () => {
    if (!ride?._id) return alert("No active ride to send SOS");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const token = localStorage.getItem("token");

          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          await axios.post(
            "/api/sos",
            { rideId: ride._id, lat, lng },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          socket.emit("SOSAlert", {
            rideId: ride._id,
            driverId: ride?.driver,
            lat,
            lng,
            message: "Driver requested SOS help!",
          });

          alert("🚨 SOS Alert Sent!");
        } catch (err) {
          console.error("SOS error:", err);
          alert("Failed to send SOS alert");
        }
      },
      (err) => {
        alert("Failed to get location for SOS");
      }
    );
  };

  // ----------------------
  // UI Rendering
  // ----------------------
  return (
    <div className="driver-layout">
      <DriverSidebar />

      <div className="driver-main">
        <div className="driver-topbar">
          <h1>Active Ride</h1>
        </div>

        {!ride ? (
          <p>No active ride.</p>
        ) : (
          <div className="driver-upcoming-card">
            <p>
              <strong>Passenger:</strong> {ride.createdBy?.name || "N/A"}
            </p>
            <p>
              <strong>Pickup:</strong> {ride.pickup?.address || "N/A"}
            </p>
            <p>
              <strong>Drop:</strong> {ride.destination?.address || "N/A"}
            </p>
            <p>
              <strong>Status:</strong> {ride.status}
            </p>

             

              {/* OTP Input */}
            <input
              type="text"
              placeholder="Enter OTP"
              style={{ marginTop: "10px", padding: "8px" }}
              value={otp}
              onChange={(e) => setOTP(e.target.value)}
            />

            <div className="driver-upcoming-actions" style={{ marginTop: "15px" }}>
              {ride.status === "accepted" && (
                <button className="driver-primary-btn" onClick={handleStartRide}>
                  Start Ride
                </button>
              )}

              {ride.status === "ongoing" && (
                <button className="driver-primary-btn" onClick={handleEndRide}>
                  End Ride
                </button>
              )}

              
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveRide;

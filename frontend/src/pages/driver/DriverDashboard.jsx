import React, { useEffect, useState } from "react";
import DriverSidebar from "../../components/DriverSidebar";
import socket from "../../services/socket";
import axios from "../../services/api";
import { useNavigate } from "react-router-dom";
import "./driver.css";

const DriverDashboard = () => {
  const [incomingRide, setIncomingRide] = useState(null);
  const [online, setOnline] = useState(false);

  const navigate = useNavigate();

  // -------------------------------------------
  // LOAD DRIVER STATUS INITIALLY
  // -------------------------------------------
  useEffect(() => {
    const loadDriver = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get("/api/driver/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setOnline(res.data.driver.online || false);
      } catch (err) {
        console.error("Failed to load driver status:", err);
      }
    };

    loadDriver();
  }, []);

  // -------------------------------------------
  // SOCKET LISTENER - Driver receives rideRequest
  // -------------------------------------------
  useEffect(() => {
    const handleRideRequest = (ride) => {
      console.log("🚕 Incoming ride request:", ride);
      setIncomingRide(ride);
    };

    socket.on("rideRequest", handleRideRequest);

    return () => {
      socket.off("rideRequest", handleRideRequest);
    };
  }, []);

  // -------------------------------------------
  // DRIVER GO ONLINE/OFFLINE
  // -------------------------------------------
  const toggleOnline = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "/api/drivers/online",
        { online: !online },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setOnline(res.data.online);
    } catch (err) {
      console.error(err);
      alert("Failed to update online status");
    }
  };

  // -------------------------------------------
  // DRIVER ACCEPTS RIDE
  // -------------------------------------------
  const acceptRide = async () => {
    if (!incomingRide) return;

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "/api/rides/driver/respond",
        {
          rideId: incomingRide.rideId,
          action: "accept",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      socket.emit("driverAcceptedRide", {
        rideId: incomingRide.rideId,
      });

      alert("Ride accepted! Waiting for passenger...");
      setIncomingRide(null);
    } catch (err) {
      console.error(err);
      alert("Failed to accept ride");
    }
  };

  // -------------------------------------------
  // DRIVER REJECTS RIDE
  // -------------------------------------------
  const rejectRide = async () => {
    if (!incomingRide) return;

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "/api/rides/driver/respond",
        {
          rideId: incomingRide.rideId,
          action: "reject",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      socket.emit("driverRejectedRide", {
        rideId: incomingRide.rideId,
      });

      setIncomingRide(null);
    } catch (err) {
      console.error(err);
      alert("Failed to reject ride");
    }
  };

  return (
    <div className="driver-layout">
      <DriverSidebar />

      <div className="driver-main">
        <div className="driver-topbar">
          <h1>Driver Dashboard</h1>
          <span className={`driver-status-badge ${online ? "online" : "offline"}`}>
            {online ? "Online" : "Offline"}
          </span>
        </div>

        {/* POPUP WHEN NEW RIDE ARRIVES */}
        {incomingRide && (
          <div className="ride-popup-overlay">
            <div className="ride-popup-card">
              <h2>New Ride Request</h2>

              <p>
                <strong>Pickup:</strong> {incomingRide?.pickup?.address}
              </p>
              <p>
                <strong>Drop:</strong> {incomingRide?.destination?.address}
              </p>

              <div className="ride-popup-actions">
                <button className="driver-primary-btn" onClick={acceptRide}>
                  Accept
                </button>
                <button className="driver-danger-btn" onClick={rejectRide}>
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="driver-section">
          <h2>Quick Actions</h2>
          <div className="driver-actions">
            <button className="driver-primary-btn" onClick={toggleOnline}>
              {online ? "Go Offline" : "Go Online"}
            </button>

            {/* FIXED BUTTON */}
            <button
              className="driver-secondary-btn"
              onClick={() => navigate("/driver/requests")}
            >
              View Ride Requests
            </button>
          </div>
        </div>

        {/* Example Stats */}
        <div className="driver-section">
          <h2>Driver Stats</h2>
          <div className="driver-stats-grid">
            <div className="driver-card">
              <h3>Today's Rides</h3>
              <p className="driver-card-number">4</p>
            </div>
            <div className="driver-card">
              <h3>Earnings Today</h3>
              <p className="driver-card-number">₹850</p>
            </div>
            <div className="driver-card">
              <h3>Rating</h3>
              <p className="driver-card-number">4.8 ⭐</p>
            </div>
            <div className="driver-card">
              <h3>Online Time</h3>
              <p className="driver-card-number">3h 20m</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DriverDashboard;

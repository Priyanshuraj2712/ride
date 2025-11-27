import React, { useEffect, useState } from "react";
import DriverSidebar from "../../components/DriverSidebar";
import socket from "../../services/socket";
import axios from "../../services/api";
import "./driver.css";

const DriverDashboard = () => {
  const [incomingRide, setIncomingRide] = useState(null);

  // Demo stats (replace with backend later)
  const stats = {
    todayRides: 4,
    todayEarnings: "₹850",
    rating: 4.8,
    onlineHours: "3h 20m",
  };

  // Listen for incoming ride requests from passengers
  useEffect(() => {
    socket.on("rideRequest", (ride) => {
      console.log("Incoming ride:", ride);
      setIncomingRide(ride);
    });

    return () => {
      socket.off("rideRequest");
    };
  }, []);

  // Accept Ride
  const acceptRide = async () => {
    try {
      await axios.post("/rides/accept", {
        rideId: incomingRide._id,
      });

      socket.emit("driverAcceptedRide", {
        rideId: incomingRide._id,
        driverId: incomingRide.driver,
      });

      alert("Ride Accepted! Redirecting...");
      setIncomingRide(null);
    } catch (err) {
      console.error(err);
      alert("Failed to accept ride");
    }
  };

  // Reject Ride
  const rejectRide = () => {
    socket.emit("driverRejectedRide", {
      rideId: incomingRide._id,
    });

    setIncomingRide(null);
  };

  return (
    <div className="driver-layout">
      <DriverSidebar />

      <div className="driver-main">
        <div className="driver-topbar">
          <h1>Driver Dashboard</h1>
          <span className="driver-status-badge online">Online</span>
        </div>

        {/* 🔴 POPUP FOR NEW RIDE REQUEST */}
        {incomingRide && (
          <div className="ride-popup-overlay">
            <div className="ride-popup-card">
              <h2>New Ride Request</h2>
              <p><strong>Pickup:</strong> {incomingRide.pickup.address}</p>
              <p><strong>Drop:</strong> {incomingRide.destination.address}</p>

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

        <div className="driver-stats-grid">
          <div className="driver-card">
            <h3>Today&apos;s Rides</h3>
            <p className="driver-card-number">{stats.todayRides}</p>
          </div>
          <div className="driver-card">
            <h3>Today&apos;s Earnings</h3>
            <p className="driver-card-number">{stats.todayEarnings}</p>
          </div>
          <div className="driver-card">
            <h3>Rating</h3>
            <p className="driver-card-number">{stats.rating} ⭐</p>
          </div>
          <div className="driver-card">
            <h3>Online Time</h3>
            <p className="driver-card-number">{stats.onlineHours}</p>
          </div>
        </div>

        <div className="driver-section">
          <h2>Quick Actions</h2>
          <div className="driver-actions">
            <button className="driver-primary-btn">Go Online</button>
            <button className="driver-secondary-btn">View Ride Requests</button>
          </div>
        </div>

        <div className="driver-section">
          <h2>Upcoming Ride (Demo)</h2>
          <div className="driver-upcoming-card">
            <p><strong>Pickup:</strong> Gurgaon Sector 22</p>
            <p><strong>Drop:</strong> Cyber City, DLF Phase III</p>
            <p><strong>Fare:</strong> ₹320 (est.)</p>
            <div className="driver-upcoming-actions">
              <button className="driver-primary-btn">Start Ride</button>
              <button className="driver-danger-btn">Cancel</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DriverDashboard;

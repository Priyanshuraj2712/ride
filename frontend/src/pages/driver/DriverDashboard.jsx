import React, { useEffect, useState, useRef } from "react";
import DriverSidebar from "../../components/DriverSidebar";
import socket from "../../services/socket";
import axios from "../../services/api";
import { useNavigate } from "react-router-dom";
import "./driver.css";

const DriverDashboard = () => {
  const [incomingRide, setIncomingRide] = useState(null);
  const [online, setOnline] = useState(false);
  const [stats, setStats] = useState({
    todaysRides: 0,
    earningsToday: 0,
    totalCompleted: 0,
    earningsTotal: 0,
  });

  const navigate = useNavigate();
  const watchIdRef = useRef(null);
  const [driverData, setDriverData] = useState(null);

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
        setDriverData(res.data.driver || null);
        if (res.data.stats) {
          setStats(res.data.stats);
        } else if (res.data.driver) {
          setStats((s) => ({ ...s, earningsTotal: res.data.driver.earningsTotal || s.earningsTotal }));
        }
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
      // cleanup geolocation watcher if present
      if (watchIdRef.current != null && navigator && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
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

      // start or stop location updates based on new online state
      if (res.data.online) {
        startLocationUpdates();
      } else {
        stopLocationUpdates();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update online status");
    }
  };

  const startLocationUpdates = async () => {
    if (!navigator || !navigator.geolocation) {
      console.warn("Geolocation not available");
      return;
    }

    // one-time immediate update
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const token = localStorage.getItem("token");
        try {
          await axios.post(
            "/api/location/driver",
            { latitude, longitude, timestamp: pos.timestamp },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (err) {
          console.error("Failed to send initial location", err);
        }
      },
      (err) => console.error("getCurrentPosition error", err),
      { enableHighAccuracy: true }
    );

    // start continuous watch
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const token = localStorage.getItem("token");

        // send to REST endpoint (updates driver.liveLocation)
        axios
          .post(
            "/api/location/driver",
            { latitude, longitude, timestamp: pos.timestamp },
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .catch((err) => console.error("location update failed", err));

        // emit socket event for active ride tracking
        socket.emit("driverLocation", {
          latitude,
          longitude,
          timestamp: pos.timestamp,
        });
      },
      (err) => console.error("watchPosition error", err),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );

    watchIdRef.current = id;
  };

  const stopLocationUpdates = () => {
    try {
      if (watchIdRef.current != null && navigator && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    } catch (err) {
      console.error("Failed to stop location watch", err);
    }

    watchIdRef.current = null;
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
              <p className="driver-card-number">{stats.todaysRides ?? 0}</p>
            </div>
            <div className="driver-card">
              <h3>Earnings Today</h3>
              <p className="driver-card-number">₹{stats.earningsToday ?? 0}</p>
            </div>
            <div className="driver-card">
              <h3>Rating</h3>
              <p className="driver-card-number">{driverData?.rating ?? "-"} ⭐</p>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
};

export default DriverDashboard;

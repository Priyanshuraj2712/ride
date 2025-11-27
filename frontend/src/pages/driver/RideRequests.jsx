import React, { useEffect, useState } from "react";
import DriverSidebar from "../../components/DriverSidebar";
import socket from "../../services/socket";
import axios from "../../services/api";
import "./driver.css";

const RideRequests = () => {
  const [requests, setRequests] = useState([]);

  // Load assigned pending rides for logged-in driver
  const loadRequests = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch rides assigned to this logged-in driver
      const rideRes = await axios.get("/api/rides/driver/my", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRequests(rideRes.data.rides || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load ride requests.");
    }
  };

  // Load on mount
  useEffect(() => {
    loadRequests();

    // socket listener for live ride assignment
    const handleRideRequestSocket = () => {
      console.log("Received socket ride request, refreshing...");
      loadRequests(); // refresh list
    };

    socket.on("rideRequest", handleRideRequestSocket);

    return () => socket.off("rideRequest", handleRideRequestSocket);
  }, []);

  // Accept Ride
  const acceptRide = async (rideId) => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "/api/rides/driver/respond",
        { rideId, action: "accept" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Ride accepted!");
      loadRequests();

      socket.emit("driverAcceptedRide", { rideId });
    } catch (err) {
      console.error(err);
      alert("Failed to accept ride.");
    }
  };

  // Reject Ride
  const rejectRide = async (rideId) => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "/api/rides/driver/respond",
        { rideId, action: "reject" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Ride rejected.");
      loadRequests();

      socket.emit("driverRejectedRide", { rideId });
    } catch (err) {
      console.error(err);
      alert("Failed to reject ride.");
    }
  };

  return (
    <div className="driver-layout">
      <DriverSidebar />

      <div className="driver-main">
        <div className="driver-topbar">
          <h1>Ride Requests</h1>
        </div>

        {requests.length === 0 ? (
          <p>No new ride requests.</p>
        ) : (
          requests.map((r) => (
            <div
              key={r._id}
              className="driver-upcoming-card"
              style={{ marginBottom: "10px" }}
            >
              <p>
                <strong>Pickup:</strong> {r.pickup?.address || "N/A"}
              </p>
              <p>
                <strong>Drop:</strong> {r.destination?.address || "N/A"}
              </p>
              <p>
                <strong>Fare:</strong> ₹{r.price}
              </p>

              <div className="driver-upcoming-actions">
                <button
                  className="driver-primary-btn"
                  onClick={() => acceptRide(r._id)}
                >
                  Accept
                </button>
                <button
                  className="driver-danger-btn"
                  onClick={() => rejectRide(r._id)}
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RideRequests;

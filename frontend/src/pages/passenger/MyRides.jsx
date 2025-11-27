import React, { useEffect, useState } from "react";
import axios from "../../services/api";
import { useNavigate } from "react-router-dom";
import socket from "../../services/socket";

const MyRides = () => {
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's rides
  const fetchRides = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("/api/rides/user/my", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRides(res.data.rides);
    } catch (error) {
      console.error(error);
      alert("Failed to load rides");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRides();

    // Auto update when ride gets accepted or driver moves
    socket.on("rideUpdated", () => {
      fetchRides();
    });

    return () => socket.off("rideUpdated");
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "orange";
      case "accepted":
        return "blue";
      case "ongoing":
        return "green";
      case "completed":
        return "gray";
      case "cancelled":
        return "red";
      default:
        return "black";
    }
  };

  if (loading) return <p>Loading your rides...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>My Rides</h2>

      {rides.length === 0 ? (
        <p>No rides found.</p>
      ) : (
        <div style={{ marginTop: "20px" }}>
          {rides.map((ride) => (
            <div
              key={ride._id}
              style={{
                padding: "15px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                marginBottom: "15px",
              }}
            >
              <h3>{ride.rideType?.toUpperCase()} Ride</h3>

              <p>
                <strong>Pickup:</strong> {ride.pickup?.address}
              </p>
              <p>
                <strong>Destination:</strong> {ride.destination?.address}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                <span style={{ color: getStatusColor(ride.status) }}>
                  {ride.status}
                </span>
              </p>

              <p>
                <strong>Price:</strong> ₹{ride.price}
              </p>

              <p>
                <strong>Requested At:</strong>{" "}
                {formatDate(ride.timestamps?.requestedAt)}
              </p>

              {/* Track button */}
              {(ride.status === "accepted" || ride.status === "ongoing") && (
                <button
                  onClick={() => navigate(`/track/${ride._id}`)}
                  style={{
                    marginTop: "10px",
                    padding: "8px 14px",
                    background: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Track Ride
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRides;

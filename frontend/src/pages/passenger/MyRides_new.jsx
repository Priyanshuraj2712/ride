import React, { useEffect, useState } from "react";
import axios from "../../services/api";
import { useNavigate } from "react-router-dom";
import socket from "../../services/socket";
import "./myrides.css";

const MyRides = () => {
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, accepted, ongoing, completed

  // Fetch user's rides
  const fetchRides = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/rides/user/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRides(res.data.rides || []);
    } catch (error) {
      console.error("Failed to load rides:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRides();

    // Real-time socket listeners for immediate updates
    socket.on("rideUpdated", (updatedRide) => {
      setRides((prevRides) =>
        prevRides.map((ride) =>
          ride._id === updatedRide._id ? updatedRide : ride
        )
      );
    });

    socket.on("rideAccepted", (updatedRide) => {
      setRides((prevRides) =>
        prevRides.map((ride) =>
          ride._id === updatedRide._id ? updatedRide : ride
        )
      );
    });

    socket.on("rideStarted", (updatedRide) => {
      setRides((prevRides) =>
        prevRides.map((ride) =>
          ride._id === updatedRide._id ? updatedRide : ride
        )
      );
    });

    socket.on("rideCompleted", (updatedRide) => {
      setRides((prevRides) =>
        prevRides.map((ride) =>
          ride._id === updatedRide._id ? updatedRide : ride
        )
      );
    });

    socket.on("rideCancelled", (updatedRide) => {
      setRides((prevRides) =>
        prevRides.map((ride) =>
          ride._id === updatedRide._id ? updatedRide : ride
        )
      );
    });

    return () => {
      socket.off("rideUpdated");
      socket.off("rideAccepted");
      socket.off("rideStarted");
      socket.off("rideCompleted");
      socket.off("rideCancelled");
    };
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: "Searching...", color: "#FFA500", icon: "🔍" },
      accepted: { label: "Driver Confirmed", color: "#2196F3", icon: "✓" },
      ongoing: { label: "In Progress", color: "#4CAF50", icon: "▶" },
      completed: { label: "Completed", color: "#9E9E9E", icon: "✓✓" },
      cancelled: { label: "Cancelled", color: "#F44336", icon: "✕" },
    };
    return statusConfig[status] || statusConfig.pending;
  };

  const filteredRides = () => {
    if (filter === "all") return rides;
    return rides.filter((ride) => ride.status === filter);
  };

  const upcomingRides = filteredRides().filter(
    (r) => r.status === "pending" || r.status === "accepted" || r.status === "ongoing"
  );
  const pastRides = filteredRides().filter(
    (r) => r.status === "completed" || r.status === "cancelled"
  );

  if (loading) {
    return (
      <div className="myrides-container">
        <div className="skeleton-loader">
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
          <div className="skeleton-card"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="myrides-container">
      <div className="myrides-header">
        <h1>My Rides</h1>
        <button
          className="btn-book-ride"
          onClick={() => navigate("/book-ride")}
        >
          + Book New Ride
        </button>
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs">
        {["all", "pending", "accepted", "ongoing", "completed"].map((tab) => (
          <button
            key={tab}
            className={`filter-tab ${filter === tab ? "active" : ""}`}
            onClick={() => setFilter(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Rides list */}
      {filteredRides().length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🚗</div>
          <h2>No Rides Found</h2>
          <p>
            {filter === "all"
              ? "You haven't booked any rides yet. Start by booking your first ride!"
              : `No ${filter} rides found.`}
          </p>
          <button
            className="btn-primary"
            onClick={() => navigate("/book-ride")}
          >
            Book a Ride
          </button>
        </div>
      ) : (
        <div className="rides-sections">
          {/* Upcoming Rides */}
          {upcomingRides.length > 0 && (
            <div className="rides-section">
              <h2 className="section-title">🔴 Upcoming</h2>
              <div className="rides-grid">
                {upcomingRides.map((ride) => (
                  <RideCard
                    key={ride._id}
                    ride={ride}
                    navigate={navigate}
                    getStatusBadge={getStatusBadge}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Past Rides */}
          {pastRides.length > 0 && (
            <div className="rides-section">
              <h2 className="section-title">✓ History</h2>
              <div className="rides-grid">
                {pastRides.map((ride) => (
                  <RideCard
                    key={ride._id}
                    ride={ride}
                    navigate={navigate}
                    getStatusBadge={getStatusBadge}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Ride Card Component
const RideCard = ({ ride, navigate, getStatusBadge, formatDate }) => {
  const status = getStatusBadge(ride.status);

  return (
    <div className="ride-card">
      <div className="ride-card-header">
        <div className="ride-type">
          <span className="ride-type-badge">{ride.rideType?.toUpperCase()}</span>
          <span className="ride-status-badge" style={{ backgroundColor: status.color }}>
            {status.icon} {status.label}
          </span>
        </div>
        <div className="ride-price">₹{ride.price}</div>
      </div>

      <div className="ride-card-body">
        <div className="location-info">
          <div className="location-item pickup">
            <span className="location-icon">📍</span>
            <div className="location-details">
              <span className="location-label">Pickup</span>
              <span className="location-address">{ride.pickup?.address || "N/A"}</span>
            </div>
          </div>

          <div className="location-arrow">→</div>

          <div className="location-item destination">
            <span className="location-icon">🎯</span>
            <div className="location-details">
              <span className="location-label">Destination</span>
              <span className="location-address">{ride.destination?.address || "N/A"}</span>
            </div>
          </div>
        </div>

        <div className="ride-meta">
          <div className="meta-item">
            <span className="meta-label">Requested</span>
            <span className="meta-value">{formatDate(ride.timestamps?.requestedAt)}</span>
          </div>
          {ride.timestamps?.acceptedAt && (
            <div className="meta-item">
              <span className="meta-label">Accepted</span>
              <span className="meta-value">{formatDate(ride.timestamps.acceptedAt)}</span>
            </div>
          )}
        </div>

        {/* OTPs Display */}
        {(ride.status === "accepted" || ride.status === "ongoing") && (
          <div className="otp-container">
            {ride.otpStart && (
              <div className="otp-box">
                <span className="otp-label">Start OTP</span>
                <span className="otp-value">{ride.otpStart}</span>
              </div>
            )}
            {ride.otpEnd && ride.status === "ongoing" && (
              <div className="otp-box">
                <span className="otp-label">End OTP</span>
                <span className="otp-value">{ride.otpEnd}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="ride-card-footer">
        {(ride.status === "accepted" || ride.status === "ongoing") && (
          <button
            className="btn-track"
            onClick={() => navigate(`/track/${ride._id}`)}
          >
            📍 Track Ride
          </button>
        )}
        {ride.status === "pending" && (
          <button className="btn-waiting" disabled>
            ⏳ Waiting for driver...
          </button>
        )}
        {ride.status === "completed" && (
          <button
            className="btn-secondary"
            onClick={() => navigate(`/ride-details/${ride._id}`)}
          >
            View Details
          </button>
        )}
      </div>
    </div>
  );
};

export default MyRides;

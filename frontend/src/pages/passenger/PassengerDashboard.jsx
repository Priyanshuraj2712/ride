import React, { useEffect, useState } from "react";
import PassengerSidebar from "../../components/PassengerSidebar";
import "./passenger.css";
import { useAuth } from "../../context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "../../services/api";

const PassengerDashboard = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();

  // Protect route
  if (!auth.token || auth.user.role !== "passenger") {
    return <Navigate to="/login" />;
  }

  const [loading, setLoading] = useState(true);
  const [currentRide, setCurrentRide] = useState(null);
  const [unreviewedRide, setUnreviewedRide] = useState(null);

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/rides/user/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const rides = res.data.rides || [];

        // Current ride: accepted or ongoing
        const current = rides.find((r) =>
          ["accepted", "ongoing"].includes(r.status)
        );
        setCurrentRide(current || null);

        // Find last completed ride without review/rating
        const unrev = rides
          .slice()
          .reverse()
          .find((r) => r.status === "completed" && !r.rating && !r.review);
        setUnreviewedRide(unrev || null);
      } catch (err) {
        console.error("Failed to load rides for dashboard:", err);
      }
      setLoading(false);
    };

    fetchRides();
  }, []);

  const handleQuickReview = async (rideId) => {
    // Submit a quick random 4-5 star review
    try {
      const rating = Math.random() > 0.5 ? 5 : 4;
      const body = { rating, comment: "Quick review" };
      const token = localStorage.getItem("token");
      await axios.post(`/api/rides/${rideId}/review`, body, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnreviewedRide(null);
      alert("Thanks for the quick review!");
    } catch (err) {
      console.error("Quick review failed:", err);
      alert("Failed to submit quick review.");
    }
  };

  const handleBookFromCurrent = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const pickup = {
          address: "Current Location",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        navigate("/book-ride", { state: { pickup } });
      },
      (err) => {
        console.error("Geolocation error:", err);
        alert("Unable to fetch current location: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="passenger-layout">
      <PassengerSidebar />

      <div className="content-area">
        <h1>Welcome Passenger 👋</h1>

        {loading ? (
          <p>Loading recent activity...</p>
        ) : (
          <div className="dashboard-cards">
            {currentRide ? (
              <div className="dash-card current-ride">
                <h3>Current Ride</h3>
                <p>
                  <strong>Status:</strong> {currentRide.status}
                </p>
                <p>
                  <strong>From:</strong> {currentRide.pickup?.address || "-"}
                </p>
                <p>
                  <strong>To:</strong> {currentRide.destination?.address || "-"}
                </p>
                <p>
                  <strong>Driver:</strong> {currentRide.driver?.name || "Not assigned"}
                </p>

                {(currentRide.otpStart || currentRide.otpEnd) && (
                  <div className="otp-row">
                    {currentRide.otpStart && (
                      <div className="otp-box">
                        <div className="otp-label">Start OTP</div>
                        <div className="otp-value">{currentRide.otpStart}</div>
                      </div>
                    )}
                    {currentRide.otpEnd && (
                      <div className="otp-box">
                        <div className="otp-label">End OTP</div>
                        <div className="otp-value">{currentRide.otpEnd}</div>
                      </div>
                    )}
                  </div>
                )}

                <div style={{ marginTop: 12 }}>
                  <button onClick={() => navigate(`/track/${currentRide._id}`)} className="btn-primary">
                    Track Ride
                  </button>
                </div>
              </div>
            ) : unreviewedRide ? (
              <div className="dash-card review-ride">
                <h3>Review a recent ride</h3>
                <p>
                  <strong>From:</strong> {unreviewedRide.pickup?.address || "-"}
                </p>
                <p>
                  <strong>To:</strong> {unreviewedRide.destination?.address || "-"}
                </p>
                <p>
                  <strong>Fare:</strong> ₹{unreviewedRide.price}
                </p>
                <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                  <button onClick={() => handleQuickReview(unreviewedRide._id)} className="btn-primary">
                    Give Quick Review
                  </button>
                  <button onClick={() => navigate(`/passenger/reviews`)} className="btn-secondary">
                    Full Review
                  </button>
                </div>
              </div>
            ) : (
              <div className="dash-card book-current">
                <h3>No active rides</h3>
                <p>Start a ride quickly from your current location.</p>
                <div style={{ marginTop: 12 }}>
                  <button onClick={handleBookFromCurrent} className="btn-primary">
                    Book Cab From Current Location
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PassengerDashboard;